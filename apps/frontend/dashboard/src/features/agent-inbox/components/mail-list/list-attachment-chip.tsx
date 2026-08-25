import { cn } from "@reloop/ui/cn";
import { FileTypeIcon } from "../thread-detail/file-type-icon";

export function ListAttachmentChip({ filename }: { filename: string }) {
	return (
		<span
			className={cn(
				"inline-flex max-w-[200px] items-center gap-1",
				"h-[20px] rounded-full border border-stroke-soft-200 bg-bg-white-0 py-0 pr-2 pl-1.5",
				"dark:border-white/10 dark:bg-[#1c1c1c]",
			)}
			title={filename}
		>
			<FileTypeIcon filename={filename} className="h-3 w-3 shrink-0" />
			<span className="min-w-0 truncate text-[12px] text-text-sub-600 leading-none dark:text-white/70">
				{filename}
			</span>
		</span>
	);
}
