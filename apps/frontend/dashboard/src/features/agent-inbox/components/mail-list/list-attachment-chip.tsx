import { cn } from "@reloop/ui/cn";
import {
	ATTACHMENT_KIND_ACCENT,
	attachmentFileKind,
	attachmentKindLabel,
} from "../thread-detail/attachment-file-kind";

export function ListAttachmentChip({
	filename,
	contentType,
}: {
	filename: string;
	contentType?: string;
}) {
	const kind = attachmentFileKind(filename, contentType);
	const label = attachmentKindLabel(kind);

	return (
		<span
			className={cn(
				"inline-flex max-w-[200px] items-center gap-1.5",
				"rounded-full border border-black/8 bg-white py-[3px] pr-2.5 pl-1",
				"shadow-[0_1px_1px_rgba(15,23,42,0.04)]",
				"dark:border-white/10 dark:bg-[#1c1c1c]",
			)}
			title={filename}
		>
			<span
				aria-hidden
				className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] font-bold text-[6.5px] text-white tracking-tight"
				style={{ background: ATTACHMENT_KIND_ACCENT[kind] }}
			>
				{label.slice(0, 3)}
			</span>
			<span className="min-w-0 truncate text-[12.5px] text-text-sub-600 dark:text-white/70">
				{filename}
			</span>
		</span>
	);
}
