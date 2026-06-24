"use client";

import { Icon } from "@reloop/ui/icon";
import { toast } from "sonner";

interface ForwardComposerProps {
	/** Original message to forward */
	originalFrom: string;
	originalDate: string;
	originalSubject: string;
	originalBodyText?: string;
	/** Mailbox this message belongs to */
	fromEmail: string;
	/** Controlled field values */
	toValue: string;
	ccValue: string;
	bodyValue: string;
	onToChange: (val: string) => void;
	onCcChange: (val: string) => void;
	onBodyChange: (val: string) => void;
	onSend: () => void;
	onClose: () => void;
	isSending?: boolean;
}

export const ForwardComposer = ({
	originalFrom,
	originalDate,
	originalSubject,
	originalBodyText,
	fromEmail,
	toValue,
	ccValue,
	bodyValue,
	onToChange,
	onCcChange,
	onBodyChange,
	onSend,
	onClose,
	isSending,
}: ForwardComposerProps) => {
	const canSend = toValue.trim().length > 0 && !isSending;

	return (
		<div className="mx-5 my-4 rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm dark:border-stroke-soft-100/30 dark:bg-neutral-900/40">
			{/* Header */}
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/30">
				<div className="flex items-center gap-2">
					{/* Forward icon */}
					<svg
						className="h-3.5 w-3.5 text-primary-base"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="15 17 20 12 15 7" />
						<path d="M4 18v-2a4 4 0 0 1 4-4h12" />
					</svg>
					<span className="font-semibold text-label-sm text-text-strong-950 dark:text-white">
						Forward
					</span>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-text-soft-400 hover:bg-bg-weak-50 dark:hover:bg-white/10"
				>
					<Icon name="cross" className="h-4 w-4" />
				</button>
			</div>

			{/* Fields */}
			<div className="flex flex-col gap-0 divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/30">
				{/* From */}
				<div className="flex items-center gap-2 px-4 py-2.5 text-label-sm">
					<span className="w-12 shrink-0 text-text-soft-400">From:</span>
					<span className="text-text-sub-600 dark:text-neutral-400">
						{fromEmail}
					</span>
				</div>

				{/* To */}
				<div className="flex items-center gap-2 px-4 py-2.5 text-label-sm">
					<span className="w-12 shrink-0 text-text-soft-400">To:</span>
					<input
						type="text"
						value={toValue}
						onChange={(e) => onToChange(e.target.value)}
						placeholder="recipient@example.com, …"
						className="min-w-0 flex-1 bg-transparent text-text-strong-950 placeholder-text-soft-400 outline-none dark:text-white"
					/>
				</div>

				{/* CC */}
				<div className="flex items-center gap-2 px-4 py-2.5 text-label-sm">
					<span className="w-12 shrink-0 text-text-soft-400">Cc:</span>
					<input
						type="text"
						value={ccValue}
						onChange={(e) => onCcChange(e.target.value)}
						placeholder="cc@example.com, …"
						className="min-w-0 flex-1 bg-transparent text-text-sub-600 placeholder-text-soft-400 outline-none dark:text-neutral-400"
					/>
				</div>
			</div>

			{/* Body — optional note + quoted original */}
			<div className="px-4 py-3">
				<textarea
					value={bodyValue}
					onChange={(e) => onBodyChange(e.target.value)}
					placeholder="Add a note (optional)…"
					rows={3}
					className="w-full resize-none bg-transparent text-label-sm text-text-strong-950 placeholder-text-soft-400 outline-none dark:text-white"
				/>

				{/* Quoted original */}
				<div className="mt-2 rounded-lg border border-stroke-soft-100 bg-bg-weak-50/60 p-3 dark:border-stroke-soft-100/20 dark:bg-neutral-800/30">
					<p className="mb-1.5 font-medium text-[11px] text-text-soft-400 uppercase tracking-wider">
						Forwarded message
					</p>
					<div className="flex flex-col gap-0.5 text-label-xs text-text-sub-600 dark:text-neutral-400">
						<span>
							<span className="font-semibold text-text-soft-400">From:</span>{" "}
							{originalFrom}
						</span>
						<span>
							<span className="font-semibold text-text-soft-400">Date:</span>{" "}
							{originalDate}
						</span>
						<span>
							<span className="font-semibold text-text-soft-400">Subject:</span>{" "}
							{originalSubject}
						</span>
					</div>
					{originalBodyText && (
						<p className="mt-2 line-clamp-3 whitespace-pre-wrap text-label-xs text-text-sub-600 leading-relaxed dark:text-neutral-400">
							{originalBodyText}
						</p>
					)}
				</div>
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between rounded-b-xl border-stroke-soft-100 border-t bg-bg-weak-50/30 px-4 py-2.5 dark:border-stroke-soft-100/30 dark:bg-neutral-900/20">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={onSend}
						disabled={!canSend}
						className="flex items-center gap-1.5 rounded-lg bg-primary-base px-4 py-1.5 font-semibold text-label-sm text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
					>
						{isSending ? (
							<span>Sending…</span>
						) : (
							<>
								<span>Forward</span>
								<svg
									className="h-3.5 w-3.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<polyline points="15 17 20 12 15 7" />
									<path d="M4 18v-2a4 4 0 0 1 4-4h12" />
								</svg>
							</>
						)}
					</button>

					<button
						type="button"
						className="rounded-lg p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
						title="Attach files"
						onClick={() => toast.info("Attachment uploading prototype")}
					>
						<svg
							className="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
						</svg>
					</button>
				</div>

				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-text-soft-400 hover:bg-red-50 hover:text-error-base dark:hover:bg-red-950/20"
					title="Discard draft"
				>
					<svg
						className="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
					</svg>
				</button>
			</div>
		</div>
	);
};
