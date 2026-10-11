"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toolPath } from "../../../tools/email-html-editor/content";
import {
	acmeTemplateExamples,
	type EmailTemplateExample,
} from "../../../tools/email-html-editor/templates";

/** One brand (Acme) and one theme across every transactional email. */
const USE_CASES: { id: string; title: string; description: string }[] = [
	{
		id: "acme-welcome",
		title: "Welcome emails",
		description: "Greet new users and walk them through their first steps.",
	},
	{
		id: "acme-password-reset",
		title: "Password reset emails",
		description: "Help users recover access with a secure, timely link.",
	},
	{
		id: "acme-sign-in-code",
		title: "Sign-in code emails",
		description: "Deliver one-time codes and magic links in seconds.",
	},
	{
		id: "acme-usage-alert",
		title: "Usage alert emails",
		description: "Warn customers before they hit a plan or usage limit.",
	},
	{
		id: "acme-receipt",
		title: "Receipt emails",
		description: "Send order details to customers after they make a purchase.",
	},
	{
		id: "acme-team-invite",
		title: "User invitation emails",
		description: "Invite users to create an account or join a team.",
	},
	{
		id: "acme-security-alert",
		title: "Alert emails",
		description: "Notify users of important events or issues in your app.",
	},
	{
		id: "acme-payment-failed",
		title: "Payment failed emails",
		description: "Recover revenue by prompting customers to update billing.",
	},
	{
		id: "acme-subscription-renewal",
		title: "Renewal emails",
		description: "Let users know before a trial or subscription renews.",
	},
	{
		id: "acme-order-shipped",
		title: "Shipping emails",
		description: "Keep customers updated as their order is on its way.",
	},
	{
		id: "acme-refund",
		title: "Refund emails",
		description: "Confirm refunds clearly so customers aren't left guessing.",
	},
	{
		id: "acme-verify-email",
		title: "Email verification emails",
		description: "Confirm a new user's email address before they get started.",
	},
	{
		id: "acme-password-changed",
		title: "Password changed emails",
		description:
			"Confirm security changes so users can spot ones they didn't make.",
	},
	{
		id: "acme-email-changed",
		title: "Email change emails",
		description:
			"Alert the previous address when someone changes the sign-in email.",
	},
	{
		id: "acme-two-factor-enabled",
		title: "Two-factor emails",
		description: "Confirm when two-factor authentication is turned on or off.",
	},
	{
		id: "acme-usage-limit-reached",
		title: "Usage limit emails",
		description:
			"Tell customers when they've hit a limit and what happens next.",
	},
	{
		id: "acme-trial-ending",
		title: "Trial ending emails",
		description: "Remind users before their trial ends so nothing breaks.",
	},
	{
		id: "acme-subscription-canceled",
		title: "Cancellation emails",
		description: "Confirm cancellations and explain what access remains.",
	},
	{
		id: "acme-plan-changed",
		title: "Plan change emails",
		description: "Confirm upgrades and downgrades with the new limits.",
	},
	{
		id: "acme-upcoming-invoice",
		title: "Upcoming invoice emails",
		description: "Preview the next charge so there are no billing surprises.",
	},
	{
		id: "acme-order-confirmation",
		title: "Order confirmation emails",
		description: "Confirm an order the moment it's placed.",
	},
	{
		id: "acme-order-delivered",
		title: "Delivery emails",
		description: "Let customers know their order has arrived.",
	},
	{
		id: "acme-data-export",
		title: "Data export emails",
		description: "Deliver exports and reports when they're ready.",
	},
	{
		id: "acme-account-deleted",
		title: "Account deletion emails",
		description: "Confirm deletions and explain the recovery window.",
	},
	{
		id: "acme-invitation-accepted",
		title: "Invitation accepted emails",
		description: "Tell inviters when a teammate joins.",
	},
	{
		id: "acme-api-key-created",
		title: "API key emails",
		description: "Flag new credentials so unexpected keys get caught.",
	},
	{
		id: "acme-domain-verified",
		title: "Domain verification emails",
		description: "Confirm setup steps like DNS verification.",
	},
	{
		id: "acme-support-ticket",
		title: "Support request emails",
		description: "Acknowledge support requests with a ticket number.",
	},
	{
		id: "acme-weekly-report",
		title: "Weekly report emails",
		description: "Send scheduled summaries of the numbers that matter.",
	},
	{
		id: "acme-mention",
		title: "Mention emails",
		description: "Bring people back when a teammate needs them.",
	},
];

