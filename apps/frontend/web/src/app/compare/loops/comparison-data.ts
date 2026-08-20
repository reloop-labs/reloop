import type { ComparisonCategory } from "../components/comparison-matrix";

/**
 * Feature matrix for Reloop vs Loops.
 * Grounded strictly in documented product capabilities and public Loops pricing models.
 */
export const loopsComparisonCategories: ComparisonCategory[] = [
	{
		id: "pricing-model",
		label: "Pricing & Economic Model",
		icon: "invoice",
		intro:
			"Loops charges based on your contact list size—penalizing list growth even for inactive subscribers. Reloop charges purely for emails sent (or $0 when self-hosted), ensuring your bill scales with activity, not database size.",
		features: [
			{
				label: "Pricing basis",
				icon: "invoice",
				reloop: {
					value: "Emails sent",
					note: "Pay for actual volume used",
				},
				competitor: {
					value: "Contact list size",
					note: "Bill increases as list grows",
				},
			},
			{
				label: "Free monthly tier",
				icon: "send-2",
				reloop: "10,000 emails / mo",
				competitor: "1,000 contacts",
			},
			{
				label: "10,000 volume plan",
				icon: "invoice",
				reloop: "$10 / mo",
				competitor: "$49 / mo (10k contacts)",
			},
			{
				label: "50,000 volume plan",
				icon: "mega-phone",
				reloop: "$20 / mo",
				competitor: "$199 / mo (50k contacts)",
			},
			{
				label: "Self-hosted email sends",
				icon: "server",
				reloop: {
					value: "Unlimited ($0)",
					note: "Free open-source engine (own infra)",
				},
				competitor: {
					value: "N/A",
					note: "Closed SaaS only",
				},
			},
		],
	},
	{
		id: "unified-infrastructure",
		label: "Unified Infrastructure & Sending",
		icon: "send-2",
		intro:
			"Loops is designed for product onboarding loops, forcing teams to buy a separate vendor (Resend or Postmark) for transactional emails. Reloop handles transactional API sends, marketing broadcasts, and AI agent inboxes under one unified platform.",
		features: [
			{
				label: "Transactional REST API",
				icon: "webhook",
				reloop: "Yes",
				competitor: {
					value: "Limited",
					note: "Basic event triggers only",
				},
			},
			{
				label: "SMTP relay",
				icon: "smtp",
				reloop: "Yes",
				competitor: {
					value: "No",
					note: "No raw SMTP interface",
				},
			},
			{
				label: "Lifecycle & onboarding campaigns",
				icon: "workflow",
				reloop: "Yes",
				competitor: "Yes (Core focus)",
			},
			{
				label: "Broadcast / marketing newsletters",
				icon: "mega-phone",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Agent / AI inbound inbox",
				icon: "robot",
				reloop: "Yes",
				competitor: "No",
			},
			{
				label: "React Email / HTML templates",
				icon: "file-text",
				reloop: "Yes",
				competitor: "HTML / Visual editor",
			},
			{
				label: "Open-source MTA engine",
				icon: "server",
				reloop: "Yes (KumoMTA)",
				competitor: "No (Proprietary)",
			},
			{
				label: "Self-hostable",
				icon: "github",
				reloop: "Yes",
				competitor: "No",
			},
		],
	},
	{
		id: "deliverability-data",
		label: "Deliverability & Data Ownership",
		icon: "graph-up",
		intro:
			"Reloop owns its delivery engine and allows full data sovereignty, whereas Loops routes through third-party email infrastructure.",
		features: [
			{
				label: "Direct MTA control",
				icon: "mail-server",
				reloop: "Yes (KumoMTA)",
				competitor: {
					value: "No",
					note: "Relies on third-party senders",
				},
			},
			{
				label: "Domain TLS enforcement",
				icon: "lock",
				reloop: "Yes",
				competitor: "Yes",
			},
			{
				label: "Webhook signature verification",
				icon: "webhook",
				reloop: "Yes (HMAC-SHA256)",
				competitor: "Yes",
			},
			{
				label: "Single sender reputation pool",
				icon: "globe",
				reloop: {
					value: "Yes",
					note: "Transactional + Marketing unified",
				},
				competitor: {
					value: "Split",
					note: "Requires 2nd vendor for transactional",
				},
			},
			{
				label: "Data export & sovereignty",
				icon: "server",
				reloop: {
					value: "Full control",
					note: "Self-host or export anytime",
				},
				competitor: "CSV export",
			},
		],
	},
];
