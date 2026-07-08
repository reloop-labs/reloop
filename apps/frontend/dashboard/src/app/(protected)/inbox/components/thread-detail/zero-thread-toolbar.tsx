"use client";

import * as Dropdown from "@reloop/ui/dropdown";
import { cn } from "@reloop/ui/cn";
import {
	Archive,
	MoreHorizontal,
	Printer,
	Reply,
	Star,
	Trash2,
	X,
} from "lucide-react";

const iconBtn =
	"inline-flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#313131] transition-colors hover:bg-[#404040]";

export const ZeroThreadToolbar = ({
	isStarred,
	onClose,
	onReplyAll,
	onToggleStar,
	onArchive,
	onDelete,
	onPrint,
	onMarkSpam,
	showBack,
}: {
	isStarred: boolean;
	onClose?: () => void;
	onReplyAll: () => void;
	onToggleStar: () => void;
	onArchive: () => void;
	onDelete: () => void;
	onPrint: () => void;
	onMarkSpam: () => void;
	showBack?: boolean;
}) => (
	<div className="flex shrink-0 items-center px-1 pb-[10px] md:px-3 md:pb-[11px] md:pt-3">
		<div className="flex flex-1 items-center gap-2">
			{(showBack || onClose) && (
				<button
					type="button"
					onClick={onClose}
					className={cn(iconBtn, "md:hidden")}
					aria-label="Close"
				>
					<X className="h-3.5 w-3.5 text-mail-muted" />
				</button>
			)}
			{onClose && (
				<button
					type="button"
					onClick={onClose}
					className={cn(iconBtn, "hidden md:inline-flex")}
					aria-label="Close"
				>
					<X className="h-3.5 w-3.5 text-mail-muted" />
				</button>
			)}
		</div>

		<div className="flex items-center gap-2">
			<button
				type="button"
				onClick={onReplyAll}
				className="inline-flex h-7 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-lg border-none bg-[#313131] px-1.5 transition-colors hover:bg-[#404040]"
			>
				<Reply className="h-3.5 w-3.5 text-[#9B9B9B]" />
				<span className="whitespace-nowrap pr-1 text-sm leading-none text-mail-foreground">
					Reply all
				</span>
			</button>

			<button
				type="button"
				onClick={onToggleStar}
				className={iconBtn}
				aria-label={isStarred ? "Unstar" : "Star"}
			>
				<Star
					className={cn(
						"h-4 w-4",
						isStarred
							? "fill-yellow-400 stroke-yellow-400"
							: "fill-transparent stroke-[#9D9D9D]",
					)}
				/>
			</button>

			<button
				type="button"
				onClick={onArchive}
				className={iconBtn}
				aria-label="Archive"
			>
				<Archive className="h-3.5 w-3.5 text-mail-muted" />
			</button>

			<button
				type="button"
				onClick={onDelete}
				className="inline-flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-[#6E2532] bg-[#411D23] transition-colors hover:bg-[#6E2532]/70"
				aria-label="Delete"
			>
				<Trash2 className="h-3.5 w-3.5 text-[#F43F5E]" />
			</button>

			<Dropdown.Root>
				<Dropdown.Trigger asChild>
					<button type="button" className={iconBtn} aria-label="More actions">
						<MoreHorizontal className="h-4 w-4 text-mail-muted" />
					</button>
				</Dropdown.Trigger>
				<Dropdown.Content
					align="end"
					className="min-w-44 border-mail-border bg-[#313131] p-1"
				>
					<Dropdown.Item
						className="rounded-md text-[13px] text-mail-muted hover:bg-[#404040]"
						onSelect={onPrint}
					>
						<Printer className="mr-2 h-4 w-4" />
						Print thread
					</Dropdown.Item>
					<Dropdown.Item
						className="rounded-md text-[13px] text-mail-muted hover:bg-[#404040]"
						onSelect={onMarkSpam}
					>
						Move to spam
					</Dropdown.Item>
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	</div>
);
