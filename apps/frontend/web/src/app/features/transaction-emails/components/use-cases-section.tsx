"use client";

import { Icon } from "@reloop/ui/icon";
import {
	CARD_ONLY_PREVIEW_CSS,
	EmailPreview,
	ShowMoreGrid,
	TemplateCard,
	withSampleValues,
} from "../../../tools/email-html-editor/components/template-card";
import { toolPath } from "../../../tools/email-html-editor/content";
import {
	acmeTemplateExamples,
	type EmailTemplateExample,
} from "../../../tools/email-html-editor/templates";

/** One brand (Acme) and one theme across every transactional email. */
const USE_CASES: { id: string; title: string }[] = [
	{
		id: "acme-welcome",
		title: "Welcome emails",
	},
	{
		id: "acme-password-reset",
		title: "Password reset emails",
	},
	{
		id: "acme-sign-in-code",
		title: "Sign-in code emails",
	},
	{
		id: "acme-usage-alert",
		title: "Usage alert emails",
	},
	{
		id: "acme-receipt",
		title: "Receipt emails",
	},
	{
		id: "acme-team-invite",
		title: "User invitation emails",
	},
	{
		id: "acme-security-alert",
		title: "Alert emails",
	},
	{
		id: "acme-payment-failed",
		title: "Payment failed emails",
	},
	{
		id: "acme-subscription-renewal",
		title: "Renewal emails",
	},
	{
		id: "acme-order-shipped",
		title: "Shipping emails",
	},
	{
		id: "acme-refund",
		title: "Refund emails",
	},
	{
		id: "acme-verify-email",
		title: "Email verification emails",
	},
	{
		id: "acme-password-changed",
		title: "Password changed emails",
	},
	{
		id: "acme-email-changed",
		title: "Email change emails",
	},
	{
		id: "acme-two-factor-enabled",
		title: "Two-factor emails",
	},
	{
		id: "acme-usage-limit-reached",
		title: "Usage limit emails",
	},
	{
		id: "acme-trial-ending",
		title: "Trial ending emails",
	},
	{
		id: "acme-subscription-canceled",
		title: "Cancellation emails",
	},
	{
		id: "acme-plan-changed",
		title: "Plan change emails",
	},
	{
		id: "acme-upcoming-invoice",
		title: "Upcoming invoice emails",
	},
	{
		id: "acme-order-confirmation",
		title: "Order confirmation emails",
	},
	{
		id: "acme-order-delivered",
		title: "Delivery emails",
	},
	{
		id: "acme-data-export",
		title: "Data export emails",
	},
	{
		id: "acme-account-deleted",
		title: "Account deletion emails",
	},
	{
		id: "acme-invitation-accepted",
		title: "Invitation accepted emails",
	},
	{
		id: "acme-api-key-created",
		title: "API key emails",
	},
	{
		id: "acme-domain-verified",
		title: "Domain verification emails",
	},
	{
		id: "acme-support-ticket",
		title: "Support request emails",
	},
	{
		id: "acme-weekly-report",
		title: "Weekly report emails",
	},
	{
		id: "acme-mention",
		title: "Mention emails",
	},
];

const previewTemplates = new Map<string, EmailTemplateExample>([
	...acmeTemplateExamples.map(
		(template) => [template.id, withSampleValues(template)] as const,
	),
]);

export function UseCasesSection() {
	return (
		<section
			id="use-cases"
			aria-labelledby="use-cases-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-16 text-left sm:px-8 sm:py-20 sm:text-center lg:px-12 dark:border-white/10">
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 dark:text-white/60">
					<Icon name="layout" className="size-3.5" aria-hidden />
					Templates
				</span>
				<h2
					id="use-cases-heading"
					className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
				>
					Ready for every use case
				</h2>
				<p className="mt-3 max-w-2xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mx-auto sm:text-base dark:text-white/60">
					Whether you need to send welcome emails or notify users of important
					events, start from a ready-made template.
				</p>
			</div>

			<ShowMoreGrid id="use-cases-grid">
				{USE_CASES.flatMap((useCase) => {
					const template = previewTemplates.get(useCase.id);
					if (!template) return [];
					return (
						<TemplateCard
							key={useCase.id}
							href={`${toolPath}/${template.id}`}
							title={useCase.title}
							ariaLabel={`Open the ${useCase.title.toLowerCase()} template in the editor`}
							preview={
								<EmailPreview
									template={template}
									previewCss={CARD_ONLY_PREVIEW_CSS}
								/>
							}
						/>
					);
				})}
			</ShowMoreGrid>
		</section>
	);
}
