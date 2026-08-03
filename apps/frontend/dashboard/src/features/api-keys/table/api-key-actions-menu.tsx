import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as ContextMenu from "@reloop/ui/context-menu";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import type { ApiKeyData } from "../types";

export type ApiKeyActionsHandlers = {
	togglingId: string | null;
	onToggleEnabled: (apiKey: ApiKeyData) => Promise<void> | void;
	onRotateKey: (apiKey: ApiKeyData) => void;
	onDeleteKey: (id: string) => void;
	onEditKey?: (id: string) => void;
	onOpenChange: (open: boolean, id: string) => void;
};

type MenuItemId =
	| "view"
	| "edit"
	| "copy_prefix"
	| "copy_id"
	| "toggle"
	| "rotate"
	| "delete";

function useApiKeyActionsMenu(
	apiKey: ApiKeyData,
	handlers: ApiKeyActionsHandlers,
) {
	const router = useRouter();
	const isToggling = handlers.togglingId === apiKey.id;
	const [open, setOpen] = useState(false);
	// Radix ContextMenu.Root is uncontrolled (no `open` prop); bumping this remounts
	// the root to dismiss the menu after delayed actions that call preventDefault.
	const [contextMenuKey, setContextMenuKey] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [copiedItem, setCopiedItem] = useState<"prefix" | "id" | null>(null);
	const [isToggleCompleted, setIsToggleCompleted] = useState(false);
	const [wasEnabledOnToggle, setWasEnabledOnToggle] = useState(apiKey.enabled);
	const buttonRefs = useRef<HTMLElement[]>([]);
	// Blocks Radix's automatic close while a copy/toggle animation is running.
	const keepOpenRef = useRef(false);

	const menuItems = [
		{
			id: "view" as const,
			label: "View details",
			icon: "info-outline" as const,
			isDanger: false,
		},
		{
			id: "edit" as const,
			label: "Edit API key",
			icon: "edit" as const,
			isDanger: false,
		},
		{
			id: "copy_prefix" as const,
			label: "Copy key prefix",
			icon: "copy" as const,
			isDanger: false,
		},
		{
			id: "copy_id" as const,
			label: "Copy key ID",
			icon: "copy" as const,
			isDanger: false,
		},
		{
			id: "toggle" as const,
			label: isToggling
				? wasEnabledOnToggle
					? "Disabling..."
					: "Enabling..."
				: apiKey.enabled
					? "Disable"
					: "Enable",
			icon: (isToggling
				? "loader-2"
				: apiKey.enabled
					? "cross-circle"
					: "check-circle") as "loader-2" | "cross-circle" | "check-circle",
			isDanger: false,
		},
		{
			id: "rotate" as const,
			label: "Rotate Key",
			icon: "rotate-cw" as const,
			isDanger: false,
		},
		{
			id: "delete" as const,
			label: "Delete API Key",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = useCallback(
		(next: boolean) => {
			// While a copy/toggle animation is in flight, ignore Radix's auto-close.
			if (!next && keepOpenRef.current) return;
			setOpen(next);
			if (!next) {
				setHoverIdx(undefined);
				setIsToggleCompleted(false);
			}
			handlers.onOpenChange(next, apiKey.id);
		},
		[apiKey.id, handlers.onOpenChange],
	);

	const dismissMenu = useCallback(() => {
		setContextMenuKey((key) => key + 1);
		handleOpenChange(false);
	}, [handleOpenChange]);

	const handleCopyPrefix = async () => {
		keepOpenRef.current = true;
		try {
			await navigator.clipboard.writeText(apiKey.start || apiKey.prefix || "");
			toast.success("API key prefix copied to clipboard");
			setCopiedItem("prefix");
			setTimeout(() => {
				setCopiedItem(null);
				keepOpenRef.current = false;
				dismissMenu();
			}, 900);
		} catch {
			toast.error("Failed to copy prefix");
			keepOpenRef.current = false;
			dismissMenu();
		}
	};

	const handleCopyId = async () => {
		keepOpenRef.current = true;
		try {
			await navigator.clipboard.writeText(apiKey.id);
			toast.success("API key ID copied to clipboard");
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
		if (id === "view") {
			router.push(`/api-keys/${apiKey.id}`);
			dismissMenu();
		} else if (id === "edit") {
			handlers.onEditKey?.(apiKey.id);
			dismissMenu();
		} else if (id === "copy_prefix") {
			void handleCopyPrefix();
		} else if (id === "copy_id") {
			void handleCopyId();
		} else if (id === "toggle") {
			keepOpenRef.current = true;
			setWasEnabledOnToggle(apiKey.enabled);
			try {
				await handlers.onToggleEnabled(apiKey);
				setIsToggleCompleted(true);
				setTimeout(() => {
					setIsToggleCompleted(false);
					keepOpenRef.current = false;
					dismissMenu();
				}, 750);
			} catch {
				keepOpenRef.current = false;
				dismissMenu();
			}
		} else if (id === "rotate") {
			handlers.onRotateKey(apiKey);
			dismissMenu();
		} else if (id === "delete") {
			handlers.onDeleteKey(apiKey.id);
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
		isToggleCompleted,
		wasEnabledOnToggle,
		isToggling,
		apiKey,
		handleItemClick,
	};
}

function MenuItemLabel({
	item,
	copiedItem,
	isToggleCompleted,
	wasEnabledOnToggle,
	isToggling,
	apiKey,
}: {
	item: ReturnType<typeof useApiKeyActionsMenu>["menuItems"][number];
	copiedItem: "prefix" | "id" | null;
	isToggleCompleted: boolean;
	wasEnabledOnToggle: boolean;
	isToggling: boolean;
	apiKey: ApiKeyData;
}) {
	const isCopyPrefix = item.id === "copy_prefix";
	const isCopyId = item.id === "copy_id";
	const isThisCopied =
		(isCopyPrefix && copiedItem === "prefix") ||
		(isCopyId && copiedItem === "id");
	const isToggleItem = item.id === "toggle";
	const toggleStateKey = isToggleCompleted
		? "completed"
		: isToggling
			? "loading"
			: "idle";

	if (isToggleItem) {
		return (
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.div
					key={toggleStateKey}
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
					{isToggleCompleted ? (
						<>
							<Icon
								name="check-circle"
								className="h-3.5 w-3.5 shrink-0 text-success-base"
							/>
							<span className="text-success-base">
								{wasEnabledOnToggle ? "Disabled!" : "Enabled!"}
							</span>
						</>
					) : isToggling ? (
						<>
							<Spinner size={14} color="currentColor" />
							<span>{wasEnabledOnToggle ? "Disabling..." : "Enabling..."}</span>
						</>
					) : (
						<>
							<Icon
								name={apiKey.enabled ? "cross-circle" : "check-circle"}
								className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
							/>
							<span>{apiKey.enabled ? "Disable" : "Enable"}</span>
						</>
					)}
				</motion.div>
			</AnimatePresence>
		);
	}

	if (isCopyPrefix || isCopyId) {
		return (
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
					<span>
						{isThisCopied
							? isCopyPrefix
								? "Copied prefix!"
								: "Copied ID!"
							: item.label}
					</span>
				</motion.div>
			</AnimatePresence>
		);
	}

	return (
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
}

function ApiKeyActionsMenuItems({
	menu,
	variant = "dropdown",
}: {
	menu: ReturnType<typeof useApiKeyActionsMenu>;
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
		isToggleCompleted,
		wasEnabledOnToggle,
		isToggling,
		apiKey,
		handleItemClick,
	} = menu;

	const itemClassName = (item: (typeof menuItems)[number], idx: number) =>
		cn(
			"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
			item.isDanger ? "text-error-base" : "text-text-strong-950",
			!currentRect &&
				hoverIdx === idx &&
				(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
			item.id === "toggle" &&
				(isToggling || isToggleCompleted) &&
				"cursor-not-allowed opacity-90",
			variant === "context" &&
				"data-[disabled]:pointer-events-none data-[highlighted]:bg-transparent",
		);

	const keepsMenuOpen = (id: MenuItemId) =>
		id === "copy_prefix" || id === "copy_id" || id === "toggle";

	return (
		<div className="relative">
			{menuItems.map((item, idx) => {
				const label = (
					<MenuItemLabel
						item={item}
						copiedItem={copiedItem}
						isToggleCompleted={isToggleCompleted}
						wasEnabledOnToggle={wasEnabledOnToggle}
						isToggling={isToggling}
						apiKey={apiKey}
					/>
				);
				const disabled =
					item.id === "toggle" && (isToggling || isToggleCompleted);

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
								// Keep open for copy/toggle success animations.
								if (keepsMenuOpen(item.id)) {
									event.preventDefault();
								}
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
						onClick={() => handleItemClick(item.id)}
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

const menuContentClassName = "w-48 gap-0 rounded-xl p-1.5";

export function ApiKeyActionsMenu({
	apiKey,
	handlers,
}: {
	apiKey: ApiKeyData;
	handlers: ApiKeyActionsHandlers;
}) {
	const menu = useApiKeyActionsMenu(apiKey, handlers);

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
						aria-label={`Actions for ${apiKey.name || apiKey.start || "API key"}`}
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
					<ApiKeyActionsMenuItems menu={menu} />
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
}

export function ApiKeyRowContextMenu({
	apiKey,
	handlers,
	children,
}: {
	apiKey: ApiKeyData;
	handlers: ApiKeyActionsHandlers;
	children: ReactNode;
}) {
	const menu = useApiKeyActionsMenu(apiKey, handlers);

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
				<ApiKeyActionsMenuItems menu={menu} variant="context" />
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
