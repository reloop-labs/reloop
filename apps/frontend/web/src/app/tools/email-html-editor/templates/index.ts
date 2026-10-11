import type { ToolVariable } from "@reloop/web/lib/email-html-editor/hooks/use-editor-store";
import { acmeAccountDeletedHtml } from "./acme/account-deleted";
import { acmeApiKeyCreatedHtml } from "./acme/api-key-created";
import { acmeDataExportHtml } from "./acme/data-export";
import { acmeDomainVerifiedHtml } from "./acme/domain-verified";
import { acmeEmailChangedHtml } from "./acme/email-changed";
import { acmeInvitationAcceptedHtml } from "./acme/invitation-accepted";
import { acmeMentionHtml } from "./acme/mention";
import { acmeOrderConfirmationHtml } from "./acme/order-confirmation";
import { acmeOrderDeliveredHtml } from "./acme/order-delivered";
import { acmeOrderShippedHtml } from "./acme/order-shipped";
import { acmePasswordChangedHtml } from "./acme/password-changed";
import { acmePasswordResetHtml } from "./acme/password-reset";
import { acmePaymentFailedHtml } from "./acme/payment-failed";
import { acmePlanChangedHtml } from "./acme/plan-changed";
import { acmeReceiptHtml } from "./acme/receipt";
import { acmeRefundHtml } from "./acme/refund";
import { acmeSecurityAlertHtml } from "./acme/security-alert";
import { acmeSignInCodeHtml } from "./acme/sign-in-code";
import { acmeSubscriptionCanceledHtml } from "./acme/subscription-canceled";
import { acmeSubscriptionRenewalHtml } from "./acme/subscription-renewal";
import { acmeSupportTicketHtml } from "./acme/support-ticket";
import { acmeTeamInviteHtml } from "./acme/team-invite";
import { acmeTrialEndingHtml } from "./acme/trial-ending";
import { acmeTwoFactorEnabledHtml } from "./acme/two-factor-enabled";
import { acmeUpcomingInvoiceHtml } from "./acme/upcoming-invoice";
import { acmeUsageAlertHtml } from "./acme/usage-alert";
import { acmeUsageLimitReachedHtml } from "./acme/usage-limit-reached";
import { acmeVerifyEmailHtml } from "./acme/verify-email";
import { acmeWeeklyReportHtml } from "./acme/weekly-report";
import { acmeWelcomeHtml } from "./acme/welcome";
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
				defaultValue: "Norrwilo Design",
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
				defaultValue: "norrwilo-workspace.zip",
			},
			{ name: "expiry_date", type: "string", defaultValue: "OCT 18, 2026" },
			{ name: "download_url", type: "string", defaultValue: null },
		],
	},
];

/**
 * One brand (Acme) across every email, for the transactional email feature
 * page. Only the ids in `ACME_GALLERY_IDS` also appear in the editor
 * gallery; every one still opens in the editor.
 */
