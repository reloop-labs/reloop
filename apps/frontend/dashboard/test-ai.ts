import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const ollama = createOpenAI({
	baseURL: "http://127.0.0.1:11434/v1",
	apiKey: "ollama",
});

async function main() {
    try {
        const result = streamText({
            model: ollama("llama3"),
            prompt: "hi",
        });
        const res = result.toTextStreamResponse();
        console.log(res);
    } catch(e) {
        console.error(e);
    }
}
main();
