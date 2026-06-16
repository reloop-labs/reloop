"use client";

import { cn } from "@reloop/ui/cn";
import { BookOpen, Check, Globe, Info, Lock } from "lucide-react";
import Link from "next/link";
import { SetupStepApiKey } from "./setup-step-api-key";
import { SetupStepSendEmail } from "./setup-step-send-email";
import {
	type ApiKeyData,
	type DomainData,
	useSetupProgress,
} from "./use-setup-progress";

type StepState = "done" | "active" | "upcoming";

function getStepState(done: boolean, active: boolean): StepState {
	if (done) return "done";
	if (active) return "active";
	return "upcoming";
}

function StepIndicator({
	number,
	state,
}: {
	number: number;
	state: StepState;
}) {
	return (
		<div
			className={cn(
				"flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300",
				state === "done"
					? "bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/10"
					: state === "active"
						? "bg-primary-base text-white"
						: "bg-bg-weak-50 text-text-disabled-300 dark:bg-white/[0.04] dark:text-white/20",
			)}
		>
			{state === "done" ? (
				<Check className="h-4 w-4" strokeWidth={2.5} />
			) : state === "upcoming" ? (
				<Lock className="h-3.5 w-3.5" />
			) : (
				<span className="font-semibold text-sm">{number}</span>
			)}
		</div>
	);
}

function DoneBadge() {
	return (
		<span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-[11px] text-emerald-600 dark:border-emerald-400/20 dark:text-emerald-400">
			Done
		</span>
	);
}

