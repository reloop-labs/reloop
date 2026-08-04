/**
 * Write agent discovery files into public/ (static serving).
 * Run: bun apps/frontend/web/scripts/generate-agent-public.ts
 */
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { loadMarketingCorpus } from "../src/lib/agent-content";
import { injectMarkdownAgentDirective } from "../src/lib/agent-directive";
import { buildPricingMarkdown } from "../src/lib/pricing-md";

const root = join(import.meta.dirname, "..");
const pub = join(root, "public");
const origin = "https://reloop.sh";

function ensureDir(dir: string) {
	mkdirSync(dir, { recursive: true });
}

function write(rel: string, content: string) {
	const path = join(pub, rel);
	ensureDir(join(path, ".."));
	writeFileSync(path, content, "utf-8");
	console.log(`  wrote public/${rel} (${content.length.toLocaleString()} chars)`);
}

// --- llms-full ---
const pages = loadMarketingCorpus();
const fullChunks: string[] = [
	"# Reloop Marketing (full)",
	"",
	"> Full-document snapshot of Reloop marketing site content for long-context agents.",
	`> Site index: ${origin}/llms.txt`,
	`> Product docs corpus: ${origin}/docs/llms-full.txt`,
	`> Product skill: ${origin}/skill.md`,
	"",
	`Generated from ${pages.length} pages.`,
	"",
];
for (const page of pages) {
	fullChunks.push("---", "");
	fullChunks.push(`# ${page.title}`);
	fullChunks.push("");
	fullChunks.push(`Path: ${page.path}`);
	fullChunks.push(`URL: ${origin}${page.path === "/" ? "" : page.path}`);
	fullChunks.push(
		`Markdown: ${origin}${page.path === "/" ? "/index" : page.path}.md`,
	);
	fullChunks.push("");
	fullChunks.push(page.body);
	fullChunks.push("");
}
write("llms-full.txt", fullChunks.join("\n"));

// --- pricing.md ---
write("pricing.md", injectMarkdownAgentDirective(buildPricingMarkdown()));

// --- agent page mirrors ---
const agentDir = join(root, "content/agent");
const mirrors: Array<[string, string]> = [
	["home.md", "index.md"],
	["about.md", "about.md"],
	["developers.md", "developers.md"],
];
for (const [src, dest] of mirrors) {
	const from = join(agentDir, src);
	if (existsSync(from)) {
		const body = injectMarkdownAgentDirective(readFileSync(from, "utf-8"));
		write(dest, body);
	}
}

// --- skill.md (source of truth can live next to script or already in public) ---
const skillCandidates = [
	join(pub, "skill.md"),
	join(root, "skill.md"),
	join(root, "../docs/public/skill.md"),
	join(root, "../docs/skill.md"),
];
let skill: string | null = null;
for (const p of skillCandidates) {
	if (existsSync(p)) {
		skill = readFileSync(p, "utf-8");
		break;
	}
}
if (skill) {
	// Prefer origin-level discovery links
	const normalized = skill
		.replaceAll("https://reloop.sh/docs/llms.txt", "https://reloop.sh/llms.txt")
		.replace(
			"llms: https://reloop.sh/docs/llms.txt",
			"llms: https://reloop.sh/llms.txt",
		);
	// If still missing site index section, leave as-is when already adapted
	write("skill.md", skill.includes("Site index:") ? skill : normalized);
}

// --- llms.txt must already exist in public or repo ---
const llmsSrc = existsSync(join(pub, "llms.txt"))
	? join(pub, "llms.txt")
	: join(root, "llms.txt");
if (existsSync(llmsSrc) && llmsSrc !== join(pub, "llms.txt")) {
	copyFileSync(llmsSrc, join(pub, "llms.txt"));
	console.log("  copied llms.txt → public/");
}

// --- .well-known discovery ---
const siteMcp = `${origin}/mcp`;
const docsMcp = `${origin}/docs/mcp`;

write(
	".well-known/mcp.json",
	`${JSON.stringify(
		{
			version: "1.0.0",
			transport: "http",
			url: siteMcp,
			servers: [
				{
					name: "site",
					url: siteMcp,
					transport: "http",
					authentication: "none",
					description: "Search Reloop marketing site content",
				},
				{
					name: "docs",
					url: docsMcp,
					transport: "http",
					authentication: "none",
					description: "Search and retrieve Reloop documentation as markdown",
				},
			],
		},
		null,
		2,
	)}\n`,
);

write(
	".well-known/mcp",
	`${JSON.stringify(
		{
			version: "1.0.0",
			transport: "http",
			url: siteMcp,
			servers: [
				{ name: "site", url: siteMcp, transport: "http", authentication: "none" },
				{ name: "docs", url: docsMcp, transport: "http", authentication: "none" },
			],
		},
		null,
		2,
	)}\n`,
);

write(
	".well-known/skills/index.json",
	`${JSON.stringify(
		{
			skills: [
				{
					name: "reloop",
					description:
						"Use Reloop email infrastructure: API keys, send mail, domains, contacts, webhooks, and templates.",
					files: ["SKILL.md"],
					url: `${origin}/skill.md`,
				},
			],
		},
		null,
		2,
	)}\n`,
);

write(
	".well-known/agent-skills/index.json",
	`${JSON.stringify(
		{
			$schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
			skills: [
				{
					name: "reloop",
					type: "skill-md",
					description:
						"Use Reloop email infrastructure: API keys, send mail, domains, contacts, webhooks, and templates.",
					url: `${origin}/skill.md`,
				},
			],
		},
		null,
		2,
	)}\n`,
);

if (existsSync(join(pub, "skill.md"))) {
	ensureDir(join(pub, ".well-known/agent-skills/reloop"));
	copyFileSync(
		join(pub, "skill.md"),
		join(pub, ".well-known/agent-skills/reloop/SKILL.md"),
	);
	console.log("  wrote public/.well-known/agent-skills/reloop/SKILL.md");
}

console.log("Done: agent files in public/");
