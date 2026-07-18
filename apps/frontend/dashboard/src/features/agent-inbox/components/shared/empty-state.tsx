import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

const steps = [
	{
		title: "Create an agent address",
		description:
			"Generate a dedicated inbox email address for each of your AI agents.",
	},
	{
		title: "Verify your domain",
		description:
			"Configure DNS records on your domain to receive inbound mails securely.",
	},
	{
		title: "Process inbound payloads",
		description:
			"Extract text, HTML, and attachments in real-time within your agent workflows.",
	},
];

const features = [
	{
		icon: "inbox" as const,
		title: "Automatic parsing",
		description:
			"Receive pre-parsed email bodies, headers, and media attachments as structured JSON.",
	},
	{
		icon: "lock" as const,
		title: "Security first",
		description:
			"Spam classification, signature checking, and DKIM verification out of the box.",
	},
	{
		icon: "modules" as const,
		title: "AI native routing",
		description:
			"Forward structured email events directly to LLMs, LangChain, or custom endpoints.",
	},
];

export const AgentInboxEmptyState = ({
	onAddClick,
}: {
	onAddClick: () => void;
}) => {
	return (
		<div className="w-full">
			<div className="flex flex-col items-center border-stroke-soft-100 border-b px-6 py-12 text-center dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/30">
				<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
					<Icon name="inbox" className="h-5 w-5 text-text-sub-600" />
				</div>
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					No agent addresses yet
				</h3>
				<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
					Create a dedicated inbox address for each AI agent so inbound mail is
					easy to find and route.
				</p>
				<div className="flex items-center gap-3">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={onAddClick}
						className="gap-2 rounded-lg"
					>
						<Icon name="plus" className="h-4 w-4" />
						Add agent address
					</Button.Root>
					<a
						href="https://docs.reloop.sh/integrations/agent-email-inbox"
						target="_blank"
						rel="noopener noreferrer"
						className={`${Button.buttonVariants({ variant: "neutral", mode: "stroke", size: "xsmall" }).root()} gap-2 rounded-lg`}
					>
						<Icon name="book-closed" className="h-3.5 w-3.5" />
						Learn about agent inbox
					</a>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2">
				<div className="border-stroke-soft-100 border-r p-6 dark:border-stroke-soft-100/50">
					<h4 className="mb-3 font-medium text-sm text-text-strong-950">
						How it works
					</h4>
					<div className="flex flex-col gap-6">
						{steps.map((step, i) => (
							<div key={step.title} className="relative flex gap-4">
								{i < steps.length - 1 && (
									<div className="absolute top-10 bottom-[-4px] left-[13px] w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/50" />
								)}
								<div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-surface-0 font-medium text-text-sub-600 text-xs dark:border-stroke-soft-100/50">
									{i + 1}
								</div>
								<div>
									<h5 className="font-medium text-sm text-text-strong-950">
										{step.title}
									</h5>
									<p className="mt-0.5 text-balance font-medium text-[12px] text-text-sub-600">
										{step.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="p-6">
					<h4 className="mb-3 font-medium text-sm text-text-strong-950">
						What you can do
					</h4>
					<div className="flex flex-col">
						{features.map((feature, i) => (
							<div
								key={feature.title}
								className={cn(
									"flex gap-4",
									i < features.length - 1 &&
										"mb-3 border-stroke-soft-100 border-b pb-3 dark:border-stroke-soft-100/50",
								)}
							>
								<div className="mt-0.5 shrink-0">
									<Icon
										name={feature.icon}
										className="h-4 w-4 text-text-sub-600"
									/>
								</div>
								<div>
									<h5 className="font-medium text-sm text-text-strong-950">
										{feature.title}
									</h5>
									<p className="mt-0.5 text-balance font-medium text-[12px] text-text-sub-600">
										{feature.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