export function SetupChecklist({
	domains,
	primaryApiKey,
	generatedApiKey,
	step4Done,
	isGeneratingKey,
	isSendingTest,
	testRecipient,
	onGenerateApiKey,
	onSendTestEmail,
}: {
	domains: DomainData[];
	primaryApiKey: ApiKeyData | undefined;
	generatedApiKey: string | null;
	step4Done: boolean;
	isGeneratingKey: boolean;
	isSendingTest: boolean;
	testRecipient: string;
	onGenerateApiKey: () => void;
	onSendTestEmail: () => void;
}) {
	const progress = useSetupProgress({
		domains,
		primaryApiKey,
		generatedApiKey,
		step4Done,
	});

	const {
		primaryDomain,
		primaryDomainName,
		step2Done,
		step3Done,
		step4Complete,
		completedCount,
		maskedKey,
	} = progress;

	const step1State = getStepState(true, false);
	const step2State = getStepState(step2Done, true);
	const step3State = getStepState(step3Done, step2Done);
	const step4State = getStepState(step4Complete, step3Done && step2Done);

	return (
		<div>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-lg text-text-strong-950 dark:text-white">
						Setup checklist
					</h2>
					<p className="mt-0.5 text-text-sub-600 text-xs dark:text-white/40">
						{completedCount} of 4 steps complete
					</p>
				</div>
				<div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
					<svg className="-rotate-90 h-full w-full" aria-hidden>
						<circle
							cx="24"
							cy="24"
							r="19"
							stroke="currentColor"
							className="text-stroke-soft-100 dark:text-white/[0.06]"
							strokeWidth="3.5"
							fill="transparent"
						/>
						<circle
							cx="24"
							cy="24"
							r="19"
							stroke="currentColor"
							className="text-primary-base"
							strokeWidth="3.5"
							fill="transparent"
							strokeDasharray={2 * Math.PI * 19}
							strokeDashoffset={2 * Math.PI * 19 * (1 - completedCount / 4)}
							strokeLinecap="round"
							style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
						/>
					</svg>
					<span className="absolute font-bold text-[11px] text-text-strong-950 dark:text-white">
						{completedCount}/4
					</span>
				</div>
			</div>

			{/* Steps */}
			<div className="mt-6 flex flex-col">
				{/* Step 1: Account */}
				<div className="flex gap-3.5">
					<div className="flex flex-col items-center">
						<StepIndicator number={1} state={step1State} />
						<div className="mt-1 w-px flex-1 bg-emerald-500/30 dark:bg-emerald-500/20" />
					</div>
					<div className="flex min-w-0 flex-1 flex-col justify-center pb-5">
						<div className="flex items-center justify-between gap-2">
							<span className="font-medium text-sm text-text-sub-600/70 dark:text-white/30">
								Create account
							</span>
							<DoneBadge />
						</div>
					</div>
				</div>

				{/* Step 2: Domain */}
				<div className="flex gap-3.5">
					<div className="flex flex-col items-center">
						<StepIndicator number={2} state={step2State} />
						<div
							className={cn(
								"mt-1 w-px flex-1",
								step2Done
									? "bg-emerald-500/30 dark:bg-emerald-500/20"
									: "bg-stroke-soft-200 dark:bg-white/[0.06]",
							)}
						/>
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-2 pb-5">
						<div className="flex items-center justify-between gap-2">
							<span
								className={cn(
									"font-semibold text-sm",
									step2Done
										? "text-text-sub-600/70 dark:text-white/30"
										: "text-text-strong-950 dark:text-white",
								)}
							>
								Add sending domain
							</span>
							{step2Done ? (
								<DoneBadge />
							) : primaryDomain ? (
								<span className="shrink-0 rounded-full border border-amber-200/50 bg-amber-500/10 px-2.5 py-0.5 font-semibold text-[11px] text-amber-600 capitalize dark:border-amber-400/20 dark:text-amber-400">
									{primaryDomain.status}
								</span>
							) : (
								<span className="shrink-0 rounded-full border border-red-200/50 bg-red-500/10 px-2.5 py-0.5 font-semibold text-[11px] text-red-600 dark:border-red-400/20 dark:text-red-400">
									Required
								</span>
							)}
						</div>

						{step2Done ? (
							<p className="text-text-sub-600/60 text-xs dark:text-white/30">
								{primaryDomainName} verified
							</p>
						) : (
							<>
								<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
									{primaryDomain
										? `Configure DNS settings to verify ${primaryDomainName}`
										: "Verify a domain to send emails from your own address. Takes ~5 min."}
								</p>
								<div className="mt-1 flex flex-col gap-2">
									<Link
										href={primaryDomain ? `/domain/${primaryDomain.id}` : "/domain/add"}
										className="inline-flex w-fit items-center gap-2 rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-4 py-2 font-semibold text-sm text-text-strong-950 transition-all hover:bg-bg-weak-50 active:scale-[0.98] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
									>
										<Globe className="h-4 w-4 text-text-sub-600 dark:text-white/40" />
										{primaryDomain ? "Verify domain" : "Add domain"}
									</Link>
									<Link
										href="https://reloop.sh/docs/dns"
										target="_blank"
										className="inline-flex w-fit items-center gap-2 rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-4 py-2 font-semibold text-sm text-text-strong-950 transition-all hover:bg-bg-weak-50 active:scale-[0.98] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
									>
										<BookOpen className="h-4 w-4 text-text-sub-600 dark:text-white/40" />
										Guide
									</Link>
								</div>
								<div className="mt-1 flex items-start gap-2 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-3 text-text-sub-600 text-xs leading-relaxed dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/40">
									<Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
									<span>
										Don&apos;t manage DNS? Share the verification steps with your IT team.
									</span>
								</div>
							</>
						)}
					</div>
				</div>

				{/* Step 3: API Key */}
				<div className="flex gap-3.5">
					<div className="flex flex-col items-center">
						<StepIndicator number={3} state={step3State} />
						<div
							className={cn(
								"mt-1 w-px flex-1",
								step3Done
									? "bg-emerald-500/30 dark:bg-emerald-500/20"
									: "bg-stroke-soft-200 dark:bg-white/[0.06]",
							)}
						/>
					</div>
					<div
						className={cn(
							"flex min-w-0 flex-1 flex-col gap-2 pb-5 transition-all duration-300",
							step3State === "upcoming" && "pointer-events-none opacity-40",
						)}
					>
						<div className="flex items-center justify-between gap-2">
							<span
								className={cn(
									"font-semibold text-sm",
									step3Done
										? "text-text-sub-600/70 dark:text-white/30"
										: "text-text-strong-950 dark:text-white",
								)}
							>
								Generate API key
							</span>
							{step3Done ? (
								<Link
									href="/api-keys"
									className="shrink-0 rounded-full border border-primary-base/30 bg-primary-base/10 px-2.5 py-0.5 font-semibold text-[11px] text-primary-base hover:underline"
								>
									Done
								</Link>
							) : null}
						</div>
						<SetupStepApiKey
							step3Done={step3Done}
							step2Done={step2Done}
							maskedKey={maskedKey}
							generatedApiKey={generatedApiKey}
							isGeneratingKey={isGeneratingKey}
							onGenerate={onGenerateApiKey}
						/>
					</div>
				</div>

				{/* Step 4: Send email */}
				<div className="flex gap-3.5">
					<div className="flex flex-col items-center">
						<StepIndicator number={4} state={step4State} />
					</div>
					<div
						className={cn(
							"flex min-w-0 flex-1 flex-col gap-1.5 pb-2 transition-all duration-300",
							step4State === "upcoming" && "pointer-events-none opacity-40",
						)}
					>
						<div className="flex items-center justify-between gap-2">
							<span
								className={cn(
									"font-semibold text-sm",
									step4Complete
										? "text-text-sub-600/70 dark:text-white/30"
										: "text-text-strong-950 dark:text-white",
								)}
							>
								Send your first email
							</span>
							{step4Complete && <DoneBadge />}
						</div>
						{step4State === "upcoming" ? (
							<p className="flex items-center gap-1.5 text-text-sub-600/70 text-xs dark:text-white/30">
								<Lock className="h-3 w-3" />
								Unlocks after domain is verified
							</p>
						) : (
							<SetupStepSendEmail
								step4Complete={step4Complete}
								step3Done={step3Done}
								step2Done={step2Done}
								testRecipient={testRecipient}
								isSendingTest={isSendingTest}
								onSend={onSendTestEmail}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
