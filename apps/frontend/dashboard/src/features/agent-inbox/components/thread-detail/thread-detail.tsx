import { Icon } from "@reloop/ui/icon";
import { toast } from "@reloop/ui/toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { parseAsString, useQueryState } from "nuqs";
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { LoadingDot } from "#/features/agent-inbox/components/shared/loading-dot";
import { extractBareEmail } from "#/features/agent-inbox/lib/email-address";
import { useSWR } from "#/features/agent-inbox/lib/use-swr-compat";
import { buildDisplayMessages } from "#/features/agent-inbox/utils/build-display-messages";
import type {
	AgentMailbox,
	ComposeDraft,
	ComposeDraftKind,
	InboundThread,
} from "../../types";
import { useAgentInbox } from "../agent-inbox-provider";
import { ForwardComposer } from "./forward-composer";
import type { AttachmentItem } from "./message-attachments";
import { RawHeadersModal } from "./raw-headers-modal";
import { ReplyComposer } from "./reply-composer";
import type { ThreadParticipant } from "./thread-header";
import { ThreadHeader } from "./thread-header";
import { ThreadSavedDraftBar } from "./thread-saved-draft-bar";
import { ZeroMailDisplay } from "./zero-mail-display";
import { ZeroThreadToolbar } from "./zero-thread-toolbar";

function replyModeToKind(mode: "reply" | "replyAll"): ComposeDraftKind {
	return mode === "replyAll" ? "reply_all" : "reply";
}

function replySubject(subject: string) {
	const trimmed = subject.trim();
	if (!trimmed) return "Re:";
	return /^re:/i.test(trimmed) ? trimmed : `Re: ${trimmed}`;
}

function forwardSubject(subject: string) {
	const trimmed = subject.trim();
	if (!trimmed) return "Fwd:";
	return /^(fwd|fw):/i.test(trimmed) ? trimmed : `Fwd: ${trimmed}`;
}

/** Prefer the inbound/email id the reply API expects; fall back to list id. */
function resolveReplyMessageId(
	msg:
		| {
				id?: string;
				inboundEmailId?: string;
				email?: { id?: string };
		  }
		| null
		| undefined,
): string | null {
	if (!msg) return null;
	return msg.inboundEmailId || msg.email?.id || msg.id || null;
}

const extractSummaryText = (
	parsed: Record<string, unknown> | null | undefined,
): string | null => {
	if (!parsed) return null;
	for (const key of ["summary", "aiSummary", "threadSummary"]) {
		const val = parsed[key];
		if (typeof val === "string" && val.trim()) return val.trim();
	}
	return null;
};

dayjs.extend(relativeTime);

// ---------------------------------------------------------------------------
// Translation helpers
// ---------------------------------------------------------------------------

