import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export interface AIStreamInput {
	prompt: string;
	system?: string;
	model?: string;
	apiKey?: string;
}

export function createAIStream({
	prompt,
	system = "You are an expert email designer and copywriter. Create beautiful, responsive HTML email templates with clean inline CSS, compelling copy, and clear call-to-action buttons.",
	model = "gemini-3.6-flash",
	apiKey,
}: AIStreamInput) {
	const geminiApiKey =
		apiKey ||
		process.env.GEMINI_API_KEY ||
		process.env.GOOGLE_GENERATIVE_AI_API_KEY;
	const openaiApiKey = apiKey || process.env.OPENAI_API_KEY;

	const isGeminiModel = model.includes("gemini");

	if (isGeminiModel && geminiApiKey) {
		const googleProvider = apiKey
			? createGoogleGenerativeAI({ apiKey: geminiApiKey })
			: google;

		return streamText({
			model: googleProvider(model),
			system,
			prompt,
		});
	}

	if (!isGeminiModel && openaiApiKey) {
		const openaiProvider = apiKey
			? createOpenAI({ apiKey: openaiApiKey })
			: openai;
		return streamText({
			model: openaiProvider(model),
			system,
			prompt,
		});
	}

	// Mock stream fallback when no API key is set
	const mockHtmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; padding: 32px;">
    <tr>
      <td>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px; tracking: -0.02em;">Generated with AI</h1>
        <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Here is your custom email template generated for: <strong>"${prompt}"</strong>.</p>
        
        <div style="background-color: #09090b; border: 1px dashed #3f3f46; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
          <p style="color: #e4e4e7; font-size: 14px; margin: 0; line-height: 1.5;">Welcome to our platform! We're excited to help you get started with modern, automated workflows.</p>
        </div>

        <a href="https://reloop.dev" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px;">Get Started Now &rarr;</a>
      </td>
    </tr>
  </table>
</body>
</html>`;

	const mockChunks = mockHtmlTemplate.match(/.{1,80}/g) || [mockHtmlTemplate];

	const stream = new ReadableStream<string>({
		async start(controller) {
			for (const chunk of mockChunks) {
				controller.enqueue(chunk);
				await new Promise((resolve) => setTimeout(resolve, 15));
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
