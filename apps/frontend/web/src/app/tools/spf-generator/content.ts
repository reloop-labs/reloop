import type { FaqItem } from "@reloop/web/components/faq-section";

export const toolPath = "/tools/spf-generator";
export const toolTitle = "SPF Record Generator";
export const metaTitle = "SPF Record Generator";
export const metaDescription =
	"Build a copy-pasteable v=spf1 TXT record from IPs, includes, a/mx, and a terminal policy. Warns about the 10-lookup limit and duplicate SPF records.";
export const toolDescription =
	"List the hosts allowed to send mail for your domain. The generator outputs one TXT record and flags lookup-limit and duplicate-SPF mistakes.";

export const toolKeywords = [
	"SPF record generator",
	"SPF wizard",
	"create SPF record",
	"v=spf1 generator",
];

export const faqs: FaqItem[] = [
	{
		question: "Where do I publish the record?",
		answer:
			"Create a TXT record on the sending domain itself (the apex, or a subdomain you send From). The name is usually @ or the subdomain, and the value is the generated v=spf1 string.",
	},
	{
		question: "What is the 10-lookup limit?",
		answer:
			"RFC 7208 caps DNS-querying mechanisms (include, a, mx, ptr, exists, redirect) at 10. ip4 and ip6 do not count. Nested includes count against the same budget.",
	},
	{
		question: "Can I publish two SPF records?",
		answer:
			"No. Multiple v=spf1 TXT records on the same name are invalid. Merge every sender into a single record.",
	},
	{
		question: "~all vs -all?",
		answer:
			"~all is softfail (often treated as spam). -all is fail (unauthorized mail should be rejected, especially with DMARC). +all authorizes the entire internet — never use it.",
	},
];

export const faqGroups = [{ title: "SPF", items: faqs }];
