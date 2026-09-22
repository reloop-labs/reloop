#!/usr/bin/env bun
/**
 * One-shot generator: add free-lane directories from the Hridoy Reh 94 list.
 * Run from tools/launch-submitter. Does not touch Reloop app code.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "directories");

type Entry = {
	id: string;
	name: string;
	submitUrl: string;
	homepage: string;
	domainRating: number;
	linkType?: "dofollow" | "nofollow" | "unknown";
	approval?: string;
	requiresAccount?: boolean;
	notes?: string;
	accepts?: string[];
};

/** Already shipped — skip */
const EXISTING = new Set([
	"saashub",
	"uneed",
	"peerlist",
	"f6s",
	"indie-hackers",
	"launching-next",
	"openalternative",
	"devto",
	"show-hn",
	"alternativeto",
	"startup-stash",
	"sideprojectors",
	"toolfolio",
]);

/** Free-lane (or freemium with free submit) from the 94 list */
const ENTRIES: Entry[] = [
	{
		id: "product-hunt",
		name: "Product Hunt",
		submitUrl: "https://www.producthunt.com/posts/new",
		homepage: "https://www.producthunt.com",
		domainRating: 91,
		linkType: "dofollow",
		approval: "same day when scheduled",
		requiresAccount: true,
		notes: "Free. Personal account required. Prefer scheduling a launch day; human review of gallery/tagline is expected.",
		accepts: ["saas", "developer-tools", "email", "any"],
	},
	{
		id: "trustmrr",
		name: "TrustMRR",
		submitUrl: "https://trustmrr.com/submit",
		homepage: "https://trustmrr.com",
		domainRating: 71,
		notes: "Revenue-focused directory; confirm free submit path is open.",
	},
	{
		id: "tiny-startups",
		name: "Tiny Startups",
		submitUrl: "https://www.tinystartups.com/submit",
		homepage: "https://www.tinystartups.com",
		domainRating: 71,
	},
	{
		id: "sourceforge",
		name: "SourceForge",
		submitUrl: "https://sourceforge.net/software/vendors/new",
		homepage: "https://sourceforge.net",
		domainRating: 92,
		linkType: "nofollow",
		notes: "Business listing free lane; outbound links often redirect/nofollow.",
		accepts: ["open-source", "developer-tools", "saas", "any"],
	},
	{
		id: "fazier",
		name: "Fazier",
		submitUrl: "https://fazier.com/submit",
		homepage: "https://fazier.com",
		domainRating: 83,
		linkType: "dofollow",
		approval: "within ~30 days free",
		notes: "Free lane exists; paid skips queue. Free may expect badge/comments.",
	},
	{
		id: "scroll-launch",
		name: "Scroll Launch",
		submitUrl: "https://scrolllaunch.com/submit",
		homepage: "https://scrolllaunch.com",
		domainRating: 70,
	},
	{
		id: "devhunt",
		name: "Dev Hunt",
		submitUrl: "https://devhunt.org/submit",
		homepage: "https://devhunt.org",
		domainRating: 63,
		accepts: ["developer-tools", "open-source", "any"],
	},
	{
		id: "startupbase",
		name: "StartupBase",
		submitUrl: "https://startupbase.io/submit",
		homepage: "https://startupbase.io",
		domainRating: 73,
	},
	{
		id: "show-me-best-ai",
		name: "Show Me Best AI",
		submitUrl: "https://www.showmebest.ai/submit",
		homepage: "https://www.showmebest.ai",
		domainRating: 76,
		accepts: ["ai", "saas", "any"],
	},
	{
		id: "earlyhunt",
		name: "EarlyHunt",
		submitUrl: "https://earlyhunt.com/submit",
		homepage: "https://earlyhunt.com",
		domainRating: 63,
	},
	{
		id: "startup-fame",
		name: "Startup Fame",
		submitUrl: "https://startupfa.me/submit",
		homepage: "https://startupfa.me",
		domainRating: 83,
		linkType: "dofollow",
		approval: "about a week free",
		notes: "Free queue; paid skips verification.",
	},
	{
		id: "aura-plus",
		name: "Aura++",
		submitUrl: "https://auraplusplus.com/submit",
		homepage: "https://auraplusplus.com",
		domainRating: 73,
	},
	{
		id: "seo-wins",
		name: "SEO Wins",
		submitUrl: "https://seowins.co/submit",
		homepage: "https://seowins.co",
		domainRating: 32,
	},
	{
		id: "startup-ranking",
		name: "Startup Ranking",
		submitUrl: "https://www.startupranking.com/startup/create",
		homepage: "https://www.startupranking.com",
		domainRating: 61,
		requiresAccount: true,
	},
	{
		id: "pitchwall",
		name: "PitchWall",
		submitUrl: "https://pitchwall.co/product/submit",
		homepage: "https://pitchwall.co",
		domainRating: 69,
	},
	{
		id: "tiny-launch",
		name: "Tiny Launch",
		submitUrl: "https://tinylaunch.com/submit",
		homepage: "https://tinylaunch.com",
		domainRating: 73,
	},
	{
		id: "startup-buffer",
		name: "Startup Buffer",
		submitUrl: "https://startupbuffer.com/submit-startup",
		homepage: "https://startupbuffer.com",
		domainRating: 43,
	},
	{
		id: "smol-launch",
		name: "Smol Launch",
		submitUrl: "https://smollaunch.com/submit",
		homepage: "https://smollaunch.com",
		domainRating: 74,
	},
	{
		id: "launchigniter",
		name: "LaunchIgniter",
		submitUrl: "https://launchigniter.com/submit",
		homepage: "https://launchigniter.com",
		domainRating: 74,
	},
	{
		id: "openhunts",
		name: "OpenHunts",
		submitUrl: "https://openhunts.com/submit",
		homepage: "https://openhunts.com",
		domainRating: 71,
	},
	{
		id: "open-launch",
		name: "Open Launch",
		submitUrl: "https://open-launch.com/submit",
		homepage: "https://open-launch.com",
		domainRating: 72,
	},
	{
		id: "ai-tools",
		name: "AI Tools",
		submitUrl: "https://aitools.inc/submit",
		homepage: "https://aitools.inc",
		domainRating: 67,
		accepts: ["ai", "any"],
	},
	{
		id: "tinyhunt",
		name: "TinyHunt",
		submitUrl: "https://tinyhunt.co/submit",
		homepage: "https://tinyhunt.co",
		domainRating: 43,
	},
	{
		id: "software-suggest",
		name: "Software Suggest",
		submitUrl: "https://www.softwaresuggest.com/vendors/register",
		homepage: "https://www.softwaresuggest.com",
		domainRating: 77,
		requiresAccount: true,
		notes: "Vendor registration; free listing path varies by category.",
	},
	{
		id: "magicbox",
		name: "MagicBox",
		submitUrl: "https://magicbox.tools/submit",
		homepage: "https://magicbox.tools",
		domainRating: 68,
	},
	{
		id: "theres-an-ai-for-that",
		name: "There's an AI for That",
		submitUrl: "https://theresanaiforthat.com/submit/",
		homepage: "https://theresanaiforthat.com",
		domainRating: 77,
		accepts: ["ai", "any"],
	},
	{
		id: "altern",
		name: "Altern",
		submitUrl: "https://altern.ai/submit",
		homepage: "https://altern.ai",
		domainRating: 49,
	},
	{
		id: "resource-fyi",
		name: "Resource FYI",
		submitUrl: "https://resource.fyi/submit",
		homepage: "https://resource.fyi",
		domainRating: 31,
	},
	{
		id: "saas-genius",
		name: "SaaS Genius",
		submitUrl: "https://saasgenius.com/submit",
		homepage: "https://saasgenius.com",
		domainRating: 57,
	},
	{
		id: "peerpush",
		name: "PeerPush",
		submitUrl: "https://peerpush.net/submit",
		homepage: "https://peerpush.net",
		domainRating: 75,
	},
	{
		id: "clutch",
		name: "Clutch",
		submitUrl: "https://clutch.co/profile/create",
		homepage: "https://clutch.co",
		domainRating: 91,
		requiresAccount: true,
		notes: "B2B profile; free basic profile may be limited. Heavy human review.",
		accepts: ["saas", "any"],
	},
	{
		id: "future-tools",
		name: "Future Tools",
		submitUrl: "https://www.futuretools.io/submit",
		homepage: "https://www.futuretools.io",
		domainRating: 69,
		accepts: ["ai", "any"],
	},
	{
		id: "futurepedia",
		name: "Futurepedia",
		submitUrl: "https://www.futurepedia.io/submit-tool",
		homepage: "https://www.futurepedia.io",
		domainRating: 72,
		accepts: ["ai", "any"],
	},
	{
		id: "toolify",
		name: "Toolify",
		submitUrl: "https://www.toolify.ai/submit",
		homepage: "https://www.toolify.ai",
		domainRating: 73,
		accepts: ["ai", "saas", "any"],
	},
	{
		id: "ai-valley",
		name: "AI Valley",
		submitUrl: "https://aivalley.ai/submit-tool/",
		homepage: "https://aivalley.ai",
		domainRating: 33,
		accepts: ["ai", "any"],
	},
	{
		id: "ai-tools-club",
		name: "AI Tools Club",
		submitUrl: "https://aitoolsclub.com/submit",
		homepage: "https://aitoolsclub.com",
		domainRating: 35,
		accepts: ["ai", "any"],
	},
	{
		id: "startup-fast",
		name: "Startup Fast",
		submitUrl: "https://startupfast.app/submit",
		homepage: "https://startupfast.app",
		domainRating: 72,
	},
	{
		id: "ai-parabellum",
		name: "AI Parabellum",
		submitUrl: "https://aiparabellum.com/submit",
		homepage: "https://aiparabellum.com",
		domainRating: 34,
		accepts: ["ai", "any"],
	},
	{
		id: "makerhunt",
		name: "MakerHunt",
		submitUrl: "https://makerhunt.co/submit",
		homepage: "https://makerhunt.co",
		domainRating: 45,
	},
	{
		id: "aixploria",
		name: "AIxploria",
		submitUrl: "https://www.aixploria.com/en/add/",
		homepage: "https://www.aixploria.com",
		domainRating: 56,
		accepts: ["ai", "any"],
	},
	{
		id: "dev-resources",
		name: "Dev Resources",
		submitUrl: "https://devresourc.es/submit",
		homepage: "https://devresourc.es",
		domainRating: 40,
		accepts: ["developer-tools", "any"],
	},
	{
		id: "sidehunt",
		name: "SideHunt",
		submitUrl: "https://sidehunt.org/submit",
		homepage: "https://sidehunt.org",
		domainRating: 44,
	},
	{
		id: "ai-tool-directory",
		name: "AI Tool Directory",
		submitUrl: "https://aitoolsdirectory.com/submit",
		homepage: "https://aitoolsdirectory.com",
		domainRating: 52,
		accepts: ["ai", "any"],
	},
	{
		id: "top-ai-tools",
		name: "Top AI Tools",
		submitUrl: "https://topaitools.com/submit",
		homepage: "https://topaitools.com",
		domainRating: 64,
		accepts: ["ai", "any"],
	},
	{
		id: "findly-tools",
		name: "Findly Tools",
		submitUrl: "https://findly.tools/submit",
		homepage: "https://findly.tools",
		domainRating: 81,
		notes: "Free lane often expects a footer badge for dofollow.",
	},
	{
		id: "dang-ai",
		name: "Dang AI",
		submitUrl: "https://dang.ai/submit",
		homepage: "https://dang.ai",
		domainRating: 82,
		linkType: "dofollow",
		notes: "Free lane may require permanent dofollow backlink/badge.",
		accepts: ["ai", "any"],
	},
	{
		id: "turbo0",
		name: "Turbo0",
		submitUrl: "https://turbo0.com/submit",
		homepage: "https://turbo0.com",
		domainRating: 80,
	},
	{
		id: "versily",
		name: "Versily",
		submitUrl: "https://versily.com/submit",
		homepage: "https://versily.com",
		domainRating: 68,
	},
	{
		id: "twelve-tools",
		name: "Twelve Tools",
		submitUrl: "https://twelve.tools/submit",
		homepage: "https://twelve.tools",
		domainRating: 81,
		linkType: "dofollow",
		notes: "Free lane typically one dofollow for a badge.",
	},
	{
		id: "nxgn-tools",
		name: "NxGn Tools",
		submitUrl: "https://nxgntools.com/submit",
		homepage: "https://nxgntools.com",
		domainRating: 69,
	},
	{
		id: "software-world",
		name: "Software World",
		submitUrl: "https://softwareworld.co/submit",
		homepage: "https://softwareworld.co",
		domainRating: 73,
	},
	{
		id: "foundrlist",
		name: "FoundrList",
		submitUrl: "https://foundrlist.com/submit",
		homepage: "https://foundrlist.com",
		domainRating: 72,
	},
	{
		id: "neeed-directory",
		name: "Neeed Directory",
		submitUrl: "https://neeeed.com/submit",
		homepage: "https://neeeed.com",
		domainRating: 73,
	},
	{
		id: "tool-pilot",
		name: "Tool Pilot",
		submitUrl: "https://www.toolpilot.ai/submit",
		homepage: "https://www.toolpilot.ai",
		domainRating: 78,
		notes: "Free lane may want a backlink; long review possible.",
	},
	{
		id: "uno-directory",
		name: "UNO Directory",
		submitUrl: "https://unodirectory.com/submit",
		homepage: "https://unodirectory.com",
		domainRating: 66,
	},
	{
		id: "huzzler",
		name: "Huzzler",
		submitUrl: "https://huzzler.io/submit",
		homepage: "https://huzzler.io",
		domainRating: 64,
	},
	{
		id: "firsto",
		name: "Firsto",
		submitUrl: "https://firsto.co/submit",
		homepage: "https://firsto.co",
		domainRating: 56,
	},
	{
		id: "daily-pings",
		name: "Daily Pings",
		submitUrl: "https://dailypings.com/submit",
		homepage: "https://dailypings.com",
		domainRating: 56,
	},
	{
		id: "micro-saas-examples",
		name: "Micro SaaS Examples",
		submitUrl: "https://microsaasexamples.com/submit",
		homepage: "https://microsaasexamples.com",
		domainRating: 49,
	},
	{
		id: "indie-hunt",
		name: "Indie Hunt",
		submitUrl: "https://indiehunt.com/submit",
		homepage: "https://indiehunt.com",
		domainRating: 63,
	},
	{
		id: "build-voyage",
		name: "Build Voyage",
		submitUrl: "https://buildvoyage.com/submit",
		homepage: "https://buildvoyage.com",
		domainRating: 43,
	},
	{
		id: "product-burst",
		name: "Product Burst",
		submitUrl: "https://productburst.com/submit",
		homepage: "https://productburst.com",
		domainRating: 40,
	},
	{
		id: "try-launch",
		name: "Try Launch",
		submitUrl: "https://trylaunch.com/submit",
		homepage: "https://trylaunch.com",
		domainRating: 56,
	},
	{
		id: "find-your-saas",
		name: "Find Your SaaS",
		submitUrl: "https://findyoursaas.com/submit",
		homepage: "https://findyoursaas.com",
		domainRating: 44,
	},
	{
		id: "saas-hunt",
		name: "SaaS Hunt",
		submitUrl: "https://saashunt.com/submit",
		homepage: "https://saashunt.com",
		domainRating: 60,
	},
	{
		id: "startup-listing",
		name: "Startup Listing",
		submitUrl: "https://startuplisting.com/submit",
		homepage: "https://startuplisting.com",
		domainRating: 40,
	},
	{
		id: "promote-project",
		name: "Promote Project",
		submitUrl: "https://promoteproject.com/submit",
		homepage: "https://promoteproject.com",
		domainRating: 50,
	},
	{
		id: "idea-kiln",
		name: "Idea Kiln",
		submitUrl: "https://ideakiln.com/submit",
		homepage: "https://ideakiln.com",
		domainRating: 51,
	},
	{
		id: "indiehub",
		name: "IndieHub",
		submitUrl: "https://indiehub.best/submit",
		homepage: "https://indiehub.best",
		domainRating: 40,
	},
	{
		id: "euro-alternative",
		name: "Euro Alternative",
		submitUrl: "https://euroalternative.co/submit",
		homepage: "https://euroalternative.co",
		domainRating: 38,
	},
	{
		id: "open-tools",
		name: "Open Tools",
		submitUrl: "https://opentools.ai/submit",
		homepage: "https://opentools.ai",
		domainRating: 69,
		accepts: ["ai", "open-source", "any"],
	},
	{
		id: "startupblink",
		name: "StartupBlink",
		submitUrl: "https://www.startupblink.com/startups/new",
		homepage: "https://www.startupblink.com",
		domainRating: 72,
		requiresAccount: true,
	},
	{
		id: "appscribed",
		name: "Appscribed",
		submitUrl: "https://appscribed.com/submit",
		homepage: "https://appscribed.com",
		domainRating: 41,
	},
	{
		id: "seofai",
		name: "SEOFAI",
		submitUrl: "https://seofai.com/submit",
		homepage: "https://seofai.com",
		domainRating: 19,
		accepts: ["ai", "any"],
	},
	{
		id: "powerusers-ai",
		name: "Powerusers AI",
		submitUrl: "https://powerusers.ai/submit",
		homepage: "https://powerusers.ai",
		domainRating: 33,
		accepts: ["ai", "any"],
	},
	{
		id: "ai-for-developers",
		name: "AI for Developers",
		submitUrl: "https://aidev.tools/submit",
		homepage: "https://aidev.tools",
		domainRating: 21,
		accepts: ["ai", "developer-tools", "any"],
	},
	{
		id: "shipboost",
		name: "ShipBoost",
		submitUrl: "https://shipboost.io/submit",
		homepage: "https://shipboost.io",
		domainRating: 50,
	},
	{
		id: "launch-vault",
		name: "Launch Vault",
		submitUrl: "https://launchvault.dev/submit",
		homepage: "https://launchvault.dev",
		domainRating: 56,
	},
	{
		id: "toolfame",
		name: "ToolFame",
		submitUrl: "https://toolfame.com/submit",
		homepage: "https://toolfame.com",
		domainRating: 75,
	},
	{
		id: "public-apis",
		name: "Public APIs",
		submitUrl: "https://github.com/public-apis/public-apis",
		homepage: "https://github.com/public-apis/public-apis",
		domainRating: 46,
		requiresAccount: true,
		notes: "Usually a GitHub PR, not a form. Tool opens the repo; you open a PR.",
		accepts: ["developer-tools", "open-source", "any"],
	},
	{
		id: "hacker-news",
		name: "Hacker News",
		submitUrl: "https://news.ycombinator.com/submit",
		homepage: "https://news.ycombinator.com",
		domainRating: 91,
		linkType: "dofollow",
		requiresAccount: true,
		notes: "Same form as Show HN. Prefer show-hn playbook for Reloop-style launches.",
		accepts: ["developer-tools", "open-source", "any"],
	},
];

