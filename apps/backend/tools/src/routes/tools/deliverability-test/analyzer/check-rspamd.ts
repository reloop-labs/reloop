import { checkSpamController } from "../../spam-check/spam-check.controllers";
import type { CategoryResult, CheckItem } from "../deliverability-test.types";
import type { ParsedEmailData } from "./parse-mime";

export interface ContentCheckResult {
	category: CategoryResult;
	rspamdScore: number | null;
	contentSpamScore: number;
}

const COMMON_RSPAMD_SYMBOLS: Record<string, { title: string; desc: string }> = {
	HFILTER_HELO_BAREIP: {
		title: "Helo host is bare IP",
		desc: "HELO command used a bare IP address rather than a fully qualified hostname.",
	},
	MID_CONTAINS_FROM: {
		title: "Message-ID matches From",
		desc: "Message-ID contains the sender From domain.",
	},
	MIME_GOOD: {
		title: "MIME structure is valid",
		desc: "Multipart structure and content-types are standard.",
	},
	MX_GOOD: {
		title: "Sender MX records valid",
		desc: "Sender domain has healthy incoming MX records.",
	},
	R_SPF_ALLOW: {
		title: "SPF Pass",
		desc: "Rspamd verified SPF pass for sending IP.",
	},
	R_SPF_FAIL: {
		title: "SPF Fail",
		desc: "Rspamd detected SPF fail for sending IP.",
	},
	R_SPF_SOFTFAIL: {
		title: "SPF SoftFail",
		desc: "Rspamd detected SPF softfail for sending IP.",
	},
	R_DKIM_ALLOW: {
		title: "DKIM Pass",
		desc: "Rspamd verified DKIM signature.",
	},
	R_DKIM_REJECT: {
		title: "DKIM Fail",
		desc: "Rspamd detected invalid DKIM signature.",
	},
	DMARC_POLICY_ALLOW: {
		title: "DMARC Pass",
		desc: "DMARC verified with passing alignment.",
	},
	DMARC_POLICY_REJECT: {
		title: "DMARC Reject Policy",
		desc: "DMARC failed with reject policy.",
	},
	SUBJECT_ENDS_EXCLAIM: {
		title: "Subject ends with exclamation mark",
		desc: "Subject ends with '!', which can increase spam score.",
	},
	SUBJ_ALL_CAPS: {
		title: "Subject in ALL CAPS",
		desc: "Subject line contains predominantly uppercase letters.",
	},
	BAYES_SPAM: {
		title: "Bayes statistical spam filter hit",
		desc: "Bayesian engine scored message text as high spam probability.",
	},
	BAYES_HAM: {
		title: "Bayes statistical clean hit",
		desc: "Bayesian engine scored message text as clean/ham.",
	},
	HTML_SHORT_LINK_IMG: {
		title: "HTML has image link with short text",
		desc: "Image links with little surrounding body text trigger spam penalties.",
	},
};

export async function checkRspamdAndContent(
	email: ParsedEmailData,
): Promise<ContentCheckResult> {
	const items: CheckItem[] = [];
	let totalDeduction = 0;

	// 1. Rspamd evaluation
	const rspamdScore = email.rspamdScore;
	if (rspamdScore !== null) {
		if (rspamdScore <= 0) {
			items.push({
				id: "rspamd-clean",
				title: `Rspamd Spam Filter (Score: ${rspamdScore.toFixed(1)})`,
				mark: 0,
				status: "pass",
				description: `Rspamd classified email as clean (score: ${rspamdScore.toFixed(1)} / threshold 5.0).`,
				details: [
					`Action: ${email.rspamdAction || "no action"}`,
					email.rspamdSymbols.length > 0
						? `Rules triggered: ${email.rspamdSymbols.join(", ")}`
						: "No suspicious symbols triggered.",
				],
			});
		} else {
			// Deduct based on Rspamd score (up to -4.0 max)
			const mark = -Math.min(
				4.0,
				Number.parseFloat((rspamdScore * 0.6).toFixed(1)),
			);
			totalDeduction += mark;

			items.push({
				id: "rspamd-penalty",
				title: `Rspamd Spam Filter (Score: ${rspamdScore.toFixed(1)})`,
				mark,
				status: rspamdScore >= 5.0 ? "fail" : "warn",
				description: `Rspamd assigned a spam score of ${rspamdScore.toFixed(1)} (threshold: 5.0).`,
				details: [
					`Action: ${email.rspamdAction || "add header"}`,
					`Symbols: ${email.rspamdSymbols.join(", ")}`,
				],
				recommendations: [
					"Review the triggered spam symbols below and adjust email phrasing or headers.",
				],
			});
		}

		// Add symbol items for notable symbols
		for (const sym of email.rspamdSymbols) {
			const info = COMMON_RSPAMD_SYMBOLS[sym];
			if (
				info &&
				(sym.includes("FAIL") ||
					sym.includes("SPAM") ||
					sym.includes("CAPS") ||
					sym.includes("EXCLAIM"))
			) {
				items.push({
					id: `symbol-${sym.toLowerCase()}`,
					title: `Symbol: ${sym}`,
					mark: 0,
					status: "warn",
					description: info.desc,
				});
			}
		}
	}

	// 2. Reloop Content spam check (heuristics & trigger words)
	const spamCheckResult = checkSpamController(
		email.subject,
		email.text || email.html,
	);

	if (spamCheckResult.detectedTriggers.length > 0) {
		const triggerList = spamCheckResult.detectedTriggers.slice(0, 6);
		const penalty = -Math.min(
			2.5,
			Number.parseFloat((triggerList.length * 0.4).toFixed(1)),
		);
		totalDeduction += penalty;

		items.push({
			id: "content-triggers",
			title: `Spam Trigger Keywords (${spamCheckResult.detectedTriggers.length} found)`,
			mark: penalty,
			status: triggerList.length > 3 ? "fail" : "warn",
			description:
				"Found words or phrases commonly associated with spam in the subject or body.",
			details: triggerList.map(
				(t) => `• "${t.word}" (${t.categoryLabel}, ${t.context})`,
			),
			recommendations: spamCheckResult.recommendations.slice(0, 2),
		});
	} else {
		items.push({
			id: "content-triggers-clean",
			title: "Spam Trigger Keywords (Clean)",
			mark: 0,
			status: "pass",
			description:
				"No common high-risk spam keywords or deceptive phrases were detected.",
		});
	}

	// Caps percentage
	if (spamCheckResult.metrics.capsPercentage > 30) {
		const penalty = -0.5;
		totalDeduction += penalty;
		items.push({
			id: "content-caps",
			title: `Excessive Capital Letters (${spamCheckResult.metrics.capsPercentage}%)`,
			mark: penalty,
			status: "warn",
			description:
				"High ratio of uppercase letters triggers SpamAssassin and Rspamd ALL_CAPS rules.",
			recommendations: ["Use standard sentence case."],
		});
	}

	const categoryStatus =
		totalDeduction <= -2.0 ? "fail" : totalDeduction < 0 ? "warn" : "pass";

	return {
		category: {
			id: "content",
			title: "Content & Spam Filter",
			mark: Math.max(-5.0, totalDeduction),
			status: categoryStatus,
			items,
		},
		rspamdScore,
		contentSpamScore: spamCheckResult.score,
	};
}
