"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import {
	previewCardClassName,
	TemplatePreview,
} from "../../../tools/email-html-editor/components/template-card-grid";
import { toolPath } from "../../../tools/email-html-editor/content";
import { emailTemplateExamples } from "../../../tools/email-html-editor/templates";

const USE_CASES: { id: string; title: string; description: string }[] = [
	{
		id: "password-reset",
		title: "Password reset emails",
		description: "Help users recover access with a secure, timely link.",
	},
	{
		id: "order-receipt",
		title: "Receipt emails",
		description: "Send order details to customers after they make a purchase.",
	},
	{
		id: "sign-in-code",
		title: "Sign-in code emails",
		description: "Deliver one-time codes and magic links in seconds.",
	},
	{
		id: "team-invite",
		title: "User invitation emails",
		description: "Invite users to create an account or join a team.",
	},
	{
		id: "security-alert",
		title: "Alert emails",
		description: "Notify users of important events or issues in your app.",
	},
	{
		id: "payment-failed",
		title: "Payment failed emails",
		description: "Recover revenue by prompting customers to update billing.",
	},
	{
		id: "subscription-renewal",
		title: "Renewal emails",
		description: "Let users know before a trial or subscription renews.",
	},
	{
		id: "order-shipped",
		title: "Shipping emails",
		description: "Keep customers updated as their order is on its way.",
	},
	{
		id: "refund-confirmation",
		title: "Refund emails",
		description: "Confirm refunds clearly so customers aren't left guessing.",
	},
];

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

			<div className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-10 [scrollbar-width:none] sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 sm:overflow-visible sm:px-8 sm:py-12 lg:grid-cols-3 lg:px-12 [&::-webkit-scrollbar]:hidden">
				{USE_CASES.map((useCase) => {
					const template = emailTemplateExamples.find(
						(t) => t.id === useCase.id,
					);
					if (!template) return null;
					return (
						<Link
							key={useCase.id}
							href={`${toolPath}/${template.id}`}
							className="group/card flex w-[82%] shrink-0 snap-start flex-col gap-4 sm:w-auto"
						>
							<div
								className={cn(
									previewCardClassName,
									"transition-colors duration-200 group-hover/card:border-stroke-sub-300 dark:group-hover/card:border-stroke-soft-100/70",
								)}
							>
								<TemplatePreview template={template} />
							</div>
							<div className="flex flex-col gap-1.5">
								<h3 className="font-medium text-[16px] text-text-strong-950 dark:text-white">
									{useCase.title}
								</h3>
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
