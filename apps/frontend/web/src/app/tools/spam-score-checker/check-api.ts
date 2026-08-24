export type TriggerCategory =
	| "urgency"
	| "shady"
	| "overpromise"
	| "money"
	| "outreach";

export interface DetectedTrigger {
	word: string;
	originalMatch: string;
	category: TriggerCategory;
	categoryLabel: string;
	severity: "high" | "medium" | "low";
	startIndex: number;
	endIndex: number;
	context: "subject" | "body";
}

export interface SpamIssue {
	category: "trigger_word" | "subject" | "link" | "formatting" | "compliance";
	severity: "high" | "medium" | "low";
	title: string;
	detail: string;
	recommendation?: string;
}

export interface SpamCheckResponse {
	score: number;
	grade: string;
	verdict: "inbox_ready" | "needs_review" | "high_risk";
	verdictLabel: string;
	breakdown: {
		subjectScore: number;
		contentScore: number;
		linkScore: number;
		formattingScore: number;
	};
	metrics: {
		wordCount: number;
		charCount: number;
		subjectLength: number;
		linkCount: number;
		triggerWordCount: number;
		capsPercentage: number;
		readingTimeSec: number;
	};
	categoryCounts: Record<TriggerCategory, number>;
	detectedTriggers: DetectedTrigger[];
	issues: SpamIssue[];
	recommendations: string[];
}

export const CATEGORY_META: Record<
	TriggerCategory,
	{ label: string; icon: string }
> = {
	urgency: { label: "Urgency", icon: "alert-triangle" },
	shady: { label: "Shady", icon: "shield-cross" },
	overpromise: { label: "Overpromise", icon: "sparkles" },
	money: { label: "Financial & Money", icon: "lock" },
	outreach: { label: "Cold Outreach", icon: "user-circle" },
};

interface TriggerRule {
	pattern: RegExp;
	category: TriggerCategory;
	severity: "high" | "medium" | "low";
	penalty: number;
}

