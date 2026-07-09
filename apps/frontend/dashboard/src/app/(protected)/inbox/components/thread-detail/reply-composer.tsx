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
		<div className="mx-5 my-4 rounded-xl border border-mail-border bg-panel-light shadow-sm dark:bg-panel-dark">
			{/* Header */}
			<div className="flex items-center justify-between border-mail-border border-mail-border/30 border-b px-4 py-3">
				<div className="flex flex-col gap-1 text-label-sm">
					<div className="flex items-center gap-2 text-mail-muted">
						<span className="w-12">To:</span>
						<span className="font-semibold text-mail-foreground text-mail-foreground">
							{displayTo}
						</span>
					</div>
					<div className="flex items-center gap-2 text-mail-muted">
						<span className="w-12">From:</span>
						<span className="text-mail-muted text-mail-muted">{fromEmail}</span>
					</div>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-mail-muted hover:bg-[var(--inbox-hover)]"
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
					className="w-full resize-none bg-transparent text-label-sm text-mail-foreground text-mail-foreground placeholder-text-soft-400 outline-none"
				/>
			</div>

			{/* Footer */}
			<div className="/20 flex items-center justify-between rounded-b-xl border-mail-border border-mail-border/30 border-t bg-offset-light/30 px-4 py-2.5">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={onSend}
						disabled={!replyBody.trim()}
						className="flex items-center gap-1.5 rounded-lg bg-mail-primary px-4 py-1.5 font-semibold text-label-sm text-panel-light transition-all hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
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
						className="rounded-lg p-1.5 text-mail-muted hover:bg-[var(--inbox-hover)] hover:bg-offset-light hover:text-mail-foreground"
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
					className="rounded-lg p-1.5 text-mail-muted hover:bg-red-50 hover:bg-red-950/20 hover:text-error-base"
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
