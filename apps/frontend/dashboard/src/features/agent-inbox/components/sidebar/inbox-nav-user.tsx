import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";
import { Check, ChevronDown, Copy, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { LoadingDot } from "../shared/loading-dot";

export const InboxNavUser = ({
	mailbox,
	collapsed,
	loading = false,
	onAddMailbox,
	/** When true, lays out for the top navbar (right-aligned dropdown). */
	compact = false,
}: {
	mailbox: AgentMailbox;
	collapsed: boolean;
	/** True while mailbox metadata is still resolving. */
	loading?: boolean;
	onAddMailbox?: () => void;
	compact?: boolean;
}) => {
	const router = useRouter();
	const { updateMailboxDisplayName, mailboxes } = useAgentInbox();
	const [copied, setCopied] = useState(false);
	const [isEditingName, setIsEditingName] = useState(false);
	const [nameDraft, setNameDraft] = useState("");
	const [isSavingName, setIsSavingName] = useState(false);
	const [showNameSaved, setShowNameSaved] = useState(false);
	const [switcherOpen, setSwitcherOpen] = useState(false);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const switcherRef = useRef<HTMLDivElement>(null);
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

	useEffect(() => {
		if (!switcherOpen) return;
		const onPointerDown = (e: PointerEvent) => {
			if (
				switcherRef.current &&
				!switcherRef.current.contains(e.target as Node)
			) {
				setSwitcherOpen(false);
			}
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [switcherOpen]);

	const displayName = mailbox.label || mailbox.email?.split("@")[0] || "";
	const initial = getAvatarInitial(mailbox.label, mailbox.email);

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
		return (
			<button
				type="button"
				onClick={() => setSwitcherOpen((v) => !v)}
				title={displayName}
				className={cn(
					"relative mx-auto flex size-8 items-center justify-center rounded-full font-medium text-[11px] text-white",
					getAvatarGradient(mailbox.email || displayName),
				)}
			>
				{initial}
			</button>
		);
	}

	if (loading) {
		return (
			<div
				className={cn(
					"flex items-center gap-2.5 rounded-lg px-2 py-1.5",
					compact && "max-w-[200px]",
				)}
				aria-busy="true"
			>
				<span className="sr-only">Loading mailbox</span>
				<Skeleton className="size-5 shrink-0 rounded-full bg-[var(--inbox-skeleton)]" />
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<Skeleton className="h-3.5 w-28 bg-[var(--inbox-skeleton)]" />
				</div>
			</div>
		);
	}

	return (
		<div
			ref={switcherRef}
			className={cn("relative", compact && "max-w-[220px]")}
		>
			<button
				type="button"
				onClick={() => setSwitcherOpen((v) => !v)}
				className={cn(
					"flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--inbox-row-hover)]",
					compact ? "w-auto max-w-full" : "w-full",
				)}
			>
				<span
					className={cn(
						"grid size-5 shrink-0 place-items-center rounded-full font-medium text-[11px] text-white",
						getAvatarGradient(mailbox.email || displayName),
					)}
				>
					{initial}
				</span>
				<span className="min-w-0 truncate font-medium text-[14px] text-mail-foreground leading-5">
					{displayName}
				</span>
				{(isSavingName || showNameSaved) && (
					<span className="flex size-3.5 shrink-0 items-center justify-center">
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
				<ChevronDown className="size-3.5 shrink-0 text-mail-muted" />
			</button>

			{switcherOpen && (
				<div
					className={cn(
						"absolute top-full z-50 mt-1 w-[min(280px,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-mail-border bg-panel-light shadow-lg dark:bg-panel-dark",
						compact ? "right-0 left-auto" : "right-0 left-0 w-auto",
					)}
				>
					<div className="border-mail-border border-b px-3 py-2">
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
								className="w-full rounded-sm border-0 bg-transparent p-0 font-medium text-[13px] text-mail-foreground outline-none ring-1 ring-zero-blue/60 focus:ring-zero-blue"
							/>
						) : (
							<button
								type="button"
								onClick={startEditingName}
								className="w-full truncate text-left font-medium text-[13px] text-mail-foreground hover:underline"
								title="Click to rename"
							>
								{displayName}
							</button>
						)}
						<button
							type="button"
							onClick={handleCopy}
							className="mt-0.5 flex max-w-full items-center gap-1 truncate text-[12px] text-mail-muted hover:text-mail-foreground"
							title="Copy email address"
						>
							<span className="truncate">{mailbox.email}</span>
							{copied ? (
								<Check className="size-3 shrink-0 text-green-500" />
							) : (
								<Copy className="size-2.5 shrink-0" />
							)}
						</button>
					</div>
					<div className="max-h-48 overflow-y-auto py-1">
						{mailboxes.map((m) => {
							const active = m.id === mailbox.id;
							const name = m.label || m.email.split("@")[0] || m.email;
							return (
								<button
									key={m.id}
									type="button"
									onClick={() => {
										setSwitcherOpen(false);
										if (m.id !== mailbox.id) {
											router.push(`/inbox/${m.id}`);
										}
									}}
									className={cn(
										"flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-[var(--inbox-row-hover)]",
										active
											? "font-medium text-mail-foreground"
											: "text-mail-muted",
									)}
								>
									<span
										className={cn(
											"grid size-5 shrink-0 place-items-center rounded-full font-medium text-[10px] text-white",
											getAvatarGradient(m.email || name),
										)}
									>
										{getAvatarInitial(m.label, m.email)}
									</span>
									<span className="min-w-0 flex-1 truncate">{name}</span>
									{active && (
										<Check className="size-3.5 shrink-0 text-zero-blue" />
									)}
								</button>
							);
						})}
					</div>
					{onAddMailbox && (
						<button
							type="button"
							onClick={() => {
								setSwitcherOpen(false);
								onAddMailbox();
							}}
							className="flex w-full items-center gap-2 border-mail-border border-t px-3 py-2 text-left text-[13px] text-mail-muted transition-colors hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground"
						>
							<Plus className="size-3.5" />
							Add mailbox
						</button>
					)}
				</div>
			)}
		</div>
	);
};
