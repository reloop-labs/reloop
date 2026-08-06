import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as ContextMenu from "@reloop/ui/context-menu";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { ForwardDNSRecordsModal } from "../add/setup/components/forward-dns-records-modal";
import { useDomainActions } from "../detail/hooks/use-domain-actions";
import type { Domain } from "../types";

export type DomainActionsHandlers = {
	onDelete: (id: string) => void;
	onOpenChange: (open: boolean, id: string) => void;
};

type MenuItemId =
	| "view"
	| "copy_name"
	| "copy_id"
	| "reverify"
	| "forward"
	| "delete";

function useDomainActionsMenu(domain: Domain, handlers: DomainActionsHandlers) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [contextMenuKey, setContextMenuKey] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [forwardOpen, setForwardOpen] = useState(false);
	const [copiedItem, setCopiedItem] = useState<"name" | "id" | null>(null);
	const buttonRefs = useRef<HTMLElement[]>([]);
	const keepOpenRef = useRef(false);
	const { handleVerifyDNS } = useDomainActions(domain.id);

	const menuItems = [
		{
			id: "view" as const,
			label: "View Details",
			icon: "info-outline" as const,
			isDanger: false,
		},
		{
			id: "copy_name" as const,
			label: "Copy Domain Name",
			icon: "copy" as const,
			isDanger: false,
		},
		{
			id: "copy_id" as const,
			label: "Copy Domain ID",
			icon: "copy" as const,
			isDanger: false,
		},
		{
			id: "reverify" as const,
			label: "Re-verify DNS",
			icon: "refresh-cw" as const,
			isDanger: false,
		},
		{
			id: "forward" as const,
			label: "Forward Records",
			icon: "mail-single" as const,
			isDanger: false,
		},
		{
			id: "delete" as const,
			label: "Delete Domain",
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
			handlers.onOpenChange(next, domain.id);
		},
		[domain.id, handlers.onOpenChange],
	);

	const dismissMenu = useCallback(() => {
		setContextMenuKey((key) => key + 1);
		handleOpenChange(false);
	}, [handleOpenChange]);

	const handleCopyName = async () => {
		keepOpenRef.current = true;
		try {
			await navigator.clipboard.writeText(domain.domain);
			setCopiedItem("name");
			setTimeout(() => {
				setCopiedItem(null);
				keepOpenRef.current = false;
				dismissMenu();
			}, 900);
		} catch {
			keepOpenRef.current = false;
			dismissMenu();
		}
	};

	const handleCopyId = async () => {
		keepOpenRef.current = true;
		try {
			await navigator.clipboard.writeText(domain.id);
			setCopiedItem("id");
			setTimeout(() => {
				setCopiedItem(null);
				keepOpenRef.current = false;
				dismissMenu();
			}, 900);
		} catch {
			keepOpenRef.current = false;
			dismissMenu();
		}
	};

	const handleItemClick = async (id: MenuItemId) => {
		if (id === "view") {
			router.push(`/domain/${domain.id}`);
			dismissMenu();
		} else if (id === "copy_name") {
			void handleCopyName();
		} else if (id === "copy_id") {
			void handleCopyId();
		} else if (id === "reverify") {
			void handleVerifyDNS();
			dismissMenu();
		} else if (id === "forward") {
			setForwardOpen(true);
			dismissMenu();
		} else if (id === "delete") {
			handlers.onDelete(domain.id);
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
		forwardOpen,
		setForwardOpen,
		domain,
	};
}

function DomainActionsMenuItems({
	menu,
	variant = "dropdown",
}: {
	menu: ReturnType<typeof useDomainActionsMenu>;
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

	const keepsMenuOpen = (id: MenuItemId) =>
		id === "copy_name" || id === "copy_id";

	return (
		<div className="relative">
			{menuItems.map((item, idx) => {
				const isCopyName = item.id === "copy_name";
				const isCopyId = item.id === "copy_id";
				const isThisCopied =
					(isCopyName && copiedItem === "name") ||
					(isCopyId && copiedItem === "id");

				const label =
					isCopyName || isCopyId ? (
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
										? isCopyName
											? "Copied Name!"
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
								if (keepsMenuOpen(item.id)) {
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

function ForwardModal({
	domainId,
	open,
	onOpenChange,
}: {
	domainId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<ForwardDNSRecordsModal
			domainId={domainId}
			open={open}
			onOpenChange={onOpenChange}
		/>
	);
}

export function DomainDropdown({
	domain,
	handlers,
}: {
	domain: Domain;
	handlers: DomainActionsHandlers;
}) {
	const menu = useDomainActionsMenu(domain, handlers);

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
						aria-label={`Actions for ${domain.domain}`}
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
					<DomainActionsMenuItems menu={menu} />
				</Dropdown.Content>
			</Dropdown.Root>
			<ForwardModal
				domainId={domain.id}
				open={menu.forwardOpen}
				onOpenChange={menu.setForwardOpen}
			/>
		</div>
	);
}

export function DomainRowContextMenu({
	domain,
	handlers,
	children,
}: {
	domain: Domain;
	handlers: DomainActionsHandlers;
	children: ReactNode;
}) {
	const menu = useDomainActionsMenu(domain, handlers);

	return (
		<>
			<ContextMenu.Root
				key={menu.contextMenuKey}
				onOpenChange={menu.handleOpenChange}
			>
				<ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
				<ContextMenu.Content
					className={menuContentClassName}
					onCloseAutoFocus={(e) => e.preventDefault()}
				>
					<DomainActionsMenuItems menu={menu} variant="context" />
				</ContextMenu.Content>
			</ContextMenu.Root>
			<ForwardModal
				domainId={domain.id}
				open={menu.forwardOpen}
				onOpenChange={menu.setForwardOpen}
			/>
		</>
	);
}
