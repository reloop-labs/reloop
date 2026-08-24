import { NextResponse } from "next/server";

interface FixRequestBody {
	subject: string;
	body: string;
	triggers?: string[];
}

/**
 * High-precision local heuristic fallback when external AI API keys are not provided.
 */
function localDeliverabilityFix(subject: string, body: string) {
	let newSubject = subject;
	let newBody = body;

	newSubject = newSubject
		.replace(/confidential\s*investment\s*proposal/gi, "Investment inquiry and project overview")
		.replace(/100%\s*free/gi, "Complimentary")
		.replace(/free\s*clothes/gi, "Apparel selection")
		.replace(/free/gi, "Welcome")
		.replace(/click\s*here/gi, "View details")
		.replace(/winner|congratulations/gi, "Update")
		.replace(/!{2,}/g, "!")
		.replace(/\${2,}/g, "$")
		.replace(/^(?:re:|fwd:|fw:)\s*/i, "")
		.trim();

	if (!newSubject || newSubject.length < 5) {
		newSubject = "Important project details and overview";
	}

	newBody = newBody
		.replace(/dear\s*friend/gi, "Hello")
		.replace(/dearest|respected\s*sir/gi, "Hi there")
		.replace(/financial\s*consultant/gi, "representative")
		.replace(/privately\s*owned\s*funds/gi, "capital assets")
		.replace(/finance\s*projects/gi, "support new ventures")
		.replace(/guaranteed\s*\d+%\s*roi\s*per\s*annum/gi, "standard target returns")
		.replace(/guaranteed\s*\d+%/gi, "target returns")
		.replace(/guaranteed/gi, "verified")
		.replace(/please\s*answer\s*asap/gi, "Feel free to let me know if you would like to discuss further")
		.replace(/asap|urgent/gi, "at your convenience")
		.replace(/click\s*the\s*below\s*button\s*to\s*get\s*free\s*clothes/gi, "You can select your apparel package online")
		.replace(/click\s*the\s*below\s*button|click\s*below/gi, "view online")
		.replace(/click\s*here|click\s*the\s*link/gi, "review details")
		.replace(/100%\s*free/gi, "included")
		.replace(/get\s*free/gi, "receive")
		.replace(/opt\s*in|opt-in/gi, "subscribe")
		.trim();

	if (newBody.split(/\s+/).length < 20) {
		newBody = `${newBody}\n\nYou can review complete documentation and manage your preferences anytime:\nhttps://reloop.sh/dashboard\n\nBest regards,\nThe Team`;
	}

	return {
		subject: newSubject,
		body: newBody,
		engine: "rule-heuristics",
	};
}

export async function POST(req: Request) {
	try {
		const data = (await req.json()) as FixRequestBody;
		const subject = data.subject || "";
		const body = data.body || "";

		if (!subject.trim() && !body.trim()) {
			return NextResponse.json(
				{ error: "Subject or body is required." },
				{ status: 400 },
			);
		}

		const openaiApiKey = process.env.OPENAI_API_KEY;
		const openrouterApiKey = process.env.OPENROUTER_API_KEY;
		const geminiApiKey =
			process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

		// 1. If OpenAI API key is available
		if (openaiApiKey) {
			try {
				const response = await fetch("https://api.openai.com/v1/chat/completions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${openaiApiKey}`,
					},
					body: JSON.stringify({
						model: process.env.OPENAI_MODEL || "gpt-4o-mini",
						temperature: 0.3,
						response_format: { type: "json_object" },
						messages: [
							{
								role: "system",
								content: `You are an expert email deliverability and anti-spam engineer for Reloop.
Rewrite the user's email subject line and body copy to eliminate 100% of spam trigger words, false urgency, exaggerated financial promises, and phishing phrases while preserving the core message, professional tone, and intent.
Always return valid JSON strictly matching:
{
  "subject": "Rewritten inbox-ready subject line",
  "body": "Rewritten inbox-ready body copy"
}`,
							},
							{
								role: "user",
								content: JSON.stringify({ subject, body }),
							},
						],
					}),
				});

				if (response.ok) {
					const json = await response.json();
					const content = json.choices?.[0]?.message?.content;
					if (content) {
						const parsed = JSON.parse(content);
						if (parsed.subject && parsed.body) {
							return NextResponse.json({
								subject: parsed.subject,
								body: parsed.body,
								engine: "gpt-4o-mini",
							});
						}
					}
				}
			} catch {
				// Fallback to local heuristic engine if API call fails
			}
		}

		// 2. If OpenRouter API key is available
		if (openrouterApiKey) {
			try {
				const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${openrouterApiKey}`,
					},
					body: JSON.stringify({
						model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
						temperature: 0.3,
						messages: [
							{
								role: "system",
								content: `You are an email deliverability engineer. Rewrite the subject and body to eliminate spam triggers and ensure inbox placement. Return JSON with keys "subject" and "body".`,
							},
							{
								role: "user",
								content: JSON.stringify({ subject, body }),
							},
						],
					}),
				});

				if (response.ok) {
					const json = await response.json();
					const content = json.choices?.[0]?.message?.content;
					if (content) {
						const parsed = JSON.parse(content);
						if (parsed.subject && parsed.body) {
							return NextResponse.json({
								subject: parsed.subject,
								body: parsed.body,
								engine: "openrouter-gpt-4o-mini",
							});
						}
					}
				}
			} catch {
				// Fallback to local heuristic engine
			}
		}

		// 3. Fallback to local high-precision deliverability heuristics
		const fallback = localDeliverabilityFix(subject, body);
		return NextResponse.json(fallback);
	} catch (err) {
		return NextResponse.json(
			{ error: (err as Error).message || "Internal server error" },
			{ status: 500 },
		);
	}
}
