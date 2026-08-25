import type {
	CategoryResult,
	CheckStatus,
	DeliverabilityReport,
} from "../deliverability-test.types";
import type { ParsedEmailData } from "./parse-mime";

export interface AggregateScoreInput {
	email: ParsedEmailData;
	signatureCategory: CategoryResult;
	blacklistsCategory: CategoryResult;
	contentCategory: CategoryResult;
	bodyCategory: CategoryResult;
	linksCategory: CategoryResult;
}

export function computeDeliverabilityScore(
	input: AggregateScoreInput,
): DeliverabilityReport {
	const {
		email,
		signatureCategory,
		blacklistsCategory,
		contentCategory,
		bodyCategory,
		linksCategory,
	} = input;

	// Total deductions (marks <= 0)
	const totalDeductions =
		signatureCategory.mark +
		blacklistsCategory.mark +
		contentCategory.mark +
		bodyCategory.mark +
		linksCategory.mark;

	const rawScore = 10.0 + totalDeductions;
	const finalScore = Number.parseFloat(
		Math.max(0.0, Math.min(10.0, rawScore)).toFixed(1),
	);

	let grade: string;
	let verdict: "inbox_ready" | "needs_review" | "high_risk";
	let verdictLabel: string;
	let summary: string;

	if (finalScore >= 9.0) {
		grade = finalScore >= 9.5 ? "A+" : "A";
		verdict = "inbox_ready";
		verdictLabel = "Inbox Ready (Excellent)";
		summary =
			"Your email passed major authentication, blacklist, and content checks. It is in great shape for reliable inbox placement.";
	} else if (finalScore >= 7.5) {
		grade = "B";
		verdict = "inbox_ready";
		verdictLabel = "Good Deliverability";
		summary =
			"Your email has good overall fundamentals with minor issues that could be tightened to prevent landing in spam.";
	} else if (finalScore >= 5.0) {
		grade = "C";
		verdict = "needs_review";
		verdictLabel = "Needs Review (Risk of Spam)";
		summary =
			"Several deliverability warnings were detected. Unaligned authentication or spam filter triggers may cause filtering in Gmail/Outlook.";
	} else {
		grade = finalScore >= 3.0 ? "D" : "F";
		verdict = "high_risk";
		verdictLabel = "High Spam Risk / Rejected";
		summary =
			"Critical issues found: missing or failing authentication, blacklist listings, or severe spam triggers.";
	}

	return {
		score: finalScore,
		grade,
		verdict,
		verdictLabel,
		summary,
		receivedAt: new Date().toISOString(),
		from: {
			address: email.from.address,
			name: email.from.name,
			domain: email.from.domain,
		},
		to: {
			address: email.to.address,
			name: email.to.name,
		},
		subject: email.subject || "(No Subject)",
		messageId: email.messageId,
		connectingIp: email.connectingIp,
		headers: email.headers,
		categories: {
			signature: signatureCategory,
			blacklists: blacklistsCategory,
			content: contentCategory,
			body: bodyCategory,
			links: linksCategory,
		},
		preview: {
			text: email.text ? email.text.slice(0, 500) : undefined,
			htmlSnippet: email.html ? email.html.slice(0, 500) : undefined,
			hasHtml: Boolean(email.html),
			hasText: Boolean(email.text),
			hasAttachments: email.attachments.length > 0,
			attachmentCount: email.attachments.length,
		},
	};
}
