import type { FaqItem } from "@reloop/web/components/faq-section";
import type { FeatureHighlight } from "@reloop/web/components/landing/feature-highlights";

export const toolPath = "/tools/spam-score-checker";

export const toolTitle = "Email Spam Words Checker";

export const toolDescription =
	"Free online spam score calculator. Test your email subject line, copy, and links in real time to avoid spam filters (SpamAssassin, Gmail AI, Outlook) and reach the inbox.";

export const toolKeywords = [
	"email spam score checker",
	"spam score calculator",
	"email spam checker free",
	"check email spam score",
	"spam trigger words detector",
	"email deliverability score",
	"email content spam test",
	"spamassassin tester online",
	"cold email spam score checker",
	"email deliverability tester",
	"check spam triggers",
	"email copy grader",
];

export const signals: FeatureHighlight[] = [
	{
		id: "spam-words",
		icon: "slash",
		title: "Spam Word & Hype Scanner",
		description:
			"Scans copy against high-risk commercial words, false urgency, and deceptive guarantees.",
	},
	{
		id: "subject-quality",
		icon: "message-body",
		title: "Subject Line Quality",
		description:
			"Evaluates character count, capitalization ratios, and punctuation abuse (!!!, ???).",
	},
	{
		id: "link-safety",
		icon: "link",
		title: "Link Safety & Density",
		description:
			"Detects insecure HTTP links, high link-to-text ratios, and URL shorteners.",
	},
	{
		id: "caps-formatting",
		icon: "layout",
		title: "Caps & Formatting Balance",
		description:
			"Calculates uppercase-to-lowercase ratio to avoid SpamAssassin BODY_ALL_CAPS flags.",
	},
	{
		id: "unsubscribe-signal",
		icon: "shield",
		title: "Opt-Out & Unsubscribe Signal",
		description:
			"Verifies compliance signals required by Google, Yahoo, and CAN-SPAM rules.",
	},
	{
		id: "reading-time",
		icon: "activity",
		title: "Pacing & Reading Time",
		description:
			"Estimates reading time and word count balance for a natural human inbox feel.",
	},
	{
		id: "deceptive-prefixes",
		icon: "flag",
		title: "Deceptive Reply Protection",
		description:
			"Flags fake Re: or Fwd: prefixes that violate CAN-SPAM regulations.",
	},
	{
		id: "sensitive-query",
		icon: "lock",
		title: "Phishing & Credential Guard",
		description:
			"Scans for sensitive credential queries and banking/financial triggers.",
	},
	{
		id: "heuristic-scoring",
		icon: "server",
		title: "Deterministic Rule Scoring",
		description:
			"Instant pre-send evaluation with zero latency and client-side privacy.",
	},
	{
		id: "programmatic-api",
		icon: "code",
		title: "Automated Validation API",
		description:
			"Integrate automated content checks directly into your CI/CD pipelines.",
	},
];

export const reasons: {
	icon: string;
	stat: string;
	title: string;
	description: string;
}[] = [
	{
		icon: "mail",
		stat: "1 in 6",
		title: "Emails never reach the primary inbox",
		description:
			"Over 16% of legitimate commercial emails are filtered into junk or spam folders due to preventable content triggers and poor link hygiene.",
	},
	{
		icon: "shield",
		stat: "0.3%",
		title: "Google & Yahoo spam complaint limit",
		description:
			"Exceeding a 0.3% spam complaint rate will cause major inbox providers to block your domain's outgoing mail automatically.",
	},
	{
		icon: "database",
		stat: "SpamAssassin",
		title: "Filters run rule-based heuristics",
		description:
			"Mail servers score incoming messages against deterministic penalty rules like suspicious links, uppercase text, and spam trigger phrases.",
	},
	{
		icon: "check-circle",
		stat: "Pre-send",
		title: "Fixing copy takes 30 seconds",
		description:
			"Removing high-risk keywords and fixing insecure links before sending protects your sending IP and keeps deliverability high.",
	},
];

