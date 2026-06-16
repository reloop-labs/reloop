"use client";

import { cn } from "@reloop/ui/cn";
import { Check, Globe, KeyRound, Send } from "lucide-react";
import Link from "next/link";
import { SetupStepApiKey } from "./setup-step-api-key";
import { SetupStepDomain } from "./setup-step-domain";
import { SetupStepSendEmail } from "./setup-step-send-email";
import {
	type ApiKeyData,
	type DomainData,
	useSetupProgress,
} from "./use-setup-progress";

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

	const activeHighlight =
		"rounded-xl border border-primary-base/20 bg-primary-base/[0.02] p-3.5 dark:bg-primary-base/[0.01]";
	const doneContent = "pl-3.5";
	const mutedContent = "pointer-events-none pl-3.5 opacity-50";

	return (
		<div className="rounded-2xl border border-stroke-soft-100 bg-white/60 p-6 backdrop-blur-xl dark:border-white/[0.04] dark:bg-white/[0.01]">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-lg text-text-strong-950 dark:text-white">
						Setup Checklist
					</h2>
					<p className="mt-1 text-text-sub-600 text-xs dark:text-white/40">
						Complete the actions below.
					</p>
				</div>
				<div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
					<svg className="-rotate-90 h-full w-full" aria-hidden>
						<circle
							cx="28"
							cy="28"
							r="22"
							stroke="currentColor"
							className="text-stroke-soft-100 dark:text-white/[0.04]"
							strokeWidth="4"
							fill="transparent"
						/>
						<circle
							cx="28"
							cy="28"
							r="22"
							stroke="currentColor"
							className="text-primary-base"
							strokeWidth="4"
							fill="transparent"
							strokeDasharray={2 * Math.PI * 22}
							strokeDashoffset={2 * Math.PI * 22 * (1 - completedCount / 4)}
							strokeLinecap="round"
							style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
						/>
					</svg>
					<span className="absolute font-bold text-[11px] text-text-strong-950 dark:text-white">
						{completedCount}/4
					</span>
				</div>
			</div>

			<div className="relative mt-8 space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-stroke-soft-100 dark:before:bg-white/[0.04]">
				{/* Step 1: Account */}
				<div className="group relative">
					<div className="-left-[21px] absolute top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
						<Check className="h-2.5 w-2.5" strokeWidth={4} />
					</div>
					<div className={cn("flex flex-col", doneContent)}>
						<span className="font-semibold text-sm text-text-strong-950/50 line-through decoration-text-sub-600/20 dark:text-white/40">
							Create your account
						</span>
						<span className="text-text-sub-600/60 text-xs dark:text-white/30">
							Account created successfully
						</span>
					</div>
				</div>

				{/* Step 2: Domain */}
				<div className="group relative">
					<div
						className={cn(
							"-left-[21px] absolute top-1.5 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300",
							step2Done
								? "bg-emerald-500 text-white"
								: "bg-primary-base text-white ring-4 ring-primary-base/20",
						)}
					>
						{step2Done ? (
							<Check className="h-2.5 w-2.5" strokeWidth={4} />
						) : (
							<Globe className="h-2 w-2" />
						)}
					</div>
					<div
						className={cn(
							"flex flex-col transition-all duration-300",
							step2Done ? doneContent : activeHighlight,
						)}
					>
						<div className="flex items-center justify-between gap-2">
							<span
								className={cn(
									"font-semibold text-sm",
									step2Done
										? "text-text-strong-950/50 line-through decoration-text-sub-600/20 dark:text-white/40"
										: "text-text-strong-950 dark:text-white",
								)}
							>
								Add sending domain
							</span>
							{primaryDomain
								? !step2Done && (
										<span className="shrink-0 rounded-full border border-amber-200/50 bg-amber-500/10 px-2 py-0.5 font-semibold text-[10px] text-amber-600 capitalize dark:text-amber-400">
											{primaryDomain.status}
										</span>
									)
								: !step2Done && (
										<span className="shrink-0 rounded-full border border-red-200/50 bg-red-500/10 px-2 py-0.5 font-semibold text-[10px] text-red-600 dark:text-red-400">
											Required
										</span>
									)}
						</div>
						{step2Done ? (
							<span className="mt-1 text-text-sub-600/60 text-xs dark:text-white/30">
								{primaryDomainName} verified
							</span>
						) : (
							<SetupStepDomain
								primaryDomain={primaryDomain}
								primaryDomainName={primaryDomainName}
								step2Done={step2Done}
							/>
						)}
					</div>
				</div>

				{/* Step 3: API Key */}
				<div className="group relative">
					<div
						className={cn(
							"-left-[21px] absolute top-1.5 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300",
							step3Done
								? "bg-emerald-500 text-white"
								: step2Done
									? "bg-primary-base text-white ring-4 ring-primary-base/20"
									: "bg-stroke-soft-100 text-text-disabled-300 dark:bg-white/[0.04]",
						)}
					>
						{step3Done ? (
							<Check className="h-2.5 w-2.5" strokeWidth={4} />
						) : (
							<KeyRound className="h-2 w-2" />
						)}
					</div>
					<div
						className={cn(
							"flex flex-col transition-all duration-300",
							step3Done
								? doneContent
								: step2Done
									? activeHighlight
									: mutedContent,
						)}
					>
						<div className="flex items-center justify-between gap-2">
							<span
								className={cn(
									"font-semibold text-sm",
									step3Done
										? "text-text-strong-950/50 line-through decoration-text-sub-600/20 dark:text-white/40"
										: "text-text-strong-950 dark:text-white",
								)}
							>
								Generate API key
							</span>
							{step3Done && (
								<Link
									href="/api-keys"
									className="font-semibold text-[11px] text-primary-base hover:underline"
								>
									Manage →
								</Link>
							)}
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
				<div className="group relative">
					<div
						className={cn(
							"-left-[21px] absolute top-1.5 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300",
							step4Complete
								? "bg-emerald-500 text-white"
								: step3Done && step2Done
									? "bg-primary-base text-white ring-4 ring-primary-base/20"
									: "bg-stroke-soft-100 text-text-disabled-300 dark:bg-white/[0.04]",
						)}
					>
						{step4Complete ? (
							<Check className="h-2.5 w-2.5" strokeWidth={4} />
						) : (
							<Send className="h-2 w-2" />
						)}
					</div>
					<div
						className={cn(
							"flex flex-col transition-all duration-300",
							step4Complete
								? doneContent
								: step3Done && step2Done
									? activeHighlight
									: mutedContent,
						)}
					>
						<span
							className={cn(
								"font-semibold text-sm",
								step4Complete
									? "text-text-strong-950/50 line-through decoration-text-sub-600/20 dark:text-white/40"
									: "text-text-strong-950 dark:text-white",
							)}
						>
							Send your first email
						</span>
						<SetupStepSendEmail
							step4Complete={step4Complete}
							step3Done={step3Done}
							step2Done={step2Done}
							testRecipient={testRecipient}
							isSendingTest={isSendingTest}
							onSend={onSendTestEmail}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
