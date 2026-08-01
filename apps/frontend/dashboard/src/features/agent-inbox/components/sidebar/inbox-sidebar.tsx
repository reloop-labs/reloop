import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import { Logo } from "@reloop/ui/logo";
import { Skeleton } from "@reloop/ui/skeleton";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { AddAgentAddressModal } from "#/features/agent-inbox/components/add-agent-address-modal";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import { ComposeModal } from "#/features/agent-inbox/components/compose/compose-modal";
import { MailboxRail } from "#/features/agent-inbox/components/mailbox-rail/mailbox-rail";
import { SectionError } from "#/features/agent-inbox/components/shared/section-error";
import { InboxLabelDialog } from "#/features/agent-inbox/components/sidebar/inbox-label-dialog";
import { InboxNavUser } from "#/features/agent-inbox/components/sidebar/inbox-nav-user";
import { useInboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-context";
import { useInboxFolderStats } from "#/features/agent-inbox/hooks/use-inbox-folder-stats";
import { useInboxLabels } from "#/features/agent-inbox/hooks/use-inbox-labels";
import { resolveLabelColor } from "#/features/agent-inbox/lib/label-colors";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

const InboxIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="inbox" {...props} />
);

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

const PencilIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="pencil" {...props} />
);

type NavItem = {
	id: string;
	label: string;
	/** App-relative path, e.g. `/inbox/{id}/sent` */
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	showCount?: boolean;
	external?: boolean;
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
		"group relative z-10 flex h-8 w-full items-center rounded-lg px-2.5 font-medium text-[13px]",
		active && "text-mail-foreground",
		!active && "text-mail-muted",
		collapsed ? "justify-center" : "gap-2.5",
	);

	const content = (
		<>
			<item.icon
				className={cn(
					"h-3.5 w-3.5 shrink-0",
					active
						? "text-mail-foreground"
						: "text-mail-muted opacity-70 group-hover:text-mail-foreground group-hover:opacity-100",
				)}
			/>
			{!collapsed && (
				<>
					<span className="relative bottom-px mt-0.5 min-w-0 flex-1 truncate text-left">
						{item.label}
					</span>
					{item.showCount &&
						(countLoading ? (
							<Skeleton className="mr-[3px] h-3 w-5 shrink-0 rounded-sm bg-[var(--inbox-skeleton)]" />
						) : count !== undefined ? (
							<span className="mr-[3px] shrink-0 text-mail-muted tabular-nums">
								{count.toLocaleString()}
							</span>
						) : null)}
				</>
			)}
		</>
	);

	if (item.external) {
		return (
			<a
				ref={refCallback}
				onPointerEnter={onPointerEnter}
				href={item.href}
				target="_blank"
				rel="noopener noreferrer"
				className={className}
				title={collapsed ? item.label : undefined}
			>
				{content}
			</a>
		);
	}

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

const NavSection = ({
	title,
	items,
	folder,
	stats,
	countsLoading = false,
	collapsed,
	registerRef,
	onHoverItem,
	isFirst = false,
}: {
	title: string;
	items: NavItem[];
	folder: string;
	stats: ReturnType<typeof useInboxFolderStats>;
	countsLoading?: boolean;
	collapsed: boolean;
	registerRef: (id: string, el: HTMLAnchorElement | null) => void;
	onHoverItem: (id: string) => void;
	isFirst?: boolean;
}) => (
	<div className="pb-2">
		{collapsed ? (
			<div className="mx-2 mt-1 mb-2 h-px bg-[var(--inbox-muted-bg)]" />
		) : (
			<p
				className={cn(
					"mx-2 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]",
					isFirst ? "pt-1.5" : "pt-4",
				)}
			>
				{title}
			</p>
		)}
		{items.map((item) => (
			<NavLink
				key={item.id}
				item={item}
				active={folder === item.id}
				count={stats[item.id as keyof typeof stats] as number | undefined}
				countLoading={countsLoading}
				collapsed={collapsed}
				refCallback={(el) => registerRef(item.id, el)}
				onPointerEnter={() => onHoverItem(item.id)}
			/>
		))}
	</div>
);

