import type { FaqItem } from "@reloop/web/components/faq-section";

export const toolPath = "/tools/bimi-checker";
export const toolTitle = "BIMI Checker";
export const metaTitle = "BIMI Record Checker";
export const metaDescription =
	"Look up default._bimi for a sending domain. Validate v=BIMI1, the HTTPS SVG logo URL, optional VMC/CMC, and whether DMARC is at enforcement.";
export const toolDescription =
	"BIMI only shows a brand logo when DMARC is at quarantine or reject (pct=100) and default._bimi points at a valid SVG Tiny PS logo. This check looks those records up and explains what to fix.";

export const toolKeywords = [
	"BIMI checker",
	"BIMI record lookup",
	"BIMI SVG Tiny PS",
	"VMC checker",
	"brand indicators for message identification",
];

export const reasons = [
	{
		icon: "lock",
		title: "DMARC first",
		description:
			"BIMI is not a substitute for authentication. Supporting inboxes require p=quarantine or p=reject with pct=100.",
	},
	{
		icon: "globe",
		title: "HTTPS SVG logo",
		description:
			"The l= tag must be an HTTPS URL to an SVG Tiny PS file. Scripts, animation, and remote hrefs fail.",
	},
	{
		icon: "shield-check",
		title: "Optional VMC",
		description:
			"Gmail and some others also want a Verified Mark Certificate in a=. Missing a= is a warning, not always a hard fail.",
	},
	{
		icon: "file-text",
		title: "default._bimi",
		description:
			"The assertion record lives at default._bimi.{domain}. Empty l= is a valid “do not display” assertion.",
	},
];

export const faqs: FaqItem[] = [
	{
		question: "What is BIMI?",
		answer:
			"Brand Indicators for Message Identification lets some mailbox providers show your logo next to authenticated mail. It sits on top of DMARC; it does not replace SPF, DKIM, or DMARC.",
	},
	{
		question: "Why does this check DMARC?",
		answer:
			"BIMI requires a DMARC policy of quarantine or reject, applied to 100% of mail (pct=100 or omitted). p=none is not enough for the logo to appear.",
	},
	{
		question: "What is SVG Tiny PS?",
		answer:
			"BIMI logos must be SVG Tiny Portable/Secure: version 1.2, baseProfile tiny-ps, square, no scripts, no animation, no external references. We fetch the l= URL over HTTPS and flag those issues.",
	},
	{
		question: "Do I need a VMC?",
		answer:
			"A Verified Mark Certificate (or Common Mark Certificate) is published in a=. Gmail generally requires one. Other providers may show the logo from a valid BIMI record alone.",
	},
	{
		question: "Is there an API?",
		answer:
			'Yes. POST https://reloop.sh/api/tools/v1/bimi-check with JSON {"domain":"example.com"}. No API key. Rate limited to 60 requests per minute per IP.',
	},
];

export const faqGroups = [{ title: "BIMI", items: faqs }];
