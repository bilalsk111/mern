import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { emailTool } from "../tools/email.tool.js";
import { searchTool } from "../tools/search.tool.js";
import { buildSystemPrompt } from "../tools/systemPrompt.js";
import axios from "axios";
import sharp from "sharp";

const MAX_MESSAGES = 20; // Last 20 messages are enough, no need to summarize
const MAX_TOOL_ITERATIONS = 2;

// ================= MODELS =================

const geminiFlash = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 8192,
});

const geminiLite = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 4096,
});

const mistral = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0.7,
});

// ================= TOOLS =================

const toolsMap = {
  search_internet: searchTool,
  send_email: emailTool,
};

const mistralWithTools = mistral.bindTools([searchTool, emailTool]);
const geminiWithTools = geminiFlash.bindTools([searchTool, emailTool]);

// ================= HELPERS =================

async function imageUrlToBase64(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 15000,
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  return sharp(Buffer.from(res.data))
    .resize({ width: 1024, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()
    .then((buf) => buf.toString("base64"));
}

function isQuotaError(err) {
  return (
    err?.status === 429 ||
    err?.status === 404 ||
    err?.message?.includes("429") ||
    err?.message?.includes("quota") ||
    err?.message?.includes("not found")
  );
}

function detectMode(messages) {
  const last = messages[messages.length - 1]?.content?.toLowerCase() || "";
  if (/\b(error|bug|fix|crash|exception|traceback)\b/.test(last)) return "debug";
  if (/\b(code|function|api|class|component|implement|write a)\b/.test(last)) return "coding";
  if (/\b(explain|what is|how does|why does|difference between)\b/.test(last)) return "explain";
  if (/\b(solve|calculate|math|equation|formula|proof)\b/.test(last)) return "math";
  if (/\b(write|story|poem|essay|creative|blog|copy)\b/.test(last)) return "creative";
  if (/\b(research|analyze|compare|report|summary of)\b/.test(last)) return "research";
  return "chat";
}

// SPEED FIX 1: Removed summarizeOldMessages completely. It was adding massive latency.

// ================= FORMAT MESSAGES =================

async function formatMessages(messages = []) {
  const formatted = [];

  for (const msg of messages.slice(-MAX_MESSAGES)) {
    if (msg.role === "ai") {
      if (msg.content) formatted.push(new AIMessage(msg.content));
      continue;
    }

    if (msg.fileUrl && !msg.fileType?.includes("pdf")) {
      const parts = [];
      if (msg.content) parts.push({ type: "text", text: msg.content });

      try {
        const base64 = await imageUrlToBase64(msg.fileUrl);
        parts.push({
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64}` },
        });
      } catch (err) {
        parts.push({
          type: "text",
          text: `[Image could not be loaded: ${msg.fileName || "unknown"}]`,
        });
      }

      formatted.push(
        parts.length === 1 && parts[0].type === "text"
          ? new HumanMessage(parts[0].text)
          : new HumanMessage({ content: parts })
      );
      continue;
    }

    if (msg.fileUrl && msg.fileType?.includes("pdf")) {
      const text = (msg.content ? msg.content + "\n\n" : "") +
        `[PDF Document: "${msg.fileName || "document.pdf"}" — URL: ${msg.fileUrl}. Please analyze this document carefully.]`;
      formatted.push(new HumanMessage(text));
      continue;
    }

    if (msg.content) formatted.push(new HumanMessage(msg.content));
  }

  return formatted;
}

// ================= TOOL LOOP =================

async function runToolLoop(history, useGemini = false) {
  const model = useGemini ? geminiWithTools : mistralWithTools;
  let count = 0;

  while (count < MAX_TOOL_ITERATIONS) {
    let res;
    try {
      res = await model.invoke(history);
    } catch (err) {
      break;
    }

    if (!res.tool_calls?.length) return;
    history.push(res);

    const results = await Promise.all(
      res.tool_calls.map(async (call) => {
        const toolFn = toolsMap[call.name];
        if (!toolFn) return null;
        try {
          const result = await toolFn.invoke(call.args);
          return new ToolMessage({ content: String(result), tool_call_id: call.id });
        } catch {
          return new ToolMessage({ content: "Tool failed", tool_call_id: call.id });
        }
      })
    );

    history.push(...results.filter(Boolean));
    count++;
  }
}

// ================= MAIN =================

export async function geminiairesponse(messages, onChunk, options = {}) {
  if (!Array.isArray(messages) || !messages.length) return "⚠️ Invalid input.";

  // SPEED FIX 1: Only format the last 20 messages. Do not run parallel summarization.
  const formatted = await formatMessages(messages);

  if (!formatted.length) return "⚠️ No valid messages to process.";

  const hasImage = messages.some((m) => m.fileUrl && !m.fileType?.includes("pdf"));
  const hasPDF = messages.some((m) => m.fileType?.includes("pdf"));
  const needsGemini = hasImage || hasPDF;

  const mode = options.mode || detectMode(messages);

  const systemPrompt = buildSystemPrompt({
    mode,
    hasImage,
    hasPDF,
    userName: options.userName || null,
    language: "auto",
  });

  const history = [new SystemMessage(systemPrompt), ...formatted];

  // SPEED FIX 2: Smart Tool Trigger
  // Sirf tabhi tool loop chalao agar user ke message me search/email se related words hon
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
  const needsTools = /\b(search|find|email|send|mail|look up)\b/.test(lastUserMsg);

  let stream;

  try {
    if (needsGemini) {
      // Run tool loop ONLY if explicitly needed
      if (needsTools) {
        await runToolLoop(history, true).catch(() => {});
      }

      try {
        stream = await geminiFlash.stream(history);
      } catch (err) {
        if (isQuotaError(err)) {
          stream = await geminiLite.stream(history);
        } else {
          throw err;
        }
      }
    } else {
      // Text only path
      if (needsTools) {
        await runToolLoop(history, false).catch(() => {});
      }

      try {
        stream = await mistral.stream(history);
      } catch (err) {
        stream = await geminiFlash.stream(history);
      }
    }
  } catch (err) {
    console.error("AI Error:", err.message);
    return "⚠️ AI is temporarily unavailable. Please try again.";
  }

  let full = "";

  try {
    for await (const chunk of stream) {
      const text = chunk?.content || "";
      if (!text) continue;

      full += text;
      
      // SPEED FIX 3: Buffer hata diya gaya hai. Word generate hote hi turant frontend par jayega.
      onChunk?.(text); 
    }
  } catch (err) {
    if (!full) return "⚠️ Stream interrupted. Please try again.";
  }

  return full || "⚠️ No response generated.";
}

// ================= TITLE GENERATION =================

export async function chatTitle(message) {
  if (!message?.trim()) return "New Chat";
  try {
    const res = await mistral.invoke([
      new SystemMessage("Generate a short, descriptive chat title (3-5 words max). Return ONLY the title."),
      new HumanMessage(message.slice(0, 200)),
    ]);
    return res.content?.replace(/['"]/g, "").trim() || "New Chat";
  } catch {
    return "New Chat";
  }
}