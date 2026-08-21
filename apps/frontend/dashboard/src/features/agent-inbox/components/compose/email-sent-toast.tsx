"use client";

import { Icon } from "@reloop/ui/icon";
import { toast } from "@reloop/ui/toast";
import { ArrowRight, X } from "lucide-react";

type EmailSentToastProps = {
	toastId: string | number;
	title?: string;
	description?: string;
	scheduled?: boolean;
	to?: string[];
	onViewSent?: () => void;
};

export function EmailSentToast({
	toastId,
	title = "Email sent",
	description,
	scheduled = false,
	to,
	onViewSent,
}: EmailSentToastProps) {
	const defaultSubtitle = scheduled
		? "Scheduled for delivery. Available in Sent."
		: to?.length
			? `Sent to ${to[0]}${to.length > 1 ? ` +${to.length - 1} more` : ""}`
			: "Find it in Sent — Inbox only shows received mail.";

	return (
		<div className="flex w-[min(100vw-2rem,24rem)] items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/95 p-3 text-neutral-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/95 dark:text-white dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
			<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
				{scheduled ? (
					<Icon name="calendar" className="size-4" />
				) : (
					<Icon name="sent" className="size-4" />
				)}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-[13px] leading-5 tracking-tight text-neutral-900 dark:text-white">
					{title}
				</p>
				<p className="truncate text-neutral-500 text-xs leading-4 dark:text-neutral-400">
					{description || defaultSubtitle}
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-1.5">
				{onViewSent && (
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
				)}

				<button
					type="button"
					onClick={() => toast.dismiss(toastId)}
					aria-label="Dismiss toast"
					className="rounded-md p-1 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
				>
					<X className="size-3.5" />
				</button>
			</div>
		</div>
	);
}

export function showEmailSentToast(options: {
	title?: string;
	description?: string;
	scheduled?: boolean;
	to?: string[];
	onViewSent?: () => void;
	duration?: number;
}) {
	return toast.custom(
		(toastId) => (
			<EmailSentToast
				toastId={toastId}
				title={options.title ?? (options.scheduled ? "Email scheduled" : "Email sent")}
				description={options.description}
				scheduled={options.scheduled}
				to={options.to}
				onViewSent={options.onViewSent}
			/>
		),
		{
			duration: options.duration ?? 5000,
			className:
				"!w-auto !max-w-none !border-0 !bg-transparent !p-0 !shadow-none",
		},
	);
}
