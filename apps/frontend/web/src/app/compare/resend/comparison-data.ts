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
		icon: "send-2",
		intro:
			"Both products give you a modern send API and SMTP. The gap is ownership: Reloop runs its own MTA stack (KumoMTA) and can be self-hosted; Resend is a hosted DX layer over Amazon SES.",
		features: [
			{
				label: "Transactional emails",
				icon: "mail-single",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "REST API",
				icon: "webhook",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "SMTP",
				icon: "smtp",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Official SDKs",
				icon: "workflow",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "React Email / HTML templates",
				icon: "file-text",
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
				icon: "mega-phone",
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
				icon: "calendar",
				reloop: {
					value: "No",
					note: "Scheduling engine is currently in development",
				},
				competitor: "Yes",
			},
			{
				label: "A/B testing",
				icon: "arrow-swap",
				reloop: "No",
				competitor: "No",
			},
			{
				label: "Own sending MTA",
				icon: "server",
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
				icon: "home",
				reloop: "Yes",
				competitor: "No",
			},
			{
				label: "Open-source codebase",
				icon: "github",
				reloop: {
					value: "Yes",
					note: "Apache 2.0 with Reloop Labs use restrictions—see /license",
				},
				competitor: "No",
			},
			{
				label: "Shared IPs",
				icon: "globe",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Dedicated IPs",
				icon: "globe",
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
		icon: "mail-receive",
		intro:
			"Both can receive email. Reloop routes inbound through its own MX stack into an agent inbox with full content and Rspamd scoring. Resend’s inbound product is hosted and webhook-oriented.",
		features: [
			{
				label: "Inbound email processing",
				icon: "refresh-cw",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Full message body stored",
				icon: "message-body",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Inbound spam scoring",
				icon: "alert-triangle",
				reloop: "Yes",
				competitor: "—",
			},
			{
				label: "Agent inbox",
				icon: "robot",
				reloop: "Yes",
				competitor: "No",
			},
			{
				label: "Inbox for humans",
				icon: "user-circle",
				reloop: "Yes",
				competitor: "No",
			},
			{
				label: "AI composer",
				icon: "sparkling",
				reloop: "Yes",
				competitor: "No",
			},
		],
	},
	{
		id: "analytics",
		label: "Data & analytics",
		icon: "graph-up",
		intro:
			"Core delivery telemetry overlaps. We only mark features Reloop implements in product today—no geolocation or client fingerprinting claims.",
		features: [
			{
				label: "Delivery events",
				icon: "send-2",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Bounce handling",
				icon: "refresh-cw",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Complaint / spam events",
				icon: "alert-triangle",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Open tracking",
				icon: "eye-outline",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Click tracking",
				icon: "mouse",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Unsubscribe events",
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
				label: "Geolocation on opens",
				icon: "map-pin",
				reloop: "No",
				competitor: "No",
			},
			{
				label: "Email client analytics",
				icon: "laptop",
				reloop: "No",
				competitor: "No",
			},
		],
	},
	{
		id: "reliability",
		label: "Reliability",
		icon: "server",
		intro:
			"This section is about control plane ownership—not a promise that Reloop is faster or more available than Resend. We do not publish third-party latency benchmarks here.",
		features: [
			{
				label: "Direct MTA delivery (no SES hop)",
				icon: "server",
				reloop: "Yes",
				competitor: {
					value: "No",
					note: "Resend’s public sending path goes through Amazon SES",
				},
			},
			{
				label: "Public status page",
				icon: "graph-up",
				reloop: {
					value: "Yes",
					note: "status.reloop.sh",
				},
				competitor: "Yes",
			},
			{
				label: "Self-host = your uptime domain",
				icon: "home",
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
		icon: "lock",
		features: [
			{
				label: "SPF",
				icon: "lock",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "DKIM",
				icon: "lock",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "DMARC guidance / records",
				icon: "lock",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "TLS options",
				icon: "lock",
				reloop: {
					value: "Yes",
					note: "Domain TLS: opportunistic or enforced",
				},
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
					note: "Svix-style signing headers",
				},
			},
			{
				label: "Account auth",
				icon: "user-circle",
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
		icon: "modules",
		features: [
			{
				label: "Hosted SaaS",
				icon: "globe",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Contacts / audiences",
				icon: "contacts",
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
				icon: "webhook",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Agent / AI inbox product",
				icon: "robot",
				reloop: "Yes",
				competitor: "No",
			},
			{
				label: "Vendor lock-in risk",
				icon: "invoice",
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
