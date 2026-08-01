import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

interface ChannelDropdownProps {
	channelId: string;
	channelName: string;
	visibility?: "private" | "public";
	onEdit?: (id: string) => void;
	onDelete: (id: string) => void;
	onToggleVisibility?: (
		id: string,
		currentValue: "private" | "public",
	) => void | Promise<void>;
	onOpenChange?: (open: boolean) => void;
}

export const ChannelDropdown = ({
	channelId,
	channelName: _channelName,
	visibility = "private",
	onEdit,
	onDelete,
	onToggleVisibility,
	onOpenChange,
}: ChannelDropdownProps) => {
	const router = useRouter();
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
	const [isVisibilityCompleted, setIsVisibilityCompleted] = useState(false);
	const [wasPublicOnToggle, setWasPublicOnToggle] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const handleEdit = () => {
		onEdit?.(channelId);
		setPopoverOpen(false);
	};

	const handleDelete = () => {
		onDelete(channelId);
		setPopoverOpen(false);
	};

	const handleToggleVisibility = async () => {
		if (!onToggleVisibility || isTogglingVisibility || isVisibilityCompleted)
			return;
		setWasPublicOnToggle(visibility === "public");
		setIsTogglingVisibility(true);
		try {
			await onToggleVisibility(channelId, visibility);
			setIsVisibilityCompleted(true);
			setTimeout(() => {
				setIsVisibilityCompleted(false);
				setPopoverOpen(false);
			}, 750);
		} catch {
			setPopoverOpen(false);
		} finally {
			setIsTogglingVisibility(false);
		}
	};

	const handleCopyId = async () => {
		try {
			await navigator.clipboard.writeText(channelId);
			setIsCopied(true);
			setTimeout(() => {
				setIsCopied(false);
				setPopoverOpen(false);
			}, 900);
		} catch {
			setPopoverOpen(false);
		}
	};

	const handleViewSubscribers = () => {
		router.push(`/contacts?channelId=${channelId}`);
		setPopoverOpen(false);
	};

	const visibilityIcon = visibility === "public" ? "lock" : "globe";

	const menuItems = [
		{
			id: "edit",
			icon: "edit" as const,
			label: "Edit Channel",
			onClick: handleEdit,
			hidden: !onEdit,
		},
		{
			id: "visibility",
			icon: visibilityIcon as "lock" | "globe",
			label: visibility === "public" ? "Set Private" : "Set Public",
			onClick: handleToggleVisibility,
			hidden: !onToggleVisibility,
		},
		{
			id: "subscribers",
			icon: "users" as const,
			label: "View Subscribers",
			onClick: handleViewSubscribers,
		},
		{
			id: "copy-id",
			icon: isCopied ? ("check-circle" as const) : ("copy" as const),
			label: isCopied ? "Copied ID!" : "Copy channel ID",
			onClick: handleCopyId,
		},
		{
			id: "delete",
			icon: "trash" as const,
			label: "Delete Channel",
			onClick: handleDelete,
			className:
				"text-error-base hover:bg-error-base/10 dark:hover:bg-error-base/20",
		},
	].filter((item) => !item.hidden);

	return (
		<PopoverRoot open={popoverOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button.Root variant="neutral" mode="ghost" size="xxsmall">
					<Icon name="more-horizontal" className="h-3 w-3" />
				</Button.Root>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-48 rounded-xl p-1.5"
				sideOffset={-6}
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
							onClick={item.onClick}
							disabled={
								item.id === "visibility" &&
								(isTogglingVisibility || isVisibilityCompleted)
							}
							className={cn(
								"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-medium text-text-strong-950 text-xs transition-colors dark:text-white",
								!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
								item.id === "visibility" &&
									(isTogglingVisibility || isVisibilityCompleted) &&
									"cursor-not-allowed opacity-90",
								item.className,
							)}
						>
							{item.id === "visibility" ? (
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.div
										key={
											isVisibilityCompleted
												? "completed"
												: isTogglingVisibility
													? "toggling"
													: "idle"
										}
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
										{isVisibilityCompleted ? (
											<>
												<Icon
													name="check-circle"
													className="h-3.5 w-3.5 shrink-0 text-success-base"
												/>
												<span className="text-success-base">
													{wasPublicOnToggle ? "Set Private!" : "Set Public!"}
												</span>
											</>
										) : isTogglingVisibility ? (
											<>
												<Spinner size={14} color="currentColor" />
												<span>
													{wasPublicOnToggle
														? "Setting Private..."
														: "Setting Public..."}
												</span>
											</>
										) : (
											<>
												<Icon
													name={visibility === "public" ? "lock" : "globe"}
													className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
												/>
												<span>
													{visibility === "public"
														? "Set Private"
														: "Set Public"}
												</span>
											</>
										)}
									</motion.div>
								</AnimatePresence>
							) : item.id === "copy-id" ? (
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
										<span>{isCopied ? "Copied ID!" : "Copy channel ID"}</span>
									</motion.div>
								</AnimatePresence>
							) : (
								<>
									<Icon name={item.icon} className="h-3.5 w-3.5 shrink-0" />
									<span>{item.label}</span>
								</>
							)}
						</button>
					))}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</PopoverContent>
		</PopoverRoot>
	);
};
