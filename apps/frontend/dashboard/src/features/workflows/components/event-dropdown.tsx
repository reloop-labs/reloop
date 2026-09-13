"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as ContextMenu from "@reloop/ui/context-menu";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import type { CustomEvent } from "../hooks/use-custom-events-api";

export type EventActionsHandlers = {
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onOpenChange: (open: boolean, id: string) => void;
};

type MenuItemId = "edit" | "copy_key" | "copy_id" | "delete";
type CopiedItem = "key" | "id" | null;

function useEventActionsMenu(
	event: CustomEvent,
	handlers: EventActionsHandlers,
) {
	const [open, setOpen] = useState(false);
	const [contextMenuKey, setContextMenuKey] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [copiedItem, setCopiedItem] = useState<CopiedItem>(null);
	const buttonRefs = useRef<HTMLElement[]>([]);
	const keepOpenRef = useRef(false);

	const menuItems = useMemo(
		() =>
			[
				{
					id: "edit" as const,
					label: "Edit trigger",
					icon: "pencil" as const,
					isDanger: false,
				},
				{
					id: "copy_key" as const,
					label: "Copy key",
					icon: "copy" as const,
					isDanger: false,
				},
				{
					id: "copy_id" as const,
					label: "Copy trigger ID",
					icon: "copy" as const,
					isDanger: false,
				},
				{
					id: "delete" as const,
					label: "Delete trigger",
					icon: "trash" as const,
					isDanger: true,
				},
			] satisfies {
				id: MenuItemId;
				label: string;
				icon: "pencil" | "copy" | "trash";
				isDanger: boolean;
			}[],
		[],
	);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = useCallback(
		(next: boolean) => {
			if (!next && keepOpenRef.current) return;
			setOpen(next);
			if (!next) setHoverIdx(undefined);
			handlers.onOpenChange(next, event.id);
		},
		[event.id, handlers],
	);

	const dismissMenu = useCallback(() => {
		setContextMenuKey((key) => key + 1);
		handleOpenChange(false);
	}, [handleOpenChange]);

	const handleCopy = useCallback(
		async (kind: "key" | "id", value: string, label: string) => {
			keepOpenRef.current = true;
			try {
				await navigator.clipboard.writeText(value);
				setCopiedItem(kind);
				toast.success(`${label} copied to clipboard`);
				setTimeout(() => {
					setCopiedItem(null);
					keepOpenRef.current = false;
					dismissMenu();
				}, 600);
			} catch {
				keepOpenRef.current = false;
				toast.error(`Failed to copy ${label.toLowerCase()}`);
				dismissMenu();
			}
		},
		[dismissMenu],
	);

	const handleItemClick = useCallback(
		async (id: MenuItemId, e?: Event | React.SyntheticEvent) => {
			switch (id) {
				case "edit":
					handlers.onEdit(event.id);
					dismissMenu();
					break;
				case "copy_key":
					e?.preventDefault();
					await handleCopy("key", event.key, "Trigger key");
					break;
				case "copy_id":
					e?.preventDefault();
					await handleCopy("id", event.id, "Trigger ID");
					break;
				case "delete":
					handlers.onDelete(event.id);
					dismissMenu();
					break;
			}
		},
		[event, handlers, dismissMenu, handleCopy],
	);

	return {
		open,
		contextMenuKey,
		menuItems,
		hoverIdx,
		setHoverIdx,
		copiedItem,
		buttonRefs,
		currentTab,
		currentRect,
		isDanger,
		handleOpenChange,
		handleItemClick,
	};
}

function EventActionsMenuItems({
	menu,
	variant = "dropdown",
}: {
	menu: ReturnType<typeof useEventActionsMenu>;
	variant?: "dropdown" | "context";
}) {
	const {
		menuItems,
		hoverIdx,
		setHoverIdx,
		copiedItem,
		buttonRefs,
		currentTab,
		currentRect,
		isDanger,
		handleItemClick,
	} = menu;

	const itemClassName = (item: (typeof menuItems)[number], idx: number) =>
		cn(
			"relative z-10 flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs outline-none",
			item.isDanger
				? "text-error-base hover:text-error-base"
				: "text-text-sub-600 hover:text-text-strong-950",
			!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
		);

	return (
		<div className="relative">
			{menuItems.map((item, idx) => {
				const copiedKind =
					item.id === "copy_key" ? "key" : item.id === "copy_id" ? "id" : null;
				const isThisCopied = copiedKind !== null && copiedItem === copiedKind;

				const content = (
					<>
						<div className="relative flex size-3.5 shrink-0 items-center justify-center">
							<AnimatePresence mode="wait" initial={false}>
								{isThisCopied ? (
									<motion.div
										key="check"
										initial={{ scale: 0.5, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.5, opacity: 0 }}
										transition={{ duration: 0.15 }}
									>
										<Icon name="check" className="size-3.5 text-success-base" />
									</motion.div>
								) : (
									<motion.div
										key="icon"
										initial={{ scale: 0.5, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.5, opacity: 0 }}
										transition={{ duration: 0.15 }}
									>
										<Icon name={item.icon} className="size-3.5" />
									</motion.div>
								)}
							</AnimatePresence>
						</div>
						<span className="flex-1 font-medium">
							{isThisCopied
								? item.id === "copy_key"
									? "Copied key!"
									: "Copied ID!"
								: item.label}
						</span>
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
							onSelect={(e) => {
								if (item.id === "copy_key" || item.id === "copy_id") {
									e.preventDefault();
								}
								void handleItemClick(item.id, e);
							}}
							className={itemClassName(item, idx)}
						>
							{content}
						</ContextMenu.Item>
					);
				}

				return (
					<Dropdown.Item
						key={item.id}
						ref={(el) => {
							if (el) buttonRefs.current[idx] = el;
						}}
						onPointerEnter={() => setHoverIdx(idx)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onSelect={(e) => void handleItemClick(item.id, e)}
						className={itemClassName(item, idx)}
					>
						{content}
					</Dropdown.Item>
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

export function EventDropdown({
	event,
	handlers,
}: {
	event: CustomEvent;
	handlers: EventActionsHandlers;
}) {
	const menu = useEventActionsMenu(event, handlers);

	return (
		<Dropdown.Root open={menu.open} onOpenChange={menu.handleOpenChange}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xsmall"
					aria-label={`Actions for ${event.name}`}
					className="h-6 w-6 p-0 text-text-sub-600 hover:text-text-strong-950"
				>
					<Icon name="more-horizontal" className="h-4 w-4" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				align="end"
				sideOffset={4}
				className="w-48 overflow-hidden rounded-2xl p-1.5"
			>
				<EventActionsMenuItems menu={menu} />
			</Dropdown.Content>
		</Dropdown.Root>
	);
}

export function EventRowContextMenu({
	event,
	handlers,
	children,
}: {
	event: CustomEvent;
	handlers: EventActionsHandlers;
	children: ReactNode;
}) {
	const menu = useEventActionsMenu(event, handlers);

	return (
		<ContextMenu.Root
			key={menu.contextMenuKey}
			onOpenChange={menu.handleOpenChange}
		>
			<ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
			<ContextMenu.Content
				className="w-48 overflow-hidden rounded-2xl p-1.5"
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<EventActionsMenuItems menu={menu} variant="context" />
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
