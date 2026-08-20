"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSessionQuery } from "#/features/auth/session-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { formatOwnDomainFrom, type SetupStep } from "./setup-progress";
import { useSendFromOwnDomain } from "./use-send-from-own-domain";
import { useSetupProgress } from "./use-setup-progress";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

function GlowingBlueDot() {
	return (
		<span className="relative flex size-2.5">
			<span className="absolute inline-flex h-full w-full rounded-full bg-primary-base opacity-75 motion-safe:animate-ping" />
			<span className="relative inline-flex size-2.5 rounded-full bg-primary-base ring-2 ring-bg-white-0 dark:ring-[#0c0c0c]" />
		</span>
	);
}

function SetupProgressBar({ value, max }: { value: number; max: number }) {
	const safeMax = max <= 0 ? 1 : max;
	const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));
	return (
		<div
			className="h-1.5 w-full rounded-full bg-bg-soft-200"
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max}
		>
			<div
				className="h-full rounded-full bg-primary-base transition-[width] duration-300 ease-out"
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

function StepIndicator({
	complete,
	index,
}: {
	complete: boolean;
	index: number;
}) {
	return (
		<span
			className={cn(
				"flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-medium text-[11px] tabular-nums",
				complete
					? "bg-success-base text-static-white"
					: "bg-bg-weak-50 text-text-sub-600 ring-1 ring-stroke-soft-200 ring-inset",
			)}
			aria-hidden
		>
			{complete ? <Icon name="check" className="h-3 w-3" /> : index + 1}
		</span>
	);
}

function StepRow({
	step,
	index,
	onSend,
	onNavigate,
	sending,
	sendDisabled,
}: {
	step: SetupStep;
	index: number;
	onSend: () => void;
	onNavigate: (href: string) => void;
	sending: boolean;
	sendDisabled: boolean;
}) {
	const ctaDisabled =
		step.disabled || (step.action === "send" && (sending || sendDisabled));

	return (
		<li className="flex items-start gap-3 py-3">
			<StepIndicator complete={step.complete} index={index} />
			<div className="min-w-0 flex-1">
				<p
					className={cn(
						"h-5 font-medium text-label-sm leading-5",
						step.complete ? "text-text-sub-600" : "text-text-strong-950",
					)}
				>
					{step.title}
				</p>
				<p className="truncate text-paragraph-xs text-text-soft-400">
					{step.description}
				</p>
			</div>
			{step.complete ? (
				<span className="flex h-5 shrink-0 self-center items-center font-medium text-label-xs text-success-base">
					Done
				</span>
			) : step.action === "send" ? (
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="xxsmall"
					className="self-center shrink-0 gap-1.5 rounded-xl"
					disabled={ctaDisabled}
					onClick={onSend}
				>
					{sending ? (
						<>
							<Spinner size={12} />
							Sending…
						</>
					) : (
						<>
							<Icon name="mail-send" className="h-3.5 w-3.5" />
							{step.cta}
						</>
					)}
				</Button.Root>
			) : (
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="xxsmall"
					className="self-center shrink-0 gap-1.5 rounded-xl"
					onClick={() => onNavigate(step.href ?? "/")}
				>
					{step.cta}
					<Icon name="arrow-right" className="h-3.5 w-3.5" />
				</Button.Root>
			)}
		</li>
	);
}

function CollapsedTrigger({
	completedCount,
	totalCount,
	onOpen,
}: {
	completedCount: number;
	totalCount: number;
	onOpen: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onOpen}
			aria-label={`Get started, ${completedCount} of ${totalCount} complete`}
			title="Get started"
			className="flex h-8 w-8 items-center justify-center rounded-lg transition-[background-color,transform] duration-150 ease-out hover:bg-bg-weak-50 active:scale-[0.97] dark:hover:bg-white/10"
		>
			<GlowingBlueDot />
		</button>
	);
}

function ExpandedTrigger({
	completedCount,
	totalCount,
	nextTitle,
	onOpen,
}: {
	completedCount: number;
	totalCount: number;
	nextTitle: string | undefined;
	onOpen: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onOpen}
			className="relative w-full overflow-visible rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-2.5 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-bg-weak-50 active:scale-[0.99] dark:border-stroke-soft-100/40 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
		>
			<span className="pointer-events-none absolute -top-0.75 -right-0.75 z-10">
				<GlowingBlueDot />
			</span>
			<div className="flex items-center justify-between gap-2">
				<span className="font-medium text-label-sm text-text-strong-950">
					Get started
				</span>
				<span className="font-medium text-label-xs text-text-sub-600 tabular-nums">
					{completedCount}/{totalCount}
				</span>
			</div>
			<div className="mt-2">
				<SetupProgressBar value={completedCount} max={totalCount} />
			</div>
			<p className="mt-1.5 truncate text-paragraph-xs text-text-soft-400">
				{nextTitle ?? "Finish setup"}
			</p>
		</button>
	);
}

