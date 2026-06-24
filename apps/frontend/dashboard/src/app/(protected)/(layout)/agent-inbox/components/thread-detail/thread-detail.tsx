"use client";

import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import type { AgentMailbox, InboundThread } from "../../mock-data";
import { useAgentInbox } from "../agent-inbox-provider";
import { RawHeadersModal } from "./raw-headers-modal";
import { ReplyComposer } from "./reply-composer";
import { ThreadMessageItem } from "./thread-message-item";

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
	onBack?: () => void;
	showBack?: boolean;
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

const EmptyState = () => (
	<div className="flex min-h-[500px] flex-col items-center justify-center gap-1 p-8 text-center">
		<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
			<Icon name="inbox" className="h-5 w-5 text-text-sub-600" />
		</div>
		<h3 className="font-semibold text-base text-text-strong-950">
			Select a message to inspect
		</h3>
		<p className="mx-auto max-w-sm text-balance font-medium text-[12px] text-text-sub-600">
			Click any message on the left to review parsing, timeline, and approval
			actions.
		</p>
		<div className="mt-4 flex items-center gap-1.5 text-text-soft-400 text-xs">
			<Icon name="arrow-left" className="h-3.5 w-3.5" />
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
	onBack,
}: ThreadDetailProps) => {
	const { deleteMessage, markMessageRead, markMessageSpam, sendReply, refresh } =
		useAgentInbox();

	// ── UI state ──────────────────────────────────────────────────────────────
	const [parsedExpanded, setParsedExpanded] = useState(true);
	const [rawHeadersExpanded, setRawHeadersExpanded] = useState(false);
	const [showReplyComposer, setShowReplyComposer] = useState(false);
	const [replyBody, setReplyBody] = useState("");

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
	const { data: threadData, mutate: mutateThread } = useSWR<any>(
		thread?.threadId ? `/api/inbox/v1/threads/${thread.threadId}` : null,
	);

	// Reset all local state when the selected thread changes
	useEffect(() => {
		setIsTranslated(false);
		setTranslatedHtmlMap({});
		setTranslatedTextMap({});
		setTargetLanguage("es");
		setIsTranslating(false);
		setShowReplyComposer(false);
		setReplyBody("");
		setOptimisticReplies([]);
	}, [thread?.id]);

	// ── Build display messages list ───────────────────────────────────────────
	const displayMessages = useMemo(() => {
		if (!thread) return [];

		// Base: either thread API messages or single inbound fallback
		let base: any[];
		if (threadData?.messages && threadData.messages.length > 0) {
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
					direction: "inbound",
					fromEmail: thread.from.email,
					fromName: thread.from.name || null,
					messageAt: thread.receivedAt,
					subject: thread.subject,
					email: {
						id: thread.id,
						fromEmail: thread.from.email,
						toEmails: [mailbox?.email || ""],
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
	}, [threadData, thread, mailbox, optimisticReplies]);

	// ── Action handlers ───────────────────────────────────────────────────────

	const handlePrototypeAction = (action: string) => {
		toast.info(`${action} — prototype only`);
	};

	const handleDelete = async () => {
		if (!thread || !confirm("Are you sure you want to delete this message?"))
			return;
		try {
			await deleteMessage(thread.id);
			toast.success("Message deleted");
			if (onBack) onBack();
		} catch (err: any) {
			toast.error(err.message || "Failed to delete message");
		}
	};

	const handleToggleRead = async (isRead: boolean) => {
		if (!thread) return;
		try {
			await markMessageRead(thread.id, isRead);
			toast.success(isRead ? "Marked as Handled" : "Marked as Active");
		} catch (err: any) {
			toast.error(err.message || "Failed to update status");
		}
	};

	const handleMarkSpam = async (isSpam: boolean) => {
		if (!thread) return;
		try {
			await markMessageSpam(thread.id, isSpam);
			toast.success(isSpam ? "Marked as Spam" : "Marked as Not Spam");
		} catch (err: any) {
			toast.error(err.message || "Failed to mark as spam");
		}
	};

	const handleSendReply = async () => {
		if (!thread || !replyBody.trim()) return;

		// Optimistically add the reply bubble immediately
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
				textBody: replyBody.trim(),
				htmlBody: null,
				attachments: [],
				createdAt: new Date().toISOString(),
			},
			parsed: null,
		};
		setOptimisticReplies((prev) => [...prev, optimisticMsg]);
		setReplyBody("");
		setShowReplyComposer(false);

		const replyPromise = sendReply(thread.id, optimisticMsg.email.textBody);
		toast.promise(replyPromise, {
			loading: "Sending reply...",
			success: async () => {
				// Refresh both the thread view and the messages list
				await Promise.all([
					mutateThread(),
					refresh(),
				]);
				// Once real data is back, clear the optimistic entry
				setOptimisticReplies([]);
				return `Reply sent to ${thread.from.email} successfully`;
			},
			error: (err) => {
				// Roll back optimistic entry on failure
				setOptimisticReplies((prev) =>
					prev.filter((r) => r.id !== optimisticMsg.id),
				);
				return err instanceof Error ? err.message : "Failed to send reply";
			},
		});
	};

	const handleForward = () => {
		toast.info("Forward message — Composer prototype only");
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
				const walk = doc.createTreeWalker(
					doc.body,
					NodeFilter.SHOW_TEXT,
					null,
				);
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
				setTranslatedHtmlMap((prev) => ({ ...prev, [key]: doc.body.innerHTML }));
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
			if (!pw) { window.print(); return; }
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
				${messagesHtml}<script>window.onload=function(){setTimeout(function(){window.print();window.close();},300);}<\/script></body></html>`);
			pw.document.close();
		} catch {
			window.print();
		}
	};

	// ── Render ────────────────────────────────────────────────────────────────

	if (!thread) return <EmptyState />;

	return (
		<div className="flex h-full min-h-0 flex-col">
			{/* Scrollable message area */}
			<div className="min-h-0 flex-1 overflow-y-auto">
				{/* Subject header */}
				<div className="border-stroke-soft-100 border-b px-6 py-5 dark:border-stroke-soft-100/40">
					<h1 className="flex items-center gap-2 font-medium text-text-strong-950 text-xl dark:text-white">
						{thread.subject}
					</h1>
				</div>

				{/* Translation banner */}
				{isTranslated && (
					<div className="mx-5 my-4 flex items-center justify-between gap-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50 p-3 font-medium text-label-sm dark:border-stroke-soft-100/30 dark:bg-neutral-800/40">
						<div className="flex items-center gap-2 text-text-sub-600 dark:text-neutral-400">
							<Icon
								name="translate"
								className="h-4 w-4 text-primary-base"
							/>
							<span>Translated to</span>
							<select
								value={targetLanguage}
								onChange={(e) => handleLanguageChange(e.target.value)}
								className="cursor-pointer rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-2.5 py-1 font-semibold text-text-strong-950 text-xs shadow-sm outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
							>
								<option value="es">Spanish (Español)</option>
								<option value="fr">French (Français)</option>
								<option value="de">German (Deutsch)</option>
								<option value="it">Italian (Italiano)</option>
								<option value="ja">Japanese (日本語)</option>
								<option value="zh">Chinese (中文)</option>
								<option value="pt">Portuguese (Português)</option>
								<option value="ru">Russian (Русский)</option>
								<option value="ar">Arabic (العربية)</option>
								<option value="hi">Hindi (हिन्दी)</option>
							</select>
						</div>
						<button
							type="button"
							onClick={() => setIsTranslated(false)}
							className="font-semibold text-primary-base text-xs hover:underline"
						>
							Show original
						</button>
					</div>
				)}

				{/* Message list */}
				<div className="flex flex-col">
					{displayMessages.map((msg, index) => (
						<ThreadMessageItem
							key={msg.id}
							msg={msg}
							index={index}
							mailbox={mailbox}
							thread={thread}
							isTranslated={isTranslated}
							targetLanguage={targetLanguage}
							translatedHtmlMap={translatedHtmlMap}
							translatedTextMap={translatedTextMap}
							parsedExpanded={parsedExpanded}
							onToggleParsed={() => setParsedExpanded((v) => !v)}
							onReply={() => setShowReplyComposer(true)}
							onForward={handleForward}
							onDelete={handleDelete}
							onToggleRead={handleToggleRead}
							onMarkSpam={handleMarkSpam}
							onTranslate={handleTranslate}
							onPrint={handlePrint}
							onDownload={handleDownload}
							onShowOriginal={() => setRawHeadersExpanded(true)}
							onPrototypeAction={handlePrototypeAction}
						/>
					))}
				</div>
			</div>

			{/* Reply composer / action buttons — pinned outside scroll area */}
			{showReplyComposer ? (
				<ReplyComposer
					replyBody={replyBody}
					toName={thread.from.name || ""}
					toEmail={thread.from.email}
					fromEmail={mailbox?.email || "agent@local.reloop.sh"}
					onBodyChange={setReplyBody}
					onSend={handleSendReply}
					onClose={() => {
						setReplyBody("");
						setShowReplyComposer(false);
					}}
				/>
			) : (
				<div className="mx-5 my-4 flex items-center gap-3">
					<button
						type="button"
						onClick={() => setShowReplyComposer(true)}
						className="flex items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-2 font-semibold text-label-sm text-text-sub-600 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/30 dark:bg-neutral-800/20"
					>
						<svg
							className="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="9 17 4 12 9 7" />
							<path d="M20 18v-2a4 4 0 0 0-4-4H4" />
						</svg>
						<span>Reply</span>
					</button>
					<button
						type="button"
						onClick={handleForward}
						className="flex items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-2 font-semibold text-label-sm text-text-sub-600 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/30 dark:bg-neutral-800/20"
					>
						<svg
							className="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="15 17 20 12 15 7" />
							<path d="M4 18v-2a4 4 0 0 1 4-4h12" />
						</svg>
						<span>Forward</span>
					</button>
				</div>
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
