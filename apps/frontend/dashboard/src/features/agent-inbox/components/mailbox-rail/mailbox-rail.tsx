"use client";

import { cn } from "@reloop/ui/cn";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { SectionError } from "../shared/section-error";
import { MailboxRailSkeleton } from "./mailbox-rail-skeleton";

function mailboxSortKey(m: AgentMailbox) {
	return (m.label || m.email).toLocaleLowerCase();
}

/** Active mailbox badge */
const CircleCheckBadge = ({ className }: { className?: string }) => (
	<svg
		width="14"
		height="14"
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
			fill="#1868DF"
			stroke="#ffffff"
			strokeWidth="1.5"
		/>
		<path
			d="M6.4 10.15L8.85 12.55L13.6 7.45"
			stroke="#ffffff"
			strokeWidth="2"
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
	const displayName = mailbox.label || mailbox.email.split("@")[0] || "Inbox";

	return (
		<div className="group relative flex w-full items-center justify-center">
			{/* Left active/hover indicator pill */}
			<div
				className={cn(
					"absolute -left-0.5 w-1 rounded-r-full bg-zero-blue transition-all duration-200",
					active
						? "h-6 opacity-100"
						: "h-2 opacity-0 group-hover:h-4 group-hover:opacity-60",
				)}
			/>

			<button
				type="button"
				onClick={onClick}
				title={`${displayName} (${mailbox.email})`}
				aria-label={`${displayName} (${mailbox.email})`}
				aria-current={active ? "true" : undefined}
				className="relative flex shrink-0 cursor-pointer items-center justify-center p-0.5 focus:outline-none"
			>
				<div
					className={cn(
						"relative transition-transform duration-150 group-hover:scale-105 active:scale-95",
					)}
				>
					<div
						className={cn(
							"flex size-9 items-center justify-center rounded-xl font-bold text-white text-xs uppercase shadow-sm transition-all",
							getAvatarGradient(mailbox.email || displayName),
							active
								? "ring-2 ring-zero-blue ring-offset-2 ring-offset-panel-light dark:ring-white dark:ring-offset-panel-dark"
								: "ring-1 ring-black/10 dark:ring-white/10 hover:ring-black/20 dark:hover:ring-white/30",
						)}
					>
						{getAvatarInitial(mailbox.label, mailbox.email)}
					</div>
					{active && (
						<CircleCheckBadge className="-right-1 -bottom-1 absolute z-10 size-3.5" />
					)}
				</div>
			</button>
		</div>
	);
};

export function MailboxRail({
	activeMailboxId,
	currentFolder = "inbox",
	onAddMailbox,
}: {
	activeMailboxId: string;
	currentFolder?: string;
	onAddMailbox: () => void;
}) {
	const router = useRouter();
	const { mailboxes, isLoadingMailboxes, mailboxesError, retryMailboxes } =
		useAgentInbox();

	const sortedMailboxes = useMemo(
		() =>
			[...mailboxes].sort((a, b) =>
				mailboxSortKey(a).localeCompare(mailboxSortKey(b)),
			),
		[mailboxes],
	);

	const switchMailbox = (id: string) => {
		if (id === activeMailboxId) return;
		const folderParam =
			currentFolder && currentFolder !== "inbox"
				? `&folder=${encodeURIComponent(currentFolder)}`
				: "";
		router.push(`/inbox?mailboxId=${encodeURIComponent(id)}${folderParam}`);
	};

	return (
		<nav
			aria-label="Mailboxes"
			className="flex h-full w-[54px] shrink-0 flex-col items-center border-stroke-soft-100 border-r bg-bg-white-0 py-3 dark:border-white/10 dark:bg-black"
		>
			<div className="flex min-h-0 w-full flex-1 flex-col items-center gap-3 overflow-y-auto overflow-x-hidden pt-0.5">
				{mailboxesError ? (
					<SectionError
						compact
						message="Failed"
						onRetry={() => void retryMailboxes()}
						className="px-1"
					/>
				) : isLoadingMailboxes && sortedMailboxes.length === 0 ? (
					<MailboxRailSkeleton count={3} />
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

						<div className="w-6 border-stroke-soft-100 border-t my-0.5 dark:border-white/10" />

						<button
							type="button"
							onClick={onAddMailbox}
							title="Add inbox address"
							aria-label="Add inbox address"
							className="group flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-stroke-soft-200 border-dashed bg-bg-weak-50/50 text-text-sub-600 transition-all duration-150 hover:border-text-strong-950 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:scale-105 active:scale-95 focus:outline-none dark:border-white/20 dark:bg-white/[0.04] dark:hover:border-white/50 dark:hover:bg-white/[0.08] dark:hover:text-white"
						>
							<Plus className="size-4 transition-transform group-hover:rotate-90 duration-200" />
						</button>
					</>
				)}
			</div>
		</nav>
	);
}
