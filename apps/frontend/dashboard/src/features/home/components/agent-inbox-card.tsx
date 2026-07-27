import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import {
	ArrowDown,
	ArrowRight,
	ArrowUp,
	MoreHorizontal,
	Plus,
} from "lucide-react";
import { Link } from "#/lib/navigation";
import { useNavigate } from "#/lib/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSWR } from "#/features/home/lib/use-swr-compat";

interface BackendMailbox {
	id: string;
	email: string;
	quota: string;
	status: string;
	displayName: string | null;
	createdAt: string | Date;
	sentCount?: number;
	receivedCount?: number;
}

const formatRelativeTime = (date: string | Date): string => {
	const now = Date.now();
	const then = new Date(date).getTime();
	const diffSec = Math.floor((now - then) / 1000);
	if (diffSec < 60) return `${diffSec}s ago`;
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h ago`;
	return `${Math.floor(diffHr / 24)}d ago`;
};

// ── Row actions dropdown ─────────────────────────────────────────────────────

interface MailboxActionsDropdownProps {
	mailbox: BackendMailbox;
	onOpenChange?: (open: boolean) => void;
}

const MailboxActionsDropdown = ({
	mailbox,
	onOpenChange,
}: MailboxActionsDropdownProps) => {
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const navigate = useNavigate();

	const menuItems = [
		{ id: "view", label: "View inbox", icon: "inbox" },
		{ id: "copy-email", label: "Copy email address", icon: "copy" },
		{ id: "copy-id", label: "Copy mailbox ID", icon: "copy" },
	] as const;

	const currentBtn = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentBtn?.getBoundingClientRect();

	const handleOpenChange = (val: boolean) => {
		setOpen(val);
		onOpenChange?.(val);
	};

	const handleClick = (itemId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		handleOpenChange(false);
		if (itemId === "view") void navigate({ to: "/inbox/$mailboxId", params: { mailboxId: mailbox.id } });
		else if (itemId === "copy-email") {
			navigator.clipboard.writeText(mailbox.email);
			toast.success("Email address copied");
		} else if (itemId === "copy-id") {
			navigator.clipboard.writeText(mailbox.id);
			toast.success("Mailbox ID copied");
		}
	};

	return (
		<Popover.Root open={open} onOpenChange={handleOpenChange}>
			<Popover.Trigger asChild>
				<button
					type="button"
					onClick={(e) => e.stopPropagation()}
					className="flex h-5 w-5 items-center justify-center rounded text-text-sub-600 hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white"
				>
					<MoreHorizontal className="h-3.5 w-3.5" />
				</button>
			</Popover.Trigger>
			<Popover.Content
				align="end"
				sideOffset={-1}
				className="w-44 p-2"
				showArrow={true}
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
							onClick={(e) => handleClick(item.id, e)}
							className="relative z-10 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
						>
							<Icon name={item.icon as any} className="h-3.5 w-3.5 shrink-0" />
							{item.label}
						</button>
					))}
					<AnimatedHoverBackground
						rect={currentRect}
						tabElement={currentBtn}
						className="bg-bg-weak-50 dark:bg-white/[0.04]"
					/>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};

// ── Main card ────────────────────────────────────────────────────────────────

export function AgentInboxCard() {
	const { activeOrganization } = useActiveOrganization();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const { data: mailboxesData } = useSWR<BackendMailbox[]>(
		activeOrganization?.id ? "/api/inbox/v1/mailboxes/list" : null,
	);

	const mailboxes = mailboxesData ?? [];

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<Link
					to="/agent-inbox"
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon name="inbox" className="h-4 w-4 shrink-0" />
					<span>Email Inboxes</span>
					<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-100 px-1.5 font-semibold text-[11px] text-text-sub-600 dark:bg-white/10 dark:text-white/40">
						{mailboxesData?.length ?? 0}
					</span>
				</Link>
				<div className="flex items-center gap-1.5">
					<Link
						to="/agent-inbox" search={{modal: "create-agent-mailbox"}}
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60"
					>
						<Plus className="h-3.5 w-3.5" />
					</Link>
					<Link
						to="/agent-inbox"
						className="flex h-7 w-7 shrink-0 items-center justify-center text-text-sub-600 transition-transform hover:translate-x-0.5 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
					>
						<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</div>
			</div>

			{/* Body */}
			{mailboxes.length > 0 ? (
				<div className="-mt-1.5 h-[250px] overflow-hidden rounded-xl border border-stroke-soft-100 bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					{mailboxes.slice(0, 5).map((mb) => {
						const hasSent = (mb.sentCount ?? 0) > 0;
						const hasReceived = (mb.receivedCount ?? 0) > 0;
						const hasActivity = hasSent || hasReceived;
						return (
							// Outer row is a plain div — not a link, so 3-dots won't navigate
							<div
								key={mb.id}
								className="group/row flex items-center gap-2 border-stroke-soft-100 border-b py-2.5 dark:border-white/5"
							>
								{/* Left: status dot + label (only this navigates) */}
								<Link
									to={"/inbox/$mailboxId"} params={{ mailboxId: mb.id }}
									className="flex min-w-0 flex-1 items-center gap-2 no-underline"
								>
									<span
										className={cn(
											"h-1.5 w-1.5 shrink-0 rounded-full",
											mb.status === "active"
												? "bg-success-base"
												: "bg-text-sub-600/40",
										)}
									/>
									<span className="truncate font-semibold text-text-strong-950 text-xs group-hover/row:underline dark:text-white">
										{mb.displayName || mb.email}
									</span>
									{mb.displayName && (
										<span className="hidden truncate text-text-sub-600 text-xs sm:block dark:text-white/40">
											{mb.email}
										</span>
									)}
								</Link>

								{/* Right: activity indicators OR 3-dots on hover */}
								<div className="relative flex h-5 w-14 shrink-0 items-center justify-end">
									{/* Activity — hidden on hover / when dropdown open */}
									<div
										className={cn(
											"flex items-center gap-1",
											activeDropdownId === mb.id
												? "hidden"
												: "flex group-hover/row:hidden",
										)}
									>
										{hasSent && (
											<span className="flex items-center gap-0.5 font-medium text-[10px] text-success-base">
												<ArrowUp className="h-2.5 w-2.5" />
												{mb.sentCount}
											</span>
										)}
										{hasReceived && (
											<span className="flex items-center gap-0.5 font-medium text-[10px] text-primary-base">
												<ArrowDown className="h-2.5 w-2.5" />
												{mb.receivedCount}
											</span>
										)}
										{!hasActivity && (
											<span className="text-[10px] text-text-sub-600 tabular-nums underline decoration-dotted underline-offset-2 dark:text-white/40">
												{formatRelativeTime(mb.createdAt)}
											</span>
										)}
									</div>

									{/* 3-dots — shown on hover OR when dropdown open */}
									<div
										className={cn(
											activeDropdownId === mb.id
												? "flex"
												: "hidden group-hover/row:flex",
										)}
									>
										<MailboxActionsDropdown
											mailbox={mb}
											onOpenChange={(val) => {
												if (val) {
													setActiveDropdownId(mb.id);
												} else {
													setTimeout(() => {
														setActiveDropdownId((curr) =>
															curr === mb.id ? null : curr,
														);
													}, 150);
												}
											}}
										/>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="-mt-1.5 flex h-[250px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<Icon
						name="inbox"
						className="h-6 w-6 text-text-sub-600 dark:text-white/40"
					/>
					<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
						Give your AI agents a real inbox
					</h4>
					<p className="mt-2 max-w-[300px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
						Create dedicated email addresses your agents can send and receive
						from, just like a human would
					</p>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="mt-6 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Link to="/agent-inbox" search={{modal: "create-agent-mailbox"}}>
							Create email inbox
						</Link>
					</Button.Root>
				</div>
			)}
		</div>
	);
}
