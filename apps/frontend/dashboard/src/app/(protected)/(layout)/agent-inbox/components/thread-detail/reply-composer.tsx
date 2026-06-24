"use client";

import { Icon } from "@reloop/ui/icon";
import { toast } from "sonner";

interface ReplyComposerProps {
	replyBody: string;
	toName: string;
	toEmail: string;
	fromEmail: string;
	onBodyChange: (val: string) => void;
	onSend: () => void;
	onClose: () => void;
}

export const ReplyComposer = ({
	replyBody,
	toName,
	toEmail,
	fromEmail,
	onBodyChange,
	onSend,
	onClose,
}: ReplyComposerProps) => {
	const displayTo = toName ? `${toName} <${toEmail}>` : toEmail;

	return (
		<div className="mx-5 my-4 rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm dark:border-stroke-soft-100/30 dark:bg-neutral-900/40">
			{/* Header */}
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/30">
				<div className="flex flex-col gap-1 text-label-sm">
					<div className="flex items-center gap-2 text-text-soft-400">
						<span className="w-12">To:</span>
						<span className="font-semibold text-text-strong-950 dark:text-white">
							{displayTo}
						</span>
					</div>
					<div className="flex items-center gap-2 text-text-soft-400">
						<span className="w-12">From:</span>
						<span className="text-text-sub-600 dark:text-neutral-400">
							{fromEmail}
						</span>
					</div>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-text-soft-400 hover:bg-bg-weak-50 dark:hover:bg-white/10"
				>
					<Icon name="cross" className="h-4 w-4" />
				</button>
			</div>

			{/* Text Area */}
			<div className="px-4 py-3">
				<textarea
					value={replyBody}
					onChange={(e) => onBodyChange(e.target.value)}
					placeholder={`Reply to ${toName || toEmail.split("@")[0]}...`}
					rows={5}
					className="w-full resize-none bg-transparent text-label-sm text-text-strong-950 placeholder-text-soft-400 outline-none dark:text-white"
				/>
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between rounded-b-xl border-stroke-soft-100 border-t bg-bg-weak-50/30 px-4 py-2.5 dark:border-stroke-soft-100/30 dark:bg-neutral-900/20">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={onSend}
						disabled={!replyBody.trim()}
						className="flex items-center gap-1.5 rounded-lg bg-primary-base px-4 py-1.5 font-semibold text-label-sm text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
					>
						<span>Send</span>
						<svg
							className="h-3.5 w-3.5 rotate-45"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<line x1="22" y1="2" x2="11" y2="13" />
							<polygon points="22 2 15 22 11 13 2 9 22 2" />
						</svg>
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
