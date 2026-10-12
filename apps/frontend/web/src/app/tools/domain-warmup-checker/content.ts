import type { FaqGroup, FaqItem } from "../domain-age/content";

export const toolPath = "/tools/domain-warmup-checker";
export const toolTitle =
	"Free Domain Warmup Checker — Is Your Domain Ready to Send?";
export const toolDescription =
	"New domains get flagged as spam. Paste any domain to see its warmup stage, its deliverability risk, and whether SPF, DMARC and MX are ready before you send. Free, no sign-up.";
export const metaDescription =
	"Check if your domain is ready to send email, free. See its warmup stage (Too New, Cold, Warming, Established), new-domain spam risk, and SPF, DMARC and MX readiness. No sign-up required.";

export const toolKeywords = [
	"domain warmup checker",
	"free domain warmup checker",
	"email warmup checker",
	"is my domain ready to send email",
	"domain warmup stages",
	"cold domain email warmup",
	"newly registered domain spam filter",
	"NRD spam risk checker",
	"how long before sending cold email",
	"new domain email deliverability",
	"Gmail spam new domain filter",
	"domain warmup schedule",
];

export const faqGroups: FaqGroup[] = [
	{
		title: "Domain warmup",
		items: [
			{
				question: "What are the domain warmup stages?",
				answer:
					"Too New (0 to 7 days) means mail will very likely be filtered. Cold (8 to 30 days) means keep volume near zero. Warming (31 to 90 days) means ramp volume up gradually. Established (90+ days) means age no longer hurts deliverability.",
			},
			{
				question: "Does domain age affect email deliverability?",
				answer:
					"Yes. Mailbox providers and blocklists like Spamhaus NRD treat domains registered within the last 14 to 30 days as high-risk senders. Even perfect SPF, DKIM, and DMARC records cannot override a brand-new domain's cold-domain penalty. You need to warm up your domain gradually over 60 to 90 days before sending large email volumes.",
			},
			{
				question:
					"Why do mailbox providers like Gmail treat new domains as spam?",
				answer:
					"Spammers frequently register brand-new domains, blast hundreds of thousands of unsolicited emails over 48 hours, and abandon them. To protect recipients, mailbox algorithms (and blocklists like Spamhaus NRD) automatically treat domains registered within the last 14 to 30 days as high-risk cold senders.",
			},
			{
				question:
					"Does perfect SPF, DKIM, and DMARC override a brand-new domain?",
				answer:
					"No. Authentication proves that the sender authorized the email, but it does not give the domain a positive sending reputation history. A 3-day-old domain with valid SPF and DMARC will still face severe inbox filtering if it suddenly sends high-volume marketing emails.",
			},
			{
				question:
					"How long should I wait before sending marketing or cold emails?",
				answer:
					"We recommend waiting at least 14 days after domain registration before beginning initial sending warmups. During the first 14 days, publish SPF, DKIM, and DMARC in DNS. Start warmups slowly between days 15 and 90, gradually scaling daily volume.",
			},
		],
	},
	{
		title: "Setup & Reloop",
		items: [
			{
				question: "What does 'Parking Nameservers' mean?",
				answer:
					"If your domain's DNS points to default registrar parking servers (e.g. Sedo, Bodis, or Namecheap parking), receiving mail servers cannot resolve production mail exchanges. Switch your nameservers to a production DNS provider (like Cloudflare, Route 53, or Google Cloud) to send email.",
			},
			{
				question: "How does Reloop help warm up newly registered domains?",
				answer:
					"Reloop provides built-in SPF/DKIM/DMARC setup, gradual volume ramp-up scheduling, and real-time bounce/spam monitoring so you can safely build high sender reputation without triggering mailbox spam filters.",
			},
			{
				question: "Is the domain warmup checker free?",
				answer:
					"Yes. The checker and its API are free with no sign-up, no API key, no credits and no expiry.",
			},
		],
	},
];

export const faqs: FaqItem[] = faqGroups.flatMap((group) => group.items);
