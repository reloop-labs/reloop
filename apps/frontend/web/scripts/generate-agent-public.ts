/**
 * Write agent discovery files into public/ (static serving).
 * Run: bun apps/frontend/web/scripts/generate-agent-public.ts
 */
import { createHash } from "node:crypto";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
// copyFileSync still used for skill → well-known
import { join } from "node:path";
import { loadMarketingCorpus } from "../src/lib/agent-content";
import { injectMarkdownAgentDirective } from "../src/lib/agent-directive";
import {
	freeDailyEmails,
	pricingSnapshotMarkdown,
} from "../src/lib/pricing-facts";
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
	console.log(
		`  wrote public/${rel} (${content.length.toLocaleString()} chars)`,
	);
}

// --- llms-full ---
const pages = loadMarketingCorpus();
const fullChunks: string[] = [
	"# Reloop Marketing (full)",
	"",
	"> Full-document snapshot of Reloop marketing site content for long-context agents.",
	`> Site index: ${origin}/llms.txt`,
	`> Product docs corpus: ${origin}/llms-full-docs.txt`,
	`> Docs index: ${origin}/llms-docs.txt`,
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
write(
	"pricing.md",
	injectMarkdownAgentDirective(buildPricingMarkdown(), {
		canonical: `${origin}/pricing`,
	}),
);

// --- agent page mirrors ---
const agentDir = join(root, "content/agent");
const mirrors: Array<[string, string, string]> = [
	["home.md", "index.md", ""],
	["about.md", "about.md", "/about"],
	["developers.md", "developers.md", "/developers"],
];
for (const [src, dest, page] of mirrors) {
	const from = join(agentDir, src);
	if (existsSync(from)) {
		const body = injectMarkdownAgentDirective(
			readFileSync(from, "utf-8").replace(
				/\*\*\d+ \/ day\*\*/g,
				`**${freeDailyEmails} / day**`,
			),
			{ canonical: `${origin}${page}` },
		);
		write(dest, body);
	}
}

const llmsPath = join(pub, "llms.txt");
if (existsSync(llmsPath)) {
	const raw = readFileSync(llmsPath, "utf-8");
	const snapshotHeading = "## Hosted pricing snapshot (Reloop Cloud)";
	const start = raw.indexOf(snapshotHeading);
	const end = raw.indexOf("\n## ", start + snapshotHeading.length);
	if (start === -1 || end === -1) {
		throw new Error("llms.txt is missing the hosted pricing snapshot section");
	}
	write(
		"llms.txt",
		`${raw.slice(0, start)}${snapshotHeading}\n\n${pricingSnapshotMarkdown()}\n${raw.slice(end)}`,
	);
}

// --- skill.md / llms-docs.txt are hand-maintained in public/ ---
for (const name of ["skill.md", "llms-docs.txt"] as const) {
	if (!existsSync(join(pub, name))) {
		console.warn(
			`  missing public/${name} (expected hand-maintained source of truth)`,
		);
	} else {
		console.log(`  kept public/${name}`);
	}
}

// --- .well-known discovery ---
const productMcp = `${origin}/mcp`;
const docsMcp = `${origin}/docs/mcp`;
const productMcpVersion = (
	JSON.parse(
		readFileSync(join(root, "../../backend/mcp/package.json"), "utf-8"),
	) as { version: string }
).version;
const productCard = `${origin}/.well-known/mcp-server-cards/reloop.json`;
const docsCard = `${origin}/.well-known/mcp-server-cards/docs.json`;
const icons = [
	{
		src: `${origin}/web-app-manifest-512x512.png`,
		mimeType: "image/png",
		sizes: ["512x512"],
	},
	{ src: `${origin}/icon.svg`, mimeType: "image/svg+xml", sizes: ["any"] },
];
const repository = {
	url: "https://github.com/reloop-labs/reloop",
	source: "github",
};

// Server cards (draft MCP server-card extension); no tools[]: agents trust the live tools/list.
const serverCardSchema =
	"https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json";
write(
	".well-known/mcp-server-cards/reloop.json",
	`${JSON.stringify(
		{
			$schema: serverCardSchema,
			name: "sh.reloop/mcp",
			title: "Reloop",
			description:
				"Send email and manage domains, contacts, templates, automations and inboxes on Reloop.",
			version: productMcpVersion,
			websiteUrl: `${origin}/features/mcp`,
			icons,
			repository: { ...repository, subfolder: "apps/backend/mcp" },
			remotes: [{ type: "streamable-http", url: productMcp }],
			// Auth isn't a server-card field; vendor data belongs under _meta
			_meta: {
				"sh.reloop/auth": {
					type: "oauth2",
					protectedResourceMetadata: `${origin}/.well-known/oauth-protected-resource/mcp`,
					alternatives: ["Reloop API key as `Authorization: Bearer rl_...`"],
				},
			},
		},
		null,
		2,
	)}\n`,
);
write(
	".well-known/mcp-server-cards/docs.json",
	`${JSON.stringify(
		{
			$schema: serverCardSchema,
			name: "sh.reloop/docs-mcp",
			title: "Reloop Docs",
			description: "Search and read the Reloop documentation as markdown.",
			version: "1.0.0",
			websiteUrl: `${origin}/docs/integrations/ai-tools/mcp-server`,
			icons,
			repository: { ...repository, subfolder: "apps/frontend/docs" },
			remotes: [{ type: "streamable-http", url: docsMcp }],
		},
		null,
		2,
	)}\n`,
);

const mcpServers = [
	{
		name: "reloop",
		url: productMcp,
		transport: "http",
		authentication: "oauth2",
		description:
			"Act on a Reloop account: send email, manage domains, contacts, templates, automations and inboxes",
		card: productCard,
	},
	{
		name: "docs",
		url: docsMcp,
		transport: "http",
		authentication: "none",
		description: "Search and retrieve Reloop documentation as markdown",
		card: docsCard,
	},
];
const mcpManifest = `${JSON.stringify(
	{ version: "1.0.0", transport: "http", url: productMcp, servers: mcpServers },
	null,
	2,
)}\n`;
write(".well-known/mcp.json", mcpManifest);
write(".well-known/mcp", mcpManifest);

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
					// Hash of the served bytes so agents can verify what they fetched
					digest: `sha256:${createHash("sha256")
						.update(readFileSync(join(pub, "skill.md")))
						.digest("hex")}`,
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

write(
	"install.sh",
	readFileSync(join(root, "../../../install/install.sh"), "utf-8"),
);

console.log("Done: agent files in public/");
