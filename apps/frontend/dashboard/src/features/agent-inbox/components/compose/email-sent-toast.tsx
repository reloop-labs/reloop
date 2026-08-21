"use client";

import { Icon } from "@reloop/ui/icon";
import { toast } from "@reloop/ui/toast";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type EmailSentToastProps = {
	toastId: string | number;
	title?: string;
	description?: string;
	scheduled?: boolean;
	seconds?: number;
	to?: string[];
	onViewSent?: () => void;
	onUndo?: () => void | Promise<void>;
};

export function EmailSentToast({
	toastId,
	title,
	description,
	scheduled = false,
	seconds = 3,
	to,
	onViewSent,
	onUndo,
}: EmailSentToastProps) {
	const [progress, setProgress] = useState(1);
	const [busy, setBusy] = useState(false);
	const isCountingDown = Boolean(onUndo && progress > 0);

	useEffect(() => {
		if (!onUndo || seconds <= 0) return;
		const totalMs = seconds * 1000;
		const started = Date.now();
		const id = window.setInterval(() => {
			const elapsed = Date.now() - started;
			const p = Math.max(0, 1 - elapsed / totalMs);
			setProgress(p);
			if (p <= 0) {
				window.clearInterval(id);
			}
		}, 30);
		return () => window.clearInterval(id);
	}, [seconds, onUndo]);

	const recipientText = to?.length
		? `Sent to ${to[0]}${to.length > 1 ? ` +${to.length - 1} more` : ""}`
		: "Available in Sent folder";

	const currentTitle =
		title || (scheduled ? "Email scheduled" : "Email sent");

	const currentSubtitle =
		description ||
		(scheduled
			? "Scheduled for delivery. Available in Sent."
			: recipientText);

	const handleAction = async () => {
		if (isCountingDown) {
			if (!onUndo) return;
			setBusy(true);
			try {
				await onUndo();
				toast.dismiss(toastId);
			} finally {
				setBusy(false);
			}
		} else if (onViewSent) {
			onViewSent();
			toast.dismiss(toastId);
		}
	};

	return (
		<div className="flex w-[min(100vw-2rem,25rem)] items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/95 p-3 text-neutral-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/95 dark:text-white dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
			<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
				{scheduled ? (
					<Icon name="calendar" className="size-4" />
				) : (
					<Icon name="sent" className="size-4" />
				)}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-[13px] leading-5 tracking-tight text-neutral-900 dark:text-white">
					{currentTitle}
				</p>
				<p className="truncate text-neutral-500 text-xs leading-4 dark:text-neutral-400">
					{currentSubtitle}
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-1.5">
				{(onUndo || onViewSent) && (
					<button
						type="button"
						disabled={busy}
						aria-label={isCountingDown ? "Undo send" : "View sent"}
						onClick={() => void handleAction()}
						className="relative inline-flex min-w-[58px] items-center justify-center overflow-hidden rounded-full bg-neutral-100 px-3.5 py-1.5 font-medium text-neutral-900 text-xs transition-all hover:bg-neutral-200/70 active:scale-[0.97] dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
					>
						{/* Smooth continuous progress fill inside the button during countdown */}
						{isCountingDown && (
							<span
								className="pointer-events-none absolute inset-0 origin-left bg-neutral-900/10 dark:bg-white/15"
								style={{
									width: `${progress * 100}%`,
								}}
							/>
						)}

						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={isCountingDown ? "undo" : "view"}
								transition={{
									type: "spring",
									duration: 0.28,
									bounce: 0,
								}}
								initial={{
									opacity: 0,
									y: -10,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								exit={{
									opacity: 0,
									y: 10,
								}}
								className="relative z-10 inline-flex items-center justify-center"
							>
								{isCountingDown ? (busy ? "…" : "Undo") : "View"}
							</motion.span>
						</AnimatePresence>
					</button>
				)}
			</div>
		</div>
	);
}

export function showEmailSentToast(options: {
	title?: string;
	description?: string;
	scheduled?: boolean;
	seconds?: number;
	to?: string[];
	onViewSent?: () => void;
	onUndo?: () => void | Promise<void>;
	duration?: number;
}) {
	const defaultDuration = options.onUndo
		? (options.seconds ?? 3) * 1000 + 4000
		: 5000;

	return toast.custom(
		(toastId) => (
			<EmailSentToast
				toastId={toastId}
				title={options.title}
				description={options.description}
				scheduled={options.scheduled}
				seconds={options.seconds ?? 3}
				to={options.to}
				onViewSent={options.onViewSent}
				onUndo={options.onUndo}
			/>
		),
		{
			duration: options.duration ?? defaultDuration,
			className:
				"!w-auto !max-w-none !border-0 !bg-transparent !p-0 !shadow-none",
		},
	);
}
