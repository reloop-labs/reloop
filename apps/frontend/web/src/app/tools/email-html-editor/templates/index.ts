import type { ToolVariable } from "@reloop/web/lib/email-html-editor/hooks/use-editor-store";
import { appointmentReminderHtml } from "./appointment-reminder";
import { eventTicketHtml } from "./event-ticket";
import { fileDeliveryHtml } from "./file-delivery";
import { orderReceiptHtml } from "./order-receipt";
import { orderShippedHtml } from "./order-shipped";
import { passwordResetHtml } from "./password-reset";
import { paymentFailedHtml } from "./payment-failed";
import { refundConfirmationHtml } from "./refund-confirmation";
import { securityAlertHtml } from "./security-alert";
import { signInCodeHtml } from "./sign-in-code";
import { subscriptionRenewalHtml } from "./subscription-renewal";
import { teamInviteHtml } from "./team-invite";

export interface EmailTemplateExample {
	/** URL segment: /tools/email-html-editor/[id] */
	id: string;
	name: string;
	/** Card subtitle, kebab-case like the dashboard template grid. */
	slug: string;
	description: string;
	html: (origin: string) => string;
	variables: ToolVariable[];
}

export const emailTemplateExamples: EmailTemplateExample[] = [
	{
		id: "password-reset",
		name: "Password reset",
		slug: "password-reset",
		description:
			"Minimal password reset email with a single button, expiry note, and fallback link.",
		html: passwordResetHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "reset_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "order-receipt",
		name: "Order receipt",
		slug: "order-receipt",
		description:
			"Clean order receipt with line items, totals, and a view-invoice button.",
		html: orderReceiptHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "1042" },
			{ name: "invoice_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "sign-in-code",
		name: "Sign-in code",
		slug: "sign-in-code",
		description:
			"Dark one-time code email with a glowing monospace code, magic-link button, and request details.",
		html: signInCodeHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "otp_code", type: "string", defaultValue: "482913" },
			{ name: "magic_link_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "order-shipped",
		name: "Order shipped",
		slug: "order-shipped",
		description:
			"Editorial shipping update with a progress tracker, delivery estimate, and items in the box.",
		html: orderShippedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "tracking_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "event-ticket",
		name: "Event ticket",
		slug: "booking-confirmed",
		description:
			"Tear-off ticket booking confirmation with event details, barcode, and wallet button.",
		html: eventTicketHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "booking_code", type: "string", defaultValue: "ENC4829" },
			{ name: "tickets_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "payment-failed",
		name: "Payment failed",
		slug: "payment-failed",
		description:
			"Friendly dunning email with a declined-card visual, amount due, and retry schedule.",
		html: paymentFailedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "amount_due", type: "string", defaultValue: "$49.00" },
			{ name: "update_payment_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "team-invite",
		name: "Team invite",
		slug: "team-invite",
		description:
			"Playful neo-brutalist workspace invitation with avatars, workspace tile, and join button.",
		html: teamInviteHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "inviter_name", type: "string", defaultValue: "Maya" },
			{
				name: "workspace_name",
				type: "string",
				defaultValue: "Northwind Design",
			},
			{ name: "invite_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "security-alert",
		name: "Security alert",
		slug: "new-sign-in",
		description:
			"New-device sign-in alert with device details and secure-account / it-was-me actions.",
		html: securityAlertHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "secure_account_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "appointment-reminder",
		name: "Appointment reminder",
		slug: "appointment-reminder",
		description:
			"A calming sage appointment reminder with an arched card and calendar date.",
		html: appointmentReminderHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "Alex" },
			{ name: "appointment_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "refund-confirmation",
		name: "Refund confirmation",
		slug: "refund-issued",
		description:
			"A cobalt refund confirmation with oversized amount and bank arrival details.",
		html: refundConfirmationHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "Alex" },
			{ name: "refund_amount", type: "string", defaultValue: "$84.00" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "refund_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "subscription-renewal",
		name: "Subscription renewal",
		slug: "membership-renewal",
		description:
			"A plum membership renewal with expressive serif typography and transparent billing details.",
		html: subscriptionRenewalHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "Alex" },
			{ name: "renewal_amount", type: "string", defaultValue: "$96.00" },
			{
				name: "renewal_date",
				type: "string",
				defaultValue: "October 18, 2026",
			},
			{ name: "subscription_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "file-delivery",
		name: "File delivery",
		slug: "export-ready",
		description:
			"A butter-yellow export notification with an offset shadow and file manifest.",
		html: fileDeliveryHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "Alex" },
			{
				name: "file_name",
				type: "string",
				defaultValue: "northwind-workspace.zip",
			},
			{ name: "expiry_date", type: "string", defaultValue: "OCT 18, 2026" },
			{ name: "download_url", type: "string", defaultValue: null },
		],
	},
];

export function getEmailTemplateExample(
	id: string,
): EmailTemplateExample | undefined {
	return emailTemplateExamples.find((template) => template.id === id);
}
