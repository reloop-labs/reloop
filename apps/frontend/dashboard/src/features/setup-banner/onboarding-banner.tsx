"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useSessionQuery } from "#/features/auth/session-query";
import { formatOwnDomainFrom, type SetupStep } from "./setup-progress";
import { useSendFromOwnDomain } from "./use-send-from-own-domain";
import { useSetupProgress } from "./use-setup-progress";

function ProgressRing({
	completed,
	total,
	size = 18,
}: {
	completed: number;
	total: number;
	size?: number;
}) {
	const safeTotal = total <= 0 ? 1 : total;
	const pct = Math.min(1, Math.max(0, completed / safeTotal));
	const stroke = 3;
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const done = completed >= safeTotal;

	if (done) {
		return <PricingCheckmark size={size} />;
	}

	return (
		<span
			className="relative shrink-0"
			style={{ width: size, height: size }}
			aria-hidden
		>
			<svg width={size} height={size} className="-rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke="currentColor"
					strokeWidth={stroke}
					className="text-black/15 dark:text-white/[0.18]"
				/>
				{pct > 0 && (
					<circle
						cx={size / 2}
						cy={size / 2}
						r={r}
						fill="none"
						stroke="currentColor"
						strokeWidth={stroke}
						strokeLinecap="round"
						strokeDasharray={c}
						strokeDashoffset={c * (1 - pct)}
						className="text-primary-base"
					/>
				)}
				{pct === 0 && (
					<circle
						cx={size / 2}
						cy={stroke / 2}
						r={stroke / 2}
						fill="currentColor"
						stroke="none"
						className="text-primary-base"
					/>
				)}
			</svg>
		</span>
	);
}

/**
 * Checkmark matching the pricing page geometry (tinted circle + check),
 * scaled to the same 18px footprint as the incomplete ring.
 */
function PricingCheckmark({ size = 18 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 18 18"
			fill="none"
			className="shrink-0 text-primary-base"
			aria-hidden="true"
		>
			<circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.08" />
			<path
				d="M6.3 9.45L8.1 11.25L11.7 6.75"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.25"
			/>
		</svg>
	);
}

function StepDot({ complete }: { complete: boolean }) {
	if (complete) {
		return <PricingCheckmark size={18} />;
	}
	return (
		<span
			className="h-[18px] w-[18px] shrink-0 rounded-full border-[3px] border-black/20 dark:border-white/20"
			aria-hidden
		/>
	);
}

function StepRow({
	step,
	onRun,
	sending,
	disabled,
}: {
	step: SetupStep;
	onRun: () => void;
	sending: boolean;
	disabled: boolean;
}) {
	const external = step.href?.startsWith("http");
	return (
		<li>
			<button
				type="button"
				onClick={onRun}
				disabled={step.complete || disabled}
				className={cn(
					"group flex w-full items-center gap-2.5 px-4 py-1.5 text-left",
					step.complete || disabled ? "cursor-default" : "cursor-pointer",
				)}
			>
				{sending && step.action === "send" ? (
					<span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-text-sub-600 dark:text-white/60">
						<Spinner size={14} />
					</span>
				) : (
					<StepDot complete={step.complete} />
				)}
				<span
					className={cn(
						"min-w-0 flex-1 truncate font-medium text-[13px] leading-5 tracking-normal",
						step.complete
							? "text-text-soft-400 line-through dark:text-white/30"
							: "text-text-strong-950 dark:text-white/75",
					)}
				>
					{step.title}
				</span>
				{external && !step.complete && (
					<Icon
						name="arrow-up-right"
						className="h-3.5 w-3.5 shrink-0 text-text-soft-400 dark:text-white/30"
					/>
				)}
			</button>
		</li>
	);
}

