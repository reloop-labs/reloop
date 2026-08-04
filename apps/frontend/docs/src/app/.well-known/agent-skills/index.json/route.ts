import { createHash } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { AGENT_CACHE_CONTROL } from "../../../../lib/agent-headers";
import { readDocsAppFile } from "../../../../lib/docs-content-fs";

export async function GET(_request: NextRequest) {
	const origin = process.env.NEXT_PUBLIC_URL || "https://reloop.sh";
	const skill = readDocsAppFile("skill.md") ?? "";
	const digest = `sha256:${createHash("sha256").update(skill).digest("hex")}`;

	const body = {
		$schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
		skills: [
			{
				name: "reloop",
				type: "skill-md",
				description:
					"Use Reloop email infrastructure: API keys, send mail, domains, contacts, webhooks, and templates.",
				url: `${origin}/docs/.well-known/agent-skills/reloop/SKILL.md`,
				digest,
			},
		],
	};

	return NextResponse.json(body, {
		headers: {
			"Cache-Control": AGENT_CACHE_CONTROL,
		},
	});
}