/** Paid-only / no reliable free lane on the 94 list — documented skip */
const SKIPPED_PAID = [
	{ id: "betalist", reason: "No free lane (paid listings)" },
	{ id: "microlaunch", reason: "Paid-only launch" },
	{ id: "getapp", reason: "Vendor marketplace; not a simple free submit" },
];

function stepsFor(entry: Entry) {
	return [
		{ action: "goto", url: entry.submitUrl },
		{ action: "wait", ms: 1500 },
		{ action: "humanGate" },
		{
			action: "fill",
			selector: "input[type='url'], input[name='url'], input[name='website'], input[placeholder*='URL' i], input[placeholder*='website' i]",
			valueFrom: "url",
			optional: true,
		},
		{
			action: "fill",
			selector: "input[name='name'], input[name='title'], input[placeholder*='name' i], input[placeholder*='title' i]",
			valueFrom: "name",
			optional: true,
		},
		{
			action: "fill",
			selector: "input[name='tagline'], input[placeholder*='tagline' i], input[placeholder*='slogan' i]",
			valueFrom: "tagline",
			optional: true,
		},
		{
			action: "fill",
			selector: "textarea[name='description'], textarea[placeholder*='description' i], textarea",
			valueFrom: "shortDescription",
			optional: true,
		},
		{ action: "humanGate" },
	];
}

