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
import { type ReactNode, useCallback, useRef, useState } from "react";
import type { Property } from "#/features/contacts/hooks/use-contacts-query";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export type PropertyActionsHandlers = {
	onEdit: (property: Property) => void;
	onDelete: (property: Property) => void;
	onOpenChange?: (open: boolean) => void;
};

type MenuItemId =
	| "edit"
	| "copy-name"
	| "copy-id"
	| "filter-contacts"
	| "delete";

function usePropertyActionsMenu(
	property: Property,
	handlers: PropertyActionsHandlers,
) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [contextMenuKey, setContextMenuKey] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [copiedKey, setCopiedKey] = useState<"name" | "id" | null>(null);
	const buttonRefs = useRef<HTMLElement[]>([]);
	const keepOpenRef = useRef(false);

	const menuItems = [
		{
			id: "edit" as const,
			label: "Edit property",
			icon: "edit" as const,
			isDanger: false,
		},
		{
			id: "copy-name" as const,
			label: copiedKey === "name" ? "Copied name!" : "Copy name",
			icon: (copiedKey === "name" ? "check-circle" : "copy") as
				| "check-circle"
				| "copy",
			isDanger: false,
		},
		{
			id: "copy-id" as const,
			label: copiedKey === "id" ? "Copied ID!" : "Copy property ID",
			icon: (copiedKey === "id" ? "check-circle" : "copy") as
				| "check-circle"
				| "copy",
			isDanger: false,
		},
		{
			id: "filter-contacts" as const,
			label: "Filter contacts",
			icon: "filter" as const,
			isDanger: false,
		},
		{
			id: "delete" as const,
			label: "Delete property",
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
			if (!next) setHoverIdx(undefined);
			handlers.onOpenChange?.(next);
		},
		[handlers.onOpenChange],
	);

	const dismissMenu = useCallback(() => {
		setContextMenuKey((key) => key + 1);
		handleOpenChange(false);
	}, [handleOpenChange]);

	const handleItemClick = async (itemId: MenuItemId) => {
		if (itemId === "edit") {
			handlers.onEdit(property);
			dismissMenu();
		} else if (itemId === "copy-name") {
			keepOpenRef.current = true;
			try {
				await navigator.clipboard.writeText(property.propertyName);
				setCopiedKey("name");
				setTimeout(() => {
					setCopiedKey(null);
					keepOpenRef.current = false;
					dismissMenu();
				}, 800);
			} catch {
				keepOpenRef.current = false;
				dismissMenu();
			}
		} else if (itemId === "copy-id") {
			keepOpenRef.current = true;
			try {
				await navigator.clipboard.writeText(property.id);
				setCopiedKey("id");
				setTimeout(() => {
					setCopiedKey(null);
					keepOpenRef.current = false;
					dismissMenu();
				}, 800);
			} catch {
				keepOpenRef.current = false;
				dismissMenu();
			}
		} else if (itemId === "filter-contacts") {
			const params = new URLSearchParams(
				typeof window !== "undefined" ? window.location.search : "",
			);
			params.set("search", property.propertyName);
			router.push(`/contacts?${params}`);
			dismissMenu();
		} else if (itemId === "delete") {
			handlers.onDelete(property);
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
		copiedKey,
		handleItemClick,
	};
}

function PropertyActionsMenuItems({
	menu,
	variant = "dropdown",
}: {
	menu: ReturnType<typeof usePropertyActionsMenu>;
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
		copiedKey,
		handleItemClick,
	} = menu;

	const itemClassName = (item: (typeof menuItems)[number], idx: number) =>
		cn(
			"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
			item.isDanger ? "text-error-base" : "text-text-strong-950",
			!currentRect &&
				hoverIdx === idx &&
				(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
			variant === "context" &&
				"data-[disabled]:pointer-events-none data-[highlighted]:bg-transparent",
		);

	const keepsMenuOpen = (id: MenuItemId) =>
		id === "copy-name" || id === "copy-id";

	return (
		<div className="relative">
			{menuItems.map((item, idx) => {
				const isCopyItem = item.id === "copy-name" || item.id === "copy-id";
				const label = isCopyItem ? (
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.div
							key={
								copiedKey === (item.id === "copy-name" ? "name" : "id")
									? "copied"
									: "idle"
							}
							transition={{ type: "spring", duration: 0.25, bounce: 0 }}
							initial={{ opacity: 0, y: -14 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 14 }}
							className="flex items-center gap-2"
						>
							<Icon
								name={item.icon}
								className={cn(
									"h-3.5 w-3.5 shrink-0",
									copiedKey === (item.id === "copy-name" ? "name" : "id")
										? "text-success-base"
										: "text-text-sub-600",
								)}
							/>
							<span>{item.label}</span>
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
								if (keepsMenuOpen(item.id)) event.preventDefault();
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

const menuContentClassName = "w-48 rounded-xl p-1.5";

export function PropertyActionsMenu({
	property,
	onEdit,
	onDelete,
	onOpenChange,
}: PropertyActionsHandlers & { property: Property }) {
	const menu = usePropertyActionsMenu(property, {
		onEdit,
		onDelete,
		onOpenChange,
	});

	return (
		<PopoverRoot open={menu.open} onOpenChange={menu.handleOpenChange}>
			<PopoverTrigger asChild>
				<Button.Root variant="neutral" mode="ghost" size="xxsmall">
					<Icon name="more-horizontal" className="h-3 w-3" />
				</Button.Root>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={-10}
				className={menuContentClassName}
			>
				<PropertyActionsMenuItems menu={menu} />
			</PopoverContent>
		</PopoverRoot>
	);
}

export function PropertyRowContextMenu({
	property,
	onEdit,
	onDelete,
	onOpenChange,
	children,
}: PropertyActionsHandlers & { property: Property; children: ReactNode }) {
	const menu = usePropertyActionsMenu(property, {
		onEdit,
		onDelete,
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
				<PropertyActionsMenuItems menu={menu} variant="context" />
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
