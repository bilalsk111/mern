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
import axios from "axios";
import sharp from "sharp";
import * as z from "zod";

const MAX_MESSAGES = 20;
const MAX_TOOL_ITERATIONS = 2;

// Initialize primary Gemini model for advanced tasks like images and complex reasoning
const geminiFlash = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 8192,
});

// Lightweight fallback Gemini model to handle quota limits or failures
const geminiLite = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 8192,
});

// Fast and cost-efficient text model
const mistral = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 1.0,
});

const toolsMap = {
  search_internet: searchTool,
  send_email: emailTool,
};
const mistralWithTools = mistral.bindTools([searchTool, emailTool]);
const geminiWithTools = geminiFlash.bindTools([searchTool, emailTool]);

// Convert image URL into optimized base64 for AI processing
async function imageUrlToBase64(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 10000,
  });
  const buffer = await sharp(Buffer.from(res.data))
    .resize({ width: 1024 })
    .jpeg({ quality: 80 })
    .toBuffer();
  return buffer.toString("base64");
}

// Detect API quota errors
function isQuotaError(err) {
  return err?.status === 429 || err?.message?.includes("quota");
}

// Convert DB messages into AI-compatible format
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
      } catch {
        parts.push({ type: "text", text: "Image failed to load" });
      }

      formatted.push(new HumanMessage({ content: parts }));
      continue;
    }

    if (msg.fileUrl && msg.fileType?.includes("pdf")) {
      formatted.push(new HumanMessage(`[PDF: ${msg.fileName}] ${msg.fileUrl}`));
      continue;
    }

    if (msg.content) formatted.push(new HumanMessage(msg.content));
  }

  return formatted;
}

// Executes AI tool calls in loop with limit control
async function runToolLoop(history, useGemini = false) {
  const model = useGemini ? geminiWithTools : mistralWithTools;
  let count = 0;

  while (count < MAX_TOOL_ITERATIONS) {
    let res;
    try {
      res = await model.invoke(history);
    } catch {
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
          return new ToolMessage({
            content: String(result),
            tool_call_id: call.id,
          });
        } catch {
          return new ToolMessage({
            content: "Tool failed",
            tool_call_id: call.id,
          });
        }
      }),
    );

    history.push(...results.filter(Boolean));
    count++;
  }
}

// Summarizes old conversation to reduce token usage
async function summarizeOldMessages(messages) {
  const text = messages.map((m) => m.content).join("\n");
  const res = await mistral.invoke([
    new SystemMessage("Summarize conversation briefly"),
    new HumanMessage(text),
  ]);
  return res.content;
}

// Main AI response pipeline
export async function geminiairesponse(messages, onChunk) {
  if (!Array.isArray(messages)) return "Invalid input";

  const recent = messages.slice(-10);
  const old = messages.slice(0, -10);

  let summary = "";
  if (old.length) summary = await summarizeOldMessages(old);

  const formatted = await formatMessages(recent);

  const history = [
    new SystemMessage("You are a helpful AI assistant"),
    new SystemMessage(`Previous context: ${summary}`),
    ...formatted,
  ];

  const hasImage = messages.some(
    (m) => m.fileUrl && !m.fileType?.includes("pdf"),
  );
  const needsGemini = hasImage;

  let stream;

  try {
    if (needsGemini) {
      await runToolLoop(history, true);
      stream = await geminiFlash.stream(history);
    } else {
      await runToolLoop(history, false);
      stream = await mistral.stream(history);
    }
  } catch (err) {
    if (isQuotaError(err)) return "Rate limited, try later";
    return "AI error";
  }

  let full = "";
  let buffer = "";

  for await (const chunk of stream) {
    const text = chunk?.content || "";
    buffer += text;
    full += text;

    if (buffer.length > 50) {
      onChunk?.(buffer);
      buffer = "";
    }
  }

  if (buffer) onChunk?.(buffer);

  return full || "No response";
}

// Generate short chat title using AI
export async function chatTitle(message) {
  if (!message) return "New Chat";

  try {
    const res = await mistral.invoke([
      new SystemMessage("Generate short title"),
      new HumanMessage(message.slice(0, 100)),
    ]);
    return res.content.trim();
  } catch {
    return "New Chat";
  }
}
