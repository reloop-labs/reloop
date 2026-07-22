import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export interface AIStreamInput {
	prompt: string;
	system?: string;
	model?: string;
}

export function createAIStream({
	prompt,
	system = "You are an AI assistant helping generate and refine email templates.",
	model = "gpt-4o",
}: AIStreamInput) {
	const apiKey = process.env.OPENAI_API_KEY;

	if (apiKey) {
		return streamText({
			model: openai(model),
			system,
			prompt,
		});
	}

	// Fallback mock stream for offline / test environments
	const mockChunks = [
		`Generated template response for: "${prompt}". `,
		"Subject: Exclusive Announcement\n\n",
		"Hello {{name}},\n\n",
		"We are thrilled to share our latest updates with you.\n\n",
		"Best regards,\nThe Team",
	];

	const stream = new ReadableStream<string>({
		async start(controller) {
			for (const chunk of mockChunks) {
				controller.enqueue(chunk);
				await new Promise((resolve) => setTimeout(resolve, 10));
			}
			controller.close();
		},
	});

	return {
		textStream: stream,
		toUIMessageStream: () => stream,
		toTextStreamResponse: () =>
			new Response(stream, {
				headers: { "Content-Type": "text/plain; charset=utf-8" },
			}),
		toUIMessageStreamResponse: () =>
			new Response(stream, {
				headers: { "Content-Type": "text/event-stream" },
			}),
	};
}
