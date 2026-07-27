import { useRouter } from "next/navigation";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Link } from "#/lib/navigation";

import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { SectionError } from "../shared/section-error";
import { MailboxRailSkeleton } from "./mailbox-rail-skeleton";

function mailboxSortKey(m: AgentMailbox) {
	return (m.label || m.email).toLocaleLowerCase();
}

/** Active mailbox badge — black fill, white check, thin white border. */
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
		<circle
			cx="10"
			cy="10"
			r="8.25"
			fill="#000000"
			stroke="#ffffff"
			strokeWidth="1.5"
		/>
		<path
			d="M6.4 10.15L8.85 12.55L13.6 7.45"
			stroke="#ffffff"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
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
}) => {
	const displayName = mailbox.label || mailbox.email;

	return (
		<button
			type="button"
			onClick={onClick}
			title={displayName}
			aria-label={displayName}
			aria-current={active ? "true" : undefined}
			className="relative flex shrink-0 cursor-pointer items-center justify-center overflow-visible pb-1.5 focus:outline-none"
		>
			<div
				className={cn(
					"relative rounded-lg",
					active && "ring-2 ring-black ring-offset-0",
				)}
			>
				<div
					className={cn(
						"flex size-7 items-center justify-center rounded-lg font-semibold text-white text-xs uppercase",
						getAvatarGradient(displayName),
					)}
				>
					{getAvatarInitial(mailbox.label, mailbox.email)}
				</div>
				{active && (
					<CircleCheckBadge className="-right-1.5 -bottom-2 absolute z-10 size-4" />
				)}
			</div>
		</button>
	);
};

export function MailboxRail({
	activeMailboxId,
	onAddMailbox,
}: {
	activeMailboxId: string;
	onAddMailbox: () => void;
}) {
	const router = useRouter();
	const {
		mailboxes,
		isLoadingMailboxes,
		mailboxesError,
		retryMailboxes,
	} = useAgentInbox();

	const sortedMailboxes = useMemo(
		() =>
			[...mailboxes].sort((a, b) =>
				mailboxSortKey(a).localeCompare(mailboxSortKey(b)),
			),
		[mailboxes],
	);

	const switchMailbox = (id: string) => {
		if (id === activeMailboxId) return;
		router.push(`/inbox/${id}`);
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

			<div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-x-hidden overflow-y-auto pt-0.5">
				{mailboxesError ? (
					<SectionError
						compact
						message="Failed to load"
						onRetry={() => void retryMailboxes()}
						className="px-1"
					/>
				) : isLoadingMailboxes && sortedMailboxes.length === 0 ? (
					<MailboxRailSkeleton />
				) : (
					<>
						{sortedMailboxes.map((m) => (
							<RailMailboxAvatar
								key={m.id}
								mailbox={m}
								active={m.id === activeMailboxId}
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
					</>
				)}
			</div>
		</nav>
	);
}
