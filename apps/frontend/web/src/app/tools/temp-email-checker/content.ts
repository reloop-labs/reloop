import type { FaqItem } from "@reloop/web/components/faq-section";
import type { FeatureCtaBand } from "@reloop/web/components/landing/types";

export const toolPath = "/tools/temp-email-checker";

export const toolTitle = "Temp Email Checker";

export const toolDescription =
	"Check whether an email address comes from a disposable or temporary mailbox provider — before it lands in your database and burns your sender reputation.";

export const toolKeywords = [
	"temp email checker",
	"temporary email checker",
	"disposable email checker",
	"disposable email detector",
	"fake email checker",
	"burner email address",
	"throwaway email domain",
	"email validation",
];

export const signals: { icon: string; title: string; description: string }[] = [
	{
		icon: "at-sign",
		title: "Address syntax",
		description:
			"The local part and domain are parsed against RFC 5322 shape rules, so malformed input is rejected before anything else runs.",
	},
	{
		icon: "shield-cross",
		title: "Disposable domains",
		description:
			"The domain is matched against a large, continuously refreshed catalogue of known throwaway mailbox providers.",
	},
	{
		icon: "route",
		title: "Wildcard patterns",
		description:
			"Providers spin up endless subdomains. Suffix patterns catch the whole family instead of one host at a time.",
	},
	{
		icon: "shield-check",
		title: "Exception list",
		description:
			"Legitimate domains that share infrastructure with throwaway services stay whitelisted, so real customers are never blocked.",
	},
	{
		icon: "user-circle",
		title: "Role addresses",
		description:
			"Shared inboxes like info@, billing@ and support@ are flagged separately — they are real, but they behave differently.",
	},
	{
		icon: "globe",
		title: "Free providers",
		description:
			"Consumer mailboxes are called out on their own, so you can treat them differently from throwaway addresses.",
	},
];

export const reasons: { stat: string; title: string; description: string }[] = [
	{
		stat: "Bounces",
		title: "Throwaway inboxes expire",
		description:
			"Most temporary mailboxes are destroyed within an hour. Every send after that is a hard bounce recorded against your domain.",
	},
	{
		stat: "Reputation",
		title: "Mailbox providers keep score",
		description:
			"Sustained bounce rates push your domain toward the spam folder for every recipient, not just the disposable ones.",
	},
	{
		stat: "Signal",
		title: "Your metrics stop lying",
		description:
			"Burner signups inflate list size and deflate open rates. Filtering them keeps growth numbers honest.",
	},
	{
		stat: "Abuse",
		title: "Free tiers get farmed",
		description:
			"Unlimited throwaway addresses mean unlimited trial accounts. Blocking them at signup closes the cheapest abuse vector you have.",
	},
];

export const steps: { title: string; description: string }[] = [
	{
		title: "Paste an address or domain",
		description:
			"Enter a full email address or just the domain. Input is normalised and checked for shape before any lookup happens.",
	},
	{
		title: "Match against the catalogue",
		description:
			"The domain is compared against known disposable providers, wildcard suffix patterns, and the whitelist of false-positive exceptions.",
	},
	{
		title: "Read the verdict",
		description:
			"You get a clear result plus the individual signals behind it, so you can decide whether to block, flag, or allow the address.",
	},
];

export const faqs: FaqItem[] = [
	{
		question: "What is a disposable email address?",
		answer:
			"A disposable — or temporary, throwaway, burner — email address is a mailbox created on demand that anyone can read without signing up, and that usually self-destructs within minutes or hours. People use them to get past signup walls without handing over a real address.",
	},
	{
		question: "Why should I block disposable email addresses?",
		answer:
			"Because they stop existing. Once the mailbox expires, every message you send to it hard-bounces, and mailbox providers read sustained bounce rates as a sign that you send to bad lists. That reputation damage applies to your whole domain, not just the throwaway recipients.",
	},
	{
		question: "Should I always block them?",
		answer:
			"Not necessarily. Blocking outright at signup is right for free tiers and trials, where throwaway addresses are used to farm accounts. For newsletters or content downloads, flagging and suppressing later is often enough — some people simply value their privacy.",
	},
	{
		question: "How accurate is the check?",
		answer:
			"Domain matching is exact by nature: a domain is either on the list or it isn't. The lists themselves are community maintained and refreshed continuously, but new providers appear constantly, so treat a clean result as 'not currently known to be disposable' rather than a guarantee.",
	},
	{
		question: "Is a Gmail or Outlook address disposable?",
		answer:
			"No. Consumer mailboxes from Gmail, Outlook, Yahoo and similar providers are free, but they are persistent and real. They are reported as a separate signal so you can apply your own policy to them — many products happily accept them.",
	},
	{
		question: "Does this store the addresses I check?",
		answer:
			"No. Addresses are checked and discarded — nothing is written to a database, added to a list, or used for marketing. The tool is free and needs no account.",
	},
	{
		question: "Can I run this check from my own application?",
		answer:
			"Yes. Reloop is open-source email infrastructure, so you can run the same validation inside your own signup flow, self-host the whole stack, or use the hosted API. Nothing here is locked behind a proprietary service.",
	},
];

export const cta: FeatureCtaBand = {
	title: "Stop sending to inboxes",
	titleMuted: "that no longer exist.",
	description:
		"Reloop is open-source email infrastructure — validation, sending, inbound, and analytics in one stack you can host yourself.",
	primary: { label: "Start for free", href: "/dashboard/signup" },
	secondary: { label: "Read the docs", href: "/docs" },
};
