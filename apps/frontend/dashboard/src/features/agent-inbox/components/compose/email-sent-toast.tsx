"use client";

import { Icon } from "@reloop/ui/icon";
import { toast } from "@reloop/ui/toast";
import { ArrowRight } from "lucide-react";
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
	const [remaining, setRemaining] = useState(seconds);
	const [busy, setBusy] = useState(false);
	const isCountingDown = onUndo && remaining > 0;

	useEffect(() => {
		if (!onUndo || seconds <= 0) return;
		const started = Date.now();
		const id = window.setInterval(() => {
			const left = Math.max(
				0,
				seconds - Math.floor((Date.now() - started) / 1000),
			);
			setRemaining(left);
			if (left <= 0) {
				window.clearInterval(id);
			}
		}, 100);
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

	const progressPercent = seconds > 0 ? (remaining / seconds) * 100 : 0;

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
				{isCountingDown ? (
					<button
						type="button"
						disabled={busy}
						aria-label={`Undo send, ${remaining} seconds remaining`}
						onClick={async () => {
							setBusy(true);
							try {
								await onUndo();
								toast.dismiss(toastId);
							} finally {
								setBusy(false);
							}
						}}
						className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg bg-neutral-900 px-3 py-1.5 font-medium text-white text-xs transition-transform active:scale-[0.97] dark:bg-white dark:text-neutral-900"
					>
						{/* Progress fill bar inside the button */}
						<span
							className="pointer-events-none absolute inset-0 bg-white/20 transition-all ease-linear dark:bg-neutral-900/15"
							style={{
								width: `${progressPercent}%`,
								transitionDuration: "100ms",
							}}
						/>
						<span className="relative z-10">{busy ? "…" : "Undo"}</span>
						<span className="relative z-10 flex h-4 min-w-4 items-center justify-center rounded bg-white/25 px-1 font-mono font-semibold text-[10px] tabular-nums text-white dark:bg-neutral-900/20 dark:text-neutral-900">
							{remaining}
						</span>
					</button>
				) : (
					onViewSent && (
						<button
							type="button"
							onClick={() => {
								onViewSent();
								toast.dismiss(toastId);
							}}
							className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1.5 font-medium text-neutral-900 text-xs transition-all hover:bg-neutral-200 active:scale-[0.97] dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
						>
							View Sent
							<ArrowRight className="size-3 text-neutral-400 dark:text-neutral-500" />
						</button>
					)
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
