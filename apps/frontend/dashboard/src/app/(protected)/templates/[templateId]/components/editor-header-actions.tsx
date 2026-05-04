"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CollabPresence } from "./collobration/Collabpresence";
import type { ConnectionStatus as ConnectionStatusType } from "./collobration/hooks/useCollaboration";

interface EditorHeaderActionsProps {
	connectionStatus: ConnectionStatusType;
	isSynced: boolean;
}

const menuItems = [
	{
		id: "test",
		label: "Test email",
		icon: "mail" as const,
		isDanger: false,
	},
	{
		id: "history",
		label: "Version history",
		icon: "history" as const,
		isDanger: false,
	},
	{
		id: "details",
		label: "View details",
		icon: "info-outline" as const,
		isDanger: false,
	},
	{
		id: "duplicate",
		label: "Duplicate",
		icon: "copy" as const,
		isDanger: false,
	},
	{
		id: "delete",
		label: "Delete",
		icon: "trash" as const,
		isDanger: true,
	},
];

export const EditorHeaderActions = ({
	connectionStatus,
	isSynced,
}: EditorHeaderActionsProps) => {
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;
	const router = useRouter();
	const [isPublishing, setIsPublishing] = useState(false);

	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handlePublish = async () => {
		if (!templateId) return;
		setIsPublishing(true);
		try {
			await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "published" }),
				credentials: "include",
			});
			// Optionally show success toast
		} catch (error) {
			console.error("Failed to publish template:", error);
		} finally {
			setIsPublishing(false);
		}
	};

	const handleDelete = async () => {
		if (
			!templateId ||
			!confirm("Are you sure you want to delete this template?")
		)
			return;

		try {
			await fetch(`/api/template/v1/${templateId}`, {
				method: "DELETE",
				credentials: "include",
			});
			router.push("/templates");
		} catch (error) {
			console.error("Failed to delete template:", error);
		}
	};

	const handleItemClick = (itemId: string) => {
		setPopoverOpen(false);
		if (itemId === "delete") {
			handleDelete();
		} else if (itemId === "duplicate") {
			/* Duplicate logic */
		}
	};

	return (
		<div className="flex items-center gap-2">
			<CollabPresence status={connectionStatus} isSynced={isSynced} />
			<Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
				<Popover.Trigger asChild>
					<Button.Root variant="neutral" mode="stroke" size="xsmall">
						<Icon
							name="more-horizontal"
							className="h-4 w-4 text-text-sub-600 hover:text-text-strong-950"
						/>
					</Button.Root>
				</Popover.Trigger>
				<Popover.Content
					align="end"
					sideOffset={-8}
					className="w-48 rounded-xl p-1.5"
					showArrow
				>
					<div className="relative">
						{menuItems.map((item, idx) => (
							<div key={item.id}>
								<button
									ref={(el) => {
										if (el) buttonRefs.current[idx] = el;
									}}
									type="button"
									onPointerEnter={() => setHoverIdx(idx)}
									onPointerLeave={() => setHoverIdx(undefined)}
									onClick={() => handleItemClick(item.id)}
									className={cn(
										"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
										item.isDanger ? "text-error-base" : "text-text-strong-950",
										!currentRect &&
											hoverIdx === idx &&
											(item.isDanger
												? "bg-red-alpha-10"
												: "bg-neutral-alpha-10"),
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
							</div>
						))}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={isDanger}
						/>
					</div>
				</Popover.Content>
			</Popover.Root>
			<Button.Root
				variant="primary"
				size="xsmall"
				onClick={handlePublish}
				disabled={isPublishing}
			>
				{isPublishing ? "Publishing..." : "Publish"}
			</Button.Root>
		</div>
	);
};
