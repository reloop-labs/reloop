/**
 * outbound-guard.ts
 *
 * Pre-send content security checks for all outbound email.
 * Called from sendEmailController BEFORE log creation or KumoMTA injection.
 *
 * Defences:
 *  1. Body size cap (HTML ≤ 512 KB, text ≤ 100 KB)
 *  2. Cyrillic / Arabic / non-Latin script detection in subject
 *  3. Display-name brand-spoof blocklist
 *  4. URL shortener + domain blocklist (blocks the lix.li / clck.ru attack pattern)
 *  5. Custom header CRLF injection guard + platform-reserved header blocklist
 *
 * Operators can tune behaviour with env vars:
 *  ALLOW_NON_LATIN_SUBJECTS=true   → skip script detection (multilingual platforms)
 *  BRAND_BLOCKLIST=name1,name2     → append to brand blocklist
 *  BLOCKED_DOMAINS=evil.com,...    → append to domain blocklist
 */

import { createError } from "evlog";

// ─── 1. Body size cap ────────────────────────────────────────────────────────

const MAX_HTML_BYTES = 512_000; // 512 KB
const MAX_TEXT_BYTES = 100_000; // 100 KB

export function assertBodySize(html?: string, text?: string): void {
	if (html && html.length > MAX_HTML_BYTES) {
		throw createError({
			status: 400,
			message: "Email body too large",
			why: `HTML body exceeds the 512 KB limit (got ${Math.round(html.length / 1024)} KB)`,
			fix: "Reduce the size of your HTML content",
		});
	}
	if (text && text.length > MAX_TEXT_BYTES) {
		throw createError({
			status: 400,
			message: "Email body too large",
			why: `Plain-text body exceeds the 100 KB limit (got ${Math.round(text.length / 1024)} KB)`,
			fix: "Reduce the size of your plain-text content",
		});
	}
}

// ─── 2. Non-Latin script detection in subject ─────────────────────────────────

/**
 * Regex ranges for scripts that are statistically anomalous in outbound
 * transactional email from an English-language SaaS platform.
 * Set ALLOW_NON_LATIN_SUBJECTS=true if your platform serves those locales.
 */
const SUSPICIOUS_SCRIPTS: Array<{ re: RegExp; name: string }> = [
	{ re: /[\u0400-\u04FF]/u, name: "Cyrillic" }, // Russian, Ukrainian, etc.
	{ re: /[\u0600-\u06FF]/u, name: "Arabic" },
	{ re: /[\u0900-\u097F]/u, name: "Devanagari" },
	{ re: /[\u4E00-\u9FFF]/u, name: "CJK" },
	{ re: /[\uAC00-\uD7AF]/u, name: "Hangul" },
	{ re: /[\u0E00-\u0E7F]/u, name: "Thai" },
];

const ALLOW_NON_LATIN = process.env.ALLOW_NON_LATIN_SUBJECTS === "true";

export function assertSubjectScript(subject: string): void {
	if (ALLOW_NON_LATIN) return;
	for (const { re, name } of SUSPICIOUS_SCRIPTS) {
		if (re.test(subject)) {
			throw createError({
				status: 400,
				message: "Suspicious email subject",
				why: `Subject contains ${name}-script characters which are blocked on this platform`,
				fix: "Use only ASCII/Latin characters in the subject, or contact support to enable multilingual sends",
			});
		}
	}
}

// ─── 3. Display-name brand-spoof blocklist ────────────────────────────────────

const DEFAULT_BRANDS = [
	// Payment / fintech
	"paypal",
	"stripe",
	"square",
	"venmo",
	"cashapp",
	"zelle",
	"mastercard",
	"visa",
	"american express",
	"amex",
	"binance",
	"coinbase",
	"kraken",
	// Russian-language targets (this attack)
	"yandex",
	"sberbank",
	"tinkoff",
	"vk",
	"gosuslugi",
	// Big tech
	"apple",
	"google",
	"microsoft",
	"amazon",
	"meta",
	"facebook",
	"instagram",
	"twitter",
	"whatsapp",
	// Banks
	"chase",
	"bank of america",
	"wells fargo",
	"citibank",
	"hsbc",
	"barclays",
	"halifax",
	"natwest",
	"santander",
	// E-commerce / logistics
	"ebay",
	"aliexpress",
	"fedex",
	"ups",
	"dhl",
	"usps",
	"royal mail",
	// Government / trust signals
	"irs",
	"hmrc",
	"gov.uk",
	// Generic impersonation anchors
	"support",
	"security",
	"helpdesk",
	"alert",
	"verify",
	"verification",
	"account",
	"billing",
	"invoice",
	"confirm",
];

