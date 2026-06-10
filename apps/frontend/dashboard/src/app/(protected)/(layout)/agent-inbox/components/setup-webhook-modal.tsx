"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Link from "next/link";

const STEPS = [
	{
		title: "Create an agent address",
		description:
			"Add a dedicated inbound email for each agent from Agent Inbox using Add agent address.",
		href: "",
		internal: false,
		inAppOnly: true,
	},
	{
		title: "Verify your domain",
		description:
			"Enable receiving on a verified domain so agents can get inbound mail.",
		href: "/domain",
		internal: true,
	},
	{
		title: "Create a webhook endpoint",
		description:
			"Your agent exposes an HTTPS URL to accept Reloop webhook payloads.",
		href: "/webhooks",
		internal: true,
	},
	{
		title: "Subscribe to email.received",
		description: "Register the endpoint and subscribe to inbound email events.",
		href: "/webhooks",
		internal: true,
	},
	{
		title: "Process inbound emails",
		description:
			"Verify signatures, fetch full message content, and run your agent workflow.",
		href: "https://docs.reloop.sh/integrations/agent-email-inbox",
		internal: false,
	},
];

export const SetupWebhookModal = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-lg">
				<Modal.Header
					iconName="webhook"
					title="Set up agent inbox"
					description="Connect inbound email to your AI agents via webhooks. This guide matches the Agent Email Inbox skill flow."
				/>
				<Modal.Body className="py-6 px-6">
					<ol className="relative flex flex-col gap-6 pl-1">
						{STEPS.map((step, index) => (
							<li key={step.title} className="relative flex gap-4">
								{/* Connector Line */}
								{index < STEPS.length - 1 && (
									<span
										className="absolute left-[15px] top-[32px] bottom-[-24px] w-[1.5px] bg-stroke-soft-100 dark:bg-white/10"
										aria-hidden="true"
									/>
								)}
								{/* Step Number Circle */}
								<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50/50 font-semibold text-label-xs text-text-sub-600 shadow-sm transition-all dark:border-white/10 dark:bg-white/5 dark:text-text-sub-400">
									{index + 1}
								</span>
								{/* Content */}
								<div className="min-w-0 flex-1 pt-0.5">
									<p className="font-semibold text-label-sm text-text-strong-950 dark:text-white">
										{step.title}
									</p>
									<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-text-sub-600/95 leading-relaxed">
										{step.description}
									</p>
									{"inAppOnly" in step && step.inAppOnly ? null : step.internal ? (
										<Button.Root
											asChild
											variant="neutral"
											mode="stroke"
											size="xxsmall"
											className="mt-2.5 inline-flex border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
										>
											<Link href={step.href} onClick={() => onOpenChange(false)}>
												<span>Open in dashboard</span>
												<Icon name="arrow-right" className="h-3 w-3" />
											</Link>
										</Button.Root>
									) : (
										<Button.Root
											asChild
											variant="neutral"
											mode="stroke"
											size="xxsmall"
											className="mt-2.5 inline-flex border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
										>
											<a href={step.href} target="_blank" rel="noopener noreferrer">
												<span>View documentation</span>
												<Icon name="arrow-right" className="h-3 w-3" />
											</a>
										</Button.Root>
									)}
								</div>
							</li>
						))}
					</ol>
				</Modal.Body>
				<Modal.Footer className="justify-end py-3 px-5">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
