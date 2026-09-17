"use client";

import { formatBytes } from "@fe/console/lib/format";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

export type AttachmentItem = {
	id?: string;
	filename: string;
	contentType?: string;
	size?: number;
	contentDisposition?: string | null;
	contentId?: string | null;
};

export function AttachmentChips({
	attachments,
	className,
	onAttachmentClick,
}: {
	attachments?: AttachmentItem[] | null;
	className?: string;
	onAttachmentClick?: (attachment: AttachmentItem) => void;
}) {
	if (!attachments || attachments.length === 0) {
		return <span className="text-[12px] text-text-sub-600">—</span>;
	}

	return (
		<div
			className={cn(
				"flex max-w-[320px] flex-wrap items-center gap-1.5 py-0.5",
				className,
			)}
		>
			{attachments.map((att, i) => {
				const tooltipParts = [
					att.filename,
					att.contentType,
					att.size != null ? formatBytes(att.size) : null,
				].filter(Boolean);

				const content = (
					<>
						<Icon
							name="paperclip"
							className="h-3 w-3 shrink-0 text-text-soft-400"
						/>
						<span className="max-w-[130px] truncate font-medium text-[11px] text-text-strong-950 dark:text-neutral-200">
							{att.filename}
						</span>
						{att.size != null ? (
							<span className="shrink-0 text-[10px] text-text-sub-600 dark:text-neutral-400">
								{formatBytes(att.size)}
							</span>
						) : null}
					</>
				);

				if (onAttachmentClick) {
					return (
						<button
							key={att.id || `${att.filename}-${i}`}
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onAttachmentClick(att);
							}}
							title={tooltipParts.join(" · ")}
							className="inline-flex max-w-[200px] items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-weak-50/70 px-1.5 py-0.5 text-left transition-colors hover:border-stroke-strong-950/20 hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
						>
							{content}
						</button>
					);
				}

				return (
					<span
						key={att.id || `${att.filename}-${i}`}
						title={tooltipParts.join(" · ")}
						className="inline-flex max-w-[200px] items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-weak-50/70 px-1.5 py-0.5 dark:border-white/10 dark:bg-white/[0.04]"
					>
						{content}
					</span>
				);
			})}
		</div>
	);
}
