"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Contact {
	id: string;
	email: string;
	status: string;
	firstName: string | null;
	lastName: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface ContactDropdownProps {
	contact: Contact;
	onEdit: (contact: Contact) => void;
	onDelete: (contact: Contact) => void;
	isDeleting: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const ContactDropdown = ({
	contact,
	onEdit,
	onDelete,
	isDeleting,
	onOpenChange,
}: ContactDropdownProps) => {
	const router = useRouter();
	const { mutate } = useSWRConfig();
	const { activeOrganization } = useUserOrganization();
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [isTogglingStatus, setIsTogglingStatus] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const isSubscribed = contact.status.toLowerCase() === "subscribed";

	// Dynamic menu items based on contact status
	const menuItems = [
		{
			id: "view",
			label: "View Details",
			icon: "eye-outline" as const,
			isDanger: false,
		},
		{
			id: "toggle-status",
			label: isSubscribed ? "Unsubscribe" : "Subscribe",
			icon: isSubscribed ? "cross-circle" : ("check-circle" as const),
			isDanger: false,
		},
		{
			id: "edit",
			label: "Edit contact",
			icon: "edit" as const,
			isDanger: false,
		},
		{
			id: "delete",
			label: "Delete contact",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const handlePopoverOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleToggleStatus = async () => {
		setIsTogglingStatus(true);
		try {
			const newStatus = isSubscribed ? "unsubscribed" : "subscribed";
			const response = await fetch(`/api/contacts/v1/contacts/${contact.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				throw new Error("Failed to update status");
			}

			toast.success(`Contact ${newStatus}`);
			await mutate(
				(key: string) =>
					typeof key === "string" && key.includes("/api/contacts/v1"),
			);
		} catch (error) {
			console.error("Failed to toggle status:", error);
			toast.error("Failed to update contact status");
		} finally {
			setIsTogglingStatus(false);
		}
	};

	const handleItemClick = async (itemId: string) => {
		if (itemId === "view") {
			setPopoverOpen(false);
			if (activeOrganization?.slug) {
				router.push(
					`/${activeOrganization.slug}/contacts/detail/${contact.id}`,
				);
			}
		} else if (itemId === "toggle-status") {
			setPopoverOpen(false);
			await handleToggleStatus();
		} else if (itemId === "edit") {
			setPopoverOpen(false);
			onEdit(contact);
		} else if (itemId === "delete") {
			setPopoverOpen(false);
			onDelete(contact);
		}
	};

	return (
		<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
			<PopoverTrigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					disabled={isDeleting || isTogglingStatus}
				>
					<Icon name="more-vertical" className="h-3 w-3" />
				</Button.Root>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={-4}
				className="w-40 rounded-xl p-1.5"
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
							onClick={() => handleItemClick(item.id)}
							disabled={
								(item.id === "delete" && isDeleting) ||
								(item.id === "toggle-status" && isTogglingStatus)
							}
							className={cn(
								"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
								item.isDanger ? "text-error-base" : "text-text-strong-950",
								!currentRect &&
									hoverIdx === idx &&
									(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
								((isDeleting && item.id === "delete") ||
									(isTogglingStatus && item.id === "toggle-status")) &&
									"cursor-not-allowed opacity-50",
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
			</PopoverContent>
		</PopoverRoot>
	);
};