/** Marketing previews read better with sample values than `{{{otp_code}}}`. */
function withSampleValues(
	template: EmailTemplateExample,
): EmailTemplateExample {
	return {
		...template,
		html: (origin) =>
			template.variables.reduce(
				(html, variable) =>
					variable.defaultValue === null
						? html
						: html.replaceAll(`{{{${variable.name}}}}`, variable.defaultValue),
				template.html(origin),
			),
	};
}

const previewTemplates = new Map<string, EmailTemplateExample>([
	...acmeTemplateExamples.map(
		(template) => [template.id, withSampleValues(template)] as const,
	),
]);

/** Width the email is laid out at before it is scaled into the card. */
const EMAIL_RENDER_WIDTH = 600;

/**
 * Previews show only the white email card: the email's gray page and the
 * padding around the card are dropped so every side has the same inset.
 */
const PREVIEW_CSS =
	"<style>body,body>table{background:#ffffff!important}body>table>tbody>tr>td{padding:0!important}</style>";

function EmailPreview({ template }: { template: EmailTemplateExample }) {
	const frameRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0);
	const [srcDoc, setSrcDoc] = useState<string | null>(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setSrcDoc(
			template
				.html(window.location.origin)
				.replace("</head>", `${PREVIEW_CSS}</head>`),
		);
	}, [template]);

	useEffect(() => {
		const frame = frameRef.current;
		if (!frame) return;
		const observer = new ResizeObserver(([entry]) => {
			if (entry) setScale(entry.contentRect.width / EMAIL_RENDER_WIDTH);
		});
		observer.observe(frame);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={frameRef}
			className="pointer-events-none relative aspect-[5/4] w-full select-none overflow-hidden rounded-[18px] bg-white ring-1 ring-stroke-soft-100 dark:ring-white/10"
		>
			{srcDoc && scale > 0 ? (
				<iframe
					title={`Preview of ${template.name}`}
					srcDoc={srcDoc}
					sandbox=""
					tabIndex={-1}
					aria-hidden
					scrolling="no"
					onLoad={() => setLoaded(true)}
					className={cn(
						"absolute top-0 left-0 origin-top-left border-0 bg-white transition-opacity duration-300",
						loaded ? "opacity-100" : "opacity-0",
					)}
					style={{
						width: EMAIL_RENDER_WIDTH,
						height: `${100 / scale}%`,
						transform: `scale(${scale})`,
					}}
				/>
			) : null}
		</div>
	);
}

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

			<div className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-10 [scrollbar-width:none] sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-8 sm:py-12 lg:grid-cols-3 lg:px-12 [&::-webkit-scrollbar]:hidden">
				{USE_CASES.map((useCase) => {
					const template = previewTemplates.get(useCase.id);
					if (!template) return null;
					return (
						<Link
							key={useCase.id}
							href={`${toolPath}/${template.id}`}
							aria-label={`Open the ${useCase.title.toLowerCase()} template in the editor`}
							className={cn(
								"group/card flex w-[82%] shrink-0 snap-start flex-col gap-3 rounded-[28px] bg-bg-white-0 p-2.5 sm:w-auto dark:bg-transparent",
								"transition-colors duration-200 ease-out",
								"hover:bg-bg-weak-50 dark:hover:bg-white/[0.06]",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-sub-300",
								"motion-reduce:transition-none",
							)}
						>
							<EmailPreview template={template} />
							<div className="flex flex-col gap-1 px-2 pb-2">
								<div className="flex items-center justify-between gap-2">
									<h3 className="font-medium text-[16px] text-text-strong-950 dark:text-white">
										{useCase.title}
									</h3>
									<Icon
										name="arrow-up-right"
										aria-hidden
										className="-translate-x-1 size-4 shrink-0 text-text-sub-600 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover/card:translate-x-0 group-hover/card:opacity-100 group-focus-visible/card:translate-x-0 group-focus-visible/card:opacity-100 motion-reduce:transition-none dark:text-white/60"
									/>
								</div>
								<p className="text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
									{useCase.description}
								</p>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
