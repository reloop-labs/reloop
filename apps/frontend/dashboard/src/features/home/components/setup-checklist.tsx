import Link from "next/link";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as FancyButton from "@reloop/ui/fancy-button";
import {
	HomeCardBody,
	HomeCardHeader,
	HomeCardShell,
} from "./home-card-shell";
import { SendFirstEmailButton } from "./send-first-email-button";

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
	readyDomainName,
}: {
	hasDomain: boolean;
	hasActiveDomain: boolean;
	hasApiKey: boolean;
	hasSentEmail: boolean;
	/** First active domain hostname, for copy that names it. */
	readyDomainName?: string | null;
}): SetupStep[] {
	const domainLabel = readyDomainName ?? "your domain";

	return [
		{
			id: "domain",
			label: "Add a domain",
			description: hasDomain
				? readyDomainName
					? `${readyDomainName} is on your workspace.`
					: "A domain is on your workspace."
				: "Send from your own domain with SPF, DKIM, and DMARC.",
			done: hasDomain,
			href: hasDomain ? "/domain" : "/domain/add",
			cta: hasDomain ? "View domains" : "Add domain",
		},
		{
			id: "verify",
			label: "Verify DNS",
			description: hasActiveDomain
				? `${domainLabel} is verified and ready to send.`
				: "Confirm records so mail is authenticated and deliverable.",
			done: hasActiveDomain,
			href: "/domain",
			cta: hasActiveDomain ? "View domain" : "Verify domain",
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
			description: hasActiveDomain
				? `One click — we email you from hello@${domainLabel}.`
				: "Verify a domain first, then send a test email to yourself.",
			done: hasSentEmail,
			href: "#",
			cta: "Send test email",
		},
	];
}

export function SetupChecklist({
	steps,
	canSendFirstEmail,
	readyDomainName,
}: {
	steps: SetupStep[];
	/** When true, the final step is a one-click send button. */
	canSendFirstEmail?: boolean;
	readyDomainName?: string | null;
}) {
	const incomplete = steps.filter((s) => !s.done);
	if (incomplete.length === 0) return null;

	const doneCount = steps.filter((s) => s.done).length;
	const next = incomplete[0]!;
	const nextIsSend = next.id === "send" && canSendFirstEmail;

	return (
		<HomeCardShell
			header={
				<HomeCardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
					<div>
						<div className="flex items-center gap-2">
							<Icon name="check-circle" className="h-4 w-4 text-text-sub-600" />
							<h2 className="font-medium text-label-md text-text-strong-950">
								Finish setup
							</h2>
							<span className="rounded-full bg-bg-white-0 px-2 py-0.5 font-medium text-label-xs text-text-sub-600 dark:bg-white/[0.06]">
								{doneCount}/{steps.length}
							</span>
						</div>
						<p className="mt-1 text-paragraph-sm text-text-sub-600">
							{canSendFirstEmail && readyDomainName
								? `${readyDomainName} is ready — finish the remaining steps below.`
								: "Complete these steps to start sending reliably."}
						</p>
					</div>
					{nextIsSend ? (
						<div className="shrink-0 sm:ml-auto">
							<SendFirstEmailButton showArrow label={next.cta} />
						</div>
					) : (
						<div className="shrink-0 sm:ml-auto">
							<FancyButton.Root
								variant="blue"
								size="small"
								asChild
								className="gap-1.5 rounded-xl"
							>
								<Link href={next.href}>
									{next.cta}
									<Icon name="arrow-right" className="h-3.5 w-3.5" />
								</Link>
							</FancyButton.Root>
						</div>
					)}
				</HomeCardHeader>
			}
		>
			<HomeCardBody>
				<ul className="divide-y divide-stroke-soft-200 dark:divide-stroke-soft-100/40">
					{steps.map((step) => {
						const isSendAction =
							step.id === "send" && !step.done && canSendFirstEmail;
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
										<div className="shrink-0">
											<SendFirstEmailButton
												variant="stroke"
												size="xsmall"
												label={step.cta}
												className="gap-1.5 rounded-lg"
											/>
										</div>
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
			</HomeCardBody>
		</HomeCardShell>
	);
}
