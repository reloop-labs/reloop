import type { FaqItem } from "@reloop/web/components/faq-section";

export const toolPath = "/tools/dmarc-generator";
export const toolTitle = "DMARC Record Generator";
export const metaTitle = "DMARC Record Generator";
export const metaDescription =
	"Build a copy-pasteable _dmarc TXT record. Set p=, rua/ruf, aspf/adkim, pct, and subdomain policy (sp).";
export const toolDescription =
	"Publish a DMARC policy that tells receivers what to do when SPF or DKIM fail. Start at p=none with rua= reporting, then move to quarantine and reject.";

export const toolKeywords = [
	"DMARC generator",
	"DMARC record wizard",
	"create DMARC",
	"_dmarc TXT",
];

export const faqs: FaqItem[] = [
	{
		question: "Where do I publish the record?",
		answer:
			"Create a TXT record at _dmarc.{domain}. The value is the generated v=DMARC1 string.",
	},
	{
		question: "What policy should I start with?",
		answer:
			"p=none plus rua= lets you collect aggregate reports without affecting delivery. Move to quarantine, then reject, once every legitimate sender is aligned.",
	},
	{
		question: "Does BIMI need this?",
		answer:
			"Yes. BIMI requires p=quarantine or p=reject with pct=100 (or omitted pct). Use the BIMI checker after you raise policy.",
	},
	{
		question: "rua vs ruf?",
		answer:
			"rua is aggregate XML reports (useful). ruf is forensic/failure reports (often ignored and privacy-sensitive). Most teams only set rua.",
	},
];

export const faqGroups = [{ title: "DMARC", items: faqs }];