export function OnboardingBanner({ isCollapsed }: { isCollapsed: boolean }) {
	const router = useRouter();
	const { data: session } = useSessionQuery();
	const { orgName, progress, isPending } = useSetupProgress();
	const send = useSendFromOwnDomain();
	const [open, setOpen] = useState(false);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const cancelClose = () => {
		if (closeTimer.current) {
			clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
	};
	const handleEnter = () => {
		cancelClose();
		setOpen(true);
	};
	const handleLeave = () => {
		cancelClose();
		closeTimer.current = setTimeout(() => setOpen(false), 120);
	};

	if (isPending || progress.allComplete) return null;

	const userEmail = session?.user?.email?.trim() ?? "";
	const activeDomain = progress.activeDomain;
	const sending = send.isPending;
	const sendDisabled = !userEmail;

	const handleSend = () => {
		if (!activeDomain || !userEmail) return;
		send.mutate({
			from: formatOwnDomainFrom(orgName, activeDomain.domain),
			to: userEmail,
		});
	};

	const runStep = (step: SetupStep) => {
		if (step.complete) return;
		if (step.disabled) return;
		if (step.action === "send") {
			if (sending || sendDisabled) return;
			handleSend();
			return;
		}
		router.push(step.href ?? "/");
	};

	const isStepBusy = (step: SetupStep) =>
		step.action === "send" && (sending || sendDisabled);
	const isStepDisabled = (step: SetupStep) =>
		Boolean(step.disabled) || isStepBusy(step);

	// Completed steps sink to the bottom, pending ones stay on top.
	const orderedSteps = [...progress.steps].sort(
		(a, b) => Number(a.complete) - Number(b.complete),
	);

	const stepsList = (
		<ol className="py-1">
			{orderedSteps.map((step) => (
				<StepRow
					key={step.id}
					step={step}
					onRun={() => runStep(step)}
					sending={sending}
					disabled={isStepDisabled(step)}
				/>
			))}
		</ol>
	);

	// Sidebar collapsed → dot that reveals the card on hover (flyout)
	if (isCollapsed) {
		return (
			<div
				className="relative flex w-full items-center justify-center"
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
				onFocus={handleEnter}
				onBlur={handleLeave}
			>
				<span
					title={`Get started, ${progress.completedCount} of ${progress.totalCount} complete`}
					className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-weak-50 transition-colors hover:bg-bg-soft-200 dark:bg-[#242424] dark:hover:bg-[#2c2c2c]"
				>
					<ProgressRing
						completed={progress.completedCount}
						total={progress.totalCount}
						size={18}
					/>
				</span>

				<AnimatePresence>
					{open && (
						<motion.div
							initial={{ opacity: 0, x: -6 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -6 }}
							transition={{ duration: 0.15, ease: "easeOut" }}
							className="absolute bottom-0 left-[calc(100%+10px)] z-50 w-60 overflow-hidden rounded-2xl border border-primary-base/40 bg-bg-white-0 dark:border-primary-base/50 dark:bg-[#242424]"
						>
							<div className="flex items-center gap-2.5 px-4 py-3">
								<ProgressRing
									completed={progress.completedCount}
									total={progress.totalCount}
								/>
								<span className="min-w-0 flex-1 truncate font-medium text-[13px] text-text-strong-950 leading-5 dark:text-[#e8e8e8]">
									Get started
								</span>
								<span className="shrink-0 font-normal text-[12px] text-text-soft-400 tabular-nums leading-5 dark:text-white/35">
									{progress.completedCount} of {progress.totalCount}
								</span>
							</div>
							<div className="h-px w-full bg-stroke-soft-200 dark:bg-white/[0.07]" />
							{stepsList}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		);
	}

	return (
		<div
			className="relative w-full overflow-hidden rounded-2xl border border-primary-base/40 bg-gradient-to-br from-primary-base/[0.09] via-bg-white-0 to-bg-white-0 dark:border-primary-base/50 dark:from-primary-base/[0.22] dark:via-[#242424] dark:to-[#242424]"
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
			onFocus={handleEnter}
			onBlur={handleLeave}
		>
			{/* Attention glow — pulses until setup is complete */}
			<motion.span
				aria-hidden
				className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-primary-base/60"
				animate={{ opacity: [0.15, 0.75, 0.15] }}
				transition={{
					duration: 2.2,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			/>
			{/* Header — hover expands, mouse-leave collapses (Image 2 ↔ Image 1) */}
			<div className="flex w-full items-center gap-2.5 px-4 py-3 text-left">
				<ProgressRing
					completed={progress.completedCount}
					total={progress.totalCount}
				/>
				<span className="min-w-0 flex-1 truncate font-medium text-[13px] text-text-strong-950 leading-5 dark:text-[#e8e8e8]">
					Get started
				</span>
				<span className="shrink-0 font-normal text-[12px] text-text-soft-400 tabular-nums leading-5 dark:text-white/35">
					{progress.completedCount} of {progress.totalCount}
				</span>
			</div>

			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						key="steps"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
						className="overflow-hidden"
					>
						<div className="h-px w-full bg-stroke-soft-200 dark:bg-white/[0.07]" />
						{stepsList}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