async function exists(file: string) {
	try {
		await access(file);
		return true;
	} catch {
		return false;
	}
}

await mkdir(OUT, { recursive: true });

let created = 0;
let skippedExisting = 0;

for (const entry of ENTRIES) {
	if (EXISTING.has(entry.id)) {
		skippedExisting++;
		continue;
	}
	const file = path.join(OUT, `${entry.id}.json`);
	if (await exists(file)) {
		skippedExisting++;
		continue;
	}
	const doc = {
		id: entry.id,
		name: entry.name,
		submitUrl: entry.submitUrl,
		homepage: entry.homepage,
		pricing: "free",
		domainRating: entry.domainRating,
		linkType: entry.linkType ?? "unknown",
		approval: entry.approval ?? "varies",
		requiresAccount: entry.requiresAccount ?? false,
		accepts: entry.accepts ?? ["saas", "developer-tools", "any"],
		rejects: [],
		notes:
			entry.notes ??
			"Added from the public 94-places launch list. Verify free lane and selectors before a live run.",
		lastChecked: "2026-09-22",
		source: "https://x.com/hridoyreh/status/2101574360385360122",
		steps: stepsFor(entry),
	};
	await writeFile(file, `${JSON.stringify(doc, null, "\t")}\n`);
	created++;
}

const skipNote = path.join(OUT, "_skipped-paid.json");
await writeFile(
	skipNote,
	`${JSON.stringify(
		{
			note: "From the 94 list but not added as free playbooks",
			skipped: SKIPPED_PAID,
		},
		null,
		"\t",
	)}\n`,
);

console.log(
	JSON.stringify(
		{
			created,
			skippedExisting,
			skippedPaid: SKIPPED_PAID.length,
			totalFilesHint: "run: ls directories/*.json | wc -l",
		},
		null,
		2,
	),
);
