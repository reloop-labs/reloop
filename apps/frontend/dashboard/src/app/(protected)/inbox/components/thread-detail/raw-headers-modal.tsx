"use client";

import { Icon } from "@reloop/ui/icon";

interface RawHeadersModalProps {
	thread: any;
	onClose: () => void;
}

export const RawHeadersModal = ({ thread, onClose }: RawHeadersModalProps) => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-mail-border bg-panel-light  shadow-2xl border-mail-border/30 ">
				<div className="flex items-center justify-between border-mail-border border-b p-4 border-mail-border/30">
					<h3 className="font-semibold text-sm text-mail-foreground text-mail-foreground">
						Original Message Source
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-mail-muted hover:bg-[var(--inbox-hover)]"
					>
						<Icon name="cross" className="h-4 w-4" />
					</button>
				</div>
				<div className="flex-1 select-text overflow-auto bg-offset-light/30 p-4 font-mono text-[11px] text-mail-muted /20 text-mail-muted">
					<pre className="whitespace-pre-wrap leading-relaxed">
						{JSON.stringify(
							{
								messageId: thread.id,
								mailboxId: thread.mailboxId,
								from: thread.from,
								subject: thread.subject,
								receivedAt: thread.receivedAt,
								securityLevel: thread.securityLevel,
								attachments: thread.attachments,
								timeline: thread.timeline,
							},
							null,
							2,
						)}
					</pre>
				</div>
			</div>
		</div>
	);
};
