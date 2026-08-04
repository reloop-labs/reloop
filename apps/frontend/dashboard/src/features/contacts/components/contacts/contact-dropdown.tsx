import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as ContextMenu from "@reloop/ui/context-menu";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { AudienceStatus } from "#/features/contacts/audience";
import {
	type Contact,
	useUpdateContactStatusInCache,
} from "#/features/contacts/hooks/use-contacts-query";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export type ContactActionsHandlers = {
	onEdit: (contact: Contact) => void;
	onDelete: (contact: Contact) => void;
	/** When set, shows "Remove from group" (group detail context). */
	onRemoveFromGroup?: (contact: Contact) => void | Promise<void>;
	isDeleting?: boolean;
	isRemovingFromGroup?: boolean;
	onOpenChange?: (open: boolean) => void;
};

type MenuItemId =
	| "view"
	| "toggle-status"
	| "edit"
	| "remove-from-group"
	| "delete";

function useContactActionsMenu(
	contact: Contact,
	handlers: ContactActionsHandlers,
) {
	const updateContactStatusInCache = useUpdateContactStatusInCache();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [contextMenuKey, setContextMenuKey] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [isTogglingStatus, setIsTogglingStatus] = useState(false);
	const buttonRefs = useRef<HTMLElement[]>([]);
	const keepOpenRef = useRef(false);

	const isSubscribed = contact.status.toLowerCase() === "subscribed";
	const isDeleting = handlers.isDeleting ?? false;
	const isRemovingFromGroup = handlers.isRemovingFromGroup ?? false;
	const canRemoveFromGroup = Boolean(handlers.onRemoveFromGroup);

	const menuItems = [
		{
			id: "view" as const,
			label: "View Details",
			icon: "info-outline" as const,
			isDanger: false,
		},
		{
			id: "toggle-status" as const,
			label: isSubscribed ? "Unsubscribe" : "Subscribe",
			icon: (isSubscribed ? "cross-circle" : "check-circle") as
				| "cross-circle"
				| "check-circle",
			isDanger: false,
		},
		{
			id: "edit" as const,
			label: "Edit contact",
			icon: "edit" as const,
			isDanger: false,
		},
		...(canRemoveFromGroup
			? [
					{
						id: "remove-from-group" as const,
						label: "Remove from group",
						icon: "user-minus" as const,
						isDanger: true,
					},
				]
			: []),
		{
			id: "delete" as const,
			label: "Delete contact",
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

	const handleToggleStatus = async () => {
		setIsTogglingStatus(true);
		try {
			const newStatus: AudienceStatus = isSubscribed
				? "unsubscribed"
				: "subscribed";
			const response = await fetch(`/api/contacts/${contact.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				throw new Error("Failed to update status");
			}

			toast.success(`Contact ${newStatus}`);
			updateContactStatusInCache(contact.id, newStatus);
		} catch (error) {
			console.error("Failed to toggle status:", error);
			toast.error("Failed to update contact status");
		} finally {
			setIsTogglingStatus(false);
		}
	};

	const handleItemClick = async (itemId: MenuItemId) => {
		if (itemId === "view") {
			router.push(`/contacts/detail/${contact.id}`);
			dismissMenu();
		} else if (itemId === "toggle-status") {
			dismissMenu();
			await handleToggleStatus();
		} else if (itemId === "edit") {
			handlers.onEdit(contact);
			dismissMenu();
		} else if (itemId === "remove-from-group") {
			dismissMenu();
			await handlers.onRemoveFromGroup?.(contact);
		} else if (itemId === "delete") {
			handlers.onDelete(contact);
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
		isTogglingStatus,
		isDeleting,
		isRemovingFromGroup,
		handleItemClick,
	};
}

function ContactActionsMenuItems({
	menu,
	variant = "dropdown",
}: {
	menu: ReturnType<typeof useContactActionsMenu>;
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
		isTogglingStatus,
		isDeleting,
		isRemovingFromGroup,
		handleItemClick,
	} = menu;

	const itemClassName = (item: (typeof menuItems)[number], idx: number) =>
		cn(
			"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
			item.isDanger ? "text-error-base" : "text-text-strong-950",
			!currentRect &&
				hoverIdx === idx &&
				(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
			((isDeleting && item.id === "delete") ||
				(isRemovingFromGroup && item.id === "remove-from-group") ||
				(isTogglingStatus && item.id === "toggle-status")) &&
				"cursor-not-allowed opacity-50",
			variant === "context" &&
				"data-[disabled]:pointer-events-none data-[highlighted]:bg-transparent",
		);

	return (
		<div className="relative">
			{menuItems.map((item, idx) => {
				const disabled =
					(item.id === "delete" && isDeleting) ||
					(item.id === "remove-from-group" && isRemovingFromGroup) ||
					(item.id === "toggle-status" && isTogglingStatus);
				const label = (
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
							onSelect={() => {
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

export interface ContactDropdownProps {
	contact: Contact;
	onEdit: (contact: Contact) => void;
	onDelete: (contact: Contact) => void;
	onRemoveFromGroup?: (contact: Contact) => void | Promise<void>;
	isDeleting: boolean;
	isRemovingFromGroup?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const ContactDropdown = ({
	contact,
	onEdit,
	onDelete,
	onRemoveFromGroup,
	isDeleting,
	isRemovingFromGroup = false,
	onOpenChange,
}: ContactDropdownProps) => {
	const menu = useContactActionsMenu(contact, {
		onEdit,
		onDelete,
		onRemoveFromGroup,
		isDeleting,
		isRemovingFromGroup,
		onOpenChange,
	});

	return (
		<PopoverRoot open={menu.open} onOpenChange={menu.handleOpenChange}>
			<PopoverTrigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					disabled={
						isDeleting || isRemovingFromGroup || menu.isTogglingStatus
					}
				>
					<Icon name="more-horizontal" className="h-3 w-3" />
				</Button.Root>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={-10}
				className={menuContentClassName}
			>
				<ContactActionsMenuItems menu={menu} />
			</PopoverContent>
		</PopoverRoot>
	);
};

export function ContactRowContextMenu({
	contact,
	onEdit,
	onDelete,
	onRemoveFromGroup,
	isDeleting = false,
	isRemovingFromGroup = false,
	onOpenChange,
	children,
}: ContactDropdownProps & { children: ReactNode }) {
	const menu = useContactActionsMenu(contact, {
		onEdit,
		onDelete,
		onRemoveFromGroup,
		isDeleting,
		isRemovingFromGroup,
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
				<ContactActionsMenuItems menu={menu} variant="context" />
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
