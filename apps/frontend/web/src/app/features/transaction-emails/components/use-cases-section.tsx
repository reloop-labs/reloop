"use client";

import * as Button from "@reloop/ui/button";
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

/** Cards shown before "Show more". */
const INITIAL_VISIBLE = 12;

export function UseCasesSection() {
	const [showAll, setShowAll] = useState(false);
	const toggleRef = useRef<HTMLDivElement>(null);
	const visibleUseCases = showAll
		? USE_CASES
		: USE_CASES.slice(0, INITIAL_VISIBLE);
	const hiddenCount = USE_CASES.length - INITIAL_VISIBLE;

	const toggleShowAll = () => {
		const collapsing = showAll;
		setShowAll(!collapsing);
		if (!collapsing) return;
		// Collapsing removes rows above the button; keep it under the pointer
		// instead of leaving the reader deep in the next section.
		requestAnimationFrame(() => {
			const reduceMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			toggleRef.current?.scrollIntoView({
				block: "center",
				behavior: reduceMotion ? "auto" : "smooth",
			});
		});
	};

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

			<div
				id="use-cases-grid"
				className="grid grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 sm:gap-12 sm:px-8 sm:py-12 lg:grid-cols-3 lg:px-12"
			>
				{visibleUseCases.map((useCase) => {
					const template = previewTemplates.get(useCase.id);
					if (!template) return null;
					return (
						<Link
							key={useCase.id}
							href={`${toolPath}/${template.id}`}
							aria-label={`Open the ${useCase.title.toLowerCase()} template in the editor`}
							className={cn(
								"group/card flex flex-col gap-2 rounded-t-[24px] rounded-b-[20px] bg-bg-weak-50 p-1.5 dark:bg-white/[0.03]",
								"transition-colors duration-200 ease-out",
								"hover:bg-bg-soft-200 dark:hover:bg-white/[0.07]",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-sub-300",
								"motion-reduce:transition-none",
							)}
						>
							<EmailPreview template={template} />
							<div className="flex flex-col gap-1 px-3 pt-1 pb-2.5">
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
							</div>
						</Link>
					);
				})}
			</div>
			{hiddenCount > 0 && (
				<div
					ref={toggleRef}
					className="flex justify-center px-4 pb-12 sm:px-8 lg:px-12"
				>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						aria-controls="use-cases-grid"
						aria-expanded={showAll}
						onClick={toggleShowAll}
					>
						{showAll ? "Show less" : "Show more"}
						<Icon
							name="chevron-down"
							aria-hidden
							className={cn(
								"size-3.5 transition-transform duration-200 ease-out motion-reduce:transition-none",
								showAll && "rotate-180",
							)}
						/>
					</Button.Root>
				</div>
			)}
		</section>
	);
}
