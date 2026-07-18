import { Skeleton } from "@reloop/ui/skeleton";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { LoadingDot } from "../shared/loading-dot";

export const InboxNavUser = ({
	mailbox,
	collapsed,
	loading = false,
}: {
	mailbox: AgentMailbox;
	collapsed: boolean;
	/** True while mailbox metadata is still resolving. */
	loading?: boolean;
}) => {
	const { updateMailboxDisplayName } = useAgentInbox();
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

	const displayName = mailbox.label || mailbox.email?.split("@")[0] || "";

	useEffect(() => {
		if (isEditingName) {
			nameInputRef.current?.focus();
			nameInputRef.current?.select();
		}
	}, [isEditingName]);

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

	if (collapsed) {
		return null;
	}

	if (loading) {
		return (
			<div
				className="flex min-h-[2.5rem] flex-col justify-center gap-1.5 overflow-visible text-left"
				aria-busy="true"
			>
				<span className="sr-only">Loading mailbox</span>
				<Skeleton className="h-4 w-28 bg-[var(--inbox-skeleton)]" />
				<Skeleton className="h-3.5 w-40 bg-[var(--inbox-skeleton)]" />
			</div>
		);
	}

	return (
		<div className="flex flex-col overflow-visible text-left">
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
						<span className="sr-only">{isSavingName ? "Saving" : "Saved"}</span>
						{isSavingName ? (
							<LoadingDot
								label="Saving"
								className="text-mail-muted"
								style={{ fontSize: 10 }}
							/>
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
					className="h-5 max-w-[170px] cursor-pointer truncate text-left font-medium text-[13px] text-mail-muted leading-snug transition-colors hover:text-mail-foreground focus:outline-none"
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
	);
};