const extraBrands = (process.env.BRAND_BLOCKLIST ?? "")
	.split(",")
	.map((b) => b.trim().toLowerCase())
	.filter(Boolean);

const BRAND_BLOCKLIST = [...DEFAULT_BRANDS, ...extraBrands];

function extractDisplayName(from: string): string {
	const match = from.match(/^(.+?)\s*<[^>]+>\s*$/);
	if (!match?.[1]) return "";
	return match[1].trim().replace(/^['"]+|['"]+$/g, "");
}

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function assertDisplayNameNotSpoofed(from: string): void {
	const displayName = extractDisplayName(from);
	if (!displayName) return; // bare address — nothing to check

	for (const brand of BRAND_BLOCKLIST) {
		// Word-boundary match: "PayPal Support" is blocked, but
		// "pranavkp.me via Reloop" must NOT match brand "vk",
		// and "Pineapple Inc" must NOT match brand "apple".
		// Substring `includes()` caused those false positives.
		const pattern = new RegExp(`\\b${escapeRegExp(brand)}\\b`, "i");
		if (pattern.test(displayName)) {
			throw createError({
				status: 400,
				message: "Sender display name not permitted",
				why: `The display name "${displayName}" resembles the protected brand "${brand}"`,
				fix: "Use your own brand name in the From display name, not the name of a third-party service",
			});
		}
	}
}

// ─── 4. URL shortener + domain blocklist ─────────────────────────────────────

/**
 * Known URL-shortening / link-obfuscation services used by phishers.
 * These must never appear in outbound email because they hide the real
 * destination — and our tracking system would blindly forward victims there.
 */
const SHORTENER_DOMAINS = new Set([
	// This attack
	"lix.li",
	"clck.ru", // Yandex short links
	"vk.cc",
	// Common shorteners abused in phishing
	"bit.ly",
	"tinyurl.com",
	"t.co",
	"goo.gl",
	"ow.ly",
	"is.gd",
	"buff.ly",
	"rb.gy",
	"cutt.ly",
	"short.io",
	"tiny.cc",
	"t2m.io",
	"shorte.st",
	"adf.ly",
	"bc.vc",
	"q.gs",
	"viralurl.com",
	// Telegram redirect
	"t.me",
	"telegram.me",
]);

const extraBlockedDomains = (process.env.BLOCKED_DOMAINS ?? "")
	.split(",")
	.map((d) => d.trim().toLowerCase())
	.filter(Boolean);

const BLOCKED_DOMAINS_SET = new Set(extraBlockedDomains);

/** Extract all http(s) URLs from content. */
export function extractUrls(content: string): string[] {
	return content.match(/https?:\/\/[^\s"'<>)\]]+/gi) ?? [];
}

/** Parse a bare hostname from a URL string, stripping www. */
export function extractHostname(url: string): string {
	try {
		return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
	} catch {
		return "";
	}
}

/**
 * Throws if any URL in html or text body points to a known phishing
 * shortener or a blocklisted domain.
 *
 * Also used by step-5b / step-5c to gate tracking injection
 * (so we never issue a redirect to one of these domains).
 */
export function assertUrlsNotBlocked(html?: string, text?: string): void {
	const content = `${html ?? ""} ${text ?? ""}`;
	for (const url of extractUrls(content)) {
		const hostname = extractHostname(url);
		if (!hostname) continue;

		if (SHORTENER_DOMAINS.has(hostname)) {
			throw createError({
				status: 400,
				message: "Disallowed URL in email body",
				why: `The URL "${url}" uses a link-shortening service ("${hostname}") which is not permitted`,
				fix: "Replace shortened links with the full destination URL",
			});
		}

		if (BLOCKED_DOMAINS_SET.has(hostname)) {
			throw createError({
				status: 400,
				message: "Disallowed URL in email body",
				why: `The URL "${url}" links to a blocked domain ("${hostname}")`,
				fix: "Remove links to this domain from your email content",
			});
		}
	}
}

// ─── 5. Custom header sanitization ───────────────────────────────────────────

/** Platform-reserved headers that callers must not override. */
const BLOCKED_HEADERS = new Set([
	"x-api-key",
	"x-reloop-tls-mode",
	"x-email-log-id",
	"x-org-id",
	"x-domain-id",
	"x-internal-secret",
	"authentication-results",
	"dkim-signature",
	"received",
	"return-path",
	"message-id",
	"date",
	"mime-version",
]);

const CRLF_RE = /[\r\n]/;

export function sanitizeCustomHeaders(
	headers: Record<string, string> | undefined,
): Record<string, string> {
	if (!headers) return {};
	const safe: Record<string, string> = {};
	for (const [rawName, rawValue] of Object.entries(headers)) {
		const lower = rawName.toLowerCase().trim();

		if (BLOCKED_HEADERS.has(lower)) {
			throw createError({
				status: 400,
				message: "Disallowed custom header",
				why: `The header "${rawName}" is reserved for platform use`,
				fix: `Remove "${rawName}" from your custom headers object`,
			});
		}

		if (CRLF_RE.test(rawName) || CRLF_RE.test(rawValue)) {
			throw createError({
				status: 400,
				message: "Invalid custom header",
				why: `The header "${rawName}" contains illegal CR/LF characters`,
				fix: "Remove newline characters from all header names and values",
			});
		}

		safe[rawName] = rawValue;
	}
	return safe;
}

// ─── Composite guard ─────────────────────────────────────────────────────────

/**
 * Run all outbound content checks in one call before any send-pipeline work.
 * Returns the sanitized custom headers object.
 * Throws a structured 400 error on the first violation.
 */
export function runOutboundGuard({
	from,
	subject,
	html,
	text,
	headers,
	replyTo,
	attachments,
}: {
	from: string;
	subject: string;
	html?: string;
	text?: string;
	headers?: Record<string, string>;
	replyTo?: string | string[];
	attachments?: Array<{ filename?: string; content_type?: string }>;
}): { sanitizedHeaders: Record<string, string> } {
	assertBodySize(html, text);
	assertSubjectScript(subject);
	assertDisplayNameNotSpoofed(from);
	assertUrlsNotBlocked(html, text);
	assertReplyToValid(from, replyTo);
	assertAttachmentsAllowed(attachments);
	const sanitizedHeaders = sanitizeCustomHeaders(headers);
	return { sanitizedHeaders };
}

// ─── GAP 4: Reply-To domain validation ───────────────────────────────────────

/**
 * Reply-To must either:
 *  (a) share the same domain as the From address, OR
 *  (b) be omitted entirely.
 *
 * This prevents reply-harvesting attacks where a scammer sends FROM
 * legit@their-domain.com but sets Reply-To: victim@real-bank.com so all
 * replies go to them instead.
 *
 * If your use-case legitimately requires a cross-domain Reply-To,
 * set ALLOW_CROSS_DOMAIN_REPLY_TO=true and the check is skipped.
 */
const ALLOW_CROSS_DOMAIN_REPLY_TO =
	process.env.ALLOW_CROSS_DOMAIN_REPLY_TO === "true";

function extractDomain(address: string): string {
	const bare = address.match(/<([^<>]+)>/)?.[1] ?? address;
	const at = bare.lastIndexOf("@");
	return at >= 0
		? bare
				.slice(at + 1)
				.trim()
				.toLowerCase()
		: "";
}

export function assertReplyToValid(
	from: string,
	replyTo: string | string[] | undefined,
): void {
	if (!replyTo || ALLOW_CROSS_DOMAIN_REPLY_TO) return;

	const fromDomain = extractDomain(from);
	if (!fromDomain) return; // can't determine from domain, skip

	const replyToList = Array.isArray(replyTo) ? replyTo : [replyTo];

	for (const rt of replyToList) {
		const rtDomain = extractDomain(rt);
		if (!rtDomain) {
			throw createError({
				status: 400,
				message: "Invalid Reply-To address",
				why: `"${rt}" is not a valid email address`,
				fix: "Provide a properly formatted email address in reply_to",
			});
		}
		if (rtDomain !== fromDomain) {
			throw createError({
				status: 400,
				message: "Reply-To domain mismatch",
				why: `Reply-To "${rt}" uses domain "${rtDomain}" which differs from the From domain "${fromDomain}"`,
				fix: `Use a Reply-To address on the same domain as your From address ("${fromDomain}"), or remove reply_to entirely. Contact support if you need cross-domain reply routing.`,
			});
		}
	}
}

// ─── GAP 7: Attachment extension + MIME-type blocklist ───────────────────────

/**
 * File extensions that are blocked as email attachments.
 * Covers executable, script, and document-macro types abused in phishing.
 */
const BLOCKED_EXTENSIONS = new Set([
	// Executables
	".exe",
	".com",
	".bat",
	".cmd",
	".msi",
	".msp",
	// Scripts
	".js",
	".jse",
	".vbs",
	".vbe",
	".ps1",
	".ps2",
	".psm1",
	".psd1",
	".sh",
	".bash",
	".zsh",
	".fish",
	".py",
	".rb",
	".pl",
	".php",
	// Shortcuts / launchers
	".lnk",
	".url",
	".scf",
	".pif",
	// Archives that could wrap any of the above
	".iso",
	".img",
	".dmg",
	// Java
	".jar",
	".jnlp",
	// HTA / web executables
	".hta",
	".htm",
	".html", // blocked in attachment context
	// Macro-enabled Office (plain .docx/.xlsx/.pptx are allowed)
	".doc",
	".xls",
	".ppt",
	".docm",
	".xlsm",
	".pptm",
	".xlam",
	".xltm",
]);

/**
 * MIME types explicitly blocked regardless of filename extension.
 */
const BLOCKED_MIME_TYPES = new Set([
	"application/x-msdownload",
	"application/x-executable",
	"application/x-msdos-program",
	"application/x-bat",
	"application/x-sh",
	"application/x-shellscript",
	"application/vnd.ms-excel.sheet.macroEnabled.12",
	"application/vnd.ms-word.document.macroEnabled.12",
	"application/vnd.ms-powerpoint.presentation.macroEnabled.12",
	"application/java-archive",
	"application/x-java-archive",
	"text/javascript",
	"application/javascript",
	"application/x-javascript",
]);

export function assertAttachmentsAllowed(
	attachments: Array<{ filename?: string; content_type?: string }> | undefined,
): void {
	if (!attachments || attachments.length === 0) return;

	for (const att of attachments) {
		// Check by MIME type
		if (att.content_type) {
			const mime = att.content_type.toLowerCase().split(";")[0]?.trim() ?? "";
			if (BLOCKED_MIME_TYPES.has(mime)) {
				throw createError({
					status: 400,
					message: "Attachment type not permitted",
					why: `Attachments with MIME type "${att.content_type}" are blocked for security reasons`,
					fix: "Remove the attachment or convert it to a permitted format (PDF, PNG, JPEG, CSV, etc.)",
				});
			}
		}

		// Check by file extension
		if (att.filename) {
			const lower = att.filename.toLowerCase();
			const ext = lower.slice(lower.lastIndexOf("."));
			if (ext && BLOCKED_EXTENSIONS.has(ext)) {
				throw createError({
					status: 400,
					message: "Attachment type not permitted",
					why: `Files with extension "${ext}" are blocked for security reasons (filename: "${att.filename}")`,
					fix: "Remove the attachment or convert it to a permitted format (PDF, PNG, JPEG, CSV, etc.)",
				});
			}
		}
	}
}
