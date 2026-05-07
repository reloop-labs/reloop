import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
	const cwd = process.cwd();
	const structure: Record<string, string[]> = {};

	const scan = (dir: string, label: string) => {
		try {
			if (existsSync(dir)) {
				structure[label] = readdirSync(dir);
			} else {
				structure[label] = ["NOT_FOUND"];
			}
		} catch (e: any) {
			structure[label] = [`ERROR: ${e.message}`];
		}
	};

	scan(cwd, "cwd");
	scan(join(cwd, "content"), "cwd_content");
	scan(join(cwd, "content/docs"), "cwd_content_docs");
	scan(join(cwd, "apps/frontend/docs/content/docs"), "monorepo_content_docs");
	scan("/", "root");
	scan("/app", "app_root");
	scan("/app/content", "app_content");

	return NextResponse.json({
		cwd,
		structure,
		env: process.env.NODE_ENV,
	});
}
