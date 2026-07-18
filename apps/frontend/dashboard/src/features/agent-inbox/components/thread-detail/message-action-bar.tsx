import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

type ActionId = "reply" | "replyAll" | "forward";

export function MessageActionBar({
	onReply,
	onReplyAll,
	onForward,
}: {
	onReply: () => void;
	onReplyAll?: () => void;
	onForward: () => void;
}) {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const items: Array<{
		id: ActionId;
		label: string;
		icon: "reply" | "forward";
		onClick: () => void;
	}> = [
		{ id: "reply", label: "Reply", icon: "reply", onClick: onReply },
		...(onReplyAll
			? [
					{
						id: "replyAll" as const,
						label: "Reply all",
						icon: "reply" as const,
						onClick: onReplyAll,
					},
				]
			: []),
		{ id: "forward", label: "Forward", icon: "forward", onClick: onForward },
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	return (
		<div
			className="relative mt-3 mb-1 inline-flex items-center gap-0.5"
			onPointerLeave={() => setHoverIdx(undefined)}
		>
			{items.map((item, idx) => (
				<button
					key={item.id}
					ref={(el) => {
						if (el) buttonRefs.current[idx] = el;
					}}
					type="button"
					onPointerEnter={() => setHoverIdx(idx)}
					onClick={(e) => {
						e.stopPropagation();
						item.onClick();
					}}
					className={cn(
						"relative z-10 inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3",
						"font-medium text-[13px] text-mail-muted leading-none",
						"transition-[color,transform] duration-150 ease-out",
						"hover:text-mail-foreground active:scale-[0.97]",
						!currentRect && hoverIdx === idx && "text-mail-foreground",
					)}
				>
					<Icon name={item.icon} className="h-3.5 w-3.5" />
					<span>{item.label}</span>
				</button>
			))}
			<AnimatedHoverBackground
				rect={currentRect}
				tabElement={currentTab}
				className="rounded-full !bg-[var(--inbox-hover)]"
			/>
		</div>
	);
}
