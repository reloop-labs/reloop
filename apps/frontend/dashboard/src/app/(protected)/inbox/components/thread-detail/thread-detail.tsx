"use client";

import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR from "swr";
import type { AgentMailbox, InboundThread } from "../../types";
import { useAgentInbox } from "../agent-inbox-provider";
import { ForwardComposer } from "./forward-composer";
import { NotesPanel } from "./note-panel";
import { RawHeadersModal } from "./raw-headers-modal";
import { ReplyComposer } from "./reply-composer";
import { SnoozeDialog } from "./snooze-dialog";
import { ZeroMailDisplay } from "./zero-mail-display";
import { ZeroThreadFooter } from "./zero-thread-footer";
import { ZeroThreadToolbar } from "./zero-thread-toolbar";

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
	<div className="flex min-h-[400px] flex-col items-center justify-center gap-1.5 bg-offset-light/10 p-8 text-center dark:bg-transparent">
		<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-mail-border bg-panel-light shadow-sm dark:border-neutral-850">
			<Icon
				name="inbox"
				className="h-5 w-5 text-mail-muted dark:text-neutral-450"
			/>
		</div>
		<h3 className="font-semibold text-base text-mail-foreground text-mail-foreground">
			Select a message to inspect
		</h3>
		<p className="mx-auto max-w-sm text-mail-muted text-mail-muted text-xs">
			Click any message on the left to review parsing, timeline, and approval
			actions.
		</p>
		<div className="mt-4 flex items-center gap-1.5 text-mail-muted text-mail-muted text-xs">
			<Icon name="arrow-left" className="h-3.5 w-3.5 animate-pulse" />
			<span className="font-medium">Pick a message to get started</span>
		</div>
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
	onToggleAi,
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
		snoozeThread,
		unsnoozeThread,
		toggleThreadImportant,
		sendReply,
		sendReplyAll,
		sendForward,
		refresh,
	} = useAgentInbox();

	// ── UI state ──────────────────────────────────────────────────────────────
	const messageId = thread?.messageId ?? thread?.id;
	const [parsedExpanded, setParsedExpanded] = useState(true);
	const [rawHeadersExpanded, setRawHeadersExpanded] = useState(false);
	const [showReplyComposer, setShowReplyComposer] = useState(false);
	const [replySeed, setReplySeed] = useState("");
	const [showForwardComposer, setShowForwardComposer] = useState(false);
	const [isForwarding, setIsForwarding] = useState(false);
	const [snoozeOpen, setSnoozeOpen] = useState(false);
	const [replyMode, setReplyMode] = useState<"reply" | "replyAll">("reply");
	const [composeParam, setComposeParam] = useQueryState(
		"compose",
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
		thread?.threadId ? `/api/inbox/v1/threads/${thread.threadId}` : null,
		{
			revalidateOnFocus: false,
			keepPreviousData: false,
		},
	);

	const threadDataMatches =
		!!thread?.threadId &&
		!!threadData &&
		(threadData.id === thread.threadId ||
			threadData.threadId === thread.threadId);

	// Reset all local state when the selected thread changes
	useEffect(() => {
		setIsTranslated(false);
		setTranslatedHtmlMap({});
		setTranslatedTextMap({});
		setTargetLanguage("es");
		setIsTranslating(false);
		setShowReplyComposer(false);
		setReplySeed("");
		setOptimisticReplies([]);
		setShowForwardComposer(false);
	}, [thread?.id]);

	useEffect(() => {
		if (!composeParam || !thread) return;
		if (composeParam === "forward") {
			setShowReplyComposer(false);
			setShowForwardComposer(true);
		} else if (composeParam === "reply" || composeParam === "replyAll") {
			setReplyMode(composeParam);
			setShowForwardComposer(false);
			setReplySeed("");
			setShowReplyComposer(true);
		}
		void setComposeParam(null);
	}, [composeParam, thread, setComposeParam]);

	// ── Build display messages list ───────────────────────────────────────────
	const displayMessages = useMemo(() => {
		if (!thread) return [];

		// Base: either thread API messages or single inbound fallback
		let base: any[];
		if (
			threadDataMatches &&
			threadData?.messages &&
			threadData.messages.length > 0
		) {
			const sorted = [...threadData.messages].sort(
				(a, b) =>
					new Date(a.messageAt).getTime() - new Date(b.messageAt).getTime(),
			);
			base = sorted.map((msg) => {
				if (msg.inboundEmailId === thread.id || msg.id === thread.id) {
					return { ...msg, parsed: thread.parsed || msg.parsed };
				}
				return msg;
			});
		} else {
			base = [
				{
					id: thread.id,
					direction: thread.direction || "inbound",
					fromEmail: thread.from.email,
					fromName: thread.from.name || null,
					messageAt: thread.receivedAt,
					subject: thread.subject,
					email: {
						id: thread.id,
						fromEmail: thread.from.email,
						toEmails: thread.toEmails || [mailbox?.email || ""],
						subject: thread.subject,
						textBody: thread.bodyText,
						htmlBody: thread.bodyHtml,
						attachments: thread.attachments || [],
						createdAt: thread.receivedAt,
					},
					parsed: thread.parsed,
				},
			];
		}

		// Append any optimistic outbound replies not yet returned from the API
		const apiIds = new Set(base.map((m) => m.id));
		const pending = optimisticReplies.filter((r) => !apiIds.has(r.id));
		return [...base, ...pending];
	}, [threadData, threadDataMatches, thread, mailbox, optimisticReplies]);

	const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

	// Update expandedIds when displayMessages changes
	useEffect(() => {
		if (displayMessages.length === 0) return;
		const initial: Record<string, boolean> = {};
		for (let i = 0; i < displayMessages.length; i++) {
			const msg = displayMessages[i];
			const isLast = i === displayMessages.length - 1;
			const isApproval =
				msg.status === "needs_approval" || msg.parsed?.suggestedReply;
			const isOutbound = msg.direction === "outbound";
			if (displayMessages.length === 1 || isLast || isApproval || isOutbound) {
				initial[msg.id] = true;
			} else {
				initial[msg.id] = false;
			}
		}
		setExpandedIds(initial);
	}, [displayMessages]);

	// Participant names computation
	const threadParticipants = useMemo(() => {
		if (!thread) return "";
		const primarySender = thread.from.name || thread.from.email.split("@")[0];
		const hasOutbound = displayMessages.some(
			(msg) => msg.direction === "outbound" || msg.status === "needs_approval",
		);
		if (hasOutbound) {
			return `${primarySender} & You`;
		}
		return primarySender;
	}, [thread, displayMessages]);

	// ── Action handlers ───────────────────────────────────────────────────────

	const handlePrototypeAction = (action: string) => {
		toast.info(`${action} — prototype only`);
	};

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
			toast.success("Archived");
			onBack?.();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to archive");
		}
	};

	const handleUnarchive = async () => {
		if (!threadKey) return;
		try {
			await unarchiveThread(threadKey);
			toast.success("Moved to inbox");
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
			} else if (folder === "snoozed") {
				await unsnoozeThread(threadKey);
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

	const handleToggleImportant = async () => {
		if (!threadKey) return;
		try {
			await toggleThreadImportant(threadKey, !thread?.isImportant);
			toast.success(
				thread?.isImportant ? "Unmarked important" : "Marked important",
			);
		} catch (err: unknown) {
			toast.error(
				err instanceof Error ? err.message : "Failed to update important",
			);
		}
	};

	const handleSnooze = async (until: Date) => {
		if (!threadKey) return;
		try {
			await snoozeThread(threadKey, until);
			toast.success("Snoozed");
			onBack?.();
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to snooze");
		}
	};

	const listUnsubscribeUrl = useMemo(() => {
		const headers =
			displayMessages.find((m) => m.direction !== "outbound")?.email?.headers ||
			displayMessages.find((m) => m.direction !== "outbound")?.headers ||
			null;
		if (!headers || typeof headers !== "object") return null;
		const raw =
			headers["List-Unsubscribe"] ||
			headers["list-unsubscribe"] ||
			headers["LIST-UNSUBSCRIBE"];
		if (!raw || typeof raw !== "string") return null;
		const match =
			raw.match(/<(https?:\/\/[^>]+)>/i) || raw.match(/(https?:\/\/\S+)/i);
		return match?.[1] ?? null;
	}, [displayMessages]);

	const handleUnsubscribe = () => {
		if (!listUnsubscribeUrl) return;
		window.open(listUnsubscribeUrl, "_blank", "noopener,noreferrer");
		toast.success("Opened unsubscribe link");
	};

	const handleToggleRead = async (isRead: boolean) => {
		if (!thread || !messageId) return;
		try {
			await markMessageRead(messageId, isRead);
			toast.success(isRead ? "Marked as Handled" : "Marked as Active");
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
	}) => {
		const body = payload.text.trim();
		if (!thread || !messageId || !body) return;

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
				toEmails: [thread.from.email],
				subject: `Re: ${thread.subject}`,
				textBody: body,
				htmlBody: payload.html || null,
				attachments: [],
				createdAt: new Date().toISOString(),
			},
			parsed: null,
		};
		setOptimisticReplies((prev) => [...prev, optimisticMsg]);
		setShowReplyComposer(false);

		const send =
			replyMode === "replyAll"
				? sendReplyAll(
						messageId,
						body,
						payload.html,
						payload.attachments,
					)
				: sendReply(messageId, body, payload.html, payload.attachments);

		toast.promise(send, {
			loading: "Sending reply...",
			success: async () => {
				await Promise.all([mutateThread(), refresh()]);
				setOptimisticReplies([]);
				return `Reply sent to ${thread.from.email} successfully`;
			},
			error: (err) => {
				setOptimisticReplies((prev) =>
					prev.filter((r) => r.id !== optimisticMsg.id),
				);
				return err instanceof Error ? err.message : "Failed to send reply";
			},
		});
	};

	const handleForward = (_msgId?: string) => {
		setShowReplyComposer(false);
		setShowForwardComposer(true);
	};

	const openReplyComposer = (mode: "reply" | "replyAll" = "reply") => {
		setReplyMode(mode);
		setShowForwardComposer(false);
		setReplySeed("");
		setShowReplyComposer(true);
	};

	useHotkeys("r", () => openReplyComposer("reply"));
	useHotkeys("a", () => openReplyComposer("replyAll"));
	useHotkeys("f", () => handleForward());
	useHotkeys("s", () => {
		void handleToggleStar();
	});
	useHotkeys("e", () => {
		void handleArchive();
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

		toast.promise(fwdPromise, {
			loading: "Forwarding message…",
			success: () => {
				setShowForwardComposer(false);
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

	return (
		<div className="flex h-full min-h-0 flex-col rounded-xl bg-panel-light dark:bg-panel-dark">
			<ZeroThreadToolbar
				isStarred={!!thread.isStarred}
				isImportant={!!thread.isImportant}
				folder={folder}
				showBack={showBack}
				onClose={onBack}
				onReplyAll={() => openReplyComposer("replyAll")}
				onToggleStar={() => void handleToggleStar()}
				onToggleImportant={() => void handleToggleImportant()}
				onArchive={() => void handleArchive()}
				onUnarchive={() => void handleUnarchive()}
				onRestore={() => void handleRestore()}
				onMoveToInbox={() => void handleRestore()}
				onDelete={() => void handleDelete()}
				onPrint={handlePrint}
				onMarkSpam={() => void handleMarkSpam(true)}
				onSnooze={() => setSnoozeOpen(true)}
				onUnsubscribe={listUnsubscribeUrl ? handleUnsubscribe : undefined}
				notesSlot={
					thread.threadId ? <NotesPanel threadId={thread.threadId} /> : null
				}
			/>
			<SnoozeDialog
				open={snoozeOpen}
				onOpenChange={setSnoozeOpen}
				onConfirm={(until) => void handleSnooze(until)}
			/>

			<div className="min-h-0 flex-1 overflow-y-auto">
				{/* Soft refresh indicator while conversation hydrates */}
				{thread.threadId && isLoadingThread && !threadDataMatches && (
					<div className="flex items-center justify-center border-mail-border border-b py-1.5">
						<div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white dark:border-t-transparent" />
					</div>
				)}

				{isTranslated && (
					<div className="mx-4 my-3 flex items-center justify-between gap-3 rounded-lg border border-mail-border bg-[var(--inbox-muted-bg)] p-3 text-xs">
						<div className="flex items-center gap-2 text-mail-muted">
							<Icon name="translate" className="h-4 w-4" />
							<span>Translated to</span>
							<select
								value={targetLanguage}
								onChange={(e) => handleLanguageChange(e.target.value)}
								className="cursor-pointer rounded-md border border-mail-border bg-[var(--inbox-control)] px-2 py-1 text-mail-foreground outline-none"
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

				{displayMessages.map((msg, index) => (
					<ZeroMailDisplay
						key={msg.id}
						msg={msg}
						mailbox={mailbox}
						threadSubject={thread.subject}
						index={index}
						totalCount={displayMessages.length}
						isTranslated={isTranslated}
						targetLanguage={targetLanguage}
						translatedHtmlMap={translatedHtmlMap}
						translatedTextMap={translatedTextMap}
						parsedExpanded={parsedExpanded}
						onToggleParsed={() => setParsedExpanded((v) => !v)}
						onReply={() => {
							setShowForwardComposer(false);
							setReplySeed("");
							setShowReplyComposer(true);
						}}
						onForward={() => handleForward()}
						onDelete={handleDelete}
						onPrint={handlePrint}
						onApproveSend={() => {
							const suggested = msg.parsed?.suggestedReply || "";
							if (!suggested.trim()) return;
							void handleSendReply({
								text: suggested,
								html: `<p>${suggested
									.replaceAll("&", "&amp;")
									.replaceAll("<", "&lt;")
									.replaceAll(">", "&gt;")
									.replaceAll("\n", "<br />")}</p>`,
							});
						}}
						onEditReply={() => {
							setReplySeed(msg.parsed?.suggestedReply || "");
							setShowForwardComposer(false);
							setShowReplyComposer(true);
						}}
					/>
				))}
			</div>

			{/* Reply / forward composer / action buttons — pinned outside scroll area */}
			{showReplyComposer ? (
				<ReplyComposer
					key={`${thread.id}-${replySeed.slice(0, 32)}`}
					toName={thread.from.name || ""}
					toEmail={thread.from.email}
					fromEmail={mailbox?.email || "agent@local.reloop.sh"}
					initialContent={replySeed}
					onSend={handleSendReply}
					onClose={() => {
						setReplySeed("");
						setShowReplyComposer(false);
					}}
				/>
			) : showForwardComposer ? (
				<ForwardComposer
					originalFrom={
						thread.from.name
							? `${thread.from.name} <${thread.from.email}>`
							: thread.from.email
					}
					originalDate={dayjs(thread.receivedAt).format(
						"ddd, MMM D, YYYY [at] h:mm A",
					)}
					originalSubject={thread.subject}
					originalBodyText={thread.bodyText?.substring(0, 300)}
					fromEmail={mailbox?.email || "agent@local.reloop.sh"}
					onSend={handleSendForward}
					onClose={() => {
						setShowForwardComposer(false);
					}}
					isSending={isForwarding}
				/>
			) : (
				// Show bottom composer bar only when there's no pending approval draft (actions are inline on the card)
				thread.status !== "needs_approval" && (
					<ZeroThreadFooter
						onReply={openReplyComposer}
						onReplyAll={openReplyComposer}
						onForward={() => handleForward()}
					/>
				)
			)}

			{/* Raw headers modal */}
			{rawHeadersExpanded && (
				<RawHeadersModal
					thread={thread}
					onClose={() => setRawHeadersExpanded(false)}
				/>
			)}
		</div>
	);
};
