import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useNavigate } from "#/lib/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
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

export function ApiKeyActionsMenu({
	apiKey,
	handlers,
}: {
	apiKey: ApiKeyData;
	handlers: ApiKeyActionsHandlers;
}) {
	const navigate = useNavigate();
	const isToggling = handlers.togglingId === apiKey.id;
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [copiedItem, setCopiedItem] = useState<"prefix" | "id" | null>(null);
	const [isToggleCompleted, setIsToggleCompleted] = useState(false);
	const [wasEnabledOnToggle, setWasEnabledOnToggle] = useState(apiKey.enabled);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

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
				? apiKey.enabled
					? "Disabling..."
					: "Enabling..."
				: apiKey.enabled
					? "Disable"
					: "Enable",
			icon: (isToggling
				? "loader-2"
				: apiKey.enabled
					? "cross-circle"
					: "check-circle") as
				| "loader-2"
				| "cross-circle"
				| "check-circle",
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

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) {
			setHoverIdx(undefined);
			setIsToggleCompleted(false);
		}
		handlers.onOpenChange(next, apiKey.id);
	};

	const handleCopyPrefix = async () => {
		try {
			await navigator.clipboard.writeText(apiKey.start || apiKey.prefix || "");
			setCopiedItem("prefix");
			setTimeout(() => {
				setCopiedItem(null);
				handleOpenChange(false);
			}, 900);
		} catch {
			handleOpenChange(false);
		}
	};

	const handleCopyId = async () => {
		try {
			await navigator.clipboard.writeText(apiKey.id);
			setCopiedItem("id");
			setTimeout(() => {
				setCopiedItem(null);
				handleOpenChange(false);
			}, 900);
		} catch {
			handleOpenChange(false);
		}
	};

	const handleItemClick = async (id: (typeof menuItems)[number]["id"]) => {
		if (id === "view") {
			void navigate({
				to: "/api-keys/$apiKeyId",
				params: { apiKeyId: apiKey.id },
			});
			handleOpenChange(false);
		} else if (id === "edit") {
			handlers.onEditKey?.(apiKey.id);
			handleOpenChange(false);
		} else if (id === "copy_prefix") {
			void handleCopyPrefix();
		} else if (id === "copy_id") {
			void handleCopyId();
		} else if (id === "toggle") {
			setWasEnabledOnToggle(apiKey.enabled);
			try {
				await handlers.onToggleEnabled(apiKey);
				setIsToggleCompleted(true);
				setTimeout(() => {
					setIsToggleCompleted(false);
					handleOpenChange(false);
				}, 750);
			} catch {
				handleOpenChange(false);
			}
		} else if (id === "rotate") {
			handlers.onRotateKey(apiKey);
			handleOpenChange(false);
		} else if (id === "delete") {
			handlers.onDeleteKey(apiKey.id);
			handleOpenChange(false);
		}
	};

	return (
		<div
			className="flex items-center justify-end"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Dropdown.Root open={open} onOpenChange={handleOpenChange}>
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
					className="w-48 gap-0 rounded-xl p-1.5"
				>
					<div className="relative">
						{menuItems.map((item, idx) => {
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
									disabled={item.id === "toggle" && (isToggling || isToggleCompleted)}
									className={cn(
										"relative flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-normal text-xs transition-colors min-h-[28px]",
										item.isDanger ? "text-error-base" : "text-text-strong-950",
										!currentRect &&
											hoverIdx === idx &&
											(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
										item.id === "toggle" &&
											(isToggling || isToggleCompleted) &&
											"cursor-not-allowed opacity-90",
									)}
								>
									{isToggleItem ? (
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
														<Icon
															name="loader-2"
															className="h-3.5 w-3.5 shrink-0 animate-spin text-text-sub-600"
														/>
														<span>
															{apiKey.enabled ? "Disabling..." : "Enabling..."}
														</span>
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
									) : isCopyPrefix || isCopyId ? (
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
														isThisCopied
															? "text-success-base"
															: "text-text-sub-600",
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
							);
						})}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={isDanger}
						/>
					</div>
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
}
