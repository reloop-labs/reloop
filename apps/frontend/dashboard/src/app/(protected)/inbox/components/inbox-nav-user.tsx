"use client";

import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import type { AgentMailbox } from "@fe/dashboard/app/(protected)/inbox/types";
import { getAvatarInitial } from "@fe/dashboard/utils/avatar";
import { cn } from "@reloop/ui/cn";
import { Check, Copy, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

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

const MailboxAvatar = ({
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
		title={mailbox.email}
		className="relative flex shrink-0 cursor-pointer items-center rounded-lg focus:outline-none"
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

export const InboxNavUser = ({
	mailbox,
	collapsed,
	onAddMailbox,
}: {
	mailbox: AgentMailbox;
	collapsed: boolean;
	onAddMailbox: () => void;
}) => {
	const router = useRouter();
	const { mailboxes, updateMailboxDisplayName } = useAgentInbox();
	const [copied, setCopied] = useState(false);
	const [isEditingName, setIsEditingName] = useState(false);
	const [nameDraft, setNameDraft] = useState("");
	const [isSavingName, setIsSavingName] = useState(false);
	const [showNameSaved, setShowNameSaved] = useState(false);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const skipNameSaveRef = useRef(false);
	const nameSavedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	useEffect(() => {
		return () => {
			if (nameSavedTimeoutRef.current) {
				clearTimeout(nameSavedTimeoutRef.current);
			}
		};
	}, []);

	const sortedMailboxes = useMemo(
		() =>
			[...mailboxes].sort((a, b) =>
				mailboxSortKey(a).localeCompare(mailboxSortKey(b)),
			),
		[mailboxes],
	);

	const displayName = mailbox.label || mailbox.email?.split("@")[0] || "";

	useEffect(() => {
		if (isEditingName) {
			nameInputRef.current?.focus();
			nameInputRef.current?.select();
		}
	}, [isEditingName]);

	const switchMailbox = (id: string) => {
		if (id === mailbox.id) return;
		router.push(`/inbox/${id}`);
	};

	const handleCopy = () => {
		void navigator.clipboard.writeText(mailbox.email);
		setCopied(true);
		toast.success("Email copied");
		setTimeout(() => setCopied(false), 2000);
	};

	const startEditingName = () => {
		if (isSavingName) return;
		skipNameSaveRef.current = false;
		setShowNameSaved(false);
		if (nameSavedTimeoutRef.current) {
			clearTimeout(nameSavedTimeoutRef.current);
			nameSavedTimeoutRef.current = null;
		}
		setNameDraft(displayName);
		setIsEditingName(true);
	};

	const cancelEditingName = () => {
		skipNameSaveRef.current = true;
		setIsEditingName(false);
		setNameDraft("");
	};

	const saveDisplayName = async () => {
		if (skipNameSaveRef.current) {
			skipNameSaveRef.current = false;
			return;
		}

		const trimmed = nameDraft.trim();
		if (!trimmed || trimmed === displayName) {
			setIsEditingName(false);
			setNameDraft("");
			return;
		}

		setIsSavingName(true);
		setShowNameSaved(false);
		try {
			await updateMailboxDisplayName(mailbox.id, trimmed);
			setIsEditingName(false);
			setNameDraft("");
			setShowNameSaved(true);
			if (nameSavedTimeoutRef.current) {
				clearTimeout(nameSavedTimeoutRef.current);
			}
			nameSavedTimeoutRef.current = setTimeout(() => {
				setShowNameSaved(false);
				nameSavedTimeoutRef.current = null;
			}, 1200);
		} catch {
			// Stay in edit mode so the user can retry
		} finally {
			setIsSavingName(false);
		}
	};

	const addButton = (
		<button
			type="button"
			onClick={onAddMailbox}
			className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#929292]/50 border-dashed bg-transparent px-0 text-[#929292] transition duration-200 ease-out hover:bg-[var(--inbox-hover)] hover:text-mail-foreground focus:outline-none active:scale-[0.97] dark:bg-[#262626]"
			aria-label="Add mailbox"
		>
			<Plus className="size-4" />
		</button>
	);

	if (collapsed) {
		return (
			<div className="flex flex-col items-center gap-2 overflow-visible pb-1">
				<MailboxAvatar
					mailbox={mailbox}
					active
					onClick={() => switchMailbox(mailbox.id)}
				/>
				{addButton}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 overflow-visible">
			<div className="flex items-center gap-2 overflow-visible pb-1.5">
				{sortedMailboxes.map((m) => (
					<MailboxAvatar
						key={m.id}
						mailbox={m}
						active={m.id === mailbox.id}
						onClick={() => switchMailbox(m.id)}
					/>
				))}
				{addButton}
			</div>

			<div className="mt-2 flex w-full flex-col gap-1 text-left">
				<div className="flex min-h-[1.25rem] items-center gap-1.5 font-medium text-[14px] text-mail-foreground leading-snug">
					{isEditingName ? (
						<input
							ref={nameInputRef}
							value={nameDraft}
							onChange={(e) => setNameDraft(e.target.value)}
							onBlur={() => {
								void saveDisplayName();
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									void saveDisplayName();
								} else if (e.key === "Escape") {
									e.preventDefault();
									cancelEditingName();
								}
							}}
							disabled={isSavingName}
							maxLength={255}
							aria-label="Mailbox display name"
							className="min-w-0 max-w-[14.5ch] flex-1 rounded-sm border-0 bg-transparent p-0 font-medium text-[14px] text-mail-foreground leading-snug outline-none ring-1 ring-[#006ffe]/60 focus:ring-[#006ffe] disabled:opacity-70"
						/>
					) : (
						<button
							type="button"
							onClick={startEditingName}
							title="Click to rename"
							className="max-w-[14.5ch] cursor-text truncate text-left focus:outline-none"
						>
							{displayName}
						</button>
					)}
					{(isSavingName || showNameSaved) && (
						<span
							className="flex size-3.5 shrink-0 items-center justify-center"
							aria-live="polite"
						>
							<span className="sr-only">
								{isSavingName ? "Saving" : "Saved"}
							</span>
							{isSavingName ? (
								<Loader2 className="size-3 animate-spin text-mail-muted" />
							) : (
								<Check className="size-3 text-green-500" />
							)}
						</span>
					)}
				</div>
				<div className="flex w-full items-center gap-1.5">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							handleCopy();
						}}
						className="h-5 max-w-[170px] cursor-pointer truncate text-left text-[13px] text-mail-muted leading-snug transition-colors hover:text-mail-foreground focus:outline-none"
						title="Copy email address"
					>
						{mailbox.email}
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							handleCopy();
						}}
						className="flex shrink-0 cursor-pointer items-center justify-center text-mail-muted transition-colors hover:text-mail-foreground focus:outline-none"
						title="Copy email address"
					>
						{copied ? (
							<Check className="size-3 text-green-500" />
						) : (
							<Copy className="size-2.5" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
};
