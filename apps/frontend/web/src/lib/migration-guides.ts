import {
	getPostSource,
	getPublishedPosts,
} from "@reloop/web/lib/landing/blog/source";

/** Inline markdown (bold, code, links) is kept so the page can render it. */
export type MigrationStep = {
	title: string;
	detail: string;
	effort?: string;
};

/** A /migrate/<slug> guide built from the "Reloop vs X" blog post. */
export type MigrationGuide = {
	slug: string;
	competitor: string;
	description: string;
	intro: string[];
	steps: MigrationStep[];
	notes: string[];
	postSlug: string;
	/** Longer standalone guide, e.g. /blog/migrating-from-sendgrid. */
	fullGuideSlug?: string;
	image?: string;
};

const POST_PREFIX = "reloop-vs-";

/** "Switching from X to Reloop" in most posts; Cloudflare uses "Using both, or switching". */
const SWITCHING_HEADING =
	/^## (Switching from .+|Using both, or switching)\s*$/;

/** "Reloop vs Brevo (2026): Pricing..." -> "Brevo" */
function competitorFromTitle(title: string): string {
	return title.match(/^Reloop vs (.+?)(?:\s*\(|:|$)/)?.[1]?.trim() ?? title;
}

function sectionLines(body: string, heading: RegExp): string[] {
	const lines = body.split("\n");
	const start = lines.findIndex((line) => heading.test(line));
	if (start === -1) return [];
	const rest = lines.slice(start + 1);
	const end = rest.findIndex((line) => line.startsWith("## "));
	return end === -1 ? rest : rest.slice(0, end);
}

/**
 * "3. **Move templates.** Change ..." -> { title: "Move templates", detail: "Change ..." }
 * "1. **Add your domain** and publish ..." keeps the whole sentence as the detail,
 * since the bold lead is part of it.
 */
function parseStep(line: string): MigrationStep {
	const raw = line.replace(/^\d+\.\s+/, "").trim();
	const bold = raw.match(/^\*\*(.+?)\*\*\s*(.*)$/);
	if (!bold) return { title: raw, detail: "" };
	const lead = bold[1] ?? "";
	const rest = bold[2] ?? "";
	if (/[.:]$/.test(lead)) {
		return { title: lead.slice(0, -1), detail: rest };
	}
	const joiner = /^[,.;]/.test(rest) ? "" : " ";
	return { title: lead, detail: `${lead}${joiner}${rest}`.trim() };
}

/** Paragraph lines, skipping rules, blanks and list items. */
function paragraphs(lines: string[]): string[] {
	return lines
		.map((line) => line.trim())
		.filter((line) => line && line !== "---" && !/^\d+\.\s/.test(line));
}

/** "| 1. Verify your domain | What changes | Effort |" rows of a standalone guide. */
function stepsFromGlanceTable(postSlug: string): MigrationStep[] {
	const source = getPostSource(postSlug);
	if (!source) return [];
	return sectionLines(source.content, /^## The migration at a glance/)
		.filter((line) => line.trim().startsWith("|"))
		.slice(2)
		.flatMap((line) => {
			const [title, detail, effort] = line
				.trim()
				.replace(/^\||\|$/g, "")
				.split("|")
				.map((cell) => cell.trim());
			if (!title) return [];
			return [
				{
					title: title.replace(/^\d+\.\s*/, ""),
					detail: detail ?? "",
					effort,
				},
			];
		});
}

function buildGuide(postSlug: string): MigrationGuide | null {
	const source = getPostSource(postSlug);
	if (!source) return null;
	const { post, content } = source;
	const competitor = competitorFromTitle(post.title);
	const lines = sectionLines(content, SWITCHING_HEADING);
	if (lines.length === 0) return null;

	const firstStep = lines.findIndex((line) => /^\d+\.\s/.test(line));
	const lastStep = lines.findLastIndex((line) => /^\d+\.\s/.test(line));
	let steps =
		firstStep === -1
			? []
			: lines
					.slice(firstStep, lastStep + 1)
					.filter((line) => /^\d+\.\s/.test(line))
					.map(parseStep);
	// First paragraph leads the page; the rest (minus "To move X:" lead-ins) become notes.
	const before = paragraphs(
		firstStep === -1 ? lines : lines.slice(0, firstStep),
	).filter((line) => !line.endsWith(":"));
	const intro = before.slice(0, 1);
	const notes = [
		...before.slice(1),
		...(firstStep === -1 ? [] : paragraphs(lines.slice(lastStep + 1))),
	];

	// Posts like SendGrid's link out to a standalone guide instead of listing steps.
	const slug = postSlug.slice(POST_PREFIX.length);
	const fullGuideSlug = content.includes(`(/blog/migrating-from-${slug})`)
		? `migrating-from-${slug}`
		: undefined;
	if (steps.length === 0 && fullGuideSlug) {
		steps = stepsFromGlanceTable(fullGuideSlug);
	}
	if (steps.length === 0) return null;

	return {
		slug,
		competitor,
		description: `How to move from ${competitor} to Reloop: verify your domain, swap the send code, move templates and webhooks, and ramp traffic without downtime.`,
		intro,
		steps,
		notes,
		postSlug,
		fullGuideSlug,
		image: post.image,
	};
}

/** One guide per published "Reloop vs X" post that has switching steps. */
export function listMigrationGuides(): MigrationGuide[] {
	return getPublishedPosts()
		.filter((post) => post.slug.startsWith(POST_PREFIX))
		.flatMap((post) => buildGuide(post.slug) ?? [])
		.sort((a, b) => a.competitor.localeCompare(b.competitor));
}

export function getMigrationGuide(slug: string): MigrationGuide | null {
	const post = getPublishedPosts().find(
		(candidate) => candidate.slug === `${POST_PREFIX}${slug}`,
	);
	return post ? buildGuide(post.slug) : null;
}
