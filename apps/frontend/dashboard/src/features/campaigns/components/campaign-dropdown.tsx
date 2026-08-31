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
import type { Campaign } from "../campaign-types";

export type CampaignActionsHandlers = {
	onSend: (id: string) => Promise<void> | void;
	onDuplicate: (id: string) => Promise<void> | void;
	onDelete: (id: string) => void;
	onOpenChange: (open: boolean, id: string) => void;
};

type MenuItemId = "edit" | "view" | "send" | "duplicate" | "copy_id" | "delete";

function useCampaignActionsMenu(
	campaign: Campaign,
	handlers: CampaignActionsHandlers,
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
			icon: "pencil" | "info-outline" | "mail-send" | "copy" | "trash";
			isDanger: boolean;
		}[] = [];

		if (campaign.status === "draft") {
			items.push({
				id: "edit",
				label: "Edit draft",
				icon: "pencil",
				isDanger: false,
			});
		}

		items.push({
			id: "view",
			label: "View details",
			icon: "info-outline",
			isDanger: false,
		});

		if (campaign.status === "draft") {
			items.push({
				id: "send",
				label: "Send now",
				icon: "mail-send",
				isDanger: false,
			});
		}
		items.push(
			{
				id: "duplicate",
				label: "Duplicate",
				icon: "copy",
				isDanger: false,
			},
			{
				id: "copy_id",
				label: "Copy campaign ID",
				icon: "copy",
				isDanger: false,
			},
			{
				id: "delete",
				label: "Delete campaign",
				icon: "trash",
				isDanger: true,
			},
		);
		return items;
	}, [campaign.status]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = useCallback(
		(next: boolean) => {
			if (!next && keepOpenRef.current) return;
			setOpen(next);
			if (!next) setHoverIdx(undefined);
			handlers.onOpenChange(next, campaign.id);
		},
		[campaign.id, handlers.onOpenChange],
	);

	const dismissMenu = useCallback(() => {
		setContextMenuKey((key) => key + 1);
		handleOpenChange(false);
	}, [handleOpenChange]);

	const handleCopyId = async () => {
		keepOpenRef.current = true;
		try {
			await navigator.clipboard.writeText(campaign.id);
			setCopiedItem("id");
			setTimeout(() => {
				setCopiedItem(null);
				keepOpenRef.current = false;
				dismissMenu();
			}, 900);
		} catch {
			toast.error("Failed to copy ID");
			keepOpenRef.current = false;
			dismissMenu();
		}
	};

	const handleItemClick = async (id: MenuItemId) => {
		if (id === "edit") {
			router.push(`/campaigns/${campaign.id}/edit`);
			dismissMenu();
		} else if (id === "view") {
			router.push(`/campaigns/${campaign.id}`);
			dismissMenu();
		} else if (id === "send") {
			dismissMenu();
			await handlers.onSend(campaign.id);
		} else if (id === "duplicate") {
			dismissMenu();
			await handlers.onDuplicate(campaign.id);
		} else if (id === "copy_id") {
			void handleCopyId();
		} else if (id === "delete") {
			handlers.onDelete(campaign.id);
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
		copiedItem,
		handleItemClick,
	};
}

function CampaignActionsMenuItems({
	menu,
	variant = "dropdown",
}: {
	menu: ReturnType<typeof useCampaignActionsMenu>;
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
		copiedItem,
		handleItemClick,
	} = menu;

	const itemClassName = (item: (typeof menuItems)[number], idx: number) =>
		cn(
			"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
			item.isDanger ? "text-error-base" : "text-text-strong-950",
			!currentRect &&
				hoverIdx === idx &&
				(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
			variant === "context" &&
				"data-[disabled]:pointer-events-none data-[highlighted]:bg-transparent",
		);

	return (
		<div className="relative">
			{menuItems.map((item, idx) => {
				const isCopyId = item.id === "copy_id";
				const isThisCopied = isCopyId && copiedItem === "id";

				const label = isCopyId ? (
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.div
							key={isThisCopied ? "copied" : "idle"}
							transition={{
								type: "spring",
								duration: 0.25,
								bounce: 0,
							}}
							initial={{ opacity: 0, y: -14 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 14 }}
							className="flex items-center gap-2"
						>
							<Icon
								name={isThisCopied ? "check-circle" : "copy"}
								className={cn(
									"h-3.5 w-3.5 shrink-0",
									isThisCopied ? "text-success-base" : "text-text-sub-600",
								)}
							/>
							<span>{isThisCopied ? "Copied ID!" : item.label}</span>
						</motion.div>
					</AnimatePresence>
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
								if (item.id === "copy_id") {
									event.preventDefault();
								}
								void handleItemClick(item.id);
							}}
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

const menuContentClassName = "w-48 gap-0 rounded-xl p-1.5";

export function CampaignDropdown({
	campaign,
	handlers,
}: {
	campaign: Campaign;
	handlers: CampaignActionsHandlers;
}) {
	const menu = useCampaignActionsMenu(campaign, handlers);

	return (
		<div
			className="flex items-center justify-end"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Dropdown.Root open={menu.open} onOpenChange={menu.handleOpenChange}>
				<Dropdown.Trigger asChild>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="aspect-square h-7 w-7 rounded-lg p-0"
						aria-label={`Actions for ${campaign.name}`}
					>
						<Icon
							name="more-horizontal"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
					</Button.Root>
				</Dropdown.Trigger>
				<Dropdown.Content
					align="end"
					sideOffset={6}
					className={menuContentClassName}
					onCloseAutoFocus={(e) => e.preventDefault()}
				>
					<CampaignActionsMenuItems menu={menu} />
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
}

export function CampaignRowContextMenu({
	campaign,
	handlers,
	children,
}: {
	campaign: Campaign;
	handlers: CampaignActionsHandlers;
	children: ReactNode;
}) {
	const menu = useCampaignActionsMenu(campaign, handlers);

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
				<CampaignActionsMenuItems menu={menu} variant="context" />
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
