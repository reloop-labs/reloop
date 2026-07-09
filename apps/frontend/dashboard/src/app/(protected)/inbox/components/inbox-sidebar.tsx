"use client";

import { AddAgentAddressModal } from "@fe/dashboard/app/(protected)/inbox/components/add-agent-address-modal";
import { ComposeModal } from "@fe/dashboard/app/(protected)/inbox/components/compose-modal";
import { InboxLabelDialog } from "@fe/dashboard/app/(protected)/inbox/components/inbox-label-dialog";
import { InboxNavUser } from "@fe/dashboard/app/(protected)/inbox/components/inbox-nav-user";
import { useInboxSidebar } from "@fe/dashboard/app/(protected)/inbox/components/inbox-sidebar-context";
import { useInboxFolderStats } from "@fe/dashboard/app/(protected)/inbox/hooks/use-inbox-folder-stats";
import { useInboxLabels } from "@fe/dashboard/app/(protected)/inbox/hooks/use-inbox-labels";
import type { AgentMailbox } from "@fe/dashboard/app/(protected)/inbox/types";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

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

const SnoozeIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="snooze" {...props} />
);

const AlertIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="alert" {...props} />
);

const AgentIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="agent" {...props} />
);

const TagIcon = (props: Omit<React.ComponentProps<typeof Icon>, "name">) => (
	<Icon name="tag" {...props} />
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
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	showCount?: boolean;
	external?: boolean;
};

const NavLink = ({
	item,
	active,
	count,
	collapsed,
}: {
	item: NavItem;
	active: boolean;
	count?: number;
	collapsed: boolean;
}) => {
	const className = cn(
		"flex w-full items-center rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-[var(--inbox-hover)]",
		active && "bg-[var(--inbox-active)] font-medium text-mail-foreground",
		!active && "text-mail-muted",
		collapsed ? "justify-center" : "gap-2",
	);

	const content = (
		<>
			<item.icon className="h-3.5 w-3.5 shrink-0" />
			{!collapsed && (
				<>
					<span className="relative bottom-px mt-0.5 min-w-0 flex-1 truncate text-left">
						{item.label}
					</span>
					{item.showCount && count !== undefined && (
						<span className="mr-[3px] shrink-0 text-mail-muted tabular-nums">
							{count.toLocaleString()}
						</span>
					)}
				</>
			)}
		</>
	);

	if (item.external) {
		return (
			<a
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
	collapsed,
}: {
	title: string;
	items: NavItem[];
	folder: string;
	stats: ReturnType<typeof useInboxFolderStats>;
	collapsed: boolean;
}) => (
	<div className="space-y-1 pb-2">
		{collapsed ? (
			<div className="mx-2 mt-1 mb-2 h-px bg-[var(--inbox-muted-bg)]" />
		) : (
			<p className="mx-2 mb-2 text-[#898989] text-[13px]">{title}</p>
		)}
		{items.map((item) => (
			<NavLink
				key={item.id}
				item={item}
				active={folder === item.id}
				count={stats[item.id as keyof typeof stats] as number | undefined}
				collapsed={collapsed}
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
	const pathname = usePathname();
	const { collapsed, registerOpenCompose } = useInboxSidebar();
	const stats = useInboxFolderStats(mailbox.id);
	const { labels, addLabel } = useInboxLabels(mailbox.id);

	const [isComposeOpen, setIsComposeOpen] = useState(false);
	const [isAddMailboxOpen, setIsAddMailboxOpen] = useState(false);
	const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);

	useEffect(() => {
		registerOpenCompose(() => setIsComposeOpen(true));
	}, [registerOpenCompose]);

	useHotkeys("alt+n", (e) => {
		e.preventDefault();
		setIsComposeOpen(true);
	});

	const mailboxId = mailbox.id;
	const base = `/inbox/${mailboxId}`;

	const coreItems: NavItem[] = [
		{
			id: "inbox",
			label: "Inbox",
			href: base,
			icon: InboxIcon,
			showCount: true,
		},
		{
			id: "agent",
			label: "Agent",
			href: `${base}/agent`,
			icon: AgentIcon,
			showCount: true,
		},
		{ id: "drafts", label: "Drafts", href: `${base}/drafts`, icon: DraftIcon },
		{
			id: "sent",
			label: "Sent",
			href: `${base}/sent`,
			icon: SentIcon,
			showCount: true,
		},
	];

	const managementItems: NavItem[] = [
		{
			id: "archive",
			label: "Archive",
			href: `${base}/archive`,
			icon: ArchiveIcon,
			showCount: true,
		},
		{
			id: "snoozed",
			label: "Snoozed",
			href: `${base}/snoozed`,
			icon: SnoozeIcon,
		},
		{
			id: "spam",
			label: "Spam",
			href: `${base}/spam`,
			icon: AlertIcon,
			showCount: true,
		},
		{
			id: "trash",
			label: "Bin",
			href: `${base}/trash`,
			icon: TrashIcon,
			showCount: true,
		},
	];

	const activeLabelId = folder.startsWith("label:") ? folder.slice(6) : null;

	return (
		<>
			<aside
				className={cn(
					"flex h-full shrink-0 select-none flex-col bg-sidebar pb-2 transition-[width] duration-200 ease-in-out",
					collapsed ? "w-[52px] px-2 pt-2.5" : "w-[240px] px-4 pt-2.5",
				)}
			>
				<div className="flex flex-col gap-2">
					<InboxNavUser
						mailbox={mailbox}
						collapsed={collapsed}
						onAddMailbox={() => setIsAddMailboxOpen(true)}
					/>

					<FancyButton.Root
						onClick={() => setIsComposeOpen(true)}
						variant="blue"
						size="small"
						className={cn("mb-1.5 w-full rounded-xl", collapsed && "px-0")}
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

				<div className="scrollbar-hide mt-5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
					<NavSection
						title="Core"
						items={coreItems}
						folder={folder}
						stats={stats}
						collapsed={collapsed}
					/>
					<NavSection
						title="Management"
						items={managementItems}
						folder={folder}
						stats={stats}
						collapsed={collapsed}
					/>

					{!collapsed && (
						<div className="pb-4">
							<div className="mx-2 mb-4 flex items-center justify-between">
								<span className="text-[#898989] text-[13px]">Labels</span>
								<button
									type="button"
									onClick={() => setIsLabelDialogOpen(true)}
									className="mr-1 flex h-4 w-4 items-center justify-center hover:bg-transparent"
									aria-label="Create label"
								>
									<Plus className="h-3 w-3 text-[#898989]" />
								</button>
							</div>
							<div className="space-y-1">
								{labels.map((label) => {
									const href = `${base}/label/${label.id}`;
									const active =
										activeLabelId === label.id || pathname === href;
									return (
										<Link
											key={label.id}
											href={href}
											className={cn(
												"flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-[var(--inbox-hover)]",
												active
													? "bg-[var(--inbox-active)] font-medium text-mail-foreground"
													: "text-mail-muted",
											)}
										>
											<TagIcon
												className="h-3.5 w-3.5 shrink-0"
												style={{
													color:
														label.color === "default" ? undefined : label.color,
												}}
											/>
											<span className="relative bottom-px mt-0.5 min-w-0 flex-1 truncate">
												{label.name}
											</span>
										</Link>
									);
								})}
							</div>
						</div>
					)}
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
				onSubmit={async (name) => {
					const id = await addLabel(name);
					if (id) {
						toast.success(`Label "${name}" created`);
						router.push(`${base}/label/${id}`);
					} else {
						toast.error("Failed to create label");
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
