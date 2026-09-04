"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as ContextMenu from "@reloop/ui/context-menu";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import type { Workflow } from "../workflow-types";

export type WorkflowActionsHandlers = {
	onToggleStatus: (workflow: Workflow) => Promise<void> | void;
	onDuplicate: (id: string) => Promise<void> | void;
	onDelete: (id: string) => void;
	onOpenChange: (open: boolean, id: string) => void;
};

type MenuItemId = "view" | "toggle" | "duplicate" | "copy_id" | "delete";

function useWorkflowActionsMenu(
	workflow: Workflow,
	handlers: WorkflowActionsHandlers,
) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [contextMenuKey, setContextMenuKey] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [copiedItem, setCopiedItem] = useState<"id" | null>(null);
	const buttonRefs = useRef<HTMLElement[]>([]);
	const keepOpenRef = useRef(false);

	const menuItems = useMemo(() => {
		const items: {
			id: MenuItemId;
			label: string;
			icon: "info-outline" | "check-circle" | "cross-circle" | "copy" | "trash";
			isDanger: boolean;
		}[] = [
			{
				id: "view",
				label: "View details",
				icon: "info-outline",
				isDanger: false,
			},
			{
				id: "toggle",
				label:
					workflow.status === "active"
						? "Pause automation"
						: "Activate automation",
				icon: workflow.status === "active" ? "cross-circle" : "check-circle",
				isDanger: false,
			},
			{
				id: "duplicate",
				label: "Duplicate",
				icon: "copy",
				isDanger: false,
			},
			{
				id: "copy_id",
				label: "Copy automation ID",
				icon: "copy",
				isDanger: false,
			},
			{
				id: "delete",
				label: "Delete automation",
				icon: "trash",
				isDanger: true,
			},
		];
		return items;
	}, [workflow.status]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = useCallback(
		(next: boolean) => {
			if (!next && keepOpenRef.current) return;
			setOpen(next);
			if (!next) setHoverIdx(undefined);
			handlers.onOpenChange(next, workflow.id);
		},
		[workflow.id, handlers.onOpenChange],
	);

	const handleItemSelect = useCallback(
		async (id: MenuItemId, e?: Event | React.SyntheticEvent) => {
			switch (id) {
				case "view": {
					router.push(`/automation/${workflow.id}`);
					break;
				}
				case "toggle": {
					await handlers.onToggleStatus(workflow);
					break;
				}
				case "duplicate": {
					await handlers.onDuplicate(workflow.id);
					break;
				}
				case "copy_id": {
					e?.preventDefault();
					keepOpenRef.current = true;
					try {
						await navigator.clipboard.writeText(workflow.id);
						setCopiedItem("id");
						toast.success("Automation ID copied to clipboard");
						setTimeout(() => {
							setCopiedItem(null);
							keepOpenRef.current = false;
							setOpen(false);
							setContextMenuKey((k) => k + 1);
							handlers.onOpenChange(false, workflow.id);
						}, 600);
					} catch {
						keepOpenRef.current = false;
						toast.error("Failed to copy automation ID");
					}
					break;
				}
				case "delete": {
					handlers.onDelete(workflow.id);
					break;
				}
			}
		},
		[workflow, handlers, router],
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
		handleItemSelect,
	};
}

export function WorkflowDropdown({
	workflow,
	handlers,
}: {
	workflow: Workflow;
	handlers: WorkflowActionsHandlers;
}) {
	const {
		open,
		menuItems,
		hoverIdx,
		setHoverIdx,
		copiedItem,
		buttonRefs,
		currentTab,
		currentRect,
		isDanger,
		handleOpenChange,
		handleItemSelect,
	} = useWorkflowActionsMenu(workflow, handlers);

	return (
		<Dropdown.Root open={open} onOpenChange={handleOpenChange}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xsmall"
					aria-label="Actions"
					className="h-6 w-6 p-0 text-text-sub-600 hover:text-text-strong-950"
				>
					<Icon name="dots-horizontal" className="h-4 w-4" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				align="end"
				sideOffset={4}
				className="w-48 overflow-hidden rounded-2xl p-1.5"
			>
				<div className="relative">
					{menuItems.map((item, idx) => (
						<Dropdown.Item
							key={item.id}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onSelect={(e) => void handleItemSelect(item.id, e)}
							className={cn(
								"relative z-10 flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs outline-none",
								item.isDanger
									? "text-error-base hover:text-error-base"
									: "text-text-sub-600 hover:text-text-strong-950",
								!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
							)}
						>
							<div className="relative flex size-3.5 shrink-0 items-center justify-center">
								<AnimatePresence mode="wait" initial={false}>
									{item.id === "copy_id" && copiedItem === "id" ? (
										<motion.div
											key="check"
											initial={{ scale: 0.5, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											exit={{ scale: 0.5, opacity: 0 }}
											transition={{ duration: 0.15 }}
										>
											<Icon
												name="check"
												className="size-3.5 text-success-base"
											/>
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
							<span className="flex-1 font-medium">{item.label}</span>
						</Dropdown.Item>
					))}
					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={isDanger}
					/>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}

export function WorkflowRowContextMenu({
	workflow,
	handlers,
	children,
}: {
	workflow: Workflow;
	handlers: WorkflowActionsHandlers;
	children: ReactNode;
}) {
	const {
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
		handleItemSelect,
	} = useWorkflowActionsMenu(workflow, handlers);

	return (
		<ContextMenu.Root key={contextMenuKey} onOpenChange={handleOpenChange}>
			<ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
			<ContextMenu.Content
				className="w-48 overflow-hidden rounded-2xl p-1.5"
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<div className="relative">
					{menuItems.map((item, idx) => (
						<ContextMenu.Item
							key={item.id}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onSelect={(e) => void handleItemSelect(item.id, e)}
							className={cn(
								"relative z-10 flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs outline-none",
								item.isDanger
									? "text-error-base hover:text-error-base"
									: "text-text-sub-600 hover:text-text-strong-950",
								!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
							)}
						>
							<div className="relative flex size-3.5 shrink-0 items-center justify-center">
								<AnimatePresence mode="wait" initial={false}>
									{item.id === "copy_id" && copiedItem === "id" ? (
										<motion.div
											key="check"
											initial={{ scale: 0.5, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											exit={{ scale: 0.5, opacity: 0 }}
											transition={{ duration: 0.15 }}
										>
											<Icon
												name="check"
												className="size-3.5 text-success-base"
											/>
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
							<span className="flex-1 font-medium">{item.label}</span>
						</ContextMenu.Item>
					))}
					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentTab}
						isDanger={isDanger}
					/>
				</div>
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
