"use client";

import { cn } from "@reloop/ui/cn";
import { Forward, Reply, ReplyAll } from "lucide-react";

type ZeroFooterActionProps = {
	onClick: () => void;
	icon: React.ReactNode;
	text: string;
	shortcut?: string;
};

const ZeroFooterAction = ({
	onClick,
	icon,
	text,
	shortcut,
}: ZeroFooterActionProps) => (
	<button
		type="button"
		onClick={onClick}
		className="inline-flex h-7 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-md border-none bg-[#313131] px-1.5 transition-colors hover:bg-[#3d3d3d]"
	>
		{icon}
		<span className="pr-1 pl-0.5 text-sm leading-none text-white">{text}</span>
		{shortcut && (
			<kbd
				className={cn(
					"-me-1 ms-auto hidden h-6 max-h-full items-center rounded-[6px] border border-white/10 bg-[#404040] px-1.5 font-mono text-white text-xs leading-6 md:inline-flex",
				)}
			>
				{shortcut}
			</kbd>
		)}
	</button>
);

export const ZeroThreadFooter = ({
	onReply,
	onReplyAll,
	onForward,
}: {
	onReply: () => void;
	onReplyAll: () => void;
	onForward: () => void;
}) => (
	<div className="flex shrink-0 gap-2 border-mail-border/40 border-t px-4 py-3">
		<ZeroFooterAction
			onClick={onReply}
			icon={<Reply className="h-3.5 w-3.5 fill-[#9B9B9B] stroke-none" />}
			text="Reply"
			shortcut="r"
		/>
		<ZeroFooterAction
			onClick={onReplyAll}
			icon={<ReplyAll className="h-3.5 w-3.5 fill-[#9B9B9B] stroke-none" />}
			text="Reply All"
			shortcut="a"
		/>
		<ZeroFooterAction
			onClick={onForward}
			icon={<Forward className="h-3.5 w-3.5 fill-[#9B9B9B] stroke-none" />}
			text="Forward"
			shortcut="f"
		/>
	</div>
);
