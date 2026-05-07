import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
	apiKey:
		process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
	try {
		const { prompt } = await req.json();

		const { text } = await generateText({
			model: google("gemini-2.5-flash"),
			system: `You are an elite, world-class email template designer and front-end developer. Your task is to generate breathtaking, high-converting email templates based on the user's request.

CRITICAL INSTRUCTIONS:
1. ONLY return the raw HTML tags (starting with <div style="...">). Do not include any markdown formatting, \`\`\`html blocks, or conversational text whatsoever.
2. Use Tiptap-compatible HTML structure. All styles MUST be inline CSS.
3. Your designs must look PREMIUM:
   - Use high-quality Google Fonts (e.g., Inter, Roboto, Outfit) via an @import in a style tag, or fallback to beautiful system-ui sans-serif fonts.
   - Use harmonious, modern color palettes (elegant dark modes, sleek minimalist whites, rich accents). Avoid harsh basic colors like #f00 or #00f.
   - Include generous padding, perfect typography hierarchy (h1, h2, p), and high readability.
   - Design beautiful, pill-shaped or softly rounded call-to-action (CTA) buttons with hover-like states (even though it's inline).
   - Use subtle borders or shadows (e.g., box-shadow) to create a card-like container for the main content.
4. The structure should be a centered main container with a maximum width of 600px, responsive styling, and a beautiful header and footer.`,
			prompt,
		});

		if (!text) {
			return new Response(
				JSON.stringify({ error: "No content generated from AI" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		return new Response(text, {
			status: 200,
			headers: { "Content-Type": "text/plain; charset=utf-8" },
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		console.error("[AI Generate Error]", errorMessage);

		return new Response(
			JSON.stringify({
				error: "Failed to generate template",
				details: errorMessage,
				suggestion:
					"Your Gemini API quota might be exhausted. Check Google AI Studio billing.",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}

export async function GET() {
	return new Response("OK", { status: 200 });
}
