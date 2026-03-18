import 'dotenv/config'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage,SystemMessage,AIMessage } from "@langchain/core/messages";

const genai = new ChatMistralAI({
       model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
});
const model = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY
});

export async function geminiairesponse(messages) {
    if (!messages || messages.length === 0) {
        console.error("AI Service Error: 'message' is undefined or empty");
        return "No message provided.";
    }
    try {
        const res = await genai.invoke(
            messages
                .map(msg => {
                    if (!msg) return null;

                    if (msg.role === "user") {
                        return new HumanMessage(msg.content);
                    } else if (msg.role === "ai") {
                        return new AIMessage(msg.content);
                    }

                    return null;
                })
                .filter(Boolean)
        );

        return res.content;
    } catch (error) {
        console.error("Error calling Gemini:", error);
        throw error;
    }
}
export async function chatTitle(message) {
    if (!message) {
        console.error("AI Service Error: 'message' is undefined or empty");
        return "No message provided.";
    }
    try {
        const response = await model.invoke([
            new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
            new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `)
        ])

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini:", error);
        throw error;
    }
}