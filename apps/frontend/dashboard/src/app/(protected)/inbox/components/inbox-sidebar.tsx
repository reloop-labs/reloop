"use client";

import { InboxLabelDialog } from "@fe/dashboard/app/(protected)/inbox/components/inbox-label-dialog";
import { InboxNavUser } from "@fe/dashboard/app/(protected)/inbox/components/inbox-nav-user";
import { useInboxSidebar } from "@fe/dashboard/app/(protected)/inbox/components/inbox-sidebar-context";
import { AddAgentAddressModal } from "@fe/dashboard/app/(protected)/inbox/components/add-agent-address-modal";
import { ComposeModal } from "@fe/dashboard/app/(protected)/inbox/components/compose-modal";
import { useInboxFolderStats } from "@fe/dashboard/app/(protected)/inbox/hooks/use-inbox-folder-stats";
import { useInboxLabels } from "@fe/dashboard/app/(protected)/inbox/hooks/use-inbox-labels";
import type { AgentMailbox } from "@fe/dashboard/app/(protected)/inbox/types";
import { cn } from "@reloop/ui/cn";
import {
	AlertCircle,
	Archive,
	Bookmark,
	Clock,
	Folder,
	Inbox,
	MessageSquare,
	Pencil,
	Phone,
	Plane,
	Plus,
	Settings,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
		"flex w-full items-center rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-[#202020]",
		active && "bg-[#202020] text-mail-foreground",
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
						<span className="shrink-0 text-mail-muted tabular-nums">
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
			<div className="mx-2 mb-2 mt-1 h-px bg-[#262626]" />
		) : (
			<p className="mx-2 mb-2 text-[13px] text-[#898989]">{title}</p>
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

	const mailboxId = mailbox.id;
	const base = `/inbox/${mailboxId}`;

	const coreItems: NavItem[] = [
		{ id: "inbox", label: "Inbox", href: base, icon: Inbox, showCount: true },
		{ id: "drafts", label: "Drafts", href: `${base}/drafts`, icon: Folder },
		{ id: "sent", label: "Sent", href: `${base}/sent`, icon: Plane, showCount: true },
	];

	const managementItems: NavItem[] = [
		{
			id: "archive",
			label: "Archive",
			href: `${base}/archive`,
			icon: Archive,
			showCount: true,
		},
		{ id: "snoozed", label: "Snoozed", href: `${base}/snoozed`, icon: Clock },
		{
			id: "spam",
			label: "Spam",
			href: `${base}/spam`,
			icon: AlertCircle,
			showCount: true,
		},
		{
			id: "trash",
			label: "Bin",
			href: `${base}/trash`,
			icon: Trash2,
			showCount: true,
		},
	];

	const bottomItems: NavItem[] = [
		{
			id: "support",
			label: "Live Support",
			href: "https://discord.gg/mail0",
			icon: Phone,
			external: true,
		},
		{
			id: "feedback",
			label: "Feedback",
			href: "https://feedback.0.email",
			icon: MessageSquare,
			external: true,
		},
		{
			id: "settings",
			label: "Settings",
			href: "/settings",
			icon: Settings,
		},
	];

	const activeLabelId = folder.startsWith("label:") ? folder.slice(6) : null;

	const labelIcon = (icon?: string) =>
		icon === "bookmark" ? Bookmark : Folder;

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

					<button
						type="button"
						onClick={() => setIsComposeOpen(true)}
						className={cn(
							"relative mb-1.5 inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1 self-stretch overflow-hidden rounded-lg border-none bg-zero-blue text-white transition-colors hover:bg-zero-blue-hover",
							collapsed && "px-0",
						)}
					>
						<Pencil className="h-3.5 w-3.5 fill-white" />
						{!collapsed && (
							<span className="text-sm leading-none">New email</span>
						)}
					</button>
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
								<span className="text-[13px] text-[#898989]">Labels</span>
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
									const Icon = labelIcon(label.icon);
									const href = `${base}/label/${label.id}`;
									const active =
										activeLabelId === label.id ||
										pathname === href;
									return (
										<Link
											key={label.id}
											href={href}
											className={cn(
												"flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-[#202020]",
												active
													? "bg-[#202020] text-mail-foreground"
													: "text-mail-muted",
											)}
										>
											<Icon className="h-3.5 w-3.5 shrink-0" />
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

				<div className={cn("mt-auto space-y-1", collapsed && "px-0")}>
					{bottomItems.map((item) => (
						<NavLink
							key={item.id}
							item={item}
							active={false}
							collapsed={collapsed}
						/>
					))}
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
				onSubmit={(name) => {
					const id = addLabel(name);
					if (id) {
						toast.success(`Label "${name}" created`);
						router.push(`${base}/label/${id}`);
					}
				}}
			/>
		</>
	);
};