export const acmeTemplateExamples: EmailTemplateExample[] = [
	{
		id: "acme-welcome",
		name: "Welcome",
		slug: "acme-welcome",
		description:
			"Acme welcome email with three onboarding steps and a get-started button.",
		html: acmeWelcomeHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-password-reset",
		name: "Password reset",
		slug: "acme-password-reset",
		description:
			"Acme password reset email with a single button and a one-time link.",
		html: acmePasswordResetHtml,
		variables: [
			{ name: "email", type: "string", defaultValue: "you@example.com" },
			{ name: "reset_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-sign-in-code",
		name: "Sign-in code",
		slug: "acme-sign-in-code",
		description: "Acme one-time sign-in code with a magic link fallback.",
		html: acmeSignInCodeHtml,
		variables: [
			{ name: "otp_code", type: "string", defaultValue: "482913" },
			{ name: "magic_link_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-usage-alert",
		name: "Usage alert",
		slug: "acme-usage-alert",
		description:
			"Acme usage alert when a workspace nears its monthly event limit.",
		html: acmeUsageAlertHtml,
		variables: [
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-receipt",
		name: "Receipt",
		slug: "acme-receipt",
		description:
			"Acme receipt with line items, tax, total paid, and an invoice button.",
		html: acmeReceiptHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "1042" },
			{ name: "invoice_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-team-invite",
		name: "Team invite",
		slug: "acme-team-invite",
		description:
			"Acme workspace invitation with workspace details and an accept button.",
		html: acmeTeamInviteHtml,
		variables: [
			{ name: "inviter_name", type: "string", defaultValue: "Maya" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "invite_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-security-alert",
		name: "Security alert",
		slug: "acme-security-alert",
		description:
			"Acme new sign-in alert with device details and a secure-account link.",
		html: acmeSecurityAlertHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "security_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-payment-failed",
		name: "Payment failed",
		slug: "acme-payment-failed",
		description:
			"Acme failed payment notice with amount due and retry schedule.",
		html: acmePaymentFailedHtml,
		variables: [
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "amount_due", type: "string", defaultValue: "$64.80" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-subscription-renewal",
		name: "Renewal",
		slug: "acme-subscription-renewal",
		description: "Acme renewal reminder with plan, date, and amount.",
		html: acmeSubscriptionRenewalHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "renewal_date", type: "string", defaultValue: "Oct 18, 2026" },
			{ name: "renewal_amount", type: "string", defaultValue: "$480.00" },
			{ name: "subscription_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-order-shipped",
		name: "Order shipped",
		slug: "acme-order-shipped",
		description:
			"Acme shipping update with items, carrier, and estimated arrival.",
		html: acmeOrderShippedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "tracking_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-refund",
		name: "Refund",
		slug: "acme-refund",
		description: "Acme refund confirmation with amount, card, and timing.",
		html: acmeRefundHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "1042" },
			{ name: "refund_amount", type: "string", defaultValue: "$64.80" },
			{ name: "refund_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-verify-email",
		name: "Email verification",
		slug: "acme-verify-email",
		description:
			"Acme email address verification with a single confirm button.",
		html: acmeVerifyEmailHtml,
		variables: [
			{ name: "email", type: "string", defaultValue: "you@example.com" },
			{ name: "verify_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-password-changed",
		name: "Password changed",
		slug: "acme-password-changed",
		description: "Acme confirmation that an account password was changed.",
		html: acmePasswordChangedHtml,
		variables: [
			{ name: "email", type: "string", defaultValue: "you@example.com" },
			{ name: "reset_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-email-changed",
		name: "Email changed",
		slug: "acme-email-changed",
		description:
			"Acme notice sent to the old address when the sign-in email changes.",
		html: acmeEmailChangedHtml,
		variables: [
			{ name: "old_email", type: "string", defaultValue: "old@example.com" },
			{ name: "new_email", type: "string", defaultValue: "new@example.com" },
			{ name: "security_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-two-factor-enabled",
		name: "Two-factor enabled",
		slug: "acme-two-factor-enabled",
		description:
			"Acme confirmation that two-factor authentication was turned on.",
		html: acmeTwoFactorEnabledHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "security_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-usage-limit-reached",
		name: "Usage limit reached",
		slug: "acme-usage-limit-reached",
		description:
			"Acme notice when a workspace reaches its monthly event limit.",
		html: acmeUsageLimitReachedHtml,
		variables: [
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-trial-ending",
		name: "Trial ending",
		slug: "acme-trial-ending",
		description: "Acme reminder that a free trial is about to end.",
		html: acmeTrialEndingHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "trial_end_date", type: "string", defaultValue: "Oct 14, 2026" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-subscription-canceled",
		name: "Subscription canceled",
		slug: "acme-subscription-canceled",
		description: "Acme confirmation that a subscription was canceled.",
		html: acmeSubscriptionCanceledHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "access_until", type: "string", defaultValue: "Nov 1, 2026" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-plan-changed",
		name: "Plan changed",
		slug: "acme-plan-changed",
		description:
			"Acme confirmation of a plan upgrade with new limits and billing.",
		html: acmePlanChangedHtml,
		variables: [
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-upcoming-invoice",
		name: "Upcoming invoice",
		slug: "acme-upcoming-invoice",
		description: "Acme preview of the next invoice before it's charged.",
		html: acmeUpcomingInvoiceHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "invoice_date", type: "string", defaultValue: "Nov 1, 2026" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-order-confirmation",
		name: "Order confirmation",
		slug: "acme-order-confirmation",
		description: "Acme order confirmation with items, shipping, and total.",
		html: acmeOrderConfirmationHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "order_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-order-delivered",
		name: "Order delivered",
		slug: "acme-order-delivered",
		description:
			"Acme delivery confirmation with carrier and drop-off details.",
		html: acmeOrderDeliveredHtml,
		variables: [
			{ name: "order_number", type: "string", defaultValue: "2187" },
			{ name: "order_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-data-export",
		name: "Data export",
		slug: "acme-data-export",
		description:
			"Acme notice that a requested data export is ready to download.",
		html: acmeDataExportHtml,
		variables: [
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "download_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-account-deleted",
		name: "Account deleted",
		slug: "acme-account-deleted",
		description:
			"Acme confirmation that an account was deleted, with a recovery window.",
		html: acmeAccountDeletedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "support_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-invitation-accepted",
		name: "Invitation accepted",
		slug: "acme-invitation-accepted",
		description:
			"Acme notice to the inviter when someone joins their workspace.",
		html: acmeInvitationAcceptedHtml,
		variables: [
			{ name: "invitee_name", type: "string", defaultValue: "Maya" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "members_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-api-key-created",
		name: "API key created",
		slug: "acme-api-key-created",
		description: "Acme security notice when a new API key is created.",
		html: acmeApiKeyCreatedHtml,
		variables: [
			{ name: "creator_name", type: "string", defaultValue: "Maya" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "api_keys_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-domain-verified",
		name: "Domain verified",
		slug: "acme-domain-verified",
		description: "Acme confirmation that a domain passed DNS verification.",
		html: acmeDomainVerifiedHtml,
		variables: [
			{ name: "domain", type: "string", defaultValue: "example.com" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-support-ticket",
		name: "Support request",
		slug: "acme-support-ticket",
		description: "Acme acknowledgment that a support request was received.",
		html: acmeSupportTicketHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "ticket_id", type: "string", defaultValue: "48213" },
			{ name: "ticket_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-weekly-report",
		name: "Weekly report",
		slug: "acme-weekly-report",
		description:
			"Acme weekly summary of visitors, page views, and conversions.",
		html: acmeWeeklyReportHtml,
		variables: [
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "report_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-mention",
		name: "Mention",
		slug: "acme-mention",
		description: "Acme notification when someone mentions you in a comment.",
		html: acmeMentionHtml,
		variables: [
			{ name: "commenter_name", type: "string", defaultValue: "Maya" },
			{ name: "first_name", type: "string", defaultValue: "Alex" },
			{ name: "comment_url", type: "string", defaultValue: null },
		],
	},
];

/** Acme templates that also appear in the editor gallery. */
const ACME_GALLERY_IDS = new Set(["acme-verify-email"]);

/** Cards on /tools/email-html-editor: the varied designs, then picked Acme ones. */
export const galleryTemplateExamples: EmailTemplateExample[] = [
	...emailTemplateExamples,
	...acmeTemplateExamples.filter((template) =>
		ACME_GALLERY_IDS.has(template.id),
	),
];

export function getEmailTemplateExample(
	id: string,
): EmailTemplateExample | undefined {
	return [...emailTemplateExamples, ...acmeTemplateExamples].find(
		(template) => template.id === id,
	);
}
