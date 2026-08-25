import type { CategoryResult, CheckItem } from "../deliverability-test.types";
import type { ParsedEmailData } from "./parse-mime";

export interface LinksCheckResult {
	category: CategoryResult;
	totalLinks: number;
	brokenLinks: string[];
	shorteners: string[];
	insecureLinks: string[];
}

const SUSPICIOUS_SHORTENERS = [
	"bit.ly",
	"tinyurl.com",
	"t.co",
	"is.gd",
	"buff.ly",
	"ow.ly",
	"rb.gy",
	"cutt.ly",
];

interface ExtractedLink {
	url: string;
	displayText?: string;
	source: "html" | "text";
}

function extractLinks(email: ParsedEmailData): ExtractedLink[] {
	const links: ExtractedLink[] = [];
	const seenUrls = new Set<string>();

	// Extract from HTML <a href="...">text</a>
	if (email.html) {
		const anchorRegex =
			/<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
		for (const match of email.html.matchAll(anchorRegex)) {
			const href = (match[1] || "").trim();
			const text = (match[2] || "").replace(/<[^>]+>/g, "").trim();
			if (href.startsWith("http://") || href.startsWith("https://")) {
				if (!seenUrls.has(href)) {
					seenUrls.add(href);
					links.push({ url: href, displayText: text, source: "html" });
				}
			}
		}
	}

	// Extract from plain text
	const textContent = `${email.text}\n${email.subject}`;
	const rawUrlRegex = /https?:\/\/[^\s"'<>]+/gi;
	const textMatches = textContent.match(rawUrlRegex) || [];
	for (const rawUrl of textMatches) {
		const clean = rawUrl.replace(/[.,;:)]+$/, "");
		if (!seenUrls.has(clean)) {
			seenUrls.add(clean);
			links.push({ url: clean, source: "text" });
		}
	}

	return links;
}

async function probeUrl(
	url: string,
): Promise<{ status: number | null; ok: boolean; error?: string }> {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 1500);

		const resp = await fetch(url, {
			method: "HEAD",
			signal: controller.signal,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
			redirect: "follow",
		});
		clearTimeout(timeoutId);

		return {
			status: resp.status,
			ok: resp.status < 400,
		};
	} catch (e: unknown) {
		const err = e as { name?: string; message?: string };
		return {
			status: null,
			ok: false,
			error:
				err.name === "AbortError"
					? "Timeout"
					: err.message || "Connection failed",
		};
	}
}

export async function checkLinks(
	email: ParsedEmailData,
): Promise<LinksCheckResult> {
	const items: CheckItem[] = [];
	let totalDeduction = 0;

	const extracted = extractLinks(email);
	const totalLinks = extracted.length;

	const brokenLinks: string[] = [];
	const shorteners: string[] = [];
	const insecureLinks: string[] = [];
	const deceptiveLinks: Array<{ text: string; href: string }> = [];

	for (const link of extracted) {
		const lower = link.url.toLowerCase();

		// Insecure HTTP check
		if (lower.startsWith("http://")) {
			insecureLinks.push(link.url);
		}

		// Shorteners check
		for (const short of SUSPICIOUS_SHORTENERS) {
			if (lower.includes(short) && !shorteners.includes(short)) {
				shorteners.push(short);
			}
		}

		// Deceptive anchor text check (e.g. text says "https://paypal.com" but href is different domain)
		if (link.displayText && /^https?:\/\//i.test(link.displayText)) {
			try {
				const textUrl = new URL(link.displayText);
				const hrefUrl = new URL(link.url);
				if (textUrl.hostname.toLowerCase() !== hrefUrl.hostname.toLowerCase()) {
					deceptiveLinks.push({ text: link.displayText, href: link.url });
				}
			} catch {}
		}
	}

	// 1. Phishing / deceptive text mismatch
	if (deceptiveLinks.length > 0) {
		const penalty = -2.5;
		totalDeduction += penalty;
		items.push({
			id: "links-deceptive",
			title: "Mismatched link display URL (Phishing Indicator)",
			mark: penalty,
			status: "fail",
			description:
				"Link text displays a URL that points to a completely different domain.",
			details: deceptiveLinks.map(
				(d) => `• Display text: "${d.text}" points to "${d.href}"`,
			),
			recommendations: [
				"Ensure link text matches the actual destination URL or use non-URL descriptive anchor text (e.g. 'View Dashboard').",
			],
		});
	}

	// 2. URL Shorteners
	if (shorteners.length > 0) {
		const penalty = -Math.min(2.0, shorteners.length * 1.0);
		totalDeduction += penalty;
		items.push({
			id: "links-shortener",
			title: `Generic URL Shortener detected (${shorteners.join(", ")})`,
			mark: penalty,
			status: "fail",
			description:
				"Spam filters heavily penalize link shorteners because they hide the true destination.",
			details: shorteners.map((s) => `• Detected shortener domain: ${s}`),
			recommendations: [
				"Use direct branded domain links instead of generic URL shorteners.",
			],
		});
	}

	// 3. Insecure HTTP
	if (insecureLinks.length > 0) {
		const penalty = -0.5;
		totalDeduction += penalty;
		items.push({
			id: "links-http",
			title: `Insecure HTTP links (${insecureLinks.length} found)`,
			mark: penalty,
			status: "warn",
			description: `${insecureLinks.length} link(s) use unencrypted http:// instead of https://.`,
			details: insecureLinks.slice(0, 3).map((l) => `• ${l}`),
			recommendations: ["Update all links in your template to use HTTPS."],
		});
	}

	// 4. Reachability probe (up to 5 links)
	const sampleToProbe = extracted.slice(0, 5);
	const probeResults = await Promise.all(
		sampleToProbe.map(async (l) => {
			const res = await probeUrl(l.url);
			return { url: l.url, ...res };
		}),
	);

	for (const p of probeResults) {
		if (!p.ok) {
			brokenLinks.push(`${p.url} (${p.status ? `HTTP ${p.status}` : p.error})`);
		}
	}

	if (brokenLinks.length > 0) {
		const penalty = -Math.min(1.5, brokenLinks.length * 0.5);
		totalDeduction += penalty;
		items.push({
			id: "links-broken",
			title: `Unreachable or broken links (${brokenLinks.length})`,
			mark: penalty,
			status: "warn",
			description:
				"Some links in the email returned HTTP error codes or timed out during verification.",
			details: brokenLinks.map((b) => `• ${b}`),
			recommendations: [
				"Verify that all links in your campaign lead to live, accessible web pages.",
			],
		});
	}

	// Clean report item if all links healthy
	if (totalLinks > 0 && totalDeduction === 0) {
		items.push({
			id: "links-clean",
			title: `Links verified (${totalLinks} links found)`,
			mark: 0,
			status: "pass",
			description: `All ${totalLinks} extracted links use HTTPS, point to matching domains, and are reachable.`,
		});
	} else if (totalLinks === 0) {
		items.push({
			id: "links-none",
			title: "No links detected",
			mark: 0,
			status: "pass",
			description: "Message contains no external URLs.",
		});
	}

	const categoryStatus =
		totalDeduction <= -1.5 ? "fail" : totalDeduction < 0 ? "warn" : "pass";

	return {
		category: {
			id: "links",
			title: "Links & URLs",
			mark: Math.max(-4.0, totalDeduction),
			status: categoryStatus,
			items,
		},
		totalLinks,
		brokenLinks,
		shorteners,
		insecureLinks,
	};
}
