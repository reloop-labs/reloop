import Link from "next/link";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as FancyButton from "@reloop/ui/fancy-button";

export type SetupStep = {
	id: string;
	label: string;
	description: string;
	done: boolean;
	href: string;
	cta: string;
};

export function buildSetupSteps({
	hasDomain,
	hasActiveDomain,
	hasApiKey,
	hasSentEmail,
}: {
	hasDomain: boolean;
	hasActiveDomain: boolean;
	hasApiKey: boolean;
	hasSentEmail: boolean;
}): SetupStep[] {
	return [
		{
			id: "domain",
			label: "Add a domain",
			description: "Send from your own domain with SPF, DKIM, and DMARC.",
			done: hasDomain,
			href: "/domain/add",
			cta: "Add domain",
		},
		{
			id: "verify",
			label: "Verify DNS",
			description: "Confirm records so mail is authenticated and deliverable.",
			done: hasActiveDomain,
			href: "/domain",
			cta: "Verify domain",
		},
		{
			id: "api-key",
			label: "Create an API key",
			description: "Authenticate the REST API or SMTP relay.",
			done: hasApiKey,
			href: "/api-keys/create",
			cta: "Create key",
		},
		{
			id: "send",
			label: "Send your first email",
			description:
				"Send a test message to yourself from your verified domain (session auth).",
			done: hasSentEmail,
			href: "/#send-first-email",
			cta: "Send test email",
		},
	];
}

export function SetupChecklist({
	steps,
	onSendFirstEmail,
}: {
	steps: SetupStep[];
	/** Opens the session-auth "send first email" flow for the final step. */
	onSendFirstEmail?: () => void;
}) {
	const incomplete = steps.filter((s) => !s.done);
	if (incomplete.length === 0) return null;

	const doneCount = steps.filter((s) => s.done).length;
	const next = incomplete[0]!;
	const nextIsSend = next.id === "send" && Boolean(onSendFirstEmail);

	return (
		<section className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
			<div className="flex flex-col gap-3 border-stroke-soft-100 border-b bg-bg-weak-50/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
				<div>
					<div className="flex items-center gap-2">
						<Icon name="check-circle" className="h-4 w-4 text-text-sub-600" />
						<h2 className="font-medium text-label-md text-text-strong-950">
							Finish setup
						</h2>
						<span className="rounded-full bg-bg-weak-50 px-2 py-0.5 font-medium text-label-xs text-text-sub-600 dark:bg-white/[0.06]">
							{doneCount}/{steps.length}
						</span>
					</div>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						Complete these steps to start sending reliably.
					</p>
				</div>
				{nextIsSend ? (
					<FancyButton.Root
						type="button"
						variant="blue"
						size="small"
						className="shrink-0 gap-1.5 rounded-xl"
						onClick={onSendFirstEmail}
					>
						{next.cta}
						<Icon name="arrow-right" className="h-3.5 w-3.5" />
					</FancyButton.Root>
				) : (
					<FancyButton.Root
						variant="blue"
						size="small"
						asChild
						className="shrink-0 gap-1.5 rounded-xl"
					>
						<Link href={next.href}>
							{next.cta}
							<Icon name="arrow-right" className="h-3.5 w-3.5" />
						</Link>
					</FancyButton.Root>
				)}
			</div>

			<ul className="divide-y divide-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/40 dark:bg-transparent">
				{steps.map((step) => {
					const isSendAction =
						step.id === "send" && !step.done && Boolean(onSendFirstEmail);
					return (
						<li
							key={step.id}
							className="flex items-start gap-3 px-5 py-3.5 sm:items-center"
						>
							<span
								className={cn(
									"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full sm:mt-0",
									step.done
										? "bg-success-lighter text-success-base"
										: "bg-bg-weak-50 text-text-soft-400 dark:bg-white/[0.06]",
								)}
							>
								{step.done ? (
									<Icon name="check" className="h-3 w-3" />
								) : (
									<span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
								)}
							</span>
							<div className="min-w-0 flex-1">
								<p
									className={cn(
										"font-medium text-paragraph-sm",
										step.done
											? "text-text-sub-600 line-through"
											: "text-text-strong-950",
									)}
								>
									{step.label}
								</p>
								<p className="text-paragraph-xs text-text-soft-400">
									{step.description}
								</p>
							</div>
							{!step.done ? (
								isSendAction ? (
									<button
										type="button"
										onClick={onSendFirstEmail}
										className="shrink-0 font-medium text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
									>
										{step.cta}
									</button>
								) : (
									<Link
										href={step.href}
										className="shrink-0 font-medium text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
									>
										{step.cta}
									</Link>
								)
							) : null}
						</li>
					);
				})}
			</ul>
		</section>
	);
}
