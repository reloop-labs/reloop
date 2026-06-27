"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";

const steps = [
	{
		title: "Register an endpoint",
		description: "Provide a public HTTPS URL that can receive POST requests.",
	},
	{
		title: "Subscribe to events",
		description:
			"Choose which events trigger a delivery — orders, payments, users.",
	},
	{
		title: "Receive & verify",
		description: "Validate the HMAC signature on each request, then act on it.",
	},
];

const features = [
	{
		icon: "activity" as const,
		title: "Real-time delivery logs",
		description:
			"Inspect every request and response with full payload visibility.",
	},
	{
		icon: "refresh-cw" as const,
		title: "Automatic retries",
		description:
			"Failed deliveries retry with exponential backoff — up to 3 attempts.",
	},
	{
		icon: "lock" as const,
		title: "Signed payloads",
		description:
			"Every request is HMAC-SHA256 signed so you can verify it's really us.",
	},
];

export const EmptyState = () => {
	const getBackToUrl = useGetBackToUrl();
	const router = useRouter();
	const { activeOrganization } = useUserOrganization();

	return (
		<div className="w-full">
			<div className="flex flex-col items-center border-stroke-soft-100 border-b bg-bg-soft-200/10 px-6 py-12 text-center dark:border-stroke-soft-100/50 dark:bg-bg-soft-200/15">
				<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
					<Icon name="webhook" className="h-5 w-5 text-text-sub-600" />
				</div>
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					No webhooks yet
				</h3>
				<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
					Connect to real-time events and get a signed payload POSTed to your
					URL whenever something happens.
				</p>
				<div className="flex items-center gap-3">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => router.push(getBackToUrl("/webhooks/create"))}
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Icon name="plus" className="h-4 w-4" />
						Create Webhook
						<span className="inline-flex items-center gap-0.5">
							<Icon
								name="command"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100 p-px"
							/>
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100 p-px font-medium text-[10px] uppercase">
								A
							</span>
						</span>
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<a
							href="https://reloop.sh/docs/webhooks"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="book-open" className="h-3.5 w-3.5" />
							Read the docs
						</a>
					</Button.Root>
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
