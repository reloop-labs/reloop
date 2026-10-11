import type { ToolVariable } from "@reloop/web/lib/email-html-editor/hooks/use-editor-store";
import { orderReceiptHtml } from "./order-receipt";
import { passwordResetHtml } from "./password-reset";
import { welcomeConfirmAccountHtml } from "./welcome-confirm-account";

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
		id: "welcome-confirm-account",
		name: "Welcome",
		slug: "confirm-account",
		description:
			"Welcome email with a confirm-account button, fallback link, and help box.",
		html: welcomeConfirmAccountHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "confirm_url", type: "string", defaultValue: null },
			{ name: "unsubscribe_url", type: "string", defaultValue: null },
		],
	},
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
];

export function getEmailTemplateExample(
	id: string,
): EmailTemplateExample | undefined {
	return emailTemplateExamples.find((template) => template.id === id);
}
