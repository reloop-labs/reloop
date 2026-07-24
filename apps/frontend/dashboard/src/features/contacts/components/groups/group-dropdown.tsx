import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import type { Group } from "#/features/contacts/hooks/use-contacts-query";

export interface GroupDropdownProps {
	group: Group;
	onDelete: (group: Group) => void;
	isDeleting?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const GroupDropdown = ({
	group,
	onDelete,
	isDeleting = false,
	onOpenChange,
}: GroupDropdownProps) => {
	const navigate = useNavigate();
	const [, setModal] = useQueryState("modal");
	const [, setId] = useQueryState("id");

	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const menuItems = [
		{
			id: "view",
			label: "View Details",
			icon: "info-outline" as const,
			isDanger: false,
		},
		{
			id: "edit",
			label: "Edit group",
			icon: "edit" as const,
			isDanger: false,
		},
		{
			id: "copy-id",
			label: isCopied ? "Copied ID!" : "Copy group ID",
			icon: isCopied ? ("check-circle" as const) : ("copy" as const),
			isDanger: false,
		},
		{
			id: "add-contacts",
			label: "Add contacts",
			icon: "user-plus" as const,
			isDanger: false,
		},
		{
			id: "export",
			label: "Export contacts",
			icon: "file-download" as const,
			isDanger: false,
		},
		{
			id: "delete",
			label: "Delete group",
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

	const handleExport = async () => {
		try {
			const res = await fetch(
				`/api/contacts/v1/groups/${group.id}/contacts?limit=1000`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to fetch contacts");
			const data = (await res.json()) as { contacts: Array<{ id: string; email: string; createdAt: string }> };
			const contacts = data.contacts || [];
			const csvLines = [
				"ID,Email,Created At",
				...contacts.map(
					(c) => `"${c.id}","${c.email}","${c.createdAt}"`,
				),
			];
			const blob = new Blob([csvLines.join("\n")], {
				type: "text/csv;charset=utf-8;",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `group-${group.name.toLowerCase().replace(/\s+/g, "-")}-contacts.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (e) {
			console.error(e);
		}
	};

	const handleItemClick = async (itemId: string) => {
		if (itemId === "view") {
			setPopoverOpen(false);
			void navigate({
				to: "/contacts/groups/$groupId",
				params: { groupId: group.id },
			});
		} else if (itemId === "edit") {
			setPopoverOpen(false);
			void setId(group.id);
			void setModal("edit-group");
		} else if (itemId === "copy-id") {
			try {
				await navigator.clipboard.writeText(group.id);
				setIsCopied(true);
				setTimeout(() => {
					setIsCopied(false);
					setPopoverOpen(false);
				}, 900);
			} catch {
				setPopoverOpen(false);
			}
		} else if (itemId === "add-contacts") {
			setPopoverOpen(false);
			void setId(group.id);
			void setModal("add-contact-to-group");
		} else if (itemId === "export") {
			setPopoverOpen(false);
			void handleExport();
		} else if (itemId === "delete") {
			setPopoverOpen(false);
			onDelete(group);
		}
	};

	return (
		<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
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
				className="w-48 rounded-xl p-1.5"
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
							onClick={() => void handleItemClick(item.id)}
							disabled={item.id === "delete" && isDeleting}
							className={cn(
								"relative flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-medium text-xs transition-colors min-h-[28px]",
								item.isDanger ? "text-error-base" : "text-text-strong-950",
								!currentRect &&
									hoverIdx === idx &&
									(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
								isDeleting &&
									item.id === "delete" &&
									"cursor-not-allowed opacity-50",
							)}
						>
							{item.id === "copy-id" ? (
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.div
										key={isCopied ? "copied" : "idle"}
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
											name={isCopied ? "check-circle" : "copy"}
											className={cn(
												"h-3.5 w-3.5 shrink-0",
												isCopied ? "text-success-base" : "text-text-sub-600",
											)}
										/>
										<span>{isCopied ? "Copied ID!" : "Copy group ID"}</span>
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
							)}
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
