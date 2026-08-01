import { toast } from "@reloop/ui/toast";
import { useEffect, useState } from "react";

const RING_SIZE = 36;
const RING_STROKE = 2.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type UndoSendToastProps = {
	toastId: string | number;
	variant: "send" | "schedule";
	seconds: number;
	onUndo: () => void | Promise<void>;
};

function CountdownRing({
	remaining,
	total,
}: {
	remaining: number;
	total: number;
}) {
	const progress = total > 0 ? remaining / total : 0;
	const offset = RING_CIRCUMFERENCE * (1 - progress);

	return (
		<div
			className="relative shrink-0"
			style={{ width: RING_SIZE, height: RING_SIZE }}
			aria-hidden
		>
			<svg
				width={RING_SIZE}
				height={RING_SIZE}
				viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
				className="-rotate-90"
			>
				<title>Time remaining</title>
				<circle
					cx={RING_SIZE / 2}
					cy={RING_SIZE / 2}
					r={RING_RADIUS}
					fill="none"
					stroke="currentColor"
					strokeWidth={RING_STROKE}
					className="text-neutral-200 dark:text-neutral-700"
				/>
				<circle
					cx={RING_SIZE / 2}
					cy={RING_SIZE / 2}
					r={RING_RADIUS}
					fill="none"
					stroke="currentColor"
					strokeWidth={RING_STROKE}
					strokeLinecap="round"
					strokeDasharray={RING_CIRCUMFERENCE}
					strokeDashoffset={offset}
					className="text-neutral-900 transition-[stroke-dashoffset] duration-200 ease-linear dark:text-white"
				/>
			</svg>
			<span className="absolute inset-0 flex items-center justify-center font-semibold text-[11px] text-neutral-900 tabular-nums tracking-tight dark:text-white">
				{remaining}
			</span>
		</div>
	);
}

export function UndoSendToast({
	toastId,
	variant,
	seconds,
	onUndo,
}: UndoSendToastProps) {
	const [remaining, setRemaining] = useState(seconds);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		const started = Date.now();
		const id = window.setInterval(() => {
			const left = Math.max(
				0,
				seconds - Math.floor((Date.now() - started) / 1000),
			);
			setRemaining(left);
			if (left <= 0) window.clearInterval(id);
		}, 100);
		return () => window.clearInterval(id);
	}, [seconds]);

	const title = variant === "schedule" ? "Email scheduled" : "Sending email…";
	const subtitle =
		variant === "schedule"
			? "Undo before it's locked in"
			: "Not sent yet — you can still undo";

	return (
		<div className="flex w-[min(100vw-2rem,22rem)] items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/95 px-3.5 py-3 text-neutral-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/95 dark:text-white dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
			<CountdownRing remaining={remaining} total={seconds} />
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-sm leading-5 tracking-tight">
					{title}
				</p>
				<p className="truncate text-neutral-500 text-xs leading-4 dark:text-neutral-400">
					{subtitle}
				</p>
			</div>
			<button
				type="button"
				disabled={busy || remaining <= 0}
				aria-label={`Undo send, ${remaining} seconds remaining`}
				className="shrink-0 rounded-lg bg-neutral-100 px-3 py-1.5 font-medium text-neutral-900 text-sm transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-neutral-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
				onClick={() => {
					void (async () => {
						setBusy(true);
						try {
							await onUndo();
							toast.dismiss(toastId);
						} finally {
							setBusy(false);
						}
					})();
				}}
			>
				{busy ? "…" : "Undo"}
			</button>
		</div>
	);
}

export function showUndoSendToast(options: {
	variant: "send" | "schedule";
	seconds: number;
	onUndo: () => void | Promise<void>;
}) {
	return toast.custom(
		(toastId) => (
			<UndoSendToast
				toastId={toastId}
				variant={options.variant}
				seconds={options.seconds}
				onUndo={options.onUndo}
			/>
		),
		{
			duration: options.seconds * 1000,
			// Strip the shared Toaster chrome so custom content isn't double-boxed.
			className:
				"!w-auto !max-w-none !border-0 !bg-transparent !p-0 !shadow-none",
		},
	);
}
