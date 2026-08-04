import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as ContextMenu from "@reloop/ui/context-menu";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { type ReactNode, useCallback, useRef, useState } from "react";
import type { Group } from "#/features/contacts/hooks/use-contacts-query";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export type GroupActionsHandlers = {
	onEdit?: (group: Group) => void;
	onDelete: (group: Group) => void;
	isDeleting?: boolean;
	onOpenChange?: (open: boolean) => void;
};

type MenuItemId = "view" | "edit" | "copy-name" | "copy-id" | "delete";
type CopiedField = "name" | "id" | null;

function useGroupActionsMenu(group: Group, handlers: GroupActionsHandlers) {
	const router = useRouter();
	const [, setModal] = useQueryState("modal");
	const [, setId] = useQueryState("id");
	const [open, setOpen] = useState(false);
	const [contextMenuKey, setContextMenuKey] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [copiedField, setCopiedField] = useState<CopiedField>(null);
	const buttonRefs = useRef<HTMLElement[]>([]);
	const keepOpenRef = useRef(false);
	const isDeleting = handlers.isDeleting ?? false;

	const menuItems = [
		{
			id: "view" as const,
			label: "View Details",
			icon: "info-outline" as const,
			isDanger: false,
		},
		{
			id: "edit" as const,
			label: "Rename group",
			icon: "edit" as const,
			isDanger: false,
		},
		{
			id: "copy-name" as const,
			label: copiedField === "name" ? "Copied name!" : "Copy group name",
			icon: (copiedField === "name" ? "check-circle" : "copy") as
				| "check-circle"
				| "copy",
			isDanger: false,
		},
		{
			id: "copy-id" as const,
			label: copiedField === "id" ? "Copied ID!" : "Copy group ID",
			icon: (copiedField === "id" ? "check-circle" : "copy") as
				| "check-circle"
				| "copy",
			isDanger: false,
		},
		{
			id: "delete" as const,
			label: "Delete group",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = useCallback(
		(next: boolean) => {
			if (!next && keepOpenRef.current) return;
			setOpen(next);
			if (!next) {
				setHoverIdx(undefined);
				setCopiedField(null);
			}
			handlers.onOpenChange?.(next);
		},
		[handlers.onOpenChange],
	);

	const dismissMenu = useCallback(() => {
		setContextMenuKey((key) => key + 1);
		handleOpenChange(false);
	}, [handleOpenChange]);

	const copyAndFlash = async (field: "name" | "id", value: string) => {
		keepOpenRef.current = true;
		try {
			await navigator.clipboard.writeText(value);
			setCopiedField(field);
			setTimeout(() => {
				setCopiedField(null);
				keepOpenRef.current = false;
				dismissMenu();
			}, 900);
		} catch {
			keepOpenRef.current = false;
			dismissMenu();
		}
	};

	const handleItemClick = async (itemId: MenuItemId) => {
		if (itemId === "view") {
			router.push(`/contacts/groups/${group.id}`);
			dismissMenu();
		} else if (itemId === "edit") {
			if (handlers.onEdit) {
				handlers.onEdit(group);
			} else {
				void setId(group.id);
				void setModal("edit-group");
			}
			dismissMenu();
		} else if (itemId === "copy-name") {
			await copyAndFlash("name", group.name || "");
		} else if (itemId === "copy-id") {
			await copyAndFlash("id", group.id);
		} else if (itemId === "delete") {
			handlers.onDelete(group);
			dismissMenu();
		}
	};

	return {
		open,
		contextMenuKey,
		handleOpenChange,
		menuItems,
		hoverIdx,
		setHoverIdx,
		buttonRefs,
		currentTab,
		currentRect,
		isDanger,
		copiedField,
		isDeleting,
		handleItemClick,
	};
}

function GroupActionsMenuItems({
	menu,
	variant = "dropdown",
}: {
	menu: ReturnType<typeof useGroupActionsMenu>;
	variant?: "dropdown" | "context";
}) {
	const {
		menuItems,
		hoverIdx,
		setHoverIdx,
		buttonRefs,
		currentTab,
		currentRect,
		isDanger,
		copiedField,
		isDeleting,
		handleItemClick,
	} = menu;

	const itemClassName = (item: (typeof menuItems)[number], idx: number) =>
		cn(
			"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
			item.isDanger ? "text-error-base" : "text-text-strong-950",
			!currentRect &&
				hoverIdx === idx &&
				(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
			isDeleting && item.id === "delete" && "cursor-not-allowed opacity-50",
			variant === "context" &&
				"data-[disabled]:pointer-events-none data-[highlighted]:bg-transparent",
		);

	const isCopyItem = (id: string) => id === "copy-name" || id === "copy-id";

	const renderCopyLabel = (field: "name" | "id") => {
		const isCopied = copiedField === field;
		const idleLabel = field === "name" ? "Copy group name" : "Copy group ID";
		const doneLabel = field === "name" ? "Copied name!" : "Copied ID!";
		return (
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.div
					key={isCopied ? "copied" : "idle"}
					transition={{ type: "spring", duration: 0.25, bounce: 0 }}
					initial={{ opacity: 0, y: -14 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 14 }}
					className="flex items-center gap-2"
				>
					<Icon
						name={isCopied ? "check-circle" : "copy"}
						className={cn(
							"h-3.5 w-3.5 shrink-0",
							isCopied ? "text-success-base" : "text-text-sub-600",
						)}
					/>
					<span>{isCopied ? doneLabel : idleLabel}</span>
				</motion.div>
			</AnimatePresence>
		);
	};

	return (
		<div className="relative">
			{menuItems.map((item, idx) => {
				const disabled = item.id === "delete" && isDeleting;
				const label = isCopyItem(item.id) ? (
					renderCopyLabel(item.id === "copy-name" ? "name" : "id")
				) : (
					<>
						<Icon
							name={item.icon}
							className={cn(
								"h-3.5 w-3.5 shrink-0",
								item.isDanger ? "" : "text-text-sub-600",
							)}
						/>
						<span>{item.label}</span>
					</>
				);

				if (variant === "context") {
					return (
						<ContextMenu.Item
							key={item.id}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onSelect={(event) => {
								if (isCopyItem(item.id)) event.preventDefault();
								void handleItemClick(item.id);
							}}
							disabled={disabled}
							className={itemClassName(item, idx)}
						>
							{label}
						</ContextMenu.Item>
					);
				}

				return (
					<button
						key={item.id}
						ref={(el) => {
							if (el) buttonRefs.current[idx] = el;
						}}
						type="button"
						onPointerEnter={() => setHoverIdx(idx)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onClick={() => void handleItemClick(item.id)}
						disabled={disabled}
						className={itemClassName(item, idx)}
					>
						{label}
					</button>
				);
			})}
			<AnimatedHoverBackground
				rect={currentRect}
				tabElement={currentTab}
				isDanger={isDanger}
			/>
		</div>
	);
}

const menuContentClassName = "w-48 rounded-xl p-1.5";

export interface GroupDropdownProps {
	group: Group;
	onEdit?: (group: Group) => void;
	onDelete: (group: Group) => void;
	isDeleting?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const GroupDropdown = ({
	group,
	onEdit,
	onDelete,
	isDeleting = false,
	onOpenChange,
}: GroupDropdownProps) => {
	const menu = useGroupActionsMenu(group, {
		onEdit,
		onDelete,
		isDeleting,
		onOpenChange,
	});

	return (
		<PopoverRoot open={menu.open} onOpenChange={menu.handleOpenChange}>
			<PopoverTrigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					disabled={isDeleting}
				>
					<Icon name="more-horizontal" className="h-3 w-3" />
				</Button.Root>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={-10}
				className={menuContentClassName}
			>
				<GroupActionsMenuItems menu={menu} />
			</PopoverContent>
		</PopoverRoot>
	);
};

export function GroupRowContextMenu({
	group,
	onEdit,
	onDelete,
	isDeleting = false,
	onOpenChange,
	children,
}: GroupDropdownProps & { children: ReactNode }) {
	const menu = useGroupActionsMenu(group, {
		onEdit,
		onDelete,
		isDeleting,
		onOpenChange,
	});

	return (
		<ContextMenu.Root
			key={menu.contextMenuKey}
			onOpenChange={menu.handleOpenChange}
		>
			<ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
			<ContextMenu.Content
				className={menuContentClassName}
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<GroupActionsMenuItems menu={menu} variant="context" />
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
