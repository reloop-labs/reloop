import type { BlogPostDefinition } from "../types";

export const post: BlogPostDefinition = {
	slug: "spf-dkim-dmarc-setup-guide",
	title: "SPF, DKIM, and DMARC Setup Guide",
	description:
		"A practical guide to email authentication—what each record does, how to configure them, and common mistakes to avoid.",
	keywords: [
		"SPF DKIM DMARC setup",
		"email authentication guide",
		"DMARC setup guide",
	],
	publishedAt: "2026-06-15",
	tag: "Deliverability",
	readTime: "8 min read",
	sections: [
		{
			heading: "Why authentication matters",
			paragraphs: [
				"Without SPF, DKIM, and DMARC, your emails are far more likely to land in spam—or be rejected entirely. Authentication tells receiving servers that you are who you claim to be.",
				"Reloop generates the DNS records you need when you add a sending domain. This guide explains what each record does so you can troubleshoot confidently.",
			],
		},
		{
			heading: "SPF first",
			paragraphs: [
				"SPF (Sender Policy Framework) is a TXT record listing which servers may send email for your domain. Add Reloop's include directive to your SPF record—never create duplicate SPF records; merge into one.",
			],
		},
		{
			heading: "Add DKIM",
			paragraphs: [
				"DKIM signs each message with a private key; receivers verify against your public key in DNS. Reloop provides CNAME records for selector-based DKIM—copy them exactly as shown in the dashboard.",
			],
		},
		{
			heading: "Roll out DMARC",
			paragraphs: [
				"Start with p=none to collect reports without affecting delivery. Once SPF and DKIM pass consistently, move to quarantine then reject. Use Reloop's auth checker tool to verify all three records.",
			],
		},
	],
};
