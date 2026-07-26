import type { ComparisonCategory } from "../components/comparison-matrix";

/**
 * Feature matrix for Reloop vs Resend.
 * Only include claims we can defend from product docs / public Resend docs /
 * Reloop codebase. Prefer "—" or plain text over inventing a win.
 */
export const resendComparisonCategories: ComparisonCategory[] = [
	{
		id: "sending",
		label: "Sending",
		intro:
			"Both products give you a modern send API and SMTP. The gap is ownership: Reloop runs its own MTA stack (KumoMTA) and can be self-hosted; Resend is a hosted DX layer over Amazon SES.",
		features: [
			{ label: "Transactional emails", reloop: "Yes", competitor: "Yes" },
			{
				label: "REST API",
				reloop: "Yes",
				competitor: "Yes",
			},
			{ label: "SMTP", reloop: "Yes", competitor: "Yes" },
			{
				label: "Official SDKs",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "React Email / HTML templates",
				reloop: {
					value: "Yes",
					note: "Dashboard React Email editor + send with rendered HTML or template IDs",
				},
				competitor: {
					value: "Yes",
					note: "React Email first-class; build in your app",
				},
			},
			{
				label: "Batch / broadcast sending",
				reloop: {
					value: "API",
					note: "Send via API/SMTP; no separate marketing campaign builder shipping yet",
				},
				competitor: {
					value: "Yes",
					note: "Audiences / batch APIs on hosted product",
				},
			},
			{
				label: "Scheduled delivery",
				reloop: {
					value: "No",
					note: "Scheduling engine is currently in development",
				},
				competitor: "Yes",
			},
			{
				label: "A/B testing",
				reloop: "No",
				competitor: "No",
			},
			{
				label: "Own sending MTA",
				reloop: {
					value: "Yes",
					note: "KumoMTA in Reloop’s stack",
				},
				competitor: {
					value: "No",
					note: "Public delivery path uses Amazon SES",
				},
			},
			{
				label: "Self-hostable",
				reloop: "Yes",
				competitor: "No",
			},
			{
				label: "Open-source codebase",
				reloop: {
					value: "Yes",
					note: "Apache 2.0 with Reloop Labs use restrictions—see /license",
				},
				competitor: "No",
			},
			{
				label: "Shared IPs",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Dedicated IPs",
				reloop: {
					value: "Enterprise",
					note: "Optional / custom on Enterprise; self-host can use your own IPs",
				},
				competitor: {
					value: "Scale+",
					note: "Managed dedicated IP pools on higher plans",
				},
			},
		],
	},
	{
		id: "inbound",
		label: "Inbound Email (receiving email)",
		intro:
			"Both can receive email. Reloop routes inbound through its own MX stack into an agent inbox with full content and Rspamd scoring. Resend’s inbound product is hosted and webhook-oriented.",
		features: [
			{
				label: "Inbound email processing",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Full message body stored",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Inbound spam scoring",
				reloop: "Yes",
				competitor: "—",
			},
			{
				label: "Agent inbox UI",
				reloop: "Yes",
				competitor: "No",
			},
			{
				label: "AI compose helpers",
				reloop: "Yes",
				competitor: "No",
			},
		],
	},
	{
		id: "analytics",
		label: "Data & analytics",
		intro:
			"Core delivery telemetry overlaps. We only mark features Reloop implements in product today—no geolocation or client fingerprinting claims.",
		features: [
			{ label: "Delivery events", reloop: "Yes", competitor: "Yes" },
			{ label: "Bounce handling", reloop: "Yes", competitor: "Yes" },
			{ label: "Complaint / spam events", reloop: "Yes", competitor: "Yes" },
			{ label: "Open tracking", reloop: "Yes", competitor: "Yes" },
			{ label: "Click tracking", reloop: "Yes", competitor: "Yes" },
			{
				label: "Unsubscribe events",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Dashboard activity / logs",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Geolocation on opens",
				reloop: "No",
				competitor: "No",
			},
			{
				label: "Email client analytics",
				reloop: "No",
				competitor: "No",
			},
		],
	},
	{
		id: "reliability",
		label: "Reliability",
		intro:
			"This section is about control plane ownership—not a promise that Reloop is faster or more available than Resend. We do not publish third-party latency benchmarks here.",
		features: [
			{
				label: "Direct MTA delivery (no SES hop)",
				reloop: "Yes",
				competitor: {
					value: "No",
					note: "Resend’s public sending path goes through Amazon SES",
				},
			},
			{
				label: "Public status page",
				reloop: {
					value: "Yes",
					note: "status.reloop.sh",
				},
				competitor: "Yes",
			},
			{
				label: "Self-host = your uptime domain",
				reloop: {
					value: "Yes",
					note: "You operate the stack and SLOs",
				},
				competitor: "No",
			},
		],
	},
	{
		id: "security",
		label: "Security",
		features: [
			{ label: "SPF", reloop: "Yes", competitor: "Yes" },
			{ label: "DKIM", reloop: "Yes", competitor: "Yes" },
			{ label: "DMARC guidance / records", reloop: "Yes", competitor: "Yes" },
			{
				label: "TLS options",
				reloop: {
					value: "Yes",
					note: "Domain TLS: opportunistic or enforced",
				},
				competitor: "Yes",
			},
			{
				label: "Webhook signature verification",
				reloop: {
					value: "Yes",
					note: "HMAC-SHA256 (X-Webhook-Signature)",
				},
				competitor: {
					value: "Yes",
					note: "Svix-style signing headers",
				},
			},
			{
				label: "Account auth",
				reloop: {
					value: "Email OTP + OAuth",
					note: "Google / GitHub",
				},
				competitor: "Yes",
			},
		],
	},
	{
		id: "platform",
		label: "Platform",
		features: [
			{
				label: "Hosted SaaS",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Contacts / audiences",
				reloop: {
					value: "Yes",
					note: "Contacts, groups, channels",
				},
				competitor: {
					value: "Yes",
					note: "Audiences on Resend",
				},
			},
			{
				label: "Webhook management API",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Agent / AI inbox product",
				reloop: "Yes",
				competitor: "No",
			},
			{
				label: "Vendor lock-in risk",
				reloop: {
					value: "Lower",
					note: "Source + self-host path; still evaluate license terms",
				},
				competitor: {
					value: "Higher",
					note: "Hosted-only proprietary stack",
				},
			},
		],
	},
];
