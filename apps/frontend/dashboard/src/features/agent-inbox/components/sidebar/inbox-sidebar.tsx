import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import {
	ChevronDown,
	Pencil,
	Plus,
	Search,
	Settings,
	Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

const DraftIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="draft" {...props} />
);

const SentIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="sent" {...props} />
);

const ArchiveIcon = (
	props: Omit<React.ComponentProps<typeof Icon>, "name">,
) => <Icon name="archive" {...props} />;

const AlertIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="alert" {...props} />
);

const AgentIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="agent" {...props} />
);

const TrashIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="trash" {...props} />
);

type NavItem = {
	id: string;
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	showCount?: boolean;
};

const NavLink = ({
	item,
	active,
	count,
	countLoading = false,
	collapsed,
	refCallback,
	onPointerEnter,
}: {
	item: NavItem;
	active: boolean;
	count?: number;
	countLoading?: boolean;
	collapsed: boolean;
	refCallback?: (el: HTMLAnchorElement | null) => void;
	onPointerEnter?: () => void;
}) => {
	const className = cn(
		"group relative z-10 flex h-8 w-full items-center rounded-lg px-2 font-medium text-[14px] leading-5",
		active
			? "bg-[var(--inbox-selected)] text-mail-foreground"
			: "text-[var(--inbox-sidebar-text-inactive)] hover:text-mail-foreground",
		collapsed ? "justify-center" : "gap-2.5",
	);

	const content = (
		<>
			<item.icon
				className={cn(
					"h-[17px] w-[17px] shrink-0",
					active
						? "text-mail-foreground"
						: "text-[var(--inbox-sidebar-icon)] group-hover:text-mail-foreground",
				)}
			/>
			{!collapsed && (
				<>
					<span className="min-w-0 flex-1 truncate text-left">
						{item.label}
					</span>
					{item.showCount &&
						(countLoading ? (
							<Skeleton className="h-3 w-5 shrink-0 rounded-sm bg-[var(--inbox-skeleton)]" />
						) : count !== undefined && count > 0 ? (
							<span className="ml-auto shrink-0 font-medium text-[12px] text-[var(--inbox-sidebar-text-inactive)] tabular-nums">
								{count.toLocaleString()}
							</span>
						) : null)}
				</>
			)}
		</>
	);

	return (
		<Link
			href={item.href}
			ref={refCallback}
			onPointerEnter={onPointerEnter}
			className={className}
			title={collapsed ? item.label : undefined}
		>
			{content}
		</Link>
	);
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
		return <div className="mx-2 mt-1 mb-2 h-px bg-[var(--inbox-muted-bg)]" />;
	}
	return (
		<div
			className={cn(
				"flex items-center justify-between px-2 py-2",
				isFirst ? "pt-1" : "pt-3.5",
			)}
		>
			<span className="font-semibold text-[12px] text-mail-foreground opacity-40">
				{title}
			</span>
			<span className="text-mail-foreground opacity-40">
				<ChevronDown className="h-3.5 w-3.5" />
			</span>
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
	const [rect, setRect] = useState<DOMRect | undefined>(undefined);
	const navRefs = useRef<Record<string, HTMLAnchorElement>>({});

	const activeEl = navRefs.current[folder];
	const currentEl = hoveredEl ?? activeEl;

	useLayoutEffect(() => {
		if (!currentEl) {
			setRect(undefined);
			return;
		}
		const next = currentEl.getBoundingClientRect();
		setRect((prev) => {
			if (
				prev &&
				prev.top === next.top &&
				prev.left === next.left &&
				prev.width === next.width &&
				prev.height === next.height
			) {
				return prev;
			}
			return next;
		});
	}, [currentEl]);

	useEffect(() => {
		registerOpenCompose(() => setIsComposeOpen(true));
	}, [registerOpenCompose]);

	useHotkeys("alt+n", (e) => {
		e.preventDefault();
		setIsComposeOpen(true);
	});

	useHotkeys("alt+l", (e) => {
		e.preventDefault();
		setIsLabelDialogOpen(true);
	});

	useHotkeys("meta+k, ctrl+k", (e) => {
		// Search is handled by command palette elsewhere; this is a soft affordance.
		e.preventDefault();
		window.dispatchEvent(new CustomEvent("inbox:open-search"));
	});

	const mailboxId = mailbox.id;

	const mailItems: NavItem[] = [
		{
			id: "starred",
			label: "Starred",
			href: `/inbox/${mailboxId}/starred`,
			icon: (props) => <Star {...props} />,
			showCount: true,
		},
		{
			id: "drafts",
			label: "Drafts",
			href: `/inbox/${mailboxId}/drafts`,
			icon: DraftIcon,
			showCount: true,
		},
		{
			id: "sent",
			label: "Sent",
			href: `/inbox/${mailboxId}/sent`,
			icon: SentIcon,
		},
		{
			id: "agent",
			label: "Agent",
			href: `/inbox/${mailboxId}/agent`,
			icon: AgentIcon,
			showCount: true,
		},
		{
			id: "archive",
			label: "Archive",
			href: `/inbox/${mailboxId}/archive`,
			icon: ArchiveIcon,
			showCount: true,
		},
		{
			id: "spam",
			label: "Spam",
			href: `/inbox/${mailboxId}/spam`,
			icon: AlertIcon,
			showCount: true,
		},
		{
			id: "trash",
			label: "Trash",
			href: `/inbox/${mailboxId}/trash`,
			icon: TrashIcon,
		},
	];

	const activeLabelId = folder.startsWith("label:") ? folder.slice(6) : null;

	const openSearch = () => {
		window.dispatchEvent(new CustomEvent("inbox:open-search"));
	};

	const quickActions = [
		{
			id: "compose",
			label: "Compose",
			icon: Pencil,
			onClick: () => {
				if (!mailboxReady) return;
				setIsComposeOpen(true);
			},
		},
		{
			id: "search",
			label: "Search",
			icon: Search,
			onClick: openSearch,
		},
		{
			id: "settings",
			label: "Settings",
			icon: Settings,
			onClick: () => {
				toast.message("Mailbox settings coming soon");
			},
		},
	];

	return (
		<>
			<aside
				className={cn(
					"flex h-full shrink-0 select-none flex-col border-mail-border border-r bg-sidebar pb-2 transition-[width] duration-200 ease-in-out",
					collapsed ? "w-[52px] px-1.5 pt-2.5" : "w-[220px] px-2 pt-2.5",
				)}
			>
				{/* Quick actions */}
				<div className="mt-1 flex flex-col">
					{quickActions.map((action) => (
						<button
							key={action.id}
							type="button"
							onClick={action.onClick}
							disabled={action.id === "compose" && !mailboxReady}
							className={cn(
								"flex items-center gap-2.5 rounded-lg px-2 py-1 font-medium text-[14px] text-[var(--inbox-sidebar-text-inactive)] leading-5 transition-colors hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground disabled:opacity-40",
								collapsed && "justify-center",
							)}
							title={collapsed ? action.label : undefined}
						>
							<action.icon className="h-[17px] w-[17px] shrink-0 text-[var(--inbox-sidebar-icon)]" />
							{!collapsed && <span>{action.label}</span>}
						</button>
					))}
				</div>

				<div
					onPointerLeave={() => setHoveredEl(undefined)}
					className="relative mt-3.5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
				>
					{/* Labels section first */}
					<SectionHeader title="Labels" collapsed={collapsed} isFirst />
					<div className="flex flex-col">
						{/* All (inbox) */}
						<Link
							href={`/inbox/${mailboxId}`}
							ref={(el) => {
								if (el) navRefs.current.inbox = el;
							}}
							onPointerEnter={() => setHoveredEl(navRefs.current.inbox)}
							className={cn(
								"relative z-10 flex items-center justify-between rounded-lg px-2 py-1 font-medium text-[14px] leading-5",
								folder === "inbox"
									? "bg-[var(--inbox-selected)] text-mail-foreground"
									: "text-[var(--inbox-sidebar-text-inactive)] hover:text-mail-foreground",
								collapsed && "justify-center",
							)}
							title={collapsed ? "All" : undefined}
						>
							{collapsed ? (
								<Icon name="inbox" className="h-4 w-4" />
							) : (
								<>
									<span className="truncate">All</span>
									{countsLoading ? (
										<Skeleton className="h-3 w-5 shrink-0 rounded-sm bg-[var(--inbox-skeleton)]" />
									) : stats.inbox > 0 ? (
										<span className="ml-auto shrink-0 font-medium text-[12px] text-[var(--inbox-sidebar-text-inactive)] tabular-nums">
											{stats.inbox.toLocaleString()}
										</span>
									) : null}
								</>
							)}
						</Link>

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
											<Skeleton className="size-2.5 shrink-0 rounded-full bg-[var(--inbox-skeleton)]" />
											<Skeleton className="h-3 flex-1 rounded-sm bg-[var(--inbox-skeleton)]" />
										</div>
									))}
								</div>
							) : labels.length === 0 ? (
								<button
									type="button"
									onClick={() => setIsLabelDialogOpen(true)}
									className="flex flex-col items-start gap-0.5 rounded-lg px-2 py-2 text-left hover:bg-[var(--inbox-row-hover)]"
								>
									<span className="font-medium text-[12px] text-mail-muted">
										No labels yet
									</span>
									<span className="text-[11px] text-mail-muted opacity-70">
										Create one to organize mail
									</span>
								</button>
							) : (
								labels.map((label) => {
									const labelKey = `label:${label.id}`;
									const active = activeLabelId === label.id;
									const swatch = resolveLabelColor(label.color);
									return (
										<Link
											href={`/inbox/${mailboxId}/label/${label.id}`}
											key={label.id}
											ref={(el) => {
												if (el) navRefs.current[labelKey] = el;
											}}
											onPointerEnter={() =>
												setHoveredEl(navRefs.current[labelKey])
											}
											className={cn(
												"relative z-10 flex items-center justify-between rounded-lg px-2 py-1 font-medium text-[14px] leading-5",
												active
													? "bg-[var(--inbox-selected)] text-mail-foreground"
													: "text-[var(--inbox-sidebar-text-inactive)] hover:text-mail-foreground",
											)}
										>
											<span className="flex min-w-0 items-center gap-2">
												<span
													className="size-2 shrink-0 rounded-full ring-1 ring-black/5 dark:ring-white/10"
													style={{ backgroundColor: swatch }}
													aria-hidden
												/>
												<span className="truncate">{label.name}</span>
											</span>
										</Link>
									);
								})
							))}

						{!collapsed && (
							<button
								type="button"
								onClick={() => setIsLabelDialogOpen(true)}
								disabled={!mailboxReady}
								className="mt-0.5 flex items-center gap-2 rounded-lg px-2 py-1 text-[13px] text-mail-muted opacity-70 hover:bg-[var(--inbox-row-hover)] hover:opacity-100 disabled:opacity-40"
								aria-label="Create label (⌥L)"
								title="Create label (⌥L)"
							>
								<Plus className="h-3.5 w-3.5" />
								New label
							</button>
						)}
					</div>

					{/* Mail section */}
					<SectionHeader title="Mail" collapsed={collapsed} />
					<div className="flex flex-col">
						{mailItems.map((item) => (
							<NavLink
								key={item.id}
								item={item}
								active={folder === item.id}
								count={
									stats[item.id as keyof typeof stats] as number | undefined
								}
								countLoading={countsLoading}
								collapsed={collapsed}
								refCallback={(el) => {
									if (el) navRefs.current[item.id] = el;
								}}
								onPointerEnter={() => setHoveredEl(navRefs.current[item.id])}
							/>
						))}
					</div>

					<AnimatedHoverBackground
						rect={rect}
						tabElement={currentEl}
						className="!bg-transparent"
					/>
				</div>

				<div className="mt-auto flex w-full py-2">
					{!collapsed ? <FooterThemeToggle /> : <CollapsedThemeToggle />}
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
						router.push(`/inbox/${mailbox.id}/label/${id}`);
					} else {
						toast.error("Failed to create label");
						throw new Error("Failed to create label");
					}
				}}
			/>
		</>
	);
};

