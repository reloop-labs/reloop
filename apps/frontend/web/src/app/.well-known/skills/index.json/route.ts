import { NextResponse } from "next/server";

const ORIGIN = process.env.NEXT_PUBLIC_URL || "https://reloop.sh";

export async function GET() {
	return NextResponse.json(
		{
			skills: [
				{
					name: "reloop",
					description:
						"Use Reloop email infrastructure: API keys, send mail, domains, contacts, webhooks, and templates.",
					files: ["SKILL.md"],
					url: `${ORIGIN}/docs/skill.md`,
				},
			],
		},
		{
			headers: {
				"Cache-Control": "public, max-age=300, s-maxage=3600, must-revalidate",
			},
		},
	);
}
