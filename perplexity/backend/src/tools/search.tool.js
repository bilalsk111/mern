import { tool } from "@langchain/core/tools";
import { tavily } from "@tavily/core";
import * as z from "zod";

// Initialize Tavily client safely
let tvly;
try {
  tvly = new tavily({ apiKey: process.env.TAVILY_API_KEY });
} catch {
  tvly = null;
}

// Internet search tool
export const searchTool = tool(
  async ({ query }) => {
    if (!tvly) return "Search unavailable";

    try {
      const res = await tvly.search(query, {
        maxResults: 5,
        searchDepth: "advanced",
        includeAnswer: true,
      });

      const answer = res.answer
        ? `Summary: ${res.answer}\n\n`
        : "";

      const results = res.results
        .map(
          (r, i) =>
            `${i + 1}. ${r.title}\n${r.content.slice(0, 200)}\n${r.url}`
        )
        .join("\n\n");

      return answer + results;
    } catch (err) {
      return `Search failed: ${err.message}`;
    }
  },
  {
    name: "search_internet",
    description: "Search for latest or real-time information",
    schema: z.object({
      query: z.string(),
    }),
  }
);