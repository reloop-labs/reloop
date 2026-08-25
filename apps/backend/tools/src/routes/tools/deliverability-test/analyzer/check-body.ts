import type { CategoryResult, CheckItem } from "../deliverability-test.types";
import type { ParsedEmailData } from "./parse-mime";

export interface BodyCheckResult {
	category: CategoryResult;
	hasHtml: boolean;
	hasText: boolean;
	textToHtmlRatio: number;
	imageCount: number;
	missingAltCount: number;
	hasUnsubscribeHeader: boolean;
}

export function checkBody(email: ParsedEmailData): BodyCheckResult {
	const items: CheckItem[] = [];
	let totalDeduction = 0;

	const hasHtml = Boolean(email.html && email.html.trim().length > 0);
	const hasText = Boolean(email.text && email.text.trim().length > 0);

	// 1. Multipart check
	if (hasHtml && !hasText) {
		const penalty = -0.8;
		totalDeduction += penalty;
		items.push({
			id: "body-html-only",
			title: "Missing plain text version (HTML only)",
			mark: penalty,
			status: "warn",
			description:
				"The message contains an HTML body but lacks an accompanying text/plain multipart alternative.",
			details: [
				"Spam filters penalize HTML-only emails because legitimate newsletters almost always provide a text version.",
			],
			recommendations: [
				"Include a clean plain-text fallback in your multipart MIME message.",
			],
		});
	} else if (hasHtml && hasText) {
		items.push({
			id: "body-multipart",
			title: "Multipart MIME structure (HTML + Plain Text)",
			mark: 0,
			status: "pass",
			description:
				"Message includes both HTML and plain text alternative versions.",
		});
	} else if (hasText && !hasHtml) {
		items.push({
			id: "body-plain-only",
			title: "Plain text format",
			mark: 0,
			status: "pass",
			description: "Message is sent as clean plain text.",
		});
	}

	// 2. Text-to-HTML ratio
	let textToHtmlRatio = 1.0;
	if (hasHtml) {
		const rawHtmlLength = email.html.length;
		const cleanTextLength =
			email.text.length || email.html.replace(/<[^>]+>/g, "").trim().length;
		textToHtmlRatio =
			rawHtmlLength > 0
				? Number.parseFloat((cleanTextLength / rawHtmlLength).toFixed(2))
				: 1.0;

		if (rawHtmlLength > 2000 && textToHtmlRatio < 0.15) {
			const penalty = -0.5;
			totalDeduction += penalty;
			items.push({
				id: "body-low-ratio",
				title: `Low text-to-code ratio (${Math.round(textToHtmlRatio * 100)}%)`,
				mark: penalty,
				status: "warn",
				description:
					"The email has a large amount of HTML tags and formatting compared to actual text content.",
				recommendations: [
					"Simplify inline CSS styles and ensure your email contains sufficient readable copy.",
				],
			});
		}
	}

	// 3. Images & alt tags
	let imageCount = 0;
	let missingAltCount = 0;
	if (hasHtml) {
		const imgTags = email.html.match(/<img[^>]+>/gi) || [];
		imageCount = imgTags.length;

		for (const tag of imgTags) {
			const hasAlt = /alt\s*=\s*["'][^"']*["']/i.test(tag);
			if (!hasAlt) {
				missingAltCount++;
			}
		}

		if (imageCount > 0) {
			if (missingAltCount > 0) {
				const penalty = -0.4;
				totalDeduction += penalty;
				items.push({
					id: "body-img-alt",
					title: `Images missing alt attributes (${missingAltCount}/${imageCount})`,
					mark: penalty,
					status: "warn",
					description: `${missingAltCount} out of ${imageCount} images lack descriptive alt tags, hurting accessibility and spam scoring.`,
					recommendations: [
						'Add descriptive alt="..." text to every <img> tag.',
					],
				});
			} else {
				items.push({
					id: "body-img-clean",
					title: `Image accessibility (${imageCount} images with alt tags)`,
					mark: 0,
					status: "pass",
					description: "All embedded images include valid alt attributes.",
				});
			}
		}
	}

	// 4. Risky HTML elements
	if (hasHtml) {
		const riskyElements: string[] = [];
		if (/<script\b[^>]*>/i.test(email.html)) riskyElements.push("<script>");
		if (/<form\b[^>]*>/i.test(email.html)) riskyElements.push("<form>");
		if (/<iframe\b[^>]*>/i.test(email.html)) riskyElements.push("<iframe>");
		if (/<object\b|<embed\b/i.test(email.html))
			riskyElements.push("<object>/<embed>");

		if (riskyElements.length > 0) {
			const penalty = -2.0;
			totalDeduction += penalty;
			items.push({
				id: "body-risky-html",
				title: `Dangerous HTML elements detected (${riskyElements.join(", ")})`,
				mark: penalty,
				status: "fail",
				description: `Email contains forbidden or high-risk tags (${riskyElements.join(", ")}). Spam filters and webmail clients immediately quarantine these messages.`,
				recommendations: [
					"Remove interactive forms, scripts, and embedded frames from your HTML template.",
				],
			});
		}
	}

	// 5. List-Unsubscribe headers
	const listUnsubscribe = email.headers["list-unsubscribe"];
	const listUnsubscribePost = email.headers["list-unsubscribe-post"];
	const hasUnsubscribeHeader = Boolean(listUnsubscribe);

	if (hasUnsubscribeHeader) {
		items.push({
			id: "body-unsubscribe",
			title: "List-Unsubscribe header present",
			mark: 0,
			status: "pass",
			description:
				"Message includes RFC 8058 one-click List-Unsubscribe headers (required by Gmail & Yahoo for bulk senders).",
			details: [
				`List-Unsubscribe: ${listUnsubscribe}`,
				listUnsubscribePost
					? `List-Unsubscribe-Post: ${listUnsubscribePost}`
					: "",
			].filter(Boolean),
		});
	} else {
		// Informational notice
		items.push({
			id: "body-no-unsubscribe",
			title: "List-Unsubscribe header missing",
			mark: 0,
			status: "info",
			description:
				"No List-Unsubscribe header found. If you send marketing or bulk newsletters, Google and Yahoo mandate this header.",
			recommendations: [
				'Add "List-Unsubscribe: <https://your-domain.com/unsubscribe>, <mailto:unsubscribe@your-domain.com>"',
			],
		});
	}

	// 6. Subject line check
	if (!email.subject || email.subject.trim().length === 0) {
		const penalty = -1.5;
		totalDeduction += penalty;
		items.push({
			id: "body-no-subject",
			title: "Subject line missing",
			mark: penalty,
			status: "fail",
			description: "Email has no subject header.",
			recommendations: ["Always provide a clear subject line."],
		});
	} else if (email.subject.length > 75) {
		const penalty = -0.3;
		totalDeduction += penalty;
		items.push({
			id: "body-subject-length",
			title: `Subject line is long (${email.subject.length} characters)`,
			mark: penalty,
			status: "warn",
			description: `Subject line is ${email.subject.length} characters. Mobile inboxes typically truncate subjects over 50–60 characters.`,
			recommendations: ["Keep subject lines between 30 and 60 characters."],
		});
	} else {
		items.push({
			id: "body-subject-clean",
			title: `Subject line length (${email.subject.length} characters)`,
			mark: 0,
			status: "pass",
			description: `"${email.subject}" is well-sized for inbox previews.`,
		});
	}

	const categoryStatus =
		totalDeduction <= -1.5 ? "fail" : totalDeduction < 0 ? "warn" : "pass";

	return {
		category: {
			id: "body",
			title: "Message Body & MIME",
			mark: Math.max(-4.0, totalDeduction),
			status: categoryStatus,
			items,
		},
		hasHtml,
		hasText,
		textToHtmlRatio,
		imageCount,
		missingAltCount,
		hasUnsubscribeHeader,
	};
}