const TRIGGER_RULES: TriggerRule[] = [
	{
		pattern:
			/\b(?:asap|as soon as possible|immediately|urgent|act now|hurry|last chance|final notice|final warning)\b/gi,
		category: "urgency",
		severity: "high",
		penalty: 14,
	},
	{
		pattern:
			/\b(?:expires tonight|limited time|time is running out|closing soon|don't delay)\b/gi,
		category: "urgency",
		severity: "high",
		penalty: 12,
	},
	{
		pattern: /\b(?:please answer|please reply|respond asap|please)\b/gi,
		category: "urgency",
		severity: "medium",
		penalty: 8,
	},
	{
		pattern: /\b(?:once you are done|take action)\b/gi,
		category: "urgency",
		severity: "low",
		penalty: 6,
	},
	{
		pattern:
			/\b(?:dear friend|dearest|respected sir|dear beloved|greetings)\b/gi,
		category: "shady",
		severity: "high",
		penalty: 16,
	},
	{
		pattern:
			/\b(?:privately owned funds|private funds|offshore funds|inherited funds|funds)\b/gi,
		category: "shady",
		severity: "high",
		penalty: 14,
	},
	{
		pattern:
			/\b(?:financial consultant|investment consultant|beneficiary|confidential proposal|confidential investment proposal)\b/gi,
		category: "shady",
		severity: "high",
		penalty: 16,
	},
	{
		pattern:
			/\b(?:click below|click here|click the below|click the link|click button|click)\b/gi,
		category: "shady",
		severity: "high",
		penalty: 12,
	},
	{
		pattern:
			/\b(?:open immediately|do not delete|important notice|critical alert)\b/gi,
		category: "shady",
		severity: "high",
		penalty: 15,
	},
	{
		pattern:
			/\b(?:this isn't spam|not spam|opt in|opt-in|pre-approved|certified)\b/gi,
		category: "shady",
		severity: "medium",
		penalty: 10,
	},
	{
		pattern: /\b(?:hidden|secret|loophole|hack|cheat|unlimited leads)\b/gi,
		category: "shady",
		severity: "medium",
		penalty: 10,
	},
	{
		pattern:
			/\b(?:claim|claim your|claim now|redeem|winner|congratulations|you have won|chosen)\b/gi,
		category: "shady",
		severity: "high",
		penalty: 16,
	},
	{
		pattern:
			/\b(?:guaranteed\s*\d+%\s*roi|guaranteed\s*\d+%|guaranteed|guarantee|100% guaranteed|risk[- ]free|no risk)\b/gi,
		category: "overpromise",
		severity: "high",
		penalty: 16,
	},
	{
		pattern:
			/\b(?:100% free|completely free|totally free|free trial|free access|free clothes|free gifts?|free)\b/gi,
		category: "overpromise",
		severity: "high",
		penalty: 14,
	},
	{
		pattern: /\b(?:miracle|cure|unbelievable|lifetime access|no catch)\b/gi,
		category: "overpromise",
		severity: "high",
		penalty: 12,
	},
	{
		pattern:
			/\b(?:no obligation|no strings attached|no credit card required)\b/gi,
		category: "overpromise",
		severity: "medium",
		penalty: 8,
	},
	{
		pattern:
			/\b(?:best price|lowest price|double your|increase sales overnight)\b/gi,
		category: "overpromise",
		severity: "high",
		penalty: 12,
	},
	{
		pattern:
			/\b(?:finance projects|finance|make money|earn cash|extra income|cash bonus|fast cash|cash prize|cash)\b/gi,
		category: "money",
		severity: "high",
		penalty: 15,
	},
	{
		pattern:
			/\b(?:roi per annum|per annum|roi|crypto|bitcoin|wire transfer|bank account|payout|passive income)\b/gi,
		category: "money",
		severity: "high",
		penalty: 14,
	},
	{
		pattern:
			/\b(?:cheap|discount|affordable|save \$\$\$|\$\$\$|cents on the dollar)\b/gi,
		category: "money",
		severity: "medium",
		penalty: 10,
	},
	{
		pattern:
			/\b(?:pure profit|billion dollars|millionaire|financial freedom|financial)\b/gi,
		category: "money",
		severity: "medium",
		penalty: 8,
	},
	{
		pattern: /\b(?:buy direct|order now|cheap meds|cialis|viagra)\b/gi,
		category: "outreach",
		severity: "high",
		penalty: 25,
	},
	{
		pattern: /\b(?:exclusive deal|special promotion|mass email)\b/gi,
		category: "outreach",
		severity: "medium",
		penalty: 8,
	},
];

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

/**
 * Calculates spam score deterministically.
 */
export function calculateSpamScore(
	subjectInput: string,
	bodyInput: string,
): SpamCheckResponse {
	const subject = (subjectInput || "").trim();
	const body = (bodyInput || "").trim();

	const detectedTriggers: DetectedTrigger[] = [];
	const categoryCounts: Record<TriggerCategory, number> = {
		urgency: 0,
		shady: 0,
		overpromise: 0,
		money: 0,
		outreach: 0,
	};
	const issues: SpamIssue[] = [];
	const recommendations: string[] = [];

	let subjectPenalty = 0;
	let contentPenalty = 0;
	let linkPenalty = 0;
	let formattingPenalty = 0;

	const scan = (text: string, context: "subject" | "body") => {
		for (const rule of TRIGGER_RULES) {
			const matches = text.matchAll(rule.pattern);
			for (const match of matches) {
				const matchedWord = match[0];
				if (!matchedWord || match.index === undefined) continue;
				detectedTriggers.push({
					word: matchedWord,
					originalMatch: matchedWord,
					category: rule.category,
					categoryLabel: CATEGORY_META[rule.category].label,
					severity: rule.severity,
					startIndex: match.index,
					endIndex: match.index + matchedWord.length,
					context,
				});
				categoryCounts[rule.category] += 1;

				if (context === "subject") {
					subjectPenalty += rule.penalty * 1.5;
				} else {
					contentPenalty += rule.penalty;
				}
			}
		}
	};

	scan(subject, "subject");
	scan(body, "body");

	// Subject checks
	if (!subject) {
		subjectPenalty += 20;
		issues.push({
			category: "subject",
			severity: "high",
			title: "Missing subject line",
			detail:
				"Emails without subject lines are immediately classified as spam.",
			recommendation: "Add a clear subject line.",
		});
	} else {
		if (subject.length > 60) {
			subjectPenalty += 8;
			issues.push({
				category: "subject",
				severity: "low",
				title: "Subject line exceeds 60 characters",
				detail: `Length is ${subject.length} chars. Mobile clients truncate after 40–50 chars.`,
				recommendation: "Shorten subject line to 30–50 characters.",
			});
		}

		if (/^(?:re:|fwd:|fw:)/i.test(subject)) {
			subjectPenalty += 18;
			issues.push({
				category: "subject",
				severity: "high",
				title: "Deceptive 'Re:' or 'Fwd:' prefix detected",
				detail: "False reply prefixes violate CAN-SPAM regulations.",
				recommendation: "Remove artificial reply prefixes.",
			});
		}

		if (/[!?]{2,}/.test(subject) || /\${2,}/.test(subject)) {
			subjectPenalty += 12;
			issues.push({
				category: "subject",
				severity: "medium",
				title: "Excessive punctuation in subject",
				detail:
					"Multiple exclamation marks (!!!) or dollar signs ($$$) trigger penalties.",
				recommendation: "Use standard single punctuation.",
			});
		}
	}

	// Link checks
	const combined = `${subject}\n${body}`;
	const urlMatches = combined.match(/https?:\/\/[^\s"'<>]+/gi) || [];
	const linkCount = urlMatches.length;

	for (const url of urlMatches) {
		const lower = url.toLowerCase();
		if (lower.startsWith("http://")) {
			linkPenalty += 10;
			issues.push({
				category: "link",
				severity: "medium",
				title: "Insecure HTTP link found",
				detail: `Link "${url.slice(0, 30)}..." uses unencrypted HTTP.`,
				recommendation: "Upgrade all links to HTTPS.",
			});
		}

		for (const shortener of SUSPICIOUS_SHORTENERS) {
			if (lower.includes(shortener)) {
				linkPenalty += 18;
				issues.push({
					category: "link",
					severity: "high",
					title: `URL Shortener detected (${shortener})`,
					detail: "Spam filters heavily penalize generic link shorteners.",
					recommendation: "Use direct branded domain links.",
				});
				break;
			}
		}
	}

	// Formatting checks
	const words = body.split(/\s+/).filter(Boolean);
	const wordCount = words.length;
	const charCount = body.length;

	const bodyLetters = body.replace(/[^a-zA-Z]/g, "");
	let capsPercentage = 0;
	if (bodyLetters.length > 15) {
		capsPercentage = Math.round(
			((bodyLetters.match(/[A-Z]/g) || []).length / bodyLetters.length) * 100,
		);
		if (capsPercentage > 30) {
			formattingPenalty += 14;
			issues.push({
				category: "formatting",
				severity: "high",
				title: `Excessive uppercase letters in body (${capsPercentage}%)`,
				detail: "Triggers SpamAssassin BODY_ALL_CAPS rules.",
				recommendation: "Convert text to natural sentence case.",
			});
		}
	}

	// Final scoring
	const subjectScore = Math.max(0, Math.round(25 - subjectPenalty));
	const contentScore = Math.max(0, Math.round(35 - contentPenalty));
	const linkScore = Math.max(0, Math.round(20 - linkPenalty));
	const formattingScore = Math.max(0, Math.round(20 - formattingPenalty));

	const totalScore = Math.max(
		0,
		Math.min(100, subjectScore + contentScore + linkScore + formattingScore),
	);

	let verdict: "inbox_ready" | "needs_review" | "high_risk";
	let verdictLabel: string;
	let grade: string;

	if (totalScore >= 85) {
		verdict = "inbox_ready";
		verdictLabel = "Inbox Ready";
		grade = totalScore >= 95 ? "A+" : "A";
	} else if (totalScore >= 60) {
		verdict = "needs_review";
		verdictLabel = "Needs Review";
		grade = totalScore >= 75 ? "B" : "C";
	} else {
		verdict = "high_risk";
		verdictLabel = "Poor (Spam Risk)";
		grade = totalScore >= 40 ? "D" : "F";
	}

	if (issues.length === 0) {
		recommendations.push(
			"Email is clean. Keep your domain SPF, DKIM, and DMARC aligned.",
		);
	} else {
		for (const issue of issues.slice(0, 4)) {
			if (issue.recommendation) recommendations.push(issue.recommendation);
		}
	}

	return {
		score: totalScore,
		grade,
		verdict,
		verdictLabel,
		breakdown: {
			subjectScore,
			contentScore,
			linkScore,
			formattingScore,
		},
		metrics: {
			wordCount,
			charCount,
			subjectLength: subject.length,
			linkCount,
			triggerWordCount: detectedTriggers.length,
			capsPercentage,
			readingTimeSec: Math.max(2, Math.round(wordCount / 3.5)),
		},
		categoryCounts,
		detectedTriggers,
		issues,
		recommendations,
	};
}