export const faqs: FaqItem[] = [
	{
		question: "What is an email spam score?",
		answer:
			"An email spam score is a numerical rating calculated by spam filters (such as SpamAssassin, Gmail AI, or Microsoft Defender) evaluating how likely an email is to be unsolicited or malicious. Scores are based on content keywords, link density, formatting, and domain authentication (SPF, DKIM, DMARC).",
	},
	{
		question: "How is the spam score calculated in this tool?",
		answer:
			"Reloop's Spam Score Checker calculates a 0–100 score across 4 key dimensions: Subject Line Health (25 pts), Content & Trigger Words (35 pts), Link Safety & URL Shorteners (20 pts), and Formatting & Capitalization (20 pts). A score of 90+ means your email is inbox-ready.",
	},
	{
		question: "What are the most common email spam trigger words?",
		answer:
			"Common spam words include artificial urgency phrases ('Act now', 'Limited time only'), aggressive financial promises ('100% free', 'Make money fast', 'Risk-free guarantee'), and clickbait terms ('Click here', 'Winner', 'Claim your reward'). Replacing these with natural phrasing prevents spam flags.",
	},
	{
		question: "Why do URL shorteners like bit.ly trigger spam filters?",
		answer:
			"Spam filters heavily penalize generic URL shorteners because spammers use them to disguise phishing domains. Always use full, direct links with HTTPS or branded tracking subdomains connected to your verified sending domain.",
	},
	{
		question: "How does subject line length affect email deliverability?",
		answer:
			"Subject lines between 30 and 50 characters achieve the highest open rates and render properly on mobile screens. Subject lines over 70 characters are clipped by mobile clients, while ALL-CAPS or repeated exclamation marks (!!!) directly trigger spam penalties.",
	},
	{
		question: "Is good email content enough to guarantee inbox placement?",
		answer:
			"No. Content is one half of deliverability; the other half is technical authentication. You must also configure SPF, DKIM, and DMARC records on your domain. Reloop provides open-source email infrastructure with automated DKIM signing and deliverability monitoring.",
	},
];

export const faqGroups = [
	{
		title: "Spam Score & Deliverability",
		items: faqs.slice(0, 3),
	},
	{
		title: "Best Practices & Troubleshooting",
		items: faqs.slice(3, 6),
	},
];

export const apiEndpoint = "POST https://api.reloop.sh/api/tools/v1/spam-check";

export const apiSnippets = [
	{
		id: "curl",
		label: "cURL",
		code: `curl -X POST https://api.reloop.sh/api/tools/v1/spam-check \\
  -H "Content-Type: application/json" \\
  -d '{
    "subject": "Your monthly analytics report is ready",
    "body": "Hi Alex, your weekly report has been generated. View your metrics online: https://yourdomain.com/analytics"
  }'`,
	},
	{
		id: "node",
		label: "Node.js",
		code: `import { Reloop } from "@reloop/sdk";

const reloop = new Reloop("rl_live_your_api_key");

const analysis = await reloop.tools.checkSpamScore({
  subject: "Your monthly analytics report is ready",
  body: "Hi Alex, your weekly report has been generated. View your metrics online: https://yourdomain.com/analytics",
});

console.log(\`Score: \${analysis.score}/100 (\${analysis.verdict})\`);
console.log("Detected Issues:", analysis.issues);`,
	},
	{
		id: "python",
		label: "Python",
		code: `from reloop import Reloop

client = Reloop(api_key="rl_live_your_api_key")

analysis = client.tools.check_spam_score(
    subject="Your monthly analytics report is ready",
    body="Hi Alex, your weekly report has been generated. View your metrics online: https://yourdomain.com/analytics"
)

print(f"Score: {analysis.score}/100 ({analysis.verdict})")
print(f"Trigger Words: {analysis.detected_triggers}")`,
	},
	{
		id: "go",
		label: "Go",
		code: `package main

import (
	"context"
	"fmt"
	"github.com/reloop-labs/reloop-go"
)

func main() {
	client := reloop.NewClient("rl_live_your_api_key")

	res, err := client.Tools.CheckSpamScore(context.Background(), &reloop.SpamCheckRequest{
		Subject: "Your monthly analytics report is ready",
		Body:    "Hi Alex, your weekly report has been generated. View your metrics online: https://yourdomain.com/analytics",
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("Score: %d/100 (%s)\\n", res.Score, res.Verdict)
}`,
	},
];

export const apiResponseSample = `{
  "score": 96,
  "grade": "A+",
  "verdict": "inbox_ready",
  "verdict_label": "Inbox Ready (Low Risk)",
  "breakdown": {
    "subject_score": 25,
    "content_score": 35,
    "link_score": 20,
    "formatting_score": 16
  },
  "metrics": {
    "word_count": 22,
    "link_count": 1,
    "trigger_word_count": 0,
    "caps_percentage": 4
  },
  "detected_triggers": [],
  "issues": [],
  "recommendations": [
    "Email is clean and balanced. Keep sending domains aligned with SPF and DKIM."
  ]
}`;

export const apiNotes = [
	{
		label: "Zero Quota Waste",
		detail:
			"Pre-validate automated campaigns, transactional alerts, and cold sequences via API before sending.",
	},
	{
		label: "Sub-10ms Latency",
		detail:
			"Ultra-fast deterministic rule checks suitable for synchronous signup and template submission flows.",
	},
	{
		label: "Open Source Engine",
		detail:
			"Self-host the same heuristics engine inside your own VPC or Kubernetes cluster with zero external calls.",
	},
];
