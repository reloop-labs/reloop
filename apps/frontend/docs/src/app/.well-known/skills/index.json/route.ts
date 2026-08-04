import { type NextRequest, NextResponse } from "next/server";
import { AGENT_CACHE_CONTROL } from "../../../../lib/agent-headers";

export async function GET(_request: NextRequest) {
	const origin = process.env.NEXT_PUBLIC_URL || "https://reloop.sh";
	const body = {
		skills: [
			{
				name: "reloop",
				description:
					"Use Reloop email infrastructure: API keys, send mail, domains, contacts, webhooks, and templates.",
				files: ["SKILL.md"],
				url: `${origin}/docs/skill.md`,
			},
		],
	};

	return NextResponse.json(body, {
		headers: {
			"Cache-Control": AGENT_CACHE_CONTROL,
		},
	});
}
