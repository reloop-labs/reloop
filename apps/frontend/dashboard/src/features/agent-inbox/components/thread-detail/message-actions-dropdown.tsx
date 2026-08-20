import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

type MessageActionId = "reply" | "replyAll" | "forward" | "print" | "delete";

type MenuItem = {
	id: MessageActionId;
	label: string;
	icon: "reply" | "reply-all" | "forward" | "printer" | "trash";
	isDanger?: boolean;
};

export function MessageActionsDropdown({
	onReply,
	onReplyAll,
	onForward,
	onPrint,
	onDelete,
}: {
	onReply: () => void;
	onReplyAll?: () => void;
	onForward: () => void;
	onPrint: () => void;
	onDelete: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const menuItems: MenuItem[] = [
		{ id: "reply", label: "Reply", icon: "reply" },
		...(onReplyAll
			? [
					{
						id: "replyAll" as const,
						label: "Reply all",
						icon: "reply-all" as const,
					},
				]
			: []),
		{ id: "forward", label: "Forward", icon: "forward" },
		{ id: "print", label: "Print", icon: "printer" },
		{ id: "delete", label: "Delete", icon: "trash", isDanger: true },
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setHoverIdx(undefined);
	};

	const runAction = (id: MessageActionId) => {
		switch (id) {
			case "reply":
				onReply();
				break;
			case "replyAll":
				onReplyAll?.();
				break;
			case "forward":
				onForward();
				break;
			case "print":
				onPrint();
				break;
			case "delete":
				onDelete();
				break;
		}
		handleOpenChange(false);
	};

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Dropdown.Root open={open} onOpenChange={handleOpenChange}>
				<Dropdown.Trigger asChild>
					<button
						type="button"
						className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent transition-colors duration-150 ease-out hover:bg-[var(--inbox-row-hover)]"
						aria-label="Message actions"
					>
						<Icon name="more-horizontal" className="h-4 w-4 text-mail-muted" />
					</button>
				</Dropdown.Trigger>
				<Dropdown.Content
					align="end"
					sideOffset={6}
					className="w-44 gap-0 rounded-xl p-1.5"
				>
					<div className="relative">
						{menuItems.map((item, idx) => (
							<button
								key={item.id}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => runAction(item.id)}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect &&
										hoverIdx === idx &&
										(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
								)}
							>
								<Icon
									name={item.icon}
									className={cn(
										"h-3.5 w-3.5",
										item.isDanger ? "" : "text-text-sub-600",
									)}
								/>
								<span>{item.label}</span>
							</button>
						))}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={isDanger}
						/>
					</div>
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
}
