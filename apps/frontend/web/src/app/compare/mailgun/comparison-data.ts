import type { ComparisonCategory } from "../compare-types";

export const mailgunComparisonCategories: ComparisonCategory[] = [
	{
		id: "pricing-volume",
		label: "Pricing & Email Volume",
		icon: "invoice",
		intro:
			"Mailgun prices in plan tiers: Basic at $15/mo for 10,000 emails, Foundation at $35/mo for 50,000, with overage billed from $1.30 per 1,000. Reloop Cloud Pro is $10/mo for 50,000 emails and $0.50 per 1,000 after that. Self-hosting Reloop carries no Reloop license fee; you pay your own infrastructure.",
		features: [
			{
				label: "Free tier",
				icon: "send-2",
				reloop: {
					value: "3,000 / mo",
					note: "200 / day cap",
				},
				competitor: {
					value: "100 / day",
					note: "Trial period only",
				},
			},
			{
				label: "Entry paid plan",
				icon: "invoice",
				reloop: {
					value: "$10 / mo",
					note: "50,000 emails included",
				},
				competitor: {
					value: "$15 / mo",
					note: "Basic · 10,000 emails",
				},
			},
			{
				label: "50,000 emails / mo",
				icon: "mega-phone",
				reloop: "$10 / mo",
				competitor: {
					value: "$35 / mo",
					note: "Foundation",
				},
			},
			{
				label: "Overage rate (per 1k emails)",
				icon: "arrow-swap",
				reloop: "$0.50 / 1k",
				competitor: {
					value: "From $1.30 / 1k",
					note: "Basic from $1.80 / 1k",
				},
			},
			{
				label: "Email validation",
				icon: "user-circle",
				reloop: "Yes",
				competitor: {
					value: "Yes",
					note: "Priced as a separate add-on",
				},
			},
			{
				label: "Self-hosted email sends",
				icon: "server",
				reloop: {
					value: "Unlimited",
					note: "Free open-source software (own infra)",
				},
				competitor: {
					value: "N/A",
					note: "Hosted SaaS only",
				},
			},
		],
	},
	{
		id: "sending-receiving",
		label: "Sending & Receiving",
		icon: "send-2",
		intro:
			"The sending surface overlaps closely: both speak REST and SMTP, both parse inbound mail. The split is what sits behind it. Reloop runs its own MTA and MX stack (KumoMTA, Rspamd, two-way agent inbox) and hands you the source; Mailgun is managed sending with regex-matched inbound routes.",
		features: [
			{
				label: "REST API",
				icon: "webhook",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "SMTP relay",
				icon: "smtp",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Inbound / reply handling",
				icon: "mail-receive",
				reloop: {
					value: "Agent inbox",
					note: "AI triage plus webhooks",
				},
				competitor: {
					value: "Inbound routes",
					note: "Regex match and forward",
				},
			},
			{
				label: "Agent / AI inbox",
				icon: "robot",
				reloop: "Yes",
				competitor: "No",
			},
			{
				label: "Stored templates",
				icon: "file-text",
				reloop: {
					value: "Yes",
					note: "React Email or HTML",
				},
				competitor: {
					value: "Yes",
					note: "Handlebars templates",
				},
			},
			{
				label: "Batch / broadcast sending",
				icon: "mega-phone",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Scheduled delivery",
				icon: "calendar",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Marketing campaigns",
				icon: "workflow",
				reloop: "Yes",
				competitor: {
					value: "Limited",
					note: "Campaign tooling is a separate Sinch product",
				},
			},
		],
	},
	{
		id: "analytics-security",
		label: "Data & Security",
		icon: "graph-up",
		intro:
			"Delivery telemetry is comparable. We only mark what Reloop ships today, with no geolocation or client fingerprinting claims.",
		features: [
			{
				label: "Delivery events",
				icon: "send-2",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Bounce & complaint handling",
				icon: "refresh-cw",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Open & click tracking",
				icon: "eye-outline",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Suppression lists",
				icon: "bell-off",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Dashboard activity / logs",
				icon: "logs",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Webhook signature verification",
				icon: "webhook",
				reloop: {
					value: "Yes",
					note: "HMAC-SHA256 (X-Webhook-Signature)",
				},
				competitor: {
					value: "Yes",
					note: "HMAC with account signing key",
				},
			},
			{
				label: "SPF / DKIM / DMARC",
				icon: "lock",
				reloop: "Yes",
				competitor: "Yes",
			},
		],
	},
	{
		id: "ownership",
		label: "Ownership & Exit",
		icon: "server",
		intro:
			"This is the section that decides most Mailgun migrations. Mailgun is hosted-only under Sinch, so leaving means rebuilding on someone else's stack. Reloop ships the source and a self-host path, so the exit is a deployment target rather than a rewrite.",
		features: [
			{
				label: "Open-source codebase",
				icon: "github",
				reloop: {
					value: "Yes",
					note: "Apache 2.0 plus Reloop Labs terms",
				},
				competitor: "No",
			},
			{
				label: "Self-hostable",
				icon: "server",
				reloop: "Yes",
				competitor: "No",
			},
			{
				label: "Direct MTA control",
				icon: "mail-server",
				reloop: {
					value: "Yes",
					note: "KumoMTA under your control",
				},
				competitor: {
					value: "No",
					note: "Managed sending only",
				},
			},
			{
				label: "Dedicated IPs",
				icon: "globe",
				reloop: {
					value: "1 included",
					note: "Growth plan; bring your own when self-hosted",
				},
				competitor: {
					value: "Paid add-on",
					note: "Plan-tiered availability",
				},
			},
			{
				label: "Vendor lock-in risk",
				icon: "invoice",
				reloop: {
					value: "Lower",
					note: "Source plus self-host path; still evaluate license terms",
				},
				competitor: {
					value: "Higher",
					note: "Hosted-only proprietary stack",
				},
			},
		],
	},
];
