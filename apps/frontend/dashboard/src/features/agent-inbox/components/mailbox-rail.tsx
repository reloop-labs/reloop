import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { getAvatarInitial } from "#/utils/avatar";

function mailboxSortKey(m: AgentMailbox) {
	return (m.label || m.email).toLocaleLowerCase();
}

/** Zero-style filled circle check for the active mailbox. */
const CircleCheckBadge = ({ className }: { className?: string }) => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		aria-hidden
	>
		<path
			fill="#006ffe"
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.8566 8.19113C14.1002 7.85614 14.0261 7.38708 13.6911 7.14345C13.3561 6.89982 12.8871 6.97388 12.6434 7.30887L9.15969 12.099L7.28033 10.2197C6.98744 9.92678 6.51256 9.92678 6.21967 10.2197C5.92678 10.5126 5.92678 10.9874 6.21967 11.2803L8.71967 13.7803C8.87477 13.9354 9.08999 14.0149 9.30867 13.9977C9.52734 13.9805 9.72754 13.8685 9.85655 13.6911L13.8566 8.19113Z"
		/>
	</svg>
);

const RailMailboxAvatar = ({
	mailbox,
	active,
	onClick,
}: {
	mailbox: AgentMailbox;
	active: boolean;
	onClick: () => void;
}) => (
	<button
		type="button"
		onClick={onClick}
		title={mailbox.label || mailbox.email}
		aria-label={mailbox.label || mailbox.email}
		aria-current={active ? "true" : undefined}
		className="relative flex shrink-0 cursor-pointer items-center justify-center overflow-visible pb-1.5 focus:outline-none"
	>
		<div
			className={cn(
				"relative rounded-lg",
				active && "ring-2 ring-[#006ffe] ring-offset-0",
			)}
		>
			<div className="flex size-7 items-center justify-center rounded-lg bg-[#2B2B2B] font-semibold text-white text-xs uppercase">
				{getAvatarInitial(mailbox.label, mailbox.email)}
			</div>
			{active && (
				<CircleCheckBadge className="-right-1.5 -bottom-2 absolute z-10 size-4 rounded-full bg-[var(--sidebar-background)]" />
			)}
		</div>
	</button>
);

export function MailboxRail({
	mailbox,
	onAddMailbox,
}: {
	mailbox: AgentMailbox;
	onAddMailbox: () => void;
}) {
	const navigate = useNavigate();
	const { mailboxes } = useAgentInbox();

	const sortedMailboxes = useMemo(
		() =>
			[...mailboxes].sort((a, b) =>
				mailboxSortKey(a).localeCompare(mailboxSortKey(b)),
			),
		[mailboxes],
	);

	const switchMailbox = (id: string) => {
		if (id === mailbox.id) return;
		void navigate({ to: "/inbox/$mailboxId", params: { mailboxId: id } });
	};

	return (
		<nav
			aria-label="Mailboxes"
			className="flex h-full w-[52px] shrink-0 flex-col items-center overflow-hidden border-r border-stroke-soft-200/60 bg-sidebar pt-3.5 pb-3 dark:border-white/5"
		>
			<Link
				to="/"
				title="Back to dashboard"
				aria-label="Back to dashboard"
				className="mb-3 flex size-8 shrink-0 items-center justify-center rounded-lg text-mail-muted hover:bg-[var(--inbox-hover)] hover:text-mail-foreground"
			>
				<Icon name="arrow-left" className="h-4 w-4" />
			</Link>

			<div className="scrollbar-hide flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-x-hidden overflow-y-auto pt-0.5">
				{sortedMailboxes.map((m) => (
					<RailMailboxAvatar
						key={m.id}
						mailbox={m}
						active={m.id === mailbox.id}
						onClick={() => switchMailbox(m.id)}
					/>
				))}
				<button
					type="button"
					onClick={onAddMailbox}
					className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#929292]/50 border-dashed bg-transparent text-[#929292] hover:bg-[var(--inbox-hover)] hover:text-mail-foreground focus:outline-none active:scale-[0.97]"
					aria-label="Add mailbox"
				>
					<Plus className="size-4" />
				</button>
			</div>
		</nav>
	);
}
