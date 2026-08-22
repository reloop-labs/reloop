import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Skeleton } from "@reloop/ui/skeleton";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { ComposeModal } from "#/features/agent-inbox/components/compose/compose-modal";
import { SectionError } from "#/features/agent-inbox/components/shared/section-error";
import { InboxLabelDialog } from "#/features/agent-inbox/components/sidebar/inbox-label-dialog";
import { useInboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-context";
import { useInboxFolderStats } from "#/features/agent-inbox/hooks/use-inbox-folder-stats";
import { useInboxLabels } from "#/features/agent-inbox/hooks/use-inbox-labels";
import { resolveLabelColor } from "#/features/agent-inbox/lib/label-colors";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { SidebarNavIcon } from "#/features/dashboard/sidebar/sidebar-nav-icon";
import { SidebarNavLink } from "#/features/dashboard/sidebar/sidebar-nav-link";
import { useSidebarHoverBox } from "#/features/dashboard/sidebar/use-sidebar-hover-box";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

/** Light keycap for blue FancyButton fill */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type NavItem = {
	id: string;
	label: string;
	href: string;
	iconName: string;
	showCount?: boolean;
};

const SectionHeader = ({
	title,
	collapsed,
	isFirst = false,
}: {
	title: string;
	collapsed: boolean;
	isFirst?: boolean;
}) => {
	if (collapsed) {
		return (
			<div className="my-2 h-[1px] w-6 self-center bg-stroke-soft-200 dark:bg-white/10" />
		);
	}
	return (
		<div
			className={cn(
				"px-2.5 pt-4 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]",
				isFirst && "pt-2",
			)}
		>
			{title}
		</div>
	);
};

export const InboxSidebar = ({
	mailbox,
	folder,
}: {
	mailbox: AgentMailbox;
	folder: string;
}) => {
	const router = useRouter();
	const { collapsed, registerOpenCompose } = useInboxSidebar();
	const { isLoadingMailboxes, isLoadingThreads, getMailbox } = useAgentInbox();
	const mailboxReady = !!getMailbox(mailbox.id) && !!mailbox.email;
	const stats = useInboxFolderStats(mailbox.id);
	const {
		labels,
		addLabel,
		isLoading: isLoadingLabels,
		labelsError,
		refreshLabels,
	} = useInboxLabels(mailboxReady ? mailbox.id : "");
	const countsLoading = !mailboxReady || isLoadingMailboxes || isLoadingThreads;
	const labelsLoading = !mailboxReady || isLoadingLabels;

	const [isComposeOpen, setIsComposeOpen] = useState(false);
	const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);

	const [hoveredEl, setHoveredEl] = useState<HTMLAnchorElement | undefined>(
		undefined,
	);
	const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
	const navRefs = useRef<Record<string, HTMLAnchorElement>>({});

	const activeLabelId = folder.startsWith("label:") ? folder.slice(6) : null;
	const activeFolderKey = activeLabelId ? `label:${activeLabelId}` : folder;
	const activeEl = navRefs.current[activeFolderKey];
	const currentEl = hoveredEl ?? activeEl;
	const hoverBox = useSidebarHoverBox(
		currentEl,
		containerEl,
		`${collapsed}:${activeFolderKey}`,
	);

	useEffect(() => {
		registerOpenCompose(() => setIsComposeOpen(true));
	}, [registerOpenCompose]);

	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			if (mailboxReady) {
				setIsComposeOpen(true);
			}
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys("alt+n", (e) => {
		e.preventDefault();
		if (mailboxReady) {
			setIsComposeOpen(true);
		}
	});

	useHotkeys("alt+l", (e) => {
		e.preventDefault();
		setIsLabelDialogOpen(true);
	});

	useHotkeys("meta+k, ctrl+k", (e) => {
		e.preventDefault();
		window.dispatchEvent(new CustomEvent("inbox:open-search"));
	});

	const mailboxId = mailbox.id;

	const mailItems: NavItem[] = [
		{
			id: "inbox",
			label: "Inbox",
			href: `/inbox?mailboxId=${mailboxId}&folder=inbox`,
			iconName: "inbox",
			showCount: true,
		},
		{
			id: "starred",
			label: "Starred",
			href: `/inbox?mailboxId=${mailboxId}&folder=starred`,
			iconName: "star",
			showCount: true,
		},
		{
			id: "drafts",
			label: "Drafts",
			href: `/inbox?mailboxId=${mailboxId}&folder=drafts`,
			iconName: "draft",
			showCount: true,
		},
		{
			id: "sent",
			label: "Sent",
			href: `/inbox?mailboxId=${mailboxId}&folder=sent`,
			iconName: "mail-send",
		},
		{
			id: "agent",
			label: "Agent",
			href: `/inbox?mailboxId=${mailboxId}&folder=agent`,
			iconName: "agent",
			showCount: true,
		},
		{
			id: "archive",
			label: "Archive",
			href: `/inbox?mailboxId=${mailboxId}&folder=archive`,
			iconName: "archive",
		},
		{
			id: "spam",
			label: "Spam",
			href: `/inbox?mailboxId=${mailboxId}&folder=spam`,
			iconName: "alert",
		},
		{
			id: "trash",
			label: "Trash",
			href: `/inbox?mailboxId=${mailboxId}&folder=trash`,
			iconName: "trash",
		},
	];

	return (
		<>
			<aside
				className={cn(
					"flex h-full shrink-0 select-none flex-col border-stroke-soft-100 border-r bg-bg-white-0 transition-[width] duration-200 ease-in-out dark:border-stroke-soft-100/40 dark:bg-black",
					collapsed ? "w-14 items-center" : "w-60",
				)}
			>
				{/* Compose button */}
				<div
					className={cn(
						"flex h-11 shrink-0 items-center border-stroke-soft-100 border-b dark:border-stroke-soft-100/40",
						collapsed ? "w-full justify-center px-2" : "w-full px-2.5",
					)}
				>
					<FancyButton.Root
						type="button"
						variant="blue"
						size="medium"
						onClick={() => {
							if (!mailboxReady) return;
							setIsComposeOpen(true);
						}}
						disabled={!mailboxReady}
						title="Compose (C)"
						aria-keyshortcuts="c"
						className={
							collapsed
								? "h-8 w-8 px-0"
								: "h-8 w-full justify-between gap-2 px-2.5"
						}
					>
						<div className="flex items-center gap-2">
							<Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
							{!collapsed && <span className="text-xs">Compose</span>}
						</div>
						{!collapsed && (
							<ActionKbd className={actionKbdOnBlueClassName}>C</ActionKbd>
						)}
					</FancyButton.Root>
				</div>

				<div
					ref={setContainerEl}
					onPointerLeave={() => setHoveredEl(undefined)}
					className={cn(
						"relative min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden",
						collapsed ? "px-0 py-2" : "px-2 py-2",
					)}
				>
					{/* Mail folders */}
					<div className={cn("flex flex-col", collapsed && "items-center")}>
						{mailItems.map((item) => {
							const isActive = folder === item.id;
							const count =
								item.id === "inbox"
									? stats.inbox
									: (stats[item.id as keyof typeof stats] as
											| number
											| undefined);

							return (
								<SidebarNavLink
									key={item.id}
									href={item.href}
									ref={(el) => {
										if (el) navRefs.current[item.id] = el;
									}}
									onPointerEnter={() => setHoveredEl(navRefs.current[item.id])}
									className={cn(
										"relative z-10 flex h-8 items-center rounded-lg transition-all",
										collapsed
											? "h-8 w-8 justify-center px-0"
											: "w-full gap-2.5 px-2.5 justify-start",
									)}
									title={collapsed ? item.label : undefined}
								>
									<span
										className={cn(
											"flex min-w-0 items-center",
											collapsed
												? "justify-center"
												: "flex-1 justify-between gap-2.5",
										)}
									>
										<span
											className={cn(
												"flex min-w-0 items-center",
												!collapsed && "gap-2.5",
											)}
										>
											<SidebarNavIcon
												name={item.iconName}
												isActive={isActive}
											/>
											{!collapsed && (
												<span
													className={cn(
														"truncate font-medium text-[13px] transition-colors",
														isActive
															? "text-text-strong-950"
															: "text-text-sub-600 group-hover:text-text-strong-950",
													)}
												>
													{item.label}
												</span>
											)}
										</span>
										{!collapsed &&
											item.showCount &&
											(countsLoading ? (
												<Skeleton className="h-3 w-5 shrink-0 rounded-sm bg-neutral-alpha-10" />
											) : count !== undefined && count > 0 ? (
												<span className="ml-auto shrink-0 font-medium text-[12px] text-text-sub-600 tabular-nums">
													{count.toLocaleString()}
												</span>
											) : null)}
									</span>
								</SidebarNavLink>
							);
						})}
					</div>

					{/* Labels */}
					<SectionHeader title="Labels" collapsed={collapsed} />
					<div className={cn("flex flex-col", collapsed && "items-center")}>
						{!collapsed &&
							(labelsError ? (
								<SectionError
									compact
									message="Couldn't load labels"
									onRetry={() => void refreshLabels()}
								/>
							) : labelsLoading ? (
								<div className="space-y-1 px-0.5 py-1" aria-busy="true">
									<span className="sr-only">Loading labels</span>
									{["a", "b", "c"].map((id) => (
										<div
											key={id}
											className="flex h-8 items-center gap-2.5 px-2"
										>
											<Skeleton className="size-2.5 shrink-0 rounded-full bg-neutral-alpha-10" />
											<Skeleton className="h-3 flex-1 rounded-sm bg-neutral-alpha-10" />
										</div>
									))}
								</div>
							) : labels.length === 0 ? (
								<button
									type="button"
									onClick={() => setIsLabelDialogOpen(true)}
									className="flex flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left hover:bg-neutral-alpha-10"
								>
									<span className="font-medium text-[12px] text-text-sub-600">
										No labels yet
									</span>
									<span className="text-[11px] text-text-soft-400">
										Create one to organize mail
									</span>
								</button>
							) : (
								labels.map((label) => {
									const labelKey = `label:${label.id}`;
									const isActive = activeLabelId === label.id;
									const swatch = resolveLabelColor(label.color);
									return (
										<SidebarNavLink
											href={`/inbox?mailboxId=${mailboxId}&folder=label:${label.id}`}
											key={label.id}
											ref={(el) => {
												if (el) navRefs.current[labelKey] = el;
											}}
											onPointerEnter={() =>
												setHoveredEl(navRefs.current[labelKey])
											}
											className={cn(
												"relative z-10 flex h-8 items-center rounded-lg transition-all",
												collapsed
													? "h-8 w-8 justify-center px-0"
													: "w-full gap-2.5 px-2.5 justify-start",
											)}
										>
											<span
												className={cn(
													"flex min-w-0 items-center",
													collapsed ? "justify-center" : "gap-2.5",
												)}
											>
												<span
													className="size-2 shrink-0 rounded-full ring-1 ring-black/5 dark:ring-white/10"
													style={{ backgroundColor: swatch }}
													aria-hidden
												/>
												{!collapsed && (
													<span
														className={cn(
															"truncate font-medium text-[13px] transition-colors",
															isActive
																? "text-text-strong-950"
																: "text-text-sub-600 group-hover:text-text-strong-950",
														)}
													>
														{label.name}
													</span>
												)}
											</span>
										</SidebarNavLink>
									);
								})
							))}

						{!collapsed && (
							<button
								type="button"
								onClick={() => setIsLabelDialogOpen(true)}
								disabled={!mailboxReady}
								className="mt-0.5 flex h-8 items-center gap-2 rounded-lg px-2.5 font-medium text-[13px] text-text-sub-600 opacity-70 transition-colors hover:bg-neutral-alpha-10 hover:opacity-100 hover:text-text-strong-950 disabled:opacity-40"
								aria-label="Create label (⌥L)"
								title="Create label (⌥L)"
							>
								<Plus className="h-3.5 w-3.5" />
								New label
							</button>
						)}
					</div>

					<AnimatedHoverBackground
						box={hoverBox}
						className="!bg-neutral-alpha-10"
					/>
				</div>
			</aside>

			<ComposeModal
				isOpen={isComposeOpen}
				onClose={() => setIsComposeOpen(false)}
				mailbox={mailbox}
			/>
			<InboxLabelDialog
				open={isLabelDialogOpen}
				onOpenChange={setIsLabelDialogOpen}
				onSubmit={async (name, color) => {
					const id = await addLabel(name, color);
					if (id) {
						toast.success(`Label "${name}" created`);
						router.push(
							`/inbox?mailboxId=${encodeURIComponent(mailbox.id)}&folder=label:${encodeURIComponent(id)}`,
						);
					} else {
						toast.error("Failed to create label");
						throw new Error("Failed to create label");
					}
				}}
			/>
		</>
	);
};
