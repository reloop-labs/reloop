import type { BlogPostDefinition } from "../types";

export const post: BlogPostDefinition = {
	slug: "send-email-nextjs-guide",
	title: "How to Send Email in Next.js",
	description: "Send transactional email from Next.js App Router using Reloop's Node.js SDK in Server Actions and Route Handlers.",
	keywords: [
		"send email Next.js",
		"Next.js email tutorial",
		"Next.js transactional email",
	],
	publishedAt: "2026-05-10",
	tag: "Tutorial",
	readTime: "6 min read",
	sections: [
		{
			heading: "Install the SDK",
			paragraphs: [
				"Run npm install reloop-email and add RELOOP_API_KEY to .env.local. Never expose the key to the client—send only from server components, Server Actions, or Route Handlers.",
			],
		},
		{
			heading: "Server Action example",
			paragraphs: [
				"Create a sendWelcomeEmail action that calls reloop.emails.send after signup. Return success or error to the client without leaking API details.",
			],
		},
		{
			heading: "Deploy on Vercel",
			paragraphs: [
				"Add RELOOP_API_KEY to Vercel environment variables. The HTTP API works on Edge Runtime where SMTP does not.",
			],
		},
	],
};
