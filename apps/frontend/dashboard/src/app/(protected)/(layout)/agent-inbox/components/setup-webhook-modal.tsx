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
				<Modal.Header>
					<Modal.Title>Set up agent inbox</Modal.Title>
					<Modal.Description>
						Connect inbound email to your AI agents via webhooks. This guide
						matches the Agent Email Inbox skill flow.
					</Modal.Description>
				</Modal.Header>
				<Modal.Body>
					<ol className="flex flex-col gap-4">
						{STEPS.map((step, index) => (
							<li key={step.title} className="flex gap-3">
								<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 font-medium text-paragraph-sm dark:bg-white/10">
									{index + 1}
								</span>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-paragraph-sm text-text-strong-950 dark:text-white">
										{step.title}
									</p>
									<p className="mt-0.5 text-paragraph-sm text-text-sub-600">
										{step.description}
									</p>
									{"inAppOnly" in step &&
									step.inAppOnly ? null : step.internal ? (
										<Link
											href={step.href}
											onClick={() => onOpenChange(false)}
											className="mt-2 inline-flex items-center gap-1 text-paragraph-sm text-primary-base hover:underline"
										>
											Open in dashboard
											<Icon name="arrow-right" className="h-3.5 w-3.5" />
										</Link>
									) : (
										<a
											href={step.href}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-2 inline-flex items-center gap-1 text-paragraph-sm text-primary-base hover:underline"
										>
											View documentation
											<Icon name="arrow-right" className="h-3.5 w-3.5" />
										</a>
									)}
								</div>
							</li>
						))}
					</ol>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root
						variant="neutral"
						mode="stroke"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
