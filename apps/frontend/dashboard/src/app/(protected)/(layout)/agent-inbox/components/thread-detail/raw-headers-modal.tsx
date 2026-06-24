"use client";

import { Icon } from "@reloop/ui/icon";

interface RawHeadersModalProps {
	thread: any;
	onClose: () => void;
}

export const RawHeadersModal = ({ thread, onClose }: RawHeadersModalProps) => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-2xl dark:border-stroke-soft-100/30 dark:bg-neutral-900">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b p-4 dark:border-stroke-soft-100/30">
					<h3 className="font-semibold text-sm text-text-strong-950 dark:text-white">
						Original Message Source
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-text-soft-400 hover:bg-bg-weak-50 dark:hover:bg-white/10"
					>
						<Icon name="cross" className="h-4 w-4" />
					</button>
				</div>
				<div className="flex-1 select-text overflow-auto bg-bg-weak-50/30 p-4 font-mono text-[11px] text-text-sub-600 dark:bg-neutral-950/20 dark:text-neutral-400">
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
