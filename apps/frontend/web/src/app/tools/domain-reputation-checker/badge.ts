import type { ReputationGrade } from "./check-api";

const GRADE_COLOR: Record<ReputationGrade, string> = {
	"A+": "#16a34a",
	A: "#22c55e",
	B: "#3b82f6",
	C: "#f59e0b",
	D: "#f97316",
	F: "#e11d48",
};

const LABEL = "domain reputation";

/** Verdana 11px averages ~6.5px per glyph; shields.io uses the same trick. */
function textWidth(text: string) {
	return Math.round(text.length * 6.5) + 12;
}

function escapeXml(text: string) {
	return text.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Shields-style flat badge, e.g. `domain reputation | A+ 96`. */
export function renderBadge(
	result: { grade: ReputationGrade; score: number } | null,
): string {
	const value = result ? `${result.grade} ${result.score}` : "unknown";
	const color = result ? GRADE_COLOR[result.grade] : "#9ca3af";
	const left = textWidth(LABEL);
	const right = textWidth(value);
	const width = left + right;
	const label = escapeXml(LABEL);
	const text = escapeXml(value);

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${text}"><title>${label}: ${text}</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="${width}" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="${left}" height="20" fill="#171717"/><rect x="${left}" width="${right}" height="20" fill="${color}"/><rect width="${width}" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11"><text x="${left / 2}" y="14">${label}</text><text x="${left + right / 2}" y="14" font-weight="bold">${text}</text></g></svg>`;
}

/** Bare hostname check, so the route never forwards junk to the API. */
export function normalizeBadgeDomain(raw: string): string | null {
	const domain = decodeURIComponent(raw)
		.trim()
		.toLowerCase()
		.replace(/\.svg$/, "");
	return /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(
		domain,
	)
		? domain
		: null;
}
