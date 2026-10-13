export type SvgTinyPsIssue = {
	status: "pass" | "warn" | "fail";
	code: string;
	detail: string;
	fix?: string;
};

export type SvgTinyPsResult = {
	ok: boolean;
	issues: SvgTinyPsIssue[];
};

const DISALLOWED = [
	{
		pattern: /<script[\s>]/i,
		code: "script",
		detail: "SVG contains a <script> element.",
	},
	{
		pattern: /<foreignObject[\s>]/i,
		code: "foreignObject",
		detail: "SVG contains <foreignObject>, which BIMI Tiny PS forbids.",
	},
	{
		pattern: /\bon[a-z]+\s*=/i,
		code: "event-handler",
		detail: "SVG contains an event handler attribute.",
	},
	{
		pattern: /javascript:/i,
		code: "javascript-url",
		detail: "SVG contains a javascript: URL.",
	},
	{
		pattern: /<(?:animate|animateTransform|animateMotion|set)[\s>]/i,
		code: "animation",
		detail: "SVG contains SMIL animation, which Tiny PS does not allow.",
	},
];

function extractAttr(svg: string, name: string): string | null {
	const match = svg.match(
		new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"),
	);
	return match?.[1] ?? null;
}

/**
 * Heuristic SVG Tiny Portable/Secure checks for BIMI logos.
 * Not a full SVG Tiny 1.2 parser — flags only the issues that stop a logo
 * from showing, not cosmetic header attributes.
 */
export function inspectSvgTinyPs(svg: string): SvgTinyPsResult {
	const issues: SvgTinyPsIssue[] = [];
	const trimmed = svg.trim();

	if (!/<svg[\s>]/i.test(trimmed)) {
		issues.push({
			status: "fail",
			code: "not-svg",
			detail: "Fetched body is not an SVG document.",
			fix: "Host an SVG Tiny PS logo at the l= URL, served as image/svg+xml.",
		});
		return { ok: false, issues };
	}

	// version="1.2" / baseProfile="tiny-ps" are not checked: inboxes render
	// logos without them (e.g. cnn.com), so flagging them is noise. We only
	// flag what actually stops a logo from showing.
	for (const rule of DISALLOWED) {
		if (rule.pattern.test(trimmed)) {
			issues.push({
				status: "fail",
				code: rule.code,
				detail: rule.detail,
				fix: "Export a static SVG Tiny PS logo with no scripts, animation, or external references.",
			});
		}
	}

	const hrefPattern = /(?:xlink:)?href\s*=\s*["']([^"']*)["']/gi;
	let hrefMatch: RegExpExecArray | null = hrefPattern.exec(trimmed);
	while (hrefMatch) {
		const href = (hrefMatch[1] || "").trim();
		if (!href.startsWith("#")) {
			issues.push({
				status: "fail",
				code: "external-ref",
				detail: "SVG references an external resource.",
				fix: "Embed all graphics inline. BIMI logos may not load remote assets.",
			});
			break;
		}
		hrefMatch = hrefPattern.exec(trimmed);
	}

	const viewBox = extractAttr(trimmed, "viewBox");
	if (viewBox) {
		const parts = viewBox
			.trim()
			.split(/[\s,]+/)
			.map(Number);
		const width = parts[2];
		const height = parts[3];
		if (
			width !== undefined &&
			height !== undefined &&
			width > 0 &&
			height > 0 &&
			width !== height
		) {
			issues.push({
				status: "warn",
				code: "not-square",
				detail: `viewBox is ${width}×${height}; BIMI logos should be square.`,
				fix: "Use a square viewBox (for example 0 0 128 128).",
			});
		}
	}

	const ok = issues.every((issue) => issue.status !== "fail");
	if (ok && issues.length === 0) {
		issues.push({
			status: "pass",
			code: "tiny-ps",
			detail:
				"SVG is square with no scripts, animation, or external references.",
		});
	}

	return { ok, issues };
}