export const InboxSidebar = ({
	mailbox,
	folder,
}: {
	mailbox: AgentMailbox;
	folder: string;
}) => {
	const router = useRouter();
	const { collapsed, registerOpenCompose } = useInboxSidebar();
	const {
		isLoadingMailboxes,
		isLoadingThreads,
		mailboxesError,
		retryMailboxes,
		getMailbox,
	} = useAgentInbox();
	const mailboxReady = !!getMailbox(mailbox.id) && !!mailbox.email;
	const stats = useInboxFolderStats(mailbox.id);
	const {
		labels,
		addLabel,
		isLoading: isLoadingLabels,
		labelsError,
		refreshLabels,
	} = useInboxLabels(mailboxReady ? mailbox.id : "");
	/** Counts depend on thread data — skeleton until mailbox + threads settle. */
	const countsLoading = !mailboxReady || isLoadingMailboxes || isLoadingThreads;
	const labelsLoading = !mailboxReady || isLoadingLabels;

	const [isComposeOpen, setIsComposeOpen] = useState(false);
	const [isAddMailboxOpen, setIsAddMailboxOpen] = useState(false);
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
		// Remeasure only when the active/hovered element or folder changes —
		// not when folder counts update after mark-as-read (that was causing
		// the hover pill to re-spring and flicker sidebar text).
	}, [currentEl, folder]);

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

	const mailboxId = mailbox.id;

	const coreItems: NavItem[] = [
		{
			id: "inbox",
			label: "Inbox",
			href: `/inbox/${mailboxId}`,
			icon: InboxIcon,
			showCount: true,
		},
		{
			id: "agent",
			label: "Agent",
			href: `/inbox/${mailboxId}/agent`,
			icon: AgentIcon,
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
			showCount: true,
		},
	];

	const managementItems: NavItem[] = [
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
			label: "Bin",
			href: `/inbox/${mailboxId}/trash`,
			icon: TrashIcon,
			showCount: true,
		},
	];

	const activeLabelId = folder.startsWith("label:") ? folder.slice(6) : null;

	return (
		<>
			<div className="flex h-full shrink-0">
				<MailboxRail
					activeMailboxId={mailbox.id}
					onAddMailbox={() => setIsAddMailboxOpen(true)}
				/>
				<aside
					className={cn(
						"flex h-full shrink-0 select-none flex-col bg-sidebar pb-2 transition-[width] duration-200 ease-in-out",
						collapsed ? "w-[52px] px-2 pt-2.5" : "w-[240px] px-4 pt-2.5",
					)}
				>
					<div
						className={cn(
							"mb-1 flex items-center",
							collapsed ? "h-10 w-full justify-center" : "gap-2 px-0.5",
						)}
					>
						{collapsed ? (
							<Logo className="h-8 w-8 shrink-0" />
						) : (
							<>
								<Logo className="-ml-2.5 w-10" />
								<p className="-ml-2 font-semibold text-mail-foreground">
									Reloop
								</p>
								<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-mail-muted uppercase tracking-wide dark:bg-white/[0.06]">
									Beta
								</span>
							</>
						)}
					</div>

					<div className="flex flex-col gap-2">
						{mailboxesError && !mailboxReady ? (
							<SectionError
								compact
								message="Couldn't load mailbox"
								onRetry={() => void retryMailboxes()}
							/>
						) : (
							<InboxNavUser
								mailbox={mailbox}
								collapsed={collapsed}
								loading={!mailboxReady}
							/>
						)}

						<FancyButton.Root
							onClick={() => {
								if (!mailboxReady) return;
								setIsComposeOpen(true);
							}}
							variant="neutral"
							size="xsmall"
							className={cn(
								// Avoid FancyButton's default `transition` animating opacity when
								// the button mounts / leaves a loading-disabled state.
								"!transition-none after:!transition-none mt-3 mb-1.5 w-full",
								collapsed && "px-0",
							)}
						>
							<FancyButton.Icon
								as={PencilIcon}
								className="h-3.5 w-3.5 fill-white text-white"
							/>
							{!collapsed && (
								<>
									<span className="text-sm leading-none">New email</span>
									<div className="-translate-y-1/2 absolute top-1/2 right-2.5 z-20 flex items-center gap-0.5 opacity-70">
										<KbdKeyOutline className="h-4 w-4 border-white/30 font-sans text-[9px] text-white">
											⌥
										</KbdKeyOutline>
										<KbdKeyOutline className="h-4 w-4 border-white/30 font-sans text-[9px] text-white">
											n
										</KbdKeyOutline>
									</div>
								</>
							)}
						</FancyButton.Root>
					</div>

					<div
						onPointerLeave={() => setHoveredEl(undefined)}
						className="relative mt-5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
					>
						<NavSection
							title="Core"
							items={coreItems}
							folder={folder}
							stats={stats}
							countsLoading={countsLoading}
							collapsed={collapsed}
							registerRef={(id, el) => {
								if (el) navRefs.current[id] = el;
							}}
							onHoverItem={(id) => setHoveredEl(navRefs.current[id])}
							isFirst
						/>
						<NavSection
							title="Management"
							items={managementItems}
							folder={folder}
							stats={stats}
							countsLoading={countsLoading}
							collapsed={collapsed}
							registerRef={(id, el) => {
								if (el) navRefs.current[id] = el;
							}}
							onHoverItem={(id) => setHoveredEl(navRefs.current[id])}
						/>

						{!collapsed && (
							<div className="pb-4">
								<div className="mx-2 flex items-center justify-between pt-4 pb-1.5">
									<span className="font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]">
										Labels
									</span>
									<button
										type="button"
										onClick={() => setIsLabelDialogOpen(true)}
										disabled={!mailboxReady}
										className="flex size-5 items-center justify-center rounded-md text-text-soft-400 hover:bg-[var(--inbox-hover)] hover:text-mail-foreground disabled:opacity-40"
										aria-label="Create label (⌥L)"
										title="Create label (⌥L)"
									>
										<Plus className="h-3.5 w-3.5" />
									</button>
								</div>
								<div className="flex flex-col">
									{labelsError ? (
										<SectionError
											compact
											message="Couldn't load labels"
											onRetry={() => void refreshLabels()}
										/>
									) : labelsLoading ? (
										<div className="space-y-1 px-0.5 py-1" aria-busy="true">
											<span className="sr-only">Loading labels</span>
											{/* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton */}
											{[0, 1, 2].map((i) => (
												<div
													key={i}
													className="flex h-8 items-center gap-2.5 px-2.5"
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
											className="group relative z-10 flex flex-col items-start gap-0.5 rounded-lg px-2.5 py-2.5 text-left hover:bg-[var(--inbox-hover)]"
										>
											<span className="font-medium text-[12px] text-mail-muted group-hover:text-mail-foreground">
												No labels yet
											</span>
											<span className="text-[11px] text-text-soft-400">
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
														"group relative z-10 flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 font-medium text-[13px]",
														active ? "text-mail-foreground" : "text-mail-muted",
													)}
												>
													<span
														className="size-2.5 shrink-0 rounded-full ring-1 ring-black/5 dark:ring-white/10"
														style={{ backgroundColor: swatch }}
														aria-hidden
													/>
													<span className="relative bottom-px mt-0.5 min-w-0 flex-1 truncate">
														{label.name}
													</span>
												</Link>
											);
										})
									)}
								</div>
							</div>
						)}
						<AnimatedHoverBackground
							rect={rect}
							tabElement={currentEl}
							className="!bg-neutral-alpha-10"
						/>
					</div>

					<div className="mt-auto flex w-full py-2">
						{!collapsed ? <FooterThemeToggle /> : <CollapsedThemeToggle />}
					</div>
				</aside>
			</div>

			<ComposeModal
				isOpen={isComposeOpen}
				onClose={() => setIsComposeOpen(false)}
				mailbox={mailbox}
			/>
			<AddAgentAddressModal
				isOpen={isAddMailboxOpen}
				onClose={() => setIsAddMailboxOpen(false)}
				onCreated={(created) => {
					toast.success("Mailbox added");
					router.push(`/inbox/${created.id}`);
				}}
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