const translateText = async (
	text: string,
	targetLang: string,
): Promise<string> => {
	const translate = async (chunk: string) => {
		const res = await fetch(
			`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`,
		);
		if (!res.ok) throw new Error("Translation failed");
		const data = await res.json();
		return data[0].map((x: any) => x[0]).join("");
	};

	if (text.length < 1800) return translate(text);

	const chunks = text.match(/.{1,1500}/g) || [text];
	const results = await Promise.all(
		chunks.map((c) => translate(c).catch(() => c)),
	);
	return results.join("");
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ThreadDetailProps {
	thread: InboundThread | null;
	mailbox: AgentMailbox | undefined;
	folder?: string;
	onBack?: () => void;
	showBack?: boolean;
	onToggleAi?: () => void;
}

const EmptyState = () => (
	<div className="flex min-h-[400px] flex-col items-center justify-center gap-1.5 p-8 text-center">
		<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm dark:border-stroke-soft-100/40 dark:bg-white/[0.04]">
			<Icon name="inbox" className="h-5 w-5 text-text-sub-600" />
		</div>
		<h3 className="font-semibold text-base text-text-strong-950">
			Select a conversation
		</h3>
		<p className="mx-auto max-w-sm text-text-sub-600 text-xs">
			Choose a message from the list to read and reply.
		</p>
	</div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ThreadDetail = ({
	thread,
	mailbox,
	folder,
	onBack,
	showBack,
}: ThreadDetailProps) => {
	const {
		deleteMessage,
		markMessageRead,
		markMessageSpam,
		toggleMessageStar,
		archiveThread,
		trashThread,
		restoreThread,
		unarchiveThread,
		sendReply,
		sendReplyAll,
		sendForward,
		refresh,
		findDraft,
		getDraft,
		deleteDraft,
	} = useAgentInbox();

	// ── UI state ──────────────────────────────────────────────────────────────
	const messageId = thread?.messageId ?? thread?.id;
	const [parsedExpanded, setParsedExpanded] = useState(true);
	const [rawHeadersExpanded, setRawHeadersExpanded] = useState(false);
	const [showReplyComposer, setShowReplyComposer] = useState(false);
	const [replySeed, setReplySeed] = useState("");
	const [replyInitialHtml, setReplyInitialHtml] = useState("");
	const [replyDraftId, setReplyDraftId] = useState<string | null>(null);
	/** Saved reply draft for this thread — shown when composer is closed. */
	const [savedReplyDraft, setSavedReplyDraft] = useState<ComposeDraft | null>(
		null,
	);
	/** List message id the composer is anchored under (inline in the thread). */
	const [replyAnchorMessageId, setReplyAnchorMessageId] = useState<
		string | null
	>(null);
	/** Id passed to `/messages/:id/reply` (inbound/email id when available). */
	const [replyApiMessageId, setReplyApiMessageId] = useState<string | null>(
		null,
	);
	const [showForwardComposer, setShowForwardComposer] = useState(false);
	const [isForwarding, setIsForwarding] = useState(false);
	const [isReplying, setIsReplying] = useState(false);
	/** Sync lock so Approve & Send / double-fire cannot start two reply requests. */
	const isReplyingRef = useRef(false);
	/** List message id the forward composer is anchored under. */
	const [forwardAnchorMessageId, setForwardAnchorMessageId] = useState<
		string | null
	>(null);
	const [forwardDraftId, setForwardDraftId] = useState<string | null>(null);
	const [forwardSeed, setForwardSeed] = useState("");
	const [forwardInitialHtml, setForwardInitialHtml] = useState("");
	const [forwardInitialTo, setForwardInitialTo] = useState<string[]>([]);
	const [forwardInitialCc, setForwardInitialCc] = useState<string[]>([]);
	const [replyMode, setReplyMode] = useState<"reply" | "replyAll">("reply");
	const [replyTargetPerson, setReplyTargetPerson] = useState<{
		name: string;
		email: string;
	} | null>(null);
	const replyComposerRef = useRef<HTMLDivElement>(null);
	const forwardComposerRef = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();
	/** Keyboard `R`/`A` — no enter animation / no smooth scroll. */
	const [skipReplyEnter, setSkipReplyEnter] = useState(false);
	/** Keyboard `F` — no enter animation / no smooth scroll. */
	const [skipForwardEnter, setSkipForwardEnter] = useState(false);
	const [composeParam, setComposeParam] = useQueryState(
		"compose",
		parseAsString.withDefault(""),
	);
	const [draftIdParam, setDraftIdParam] = useQueryState(
		"draftId",
		parseAsString.withDefault(""),
	);

	// ── Translation state ─────────────────────────────────────────────────────
	const [isTranslated, setIsTranslated] = useState(false);
	const [translatedHtmlMap, setTranslatedHtmlMap] = useState<
		Record<string, string>
	>({});
	const [translatedTextMap, setTranslatedTextMap] = useState<
		Record<string, string>
	>({});
	const [targetLanguage, setTargetLanguage] = useState("es");
	const [isTranslating, setIsTranslating] = useState(false);

	// ── Optimistic outbound messages (so reply appears instantly) ─────────────
	const [optimisticReplies, setOptimisticReplies] = useState<any[]>([]);

	// ── Thread fetch (for full conversation when a threadId exists) ───────────
	// KeepPreviousData is intentionally off — switching threads must not flash
	// the previous conversation. List payload is enough to render immediately.
	const {
		data: threadData,
		mutate: mutateThread,
		isLoading: isLoadingThread,
	} = useSWR<any>(
		thread?.threadId || thread?.id
			? `/api/inbox/v1/threads/${thread.threadId || thread.id}`
			: null,
		{
			revalidateOnFocus: false,
			keepPreviousData: false,
		},
	);

	const threadDataMatches =
		!!(thread?.threadId || thread?.id) &&
		!!threadData &&
		(threadData.id === (thread.threadId || thread.id) ||
			threadData.threadId === (thread.threadId || thread.id));

	// Reset all local state when the selected thread changes
	useEffect(() => {
		setIsTranslated(false);
		setTranslatedHtmlMap({});
		setTranslatedTextMap({});
		setTargetLanguage("es");
		setIsTranslating(false);
		setShowReplyComposer(false);
		setReplySeed("");
		setReplyInitialHtml("");
		setReplyDraftId(null);
		setSavedReplyDraft(null);
		setReplyAnchorMessageId(null);
		setReplyApiMessageId(null);
		setSkipReplyEnter(false);
		setSkipForwardEnter(false);
		setOptimisticReplies([]);
		setShowForwardComposer(false);
		setIsReplying(false);
		isReplyingRef.current = false;
		setIsForwarding(false);
		setForwardAnchorMessageId(null);
		setForwardDraftId(null);
		setForwardSeed("");
		setForwardInitialHtml("");
		setForwardInitialTo([]);
		setForwardInitialCc([]);
		setReplyTargetPerson(null);
	}, [thread?.id]);

	// Mark conversation read when the detail pane opens an unread thread.
	// List selection also triggers this; this covers any path that mounts detail.
	useEffect(() => {
		if (!thread?.unread) return;
		const id = thread.messageId || thread.id;
		if (!id) return;
		void markMessageRead(id, true, {
			threadId: thread.threadId ?? null,
		}).catch(() => {
			// Non-blocking — list row may already have requested mark-read
		});
	}, [
		thread?.id,
		thread?.unread,
		thread?.messageId,
		thread?.threadId,
		markMessageRead,
	]);

	/** True while we have a threadId but not the full conversation yet. */
	const awaitingFullThread =
		!!thread?.threadId && isLoadingThread && !threadDataMatches;

	// ── Build display messages list ───────────────────────────────────────────
	const displayMessages = useMemo(
		() =>
			buildDisplayMessages({
				thread,
				threadData,
				threadDataMatches,
				isLoadingThread,
				mailboxEmail: mailbox?.email || "",
				optimisticReplies,
			}),
		[
			threadData,
			threadDataMatches,
			isLoadingThread,
			thread,
			mailbox?.email,
			optimisticReplies,
		],
	);

	useEffect(() => {
		if (!composeParam || !thread) return;
		let cancelled = false;
		void (async () => {
			const last = displayMessages[displayMessages.length - 1];
			const fromUrl = draftIdParam ? await getDraft(draftIdParam) : null;
			if (cancelled) return;

			if (composeParam === "forward") {
				setShowReplyComposer(false);
				setReplyAnchorMessageId(null);
				setReplyApiMessageId(null);
				setForwardAnchorMessageId(last?.id ?? null);
				setSkipForwardEnter(false);
				if (fromUrl?.kind === "forward") {
					setForwardDraftId(fromUrl.id);
					setForwardSeed(fromUrl.text);
					setForwardInitialHtml(fromUrl.html);
					setForwardInitialTo(fromUrl.to);
					setForwardInitialCc(fromUrl.cc);
				} else {
					setForwardDraftId(null);
					setForwardSeed("");
					setForwardInitialHtml("");
					setForwardInitialTo([]);
					setForwardInitialCc([]);
				}
				setShowForwardComposer(true);
			} else if (composeParam === "reply" || composeParam === "replyAll") {
				const mode = composeParam;
				const kind = replyModeToKind(mode);
				setReplyMode(mode);
				setShowForwardComposer(false);
				setForwardAnchorMessageId(null);
				setReplyTargetPerson(null);
				setReplyAnchorMessageId(last?.id ?? null);
				setReplyApiMessageId(
					fromUrl?.inReplyToMessageId ||
						resolveReplyMessageId(last) ||
						messageId ||
						null,
				);
				setSkipReplyEnter(false);
				if (fromUrl && (fromUrl.kind === kind || fromUrl.kind === "reply")) {
					setReplyDraftId(fromUrl.id);
					setReplySeed(fromUrl.text);
					setReplyInitialHtml(fromUrl.html);
					if (fromUrl.kind === "reply_all") setReplyMode("replyAll");
				} else {
					setReplyDraftId(null);
					setReplySeed("");
					setReplyInitialHtml("");
				}
				setShowReplyComposer(true);
			}
			void setComposeParam(null);
			if (draftIdParam) void setDraftIdParam(null);
		})();
		return () => {
			cancelled = true;
		};
	}, [
		composeParam,
		thread,
		setComposeParam,
		displayMessages,
		messageId,
		draftIdParam,
		setDraftIdParam,
		getDraft,
	]);

	useEffect(() => {
		if (!showReplyComposer) return;
		replyComposerRef.current?.scrollIntoView({
			behavior: skipReplyEnter || reduceMotion ? "auto" : "smooth",
			block: "nearest",
		});
	}, [showReplyComposer, replyAnchorMessageId, skipReplyEnter, reduceMotion]);

	useEffect(() => {
		if (!showForwardComposer) return;
		forwardComposerRef.current?.scrollIntoView({
			behavior: skipForwardEnter || reduceMotion ? "auto" : "smooth",
			block: "nearest",
		});
	}, [
		showForwardComposer,
		forwardAnchorMessageId,
		skipForwardEnter,
		reduceMotion,
	]);

	const closeReplyComposer = () => {
		// Keep anchor/seed through the exit so AnimatePresence can reverse the open scale.
		setSkipReplyEnter(false);
		setShowReplyComposer(false);
	};

	const refreshSavedReplyDraft = useCallback(async () => {
		const mailboxKey = mailbox?.id;
		const threadKey = thread?.threadId || thread?.id;
		if (!mailboxKey || !threadKey) {
			setSavedReplyDraft(null);
			return;
		}
		const [reply, replyAll] = await Promise.all([
			findDraft({
				mailboxId: mailboxKey,
				threadId: threadKey,
				kind: "reply",
			}),
			findDraft({
				mailboxId: mailboxKey,
				threadId: threadKey,
				kind: "reply_all",
			}),
		]);
		const candidates = [reply, replyAll].filter(
			(d): d is ComposeDraft => !!d && (!!d.text.trim() || !!d.html.trim()),
		);
		candidates.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
		);
		setSavedReplyDraft(candidates[0] ?? null);
	}, [mailbox?.id, thread?.threadId, findDraft]);

	useEffect(() => {
		if (showReplyComposer) return;
		const timer = window.setTimeout(() => {
			void refreshSavedReplyDraft();
		}, 500);
		return () => window.clearTimeout(timer);
	}, [refreshSavedReplyDraft, showReplyComposer, replyDraftId]);

	const closeForwardComposer = () => {
		setSkipForwardEnter(false);
		setShowForwardComposer(false);
	};

	useEffect(() => {
		if (showReplyComposer) return;
		if (
			!replyAnchorMessageId &&
			!replyApiMessageId &&
			!replySeed &&
			!replyTargetPerson
		) {
			return;
		}
		const ms = reduceMotion ? 100 : 160;
		const id = window.setTimeout(() => {
			setReplySeed("");
			setReplyTargetPerson(null);
			setReplyAnchorMessageId(null);
			setReplyApiMessageId(null);
		}, ms);
		return () => window.clearTimeout(id);
	}, [
		showReplyComposer,
		replyAnchorMessageId,
		replyApiMessageId,
		replySeed,
		replyTargetPerson,
		reduceMotion,
	]);

	useEffect(() => {
		if (showForwardComposer) return;
		if (!forwardAnchorMessageId) return;
		const ms = reduceMotion ? 100 : 160;
		const id = window.setTimeout(() => {
			setForwardAnchorMessageId(null);
		}, ms);
		return () => window.clearTimeout(id);
	}, [showForwardComposer, forwardAnchorMessageId, reduceMotion]);

	const threadParticipants = useMemo((): ThreadParticipant[] => {
		const seen = new Set<string>();
		const people: ThreadParticipant[] = [];
		for (const msg of displayMessages) {
			const email = (msg.fromEmail || msg.email?.fromEmail || "").toLowerCase();
			if (!email || seen.has(email)) continue;
			seen.add(email);
			people.push({
				name: msg.fromName || msg.email?.fromName || "",
				email: msg.fromEmail || msg.email?.fromEmail || "",
			});
		}
		if (people.length === 0 && thread?.from?.email) {
			people.push({
				name: thread.from.name || "",
				email: thread.from.email,
			});
		}
		return people;
	}, [displayMessages, thread]);

	const threadAttachments = useMemo((): AttachmentItem[] => {
		const items: AttachmentItem[] = [];
		const seen = new Set<string>();
		for (const msg of displayMessages) {
			const atts = msg.email?.attachments || msg.attachments || [];
			for (const att of atts) {
				if (att.isInline) continue;
				const id = att.id || `${att.filename || att.name}-${att.size}`;
				if (seen.has(id)) continue;
				seen.add(id);
				items.push({
					id: att.id,
					name: att.filename || att.name || "Attachment",
					size:
						typeof att.size === "number"
							? `${(att.size / 1024).toFixed(1)} KB`
							: att.size || "Unknown size",
					contentType: att.contentType,
					isInline: att.isInline,
					inboundEmailId:
						att.inboundEmailId || msg.email?.id || msg.inboundEmailId,
					messageId: msg.email?.id || msg.inboundEmailId || msg.id,
				});
			}
		}
		return items;
	}, [displayMessages]);

	const aiSummaryText = useMemo(() => {
		for (const msg of displayMessages) {
			const fromParsed = extractSummaryText(msg.parsed);
			if (fromParsed) return fromParsed;
		}
		return extractSummaryText(thread?.parsed);
	}, [displayMessages, thread]);

	// ── Action handlers ───────────────────────────────────────────────────────

	const handleToggleStar = async () => {
		if (!thread) return;
		const msgId = thread.messageId ?? thread.id;
		try {
			await toggleMessageStar(msgId, !thread.isStarred);
			toast.success(thread.isStarred ? "Unstarred" : "Starred");
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to update star");
		}
	};

	const threadKey = thread?.threadId ?? thread?.id;

	const handleArchive = async () => {
		if (!thread || !threadKey) return;
		try {
			await archiveThread(threadKey);
			toast.success("Archived", {
				action: {
					label: "Undo",
					onClick: () => void unarchiveThread(threadKey),
				},
			});
			onBack?.();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to archive");
		}
	};

	const handleUnarchive = async () => {
		if (!threadKey) return;
		try {
			await unarchiveThread(threadKey);
			toast.success("Moved to inbox", {
				action: {
					label: "Undo",
					onClick: () => void archiveThread(threadKey),
				},
			});
			onBack?.();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to unarchive");
		}
	};

	const handleRestore = async () => {
		if (!threadKey) return;
		try {
			if (folder === "spam" && messageId) {
				await markMessageSpam(messageId, false);
			} else {
				await restoreThread(threadKey);
			}
			toast.success("Moved to inbox");
			onBack?.();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to restore");
		}
	};

	const handleDelete = async () => {
		if (!thread) return;
		const inTrash = folder === "trash";
		if (
			!confirm(
				inTrash
					? "Permanently delete this thread?"
					: "Move this thread to trash?",
			)
		) {
			return;
		}
		try {
			if (inTrash) {
				if (messageId) await deleteMessage(messageId);
			} else if (threadKey) {
				await trashThread(threadKey);
			} else if (messageId) {
				await deleteMessage(messageId);
			}
			toast.success(inTrash ? "Deleted forever" : "Moved to trash");
			onBack?.();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to delete");
		}
	};

	const handleToggleRead = async (isRead: boolean) => {
		if (!thread || !messageId) return;
		try {
			await markMessageRead(messageId, isRead, {
				threadId: thread.threadId ?? null,
			});
			toast.success(isRead ? "Marked as read" : "Marked as unread");
		} catch (err: any) {
			toast.error(err.message || "Failed to update status");
		}
	};

	const handleMarkSpam = async (isSpam: boolean) => {
		if (!thread || !messageId) return;
		try {
			await markMessageSpam(messageId, isSpam);
			toast.success(isSpam ? "Marked as Spam" : "Marked as Not Spam");
			if (isSpam) onBack?.();
		} catch (err: any) {
			toast.error(err.message || "Failed to mark as spam");
		}
	};

	const handleSendReply = async (payload: {
		text: string;
		html: string;
		attachments?: Array<{
			filename?: string;
			path?: string;
			content_type?: string;
		}>;
		to?: string[];
		cc?: string[];
		bcc?: string[];
		/** Optional override when sending without opening the composer (e.g. approve). */
		replyToId?: string;
	}) => {
		if (isReplyingRef.current) return;

		const body = payload.text.trim();
		const sendId = payload.replyToId || replyApiMessageId || messageId;
		if (!thread || !sendId || !body) return;

		isReplyingRef.current = true;
		setIsReplying(true);

		const toList =
			payload.to && payload.to.length > 0
				? payload.to
				: [replyTargetPerson?.email || thread.from.email].filter(Boolean);

		const optimisticMsg = {
			id: `optimistic-${Date.now()}`,
			direction: "outbound",
			fromEmail: mailbox?.email || "me",
			fromName: null,
			messageAt: new Date().toISOString(),
			subject: thread.subject,
			email: {
				id: `optimistic-${Date.now()}`,
				fromEmail: mailbox?.email || "me",
				toEmails: toList,
				ccEmails: payload.cc ?? [],
				subject: `Re: ${thread.subject}`,
				textBody: body,
				htmlBody: payload.html || null,
				attachments: [],
				createdAt: new Date().toISOString(),
			},
			parsed: null,
		};
		setOptimisticReplies((prev) => [...prev, optimisticMsg]);
		const draftToDelete = replyDraftId;
		closeReplyComposer();
		setReplyDraftId(null);

		const recipients = {
			to: toList,
			cc: payload.cc && payload.cc.length > 0 ? payload.cc : undefined,
			bcc: payload.bcc && payload.bcc.length > 0 ? payload.bcc : undefined,
		};

		const send =
			replyMode === "replyAll"
				? sendReplyAll(
						sendId,
						body,
						payload.html,
						payload.attachments,
						recipients,
					)
				: sendReply(
						sendId,
						body,
						payload.html,
						payload.attachments,
						recipients,
					);

		toast.promise(send, {
			loading: "Sending reply...",
			success: async () => {
				if (draftToDelete) {
					try {
						await deleteDraft(draftToDelete);
					} catch {
						/* best-effort */
					}
				}
				await Promise.all([mutateThread(), refresh()]);
				setOptimisticReplies([]);
				isReplyingRef.current = false;
				setIsReplying(false);
				return "Reply sent successfully";
			},
			error: (err) => {
				setOptimisticReplies((prev) =>
					prev.filter((r) => r.id !== optimisticMsg.id),
				);
				isReplyingRef.current = false;
				setIsReplying(false);
				return err instanceof Error ? err.message : "Failed to send reply";
			},
		});
	};

	const openForwardComposer = (msg?: any, opts?: { viaKeyboard?: boolean }) => {
		const anchor = msg ?? displayMessages[displayMessages.length - 1] ?? null;
		closeReplyComposer();
		setForwardAnchorMessageId(anchor?.id ?? null);
		setSkipForwardEnter(!!opts?.viaKeyboard);

		const threadKey = thread?.threadId || thread?.id;
		const mailboxKey = mailbox?.id;
		if (mailboxKey && threadKey) {
			void findDraft({
				mailboxId: mailboxKey,
				threadId: threadKey,
				kind: "forward",
			}).then((existing) => {
				if (existing) {
					setForwardDraftId(existing.id);
					setForwardSeed(existing.text);
					setForwardInitialHtml(existing.html);
					setForwardInitialTo(existing.to);
					setForwardInitialCc(existing.cc);
				} else {
					setForwardDraftId(null);
					setForwardSeed("");
					setForwardInitialHtml("");
					setForwardInitialTo([]);
					setForwardInitialCc([]);
				}
				setShowForwardComposer(true);
			});
			return;
		}

		setForwardDraftId(null);
		setForwardSeed("");
		setForwardInitialHtml("");
		setForwardInitialTo([]);
		setForwardInitialCc([]);
		setShowForwardComposer(true);
	};

	const resolveReplyTarget = (msg?: any) => {
		if (!thread) return { name: "", email: "" };
		if (!msg) {
			return {
				name: thread.from.name || "",
				email: thread.from.email,
			};
		}
		// Outbound: reply goes back to the original conversation partner.
		if (msg.direction === "outbound") {
			return {
				name: thread.from.name || "",
				email: thread.from.email,
			};
		}
		const raw = msg.fromEmail || msg.email?.fromEmail || thread.from.email;
		const name = msg.fromName || msg.email?.fromName || thread.from.name || "";
		return { name, email: raw };
	};

	const resolveReplyAllCc = (msg?: any, primaryTo?: string) => {
		const email = msg?.email ?? msg;
		const mailboxBare = extractBareEmail(mailbox?.email || "").toLowerCase();
		const primaryBare = extractBareEmail(primaryTo || "").toLowerCase();
		const raw = [
			...(email?.toEmails ?? msg?.toEmails ?? []),
			...(email?.ccEmails ?? msg?.ccEmails ?? []),
		];
		const seen = new Set<string>();
		const out: string[] = [];
		for (const addr of raw) {
			const bare = extractBareEmail(String(addr ?? ""));
			if (!bare) continue;
			const key = bare.toLowerCase();
			if (key === mailboxBare || key === primaryBare || seen.has(key)) continue;
			seen.add(key);
			out.push(bare);
		}
		return out;
	};

	const openReplyComposer = (
		mode: "reply" | "replyAll" = "reply",
		msg?: any,
		opts?: { viaKeyboard?: boolean },
	) => {
		const anchor = msg ?? displayMessages[displayMessages.length - 1] ?? null;
		const apiId = resolveReplyMessageId(anchor) ?? messageId ?? null;
		setReplyMode(mode);
		setReplyTargetPerson(resolveReplyTarget(msg ?? anchor));
		setShowForwardComposer(false);
		setForwardAnchorMessageId(null);
		setReplyAnchorMessageId(anchor?.id ?? null);
		setReplyApiMessageId(apiId);
		setSkipReplyEnter(!!opts?.viaKeyboard);

		const kind = replyModeToKind(mode);
		const threadKey = thread?.threadId || thread?.id;
		const mailboxKey = mailbox?.id;
		if (mailboxKey && threadKey) {
			void findDraft({
				mailboxId: mailboxKey,
				threadId: threadKey,
				kind,
			}).then((existing) => {
				if (existing) {
					setReplyDraftId(existing.id);
					setReplySeed(existing.text);
					setReplyInitialHtml(existing.html);
					if (existing.inReplyToMessageId) {
						setReplyApiMessageId(existing.inReplyToMessageId);
					}
				} else {
					setReplyDraftId(null);
					setReplySeed("");
					setReplyInitialHtml("");
				}
				setShowReplyComposer(true);
			});
			return;
		}

		setReplyDraftId(null);
		setReplySeed("");
		setReplyInitialHtml("");
		setShowReplyComposer(true);
	};

	useHotkeys("r", () =>
		openReplyComposer("reply", undefined, { viaKeyboard: true }),
	);
	useHotkeys("a", () =>
		openReplyComposer("replyAll", undefined, { viaKeyboard: true }),
	);
	useHotkeys("f", () => openForwardComposer(undefined, { viaKeyboard: true }));
	useHotkeys("s", () => {
		void handleToggleStar();
	});
	useHotkeys("e, y", () => {
		if (folder === "archive" || folder === "archived" || thread?.isArchived) {
			void handleUnarchive();
		} else {
			void handleArchive();
		}
	});
	useHotkeys("shift+3", () => {
		void handleDelete();
	});

	const handleSendForward = async (data: {
		to: string[];
		cc: string[];
		text: string;
		html: string;
		attachments?: Array<{
			filename?: string;
			path?: string;
			content_type?: string;
		}>;
	}) => {
		if (!thread || !messageId || data.to.length === 0) return;

		setIsForwarding(true);
		const toList = data.to;
		const ccList = data.cc;

		const fwdPromise = sendForward(messageId, toList, {
			text: data.text.trim() || undefined,
			html: data.html || undefined,
			cc: ccList.length ? ccList : undefined,
			attachments: data.attachments,
		});

		const draftToDelete = forwardDraftId;
		toast.promise(fwdPromise, {
			loading: "Forwarding message…",
			success: async () => {
				if (draftToDelete) {
					try {
						await deleteDraft(draftToDelete);
					} catch {
						/* best-effort */
					}
				}
				setForwardDraftId(null);
				closeForwardComposer();
				setIsForwarding(false);
				return `Forwarded to ${toList.join(", ")} successfully`;
			},
			error: (err) => {
				setIsForwarding(false);
				return err instanceof Error ? err.message : "Failed to forward message";
			},
		});
	};

	// ── Translation handlers ──────────────────────────────────────────────────

	const performTranslation = async (
		msgId: string,
		textBody: string,
		htmlBody: string | undefined,
		lang: string,
	) => {
		const key = `${msgId}-${lang}`;

		if (htmlBody && !translatedHtmlMap[key]) {
			setIsTranslating(true);
			try {
				const parser = new DOMParser();
				const doc = parser.parseFromString(htmlBody, "text/html");
				const textNodes: Node[] = [];
				const walk = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
				let node = walk.nextNode();
				while (node) {
					if (node.nodeValue?.trim()) textNodes.push(node);
					node = walk.nextNode();
				}
				await Promise.all(
					textNodes.map(async (n) => {
						if (n.nodeValue) {
							try {
								n.nodeValue = await translateText(n.nodeValue.trim(), lang);
							} catch {
								/* ignore */
							}
						}
					}),
				);
				setTranslatedHtmlMap((prev) => ({
					...prev,
					[key]: doc.body.innerHTML,
				}));
				toast.success("Translated email dynamically");
			} catch {
				toast.error("Failed to translate dynamically");
			} finally {
				setIsTranslating(false);
			}
		}

		if (textBody && !translatedTextMap[key]) {
			setIsTranslating(true);
			try {
				const t = await translateText(textBody, lang);
				setTranslatedTextMap((prev) => ({ ...prev, [key]: t }));
				toast.success("Translated email dynamically");
			} catch {
				toast.error("Failed to translate dynamically");
			} finally {
				setIsTranslating(false);
			}
		}
	};

	const handleTranslate = async () => {
		if (isTranslated) {
			setIsTranslated(false);
			return;
		}
		setIsTranslated(true);
		await Promise.all(
			displayMessages.map((msg) =>
				performTranslation(
					msg.id,
					msg.email?.textBody || "",
					msg.email?.htmlBody,
					targetLanguage,
				),
			),
		);
	};

	const handleLanguageChange = async (lang: string) => {
		setTargetLanguage(lang);
		await Promise.all(
			displayMessages.map((msg) =>
				performTranslation(
					msg.id,
					msg.email?.textBody || "",
					msg.email?.htmlBody,
					lang,
				),
			),
		);
	};

	const handleDownload = () => {
		try {
			const messagesHtml = displayMessages
				.map((msg) => {
					const body = msg.email?.htmlBody || msg.email?.textBody || "";
					return `<div style="margin-bottom:20px;border-bottom:1px solid #eee;padding-bottom:20px;">
						<strong>From:</strong> ${msg.fromName ? `${msg.fromName} <${msg.fromEmail}>` : msg.fromEmail}<br>
						<strong>Date:</strong> ${msg.messageAt}<br><br>
						${body}
					</div>`;
				})
				.join("");
			const file = new Blob(
				[
					`<html><head><title>${thread?.subject}</title></head><body style="font-family:sans-serif;padding:20px;"><h2>${thread?.subject}</h2>${messagesHtml}</body></html>`,
				],
				{ type: "text/html" },
			);
			const el = document.createElement("a");
			el.href = URL.createObjectURL(file);
			el.download = `${thread?.subject.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
			document.body.appendChild(el);
			el.click();
			document.body.removeChild(el);
			toast.success("Message downloaded successfully");
		} catch {
			toast.error("Failed to download message");
		}
	};

	const handlePrint = () => {
		try {
			const pw = window.open("", "_blank");
			if (!pw) {
				window.print();
				return;
			}
			const messagesHtml = displayMessages
				.map((msg) => {
					const key = `${msg.id}-${targetLanguage}`;
					const body = isTranslated
						? translatedHtmlMap[key] || translatedTextMap[key] || ""
						: msg.email?.htmlBody || msg.email?.textBody || "";
					const formatted =
						body.includes("<body") || body.includes("<html")
							? body
							: `<pre style="white-space:pre-wrap;">${body}</pre>`;
					return `<div style="margin-bottom:30px;border-bottom:1px solid #e5e7eb;padding-bottom:20px;">
						<div style="font-weight:bold;font-size:14px;">${msg.fromName ? `${msg.fromName} &lt;${msg.fromEmail}&gt;` : msg.fromEmail}</div>
						<div style="font-size:12px;color:#4b5563;margin-bottom:10px;">Date: ${dayjs(msg.messageAt).format("ddd, MMM D, YYYY [at] h:mm A")}</div>
						<div>${formatted}</div>
					</div>`;
				})
				.join("");
			pw.document.write(`<!DOCTYPE html><html><head><title>${thread?.subject}</title>
				<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#1c1917;padding:20px;}</style>
				</head><body><h1 style="font-size:20px;margin-bottom:20px;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">${thread?.subject}</h1>
				${messagesHtml}<script>window.onload=function(){setTimeout(function(){window.print();window.close();},300);}</script></body></html>`);
			pw.document.close();
		} catch {
			window.print();
		}
	};

	// ── Render ────────────────────────────────────────────────────────────────

	if (!thread) return <EmptyState />;

	const replyIsAnchored =
		!!replyAnchorMessageId &&
		displayMessages.some((m) => m.id === replyAnchorMessageId);
	const forwardIsAnchored =
		!!forwardAnchorMessageId &&
		displayMessages.some((m) => m.id === forwardAnchorMessageId);

	const forwardSourceMsg =
		displayMessages.find((m) => m.id === forwardAnchorMessageId) ??
		displayMessages[displayMessages.length - 1] ??
		null;

	const forwardOriginalFrom = (() => {
		if (!forwardSourceMsg) {
			return thread.from.name
				? `${thread.from.name} <${thread.from.email}>`
				: thread.from.email;
		}
		const email =
			forwardSourceMsg.fromEmail ||
			forwardSourceMsg.email?.fromEmail ||
			thread.from.email;
		const name =
			forwardSourceMsg.fromName || forwardSourceMsg.email?.fromName || "";
		return name ? `${name} <${email}>` : email;
	})();

	const replyKind = replyModeToKind(replyMode);
	const conversationThreadId = thread.threadId || thread.id || null;

	const discardReplyDraft = () => {
		const id = replyDraftId || savedReplyDraft?.id || null;
		setReplyDraftId(null);
		setSavedReplyDraft(null);
		closeReplyComposer();
		if (id) {
			void deleteDraft(id).catch(() => {
				/* ignore */
			});
		}
	};

	const continueSavedReplyDraft = () => {
		if (!savedReplyDraft) return;
		const mode = savedReplyDraft.kind === "reply_all" ? "replyAll" : "reply";
		openReplyComposer(mode);
	};

	const discardForwardDraft = () => {
		const id = forwardDraftId;
		setForwardDraftId(null);
		closeForwardComposer();
		if (id) {
			void deleteDraft(id).catch(() => {
				/* ignore */
			});
		}
	};

	const replyComposerElement = (
		<ReplyComposer
			ref={replyComposerRef}
			// Stable presence key so close can play the reverse of open (not a remount cut).
			key="inline-reply"
			toName={replyTargetPerson?.name || thread.from.name || ""}
			toEmail={replyTargetPerson?.email || thread.from.email}
			fromEmail={mailbox?.email || "agent@local.reloop.sh"}
			replyAllCc={resolveReplyAllCc(
				displayMessages.find((m) => m.id === replyAnchorMessageId) ??
					displayMessages[displayMessages.length - 1],
				replyTargetPerson?.email || thread.from.email,
			)}
			mode={replyMode}
			canReplyAll
			variant="inline"
			skipEnter={skipReplyEnter}
			threadId={conversationThreadId}
			onModeChange={setReplyMode}
			onForward={() =>
				openForwardComposer(
					displayMessages.find((m) => m.id === replyAnchorMessageId) ??
						displayMessages[displayMessages.length - 1],
				)
			}
			initialContent={replySeed}
			initialHtml={replyInitialHtml}
			draft={
				mailbox && conversationThreadId && replyApiMessageId
					? {
							mailboxId: mailbox.id,
							threadId: conversationThreadId,
							kind: replyKind as "reply" | "reply_all",
							inReplyToMessageId: replyApiMessageId,
							subject: replySubject(thread.subject),
							draftId: replyDraftId,
							onDraftIdChange: setReplyDraftId,
							onDiscardDraft: discardReplyDraft,
						}
					: undefined
			}
			onSend={handleSendReply}
			onClose={closeReplyComposer}
			isSending={isReplying}
		/>
	);

	const forwardComposerElement = (
		<ForwardComposer
			ref={forwardComposerRef}
			key="inline-forward"
			originalFrom={forwardOriginalFrom}
			originalDate={dayjs(
				forwardSourceMsg?.messageAt || thread.receivedAt,
			).format("ddd, MMM D, YYYY [at] h:mm A")}
			originalSubject={
				forwardSourceMsg?.subject ||
				forwardSourceMsg?.email?.subject ||
				thread.subject
			}
			originalBodyText={(
				forwardSourceMsg?.email?.textBody ||
				thread.bodyText ||
				""
			).substring(0, 300)}
			fromEmail={mailbox?.email || "agent@local.reloop.sh"}
			skipEnter={skipForwardEnter}
			initialTo={forwardInitialTo}
			initialCc={forwardInitialCc}
			initialContent={forwardSeed}
			initialHtml={forwardInitialHtml}
			draft={
				mailbox && conversationThreadId
					? {
							mailboxId: mailbox.id,
							threadId: conversationThreadId,
							kind: "forward",
							inReplyToMessageId:
								resolveReplyMessageId(forwardSourceMsg) || messageId || "",
							subject: forwardSubject(thread.subject),
							draftId: forwardDraftId,
							onDraftIdChange: setForwardDraftId,
							onDiscardDraft: discardForwardDraft,
						}
					: undefined
			}
			onSend={handleSendForward}
			onClose={closeForwardComposer}
			isSending={isForwarding}
		/>
	);

	return (
		<div className="relative flex h-full min-h-0 flex-col bg-bg-white-0 dark:bg-black">
			<ZeroThreadToolbar
				isUnread={!!thread.unread}
				folder={folder}
				showBack={showBack}
				onClose={onBack}
				onArchive={() => void handleArchive()}
				onUnarchive={() => void handleUnarchive()}
				onRestore={() => void handleRestore()}
				onDelete={() => void handleDelete()}
				onMarkSpam={() => void handleMarkSpam(true)}
				onMarkUnread={() => void handleToggleRead(false)}
				onMarkRead={() => void handleToggleRead(true)}
			/>

			<div className="min-h-0 flex-1 overflow-y-auto">
				{isTranslated && (
					<div className="mx-4 my-3 flex items-center justify-between gap-3 rounded-xl border border-mail-border/40 bg-[var(--inbox-muted-bg)] p-3 text-xs">
						<div className="flex items-center gap-2 text-mail-muted">
							<Icon name="translate" className="h-4 w-4" />
							<span>Translated to</span>
							<select
								value={targetLanguage}
								onChange={(e) => handleLanguageChange(e.target.value)}
								className="cursor-pointer rounded-md border border-mail-border/40 bg-[var(--inbox-control)] px-2 py-1 text-mail-foreground outline-none"
							>
								<option value="es">Spanish</option>
								<option value="fr">French</option>
								<option value="de">German</option>
								<option value="it">Italian</option>
								<option value="ja">Japanese</option>
								<option value="zh">Chinese</option>
								<option value="pt">Portuguese</option>
								<option value="ru">Russian</option>
								<option value="ar">Arabic</option>
								<option value="hi">Hindi</option>
							</select>
						</div>
						<button
							type="button"
							onClick={() => setIsTranslated(false)}
							className="font-medium text-mail-foreground hover:underline"
						>
							Show original
						</button>
					</div>
				)}

				{(displayMessages.length > 0 || awaitingFullThread) && (
					<ThreadHeader
						subject={thread.subject}
						messageCount={
							awaitingFullThread
								? (thread.messageCount ?? 1)
								: displayMessages.length
						}
						participants={threadParticipants}
						summary={aiSummaryText}
						attachments={threadAttachments}
						labels={thread.labels}
					/>
				)}

				{awaitingFullThread ? (
					<div className="flex min-h-[200px] flex-1 flex-col items-center justify-center py-16">
						<LoadingDot
							label="Loading conversation"
							className="text-mail-muted"
							size={28}
							dotSize={3}
						/>
					</div>
				) : (
					<>
						{displayMessages.map((msg, index) => (
							<Fragment key={msg.id}>
								<ZeroMailDisplay
									msg={msg}
									mailbox={mailbox}
									index={index}
									totalCount={displayMessages.length}
									isTranslated={isTranslated}
									targetLanguage={targetLanguage}
									translatedHtmlMap={translatedHtmlMap}
									translatedTextMap={translatedTextMap}
									parsedExpanded={parsedExpanded}
									onToggleParsed={() => setParsedExpanded((v) => !v)}
									forceExpanded={
										(showReplyComposer && replyAnchorMessageId === msg.id) ||
										(showForwardComposer && forwardAnchorMessageId === msg.id)
									}
									isStarred={!!thread.isStarred}
									onToggleStar={() => void handleToggleStar()}
									onReply={() => openReplyComposer("reply", msg)}
									onReplyAll={() => openReplyComposer("replyAll", msg)}
									onForward={() => openForwardComposer(msg)}
									onDelete={handleDelete}
									onPrint={handlePrint}
									onApproveSend={() => {
										if (isReplyingRef.current) return;
										const suggested = msg.parsed?.suggestedReply || "";
										if (!suggested.trim()) return;
										void handleSendReply({
											text: suggested,
											html: `<p>${suggested
												.replaceAll("&", "&amp;")
												.replaceAll("<", "&lt;")
												.replaceAll(">", "&gt;")
												.replaceAll("\n", "<br />")}</p>`,
											replyToId:
												resolveReplyMessageId(msg) ?? messageId ?? undefined,
										});
									}}
									onEditReply={() => {
										setReplySeed(msg.parsed?.suggestedReply || "");
										setReplyMode("reply");
										setReplyTargetPerson(resolveReplyTarget(msg));
										setReplyAnchorMessageId(msg.id);
										setReplyApiMessageId(
											resolveReplyMessageId(msg) ?? messageId ?? null,
										);
										setSkipReplyEnter(false);
										setShowForwardComposer(false);
										setForwardAnchorMessageId(null);
										setShowReplyComposer(true);
									}}
								/>
								<AnimatePresence>
									{showReplyComposer && replyAnchorMessageId === msg.id
										? replyComposerElement
										: null}
								</AnimatePresence>
								<AnimatePresence>
									{showForwardComposer && forwardAnchorMessageId === msg.id
										? forwardComposerElement
										: null}
								</AnimatePresence>
							</Fragment>
						))}
						<AnimatePresence>
							{showReplyComposer && !replyIsAnchored
								? replyComposerElement
								: null}
						</AnimatePresence>
						<AnimatePresence>
							{showForwardComposer && !forwardIsAnchored
								? forwardComposerElement
								: null}
						</AnimatePresence>
						<AnimatePresence>
							{!showReplyComposer && savedReplyDraft ? (
								<ThreadSavedDraftBar
									key={savedReplyDraft.id}
									draft={savedReplyDraft}
									onContinue={continueSavedReplyDraft}
									onDiscard={discardReplyDraft}
								/>
							) : null}
						</AnimatePresence>
					</>
				)}
			</div>

			{rawHeadersExpanded && (
				<RawHeadersModal
					thread={thread}
					onClose={() => setRawHeadersExpanded(false)}
				/>
			)}
		</div>
	);
};
