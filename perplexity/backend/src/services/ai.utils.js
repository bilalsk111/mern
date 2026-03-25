// src/services/ai.utils.js

import { geminiairesponse } from "./ai.service.js";

// 🔥 Chat Summary
export async function summarizeChat(messages) {
  const text = messages.map((m) => m.content).join("\n");

  let summary = "";

  await geminiairesponse(
    [
      { role: "system", content: "Summarize in 5 lines" },
      { role: "user", content: text },
    ],
    (chunk) => {
      summary += chunk;
    }
  );

  return summary;
}