const FooterThemeToggle = () => {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="inline-flex items-center rounded-full border border-stroke-soft-200 p-0.5 dark:border-stroke-soft-100/40">
			<button
				type="button"
				onClick={() => setTheme("system")}
				className={`flex items-center rounded-full px-1.5 py-1.5 font-semibold text-[12px] transition-all duration-200 ${
					mounted && theme === "system"
						? resolvedTheme === "dark"
							? "bg-[#1A1A1A] text-white"
							: "bg-white text-black"
						: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white/80"
				}`}
				aria-label="System theme"
			>
				<Icon className="size-3.5" name="laptop" />
			</button>
			<button
				type="button"
				onClick={() => setTheme("light")}
				className={`flex items-center rounded-full px-1.5 py-1.5 font-semibold text-[12px] transition-all duration-200 ${
					mounted && theme === "light"
						? "bg-white text-black dark:bg-white dark:text-black"
						: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white/80"
				}`}
				aria-label="Light mode"
			>
				<Icon className="size-3.5" name="sun" />
			</button>
			<button
				type="button"
				onClick={() => setTheme("dark")}
				className={`flex items-center rounded-full px-1.5 py-1.5 font-semibold text-[12px] transition-all duration-200 ${
					mounted && theme === "dark"
						? "bg-[#1A1A1A] text-white"
						: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white/80"
				}`}
				aria-label="Dark mode"
			>
				<Icon className="size-3.5" name="moon" />
			</button>
		</div>
	);
};

const CollapsedThemeToggle = () => {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
	return (
		<button
			type="button"
			onClick={() => setTheme(nextTheme)}
			className="flex size-7 items-center justify-center rounded-lg text-mail-muted transition-colors hover:bg-[var(--inbox-hover)] hover:text-mail-foreground"
			title={`Switch to ${nextTheme} theme`}
		>
			<Icon
				name={resolvedTheme === "dark" ? "sun" : "moon"}
				className="h-4 w-4"
			/>
		</button>
	);
};