export function OnboardingBanner({ isCollapsed }: { isCollapsed: boolean }) {
	const router = useRouter();
	const { data: session } = useSessionQuery();
	const { orgName, progress, isPending } = useSetupProgress();
	const send = useSendFromOwnDomain();
	const [open, setOpen] = useState(false);

	const visible = !isPending && (!progress.allComplete || open);
	const userEmail = session?.user?.email?.trim() ?? "";
	const activeDomain = progress.activeDomain;
	const nextStep = progress.steps.find((step) => !step.complete);
	const sending = send.isPending;
	const sendDisabled = !userEmail;
	const nextDisabled =
		!nextStep ||
		nextStep.disabled ||
		(nextStep.action === "send" && (sending || sendDisabled));

	const handleSend = () => {
		if (!activeDomain || !userEmail) return;
		send.mutate({
			from: formatOwnDomainFrom(orgName, activeDomain.domain),
			to: userEmail,
		});
	};

	const runStep = (step: SetupStep) => {
		if (step.complete) return;
		if (step.action === "send") {
			handleSend();
			return;
		}
		setOpen(false);
		router.push(step.href ?? "/");
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && nextStep && !nextDisabled) runStep(nextStep);
		},
		{ enabled: open && Boolean(nextStep) && !nextDisabled },
	);

	if (!visible) return null;

	return (
		<>
			{isCollapsed ? (
				<CollapsedTrigger
					completedCount={progress.completedCount}
					totalCount={progress.totalCount}
					onOpen={() => setOpen(true)}
				/>
			) : (
				<ExpandedTrigger
					completedCount={progress.completedCount}
					totalCount={progress.totalCount}
					nextTitle={nextStep?.title}
					onOpen={() => setOpen(true)}
				/>
			)}

			<Modal.Root open={open} onOpenChange={setOpen}>
				<Modal.Content
					className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
					showClose={false}
				>
					<div className="p-6">
						<div>
							<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								Get started
							</Modal.Title>
							<p className="mt-1 text-sm text-text-sub-600 leading-relaxed">
								Finish these three steps so you can send from your own domain.
							</p>
						</div>

						<div className="mt-5">
							<div className="mb-2 flex items-center justify-between">
								<span className="font-medium text-label-xs text-text-sub-600 tabular-nums">
									{progress.completedCount} of {progress.totalCount} complete
								</span>
							</div>
							<SetupProgressBar
								value={progress.completedCount}
								max={progress.totalCount}
							/>
						</div>

						<ol className="mt-4 divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
							{progress.steps.map((step, index) => (
								<StepRow
									key={step.id}
									step={step}
									index={index}
									onSend={handleSend}
									onNavigate={(href) => {
										setOpen(false);
										router.push(href);
									}}
									sending={sending}
									sendDisabled={sendDisabled}
								/>
							))}
						</ol>

						<div className="mt-6 flex items-center justify-end gap-3">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={() => setOpen(false)}
								className="gap-1.5 rounded-xl"
							>
								Cancel
								<ActionKbd className="lowercase! w-auto min-w-0 px-1">
									esc
								</ActionKbd>
							</Button.Root>
							{nextStep ? (
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									disabled={nextDisabled}
									onClick={() => runStep(nextStep)}
									className="min-w-35 justify-center overflow-hidden rounded-xl"
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={sending ? "sending" : nextStep.id}
											transition={{
												type: "spring",
												duration: 0.25,
												bounce: 0,
											}}
											initial={{ opacity: 0, y: -14 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 14 }}
											className="flex items-center justify-center gap-1.5"
										>
											{sending ? (
												<>
													<Spinner size={14} color="currentColor" />
													Sending…
												</>
											) : (
												<>
													{nextStep.cta}
													<ActionKbd className={actionKbdOnBlueClassName}>
														↵
													</ActionKbd>
												</>
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							) : (
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={() => setOpen(false)}
									className="gap-1.5 rounded-xl"
								>
									Done
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
								</FancyButton.Root>
							)}
						</div>
					</div>
				</Modal.Content>
			</Modal.Root>
		</>
	);
}
