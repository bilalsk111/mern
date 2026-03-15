import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GEMINI_API
});

export async function testAi() {
    model.invoke("who are you?")
        .then((response) => {
            console.log(response.text);
        })
}