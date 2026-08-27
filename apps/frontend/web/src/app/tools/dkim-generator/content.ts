import type { FaqItem } from "@reloop/web/components/faq-section";

export const toolPath = "/tools/dkim-generator";
export const toolTitle = "DKIM Record Generator";
export const metaTitle = "DKIM Key & Record Generator";
export const metaDescription =
	"Generate a 2048-bit DKIM key pair and a copy-pasteable TXT record at {selector}._domainkey.{domain}. The private key is shown once and never stored.";
export const toolDescription =
	"Create a 2048-bit RSA DKIM key pair in the browser session. Publish the public TXT record; keep the private key on your sending server.";

export const toolKeywords = [
	"DKIM generator",
	"DKIM key pair",
	"DKIM TXT record",
	"2048-bit DKIM",
];

export const faqs: FaqItem[] = [
	{
		question: "Where do I publish the public key?",
		answer:
			"Create a TXT record at {selector}._domainkey.{domain}. The value is the generated v=DKIM1 string. Split it across 255-character strings if your DNS host requires it.",
	},
	{
		question: "What about the private key?",
		answer:
			"It is returned in this response only. Reloop does not log or store it. Paste it into your MTA or ESP and delete it from your clipboard history when you are done.",
	},
	{
		question: "Why 2048-bit RSA?",
		answer:
			"1024-bit keys are deprecated. 2048-bit RSA is the current default for DKIM. Some DNS hosts need the p= value split because TXT strings are limited to 255 octets.",
	},
	{
		question: "Can I pick any selector?",
		answer:
			"Yes, as long as it is a DNS label (letters, digits, hyphens). Common values are default, google, or a vendor name. Reloop uses a dedicated selector when you verify a domain.",
	},
];

export const faqGroups = [{ title: "DKIM", items: faqs }];
