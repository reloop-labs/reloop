import { useSupportSocket } from "#/features/dashboard/hooks/use-support-socket";
import { clearSupportUnreadInCache } from "#/features/dashboard/hooks/use-support-unread";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import type {
	SupportConversation,
	SupportMessage,
	SupportServerEvent,
} from "#/lib/support-types";
import { useUIStore } from "#/store/use-ui-store";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "#/utils/avatar";
import { useQueryClient } from "@tanstack/react-query";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import axios from "axios";
import { ArrowDown, ArrowUp, MessageSquare, RotateCcw } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

type ConversationPayload = {
	conversation: SupportConversation;
	messages: SupportMessage[];
};

function formatTime(value: string) {
	try {
		return new Date(value).toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return "";
	}
}

/** First message from `fromRole` after lastReadAt — used for the unread divider. */
function findFirstUnreadMessageId(
	messages: SupportMessage[],
	lastReadAt: string | null,
	fromRole: "user" | "admin",
): string | null {
	for (const m of messages) {
		if (m.senderRole !== fromRole) continue;
		if (!lastReadAt || new Date(m.createdAt) > new Date(lastReadAt)) {
			return m.id;
		}
	}
	return null;
}

function UnreadMessagesBanner() {
	return (
		<div className="flex items-center gap-3 py-1">
			<div className="h-px flex-1 bg-orange-400/70" />
			<span className="shrink-0 font-semibold text-[11px] text-orange-600 uppercase tracking-wide dark:text-orange-400">
				New messages
			</span>
			<div className="h-px flex-1 bg-orange-400/70" />
		</div>
	);
}

function greetingForHour() {
	const hour = new Date().getHours();
	if (hour < 12) return "Morning";
	if (hour < 18) return "Afternoon";
	return "Evening";
}

function SupportPersonAvatar({
	name,
	email,
	image,
	size = "32",
}: {
	name: string | null;
	email: string | null;
	image: string | null;
	size?: "24" | "32";
}) {
	const label = name || email || "User";
	const seed = email || name || "user";
	return (
		<Avatar.Root size={size} color="gray" className="shrink-0">
			{image ? (
				<Avatar.Image src={image} alt={label} />
			) : (
				<Avatar.Image asChild>
					<div
						className={cn(
							"flex h-full w-full items-center justify-center rounded-full font-semibold text-white uppercase tracking-wide shadow-sm",
							size === "24" ? "text-[10px]" : "text-[11px]",
							getAvatarGradient(seed),
						)}
					>
						{getAvatarInitial(name, email || "u")}
					</div>
				</Avatar.Image>
			)}
		</Avatar.Root>
	);
}

const NEAR_BOTTOM_PX = 80;

export function SupportChatPanel() {
	const { user } = useActiveOrganization();
	const queryClient = useQueryClient();
	const firstName = user?.name?.split(" ")[0] || "there";

	const pendingSupportMessage = useUIStore((s) => s.pendingSupportMessage);
	const setPendingSupportMessage = useUIStore(
		(s) => s.setPendingSupportMessage,
	);
	const autoSentRef = useRef(false);

	const [conversation, setConversation] = useState<SupportConversation | null>(
		null,
	);
	const [messages, setMessages] = useState<SupportMessage[]>([]);
	const [draft, setDraft] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sending, setSending] = useState(false);
	const [followOutput, setFollowOutput] = useState(true);
	const [showJumpLatest, setShowJumpLatest] = useState(false);
	/** Sticky for this open session — captured before mark-read. */
	const [unreadAnchorId, setUnreadAnchorId] = useState<string | null>(null);

	const viewportRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const unreadBannerRef = useRef<HTMLDivElement>(null);
	const didScrollToUnreadRef = useRef(false);
	const followRef = useRef(true);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const conversationIdRef = useRef<string | null>(null);
	conversationIdRef.current = conversation?.id ?? null;

	const bootstrap = useCallback(async () => {
		setLoading(true);
		setError(null);
		didScrollToUnreadRef.current = false;
		try {
			const { data } = await axios.post<ConversationPayload>(
				"/api/admin/v1/support/conversations",
				{},
				{ withCredentials: true },
			);
			// Capture unread boundary before mark-read clears the cursor
			const anchor = findFirstUnreadMessageId(
				data.messages,
				data.conversation.userLastReadAt,
				"admin",
			);
			setUnreadAnchorId(anchor);
			setConversation(data.conversation);
			setMessages(data.messages);
			followRef.current = !anchor;
			setFollowOutput(!anchor);
			setShowJumpLatest(false);

			// Mark as read when opening the support panel
			if (data.conversation?.id) {
				try {
					await axios.post(
						`/api/admin/v1/support/conversations/${data.conversation.id}/read`,
						{},
						{ withCredentials: true },
					);
					clearSupportUnreadInCache(queryClient);
				} catch {
					// non-fatal
				}
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to start support chat");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void bootstrap();
	}, [bootstrap]);

	const scrollToLatest = useCallback((behavior: ScrollBehavior = "smooth") => {
		followRef.current = true;
		setFollowOutput(true);
		setShowJumpLatest(false);
		bottomRef.current?.scrollIntoView({ behavior, block: "end" });
	}, []);

	const onViewportScroll = useCallback(() => {
		const el = viewportRef.current;
		if (!el) return;
		const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
		const atBottom = distance <= NEAR_BOTTOM_PX;
		followRef.current = atBottom;
		setFollowOutput(atBottom);
		setShowJumpLatest(!atBottom && messages.length > 0);
	}, [messages.length]);

	useEffect(() => {
		if (loading) return;
		if (
			unreadAnchorId &&
			!didScrollToUnreadRef.current &&
			unreadBannerRef.current
		) {
			didScrollToUnreadRef.current = true;
			unreadBannerRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
			return;
		}
		if (!followRef.current) {
			setShowJumpLatest(messages.length > 0);
			return;
		}
		bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [messages.length, unreadAnchorId, loading]);

	const onEvent = useCallback((event: SupportServerEvent) => {
		if (event.type === "ready") {
			setError(null);
			return;
		}
		if (event.type === "message_created") {
			setMessages((prev) => {
				if (prev.some((m) => m.id === event.message.id)) return prev;
				return [...prev, event.message];
			});
			setError(null);
			// Incoming admin reply while panel is open — mark read
			if (event.message.senderRole === "admin" && conversationIdRef.current) {
				const id = conversationIdRef.current;
				void axios
					.post(
						`/api/admin/v1/support/conversations/${id}/read`,
						{},
						{ withCredentials: true },
					)
					.then(() => clearSupportUnreadInCache(queryClient))
					.catch(() => undefined);
			}
		}
		if (event.type === "conversation_updated") {
			setConversation(event.conversation);
		}
		if (event.type === "error") {
			if (event.message === "Unauthorized") return;
			setError(event.message);
		}
	}, []);

	const { ready, join, leave } = useSupportSocket({
		enabled: Boolean(conversation?.id),
		onEvent,
	});

	useEffect(() => {
		if (!ready || !conversation?.id) return;
		join(conversation.id);
		return () => {
			leave(conversation.id);
		};
	}, [ready, conversation?.id, join, leave]);

	// Auto-send a queued message (e.g. from an "Upgrade" click) once the
	// conversation is ready.
	useEffect(() => {
		if (!conversation?.id || conversation.status === "closed") return;
		if (!pendingSupportMessage || autoSentRef.current) return;
		autoSentRef.current = true;
		const body = pendingSupportMessage.trim();
		setPendingSupportMessage(null);
		if (!body) return;
		const conversationId = conversation.id;
		followRef.current = true;
		setFollowOutput(true);
		void (async () => {
			setSending(true);
			try {
				const { data } = await axios.post<{
					message: SupportMessage;
					conversation: SupportConversation;
				}>(
					`/api/admin/v1/support/conversations/${conversationId}/messages`,
					{ body },
					{ withCredentials: true },
				);
				setMessages((prev) =>
					prev.some((m) => m.id === data.message.id)
						? prev
						: [...prev, data.message],
				);
				setConversation(data.conversation);
			} catch (e) {
				setError(e instanceof Error ? e.message : "Failed to send message");
			} finally {
				setSending(false);
			}
		})();
	}, [
		conversation?.id,
		conversation?.status,
		pendingSupportMessage,
		setPendingSupportMessage,
	]);

	const handleSend = async () => {
		const body = draft.trim();
		if (!body || !conversation || sending || conversation.status === "closed") {
			return;
		}
		setSending(true);
		setError(null);
		followRef.current = true;
		setFollowOutput(true);
		setShowJumpLatest(false);
		try {
			const { data } = await axios.post<{
				message: SupportMessage;
				conversation: SupportConversation;
			}>(
				`/api/admin/v1/support/conversations/${conversation.id}/messages`,
				{ body },
				{ withCredentials: true },
			);
			setMessages((prev) => {
				if (prev.some((m) => m.id === data.message.id)) return prev;
				return [...prev, data.message];
			});
			setConversation(data.conversation);
			setDraft("");
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to send message");
		} finally {
			setSending(false);
		}
	};

	if (loading) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-2 px-6">
				<div className="h-10 w-10 animate-pulse rounded-2xl bg-bg-weak-100 dark:bg-white/5" />
				<p className="text-[13px] text-text-sub-600 dark:text-white/40">
					Opening support…
				</p>
			</div>
		);
	}

	if (error && !conversation) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
				<p className="text-[13px] text-text-sub-600 dark:text-white/50">
					{error}
				</p>
				<button
					type="button"
					onClick={() => void bootstrap()}
					className="inline-flex h-9 items-center gap-2 rounded-full bg-text-strong-950 px-4 font-medium text-white text-xs dark:bg-white dark:text-black"
				>
					<RotateCcw className="h-3.5 w-3.5" />
					Try again
				</button>
			</div>
		);
	}

	const closed = conversation?.status === "closed";

	return (
		<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#0c0c0c]">
			{/* Chat header */}
			<div className="flex shrink-0 items-start justify-between gap-3 border-stroke-soft-100 border-b px-5 py-4 dark:border-white/8">
				<div className="min-w-0">
					<h2 className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
						Support
					</h2>
					<p className="mt-0.5 text-[13px] text-text-sub-600 dark:text-white/45">
						{closed
							? "This conversation is closed"
							: ready
								? "How can we help you today?"
								: "Connecting…"}
					</p>
				</div>
				<button
					type="button"
					onClick={() => void bootstrap()}
					title="Refresh conversation"
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
				>
					<RotateCcw className="h-3.5 w-3.5" />
				</button>
			</div>

			{/* Transcript */}
			<div
				ref={viewportRef}
				onScroll={onViewportScroll}
				className="scrollbar-thin relative min-h-0 flex-1 overflow-y-auto px-4 py-5"
				role="log"
				aria-label="Support messages"
				aria-relevant="additions"
				data-autoscrolling={followOutput ? "true" : "false"}
			>
				{messages.length === 0 ? (
					<div className="flex h-full min-h-[220px] flex-col items-center justify-center px-4 text-center">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-stroke-soft-200 border-dashed bg-bg-weak-50 dark:border-white/15 dark:bg-white/[0.03]">
							<MessageSquare className="h-5 w-5 text-text-sub-600 dark:text-white/45" />
						</div>
						<p className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
							{greetingForHour()}, {firstName}!
						</p>
						<p className="mt-1.5 max-w-[240px] text-[13px] text-text-sub-600 leading-relaxed dark:text-white/45">
							What can we help with? Press send to start a conversation with
							Reloop support.
						</p>
					</div>
				) : (
					<div className="mx-auto flex w-full max-w-md flex-col gap-5">
						{messages.map((m) => {
							const mine = m.senderRole === "user";
							const showUnreadBanner = m.id === unreadAnchorId;
							return (
								<Fragment key={m.id}>
									{showUnreadBanner ? (
										<div ref={unreadBannerRef}>
											<UnreadMessagesBanner />
										</div>
									) : null}
									<div
										data-message-id={m.id}
										className={cn(
											"flex w-full flex-col gap-1",
											mine ? "items-end" : "items-start",
										)}
									>
										{/* Avatar + bubble share one row so they stay bottom-aligned */}
										<div
											className={cn(
												"flex max-w-[92%] items-end gap-2",
												mine ? "flex-row-reverse" : "flex-row",
											)}
										>
											<SupportPersonAvatar
												name={
													mine
														? user?.name || m.senderName
														: m.senderName || "Support"
												}
												email={
													mine ? user?.email || m.senderEmail : m.senderEmail
												}
												image={
													mine ? user?.image || m.senderImage : m.senderImage
												}
											/>
											<div
												className={cn(
													"min-w-0 rounded-[22px] px-3.5 py-2.5 text-[13px] leading-relaxed",
													mine
														? "rounded-br-md bg-text-strong-950 text-white dark:bg-white dark:text-black"
														: "rounded-bl-md bg-bg-weak-50 text-text-strong-950 dark:bg-white/[0.06] dark:text-white/90",
												)}
											>
												<p className="whitespace-pre-wrap break-words">
													{m.body}
												</p>
											</div>
										</div>
										{/* Indent past avatar (32px) + gap (8px) so meta sits under the bubble */}
										<p
											className={cn(
												"text-[11px] text-text-soft-400 dark:text-white/30",
												mine ? "mr-10" : "ml-10",
											)}
										>
											{mine ? "You" : m.senderName || "Support"} ·{" "}
											{formatTime(m.createdAt)}
										</p>
									</div>
								</Fragment>
							);
						})}
						<div ref={bottomRef} className="h-px w-full shrink-0" />
					</div>
				)}
			</div>

			{/* Jump to latest */}
			{showJumpLatest ? (
				<div className="pointer-events-none absolute inset-x-0 bottom-[88px] z-10 flex justify-center">
					<button
						type="button"
						onClick={() => scrollToLatest()}
						className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-white px-3 font-medium text-[12px] text-text-strong-950 shadow-sm transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-[#161616] dark:text-white dark:hover:bg-white/5"
					>
						Jump to latest
						<ArrowDown className="h-3.5 w-3.5" />
					</button>
				</div>
			) : null}

			{error ? (
				<p className="shrink-0 px-5 pb-1 text-[12px] text-red-500">{error}</p>
			) : null}

			{/* Composer */}
			<div className="shrink-0 px-4 pt-1 pb-4">
				<div
					className={cn(
						"flex items-end gap-2 rounded-[28px] border border-stroke-soft-100 bg-bg-weak-50/80 p-1.5 pl-2 dark:border-white/8 dark:bg-white/[0.04]",
						closed && "opacity-60",
					)}
				>
					<textarea
						ref={textareaRef}
						value={draft}
						onChange={(e) => {
							setDraft(e.target.value);
							e.target.style.height = "auto";
							e.target.style.height = `${e.target.scrollHeight}px`;
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								void handleSend();
							}
						}}
						disabled={closed}
						placeholder={
							closed ? "Conversation closed" : "Ask support anything…"
						}
						rows={1}
						className="scrollbar-thin max-h-28 min-h-[40px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-[13px] text-text-strong-950 placeholder-text-soft-400 outline-none dark:text-white/90 dark:placeholder-white/30"
					/>
					<button
						type="button"
						onClick={() => void handleSend()}
						disabled={!draft.trim() || sending || closed}
						aria-label="Send message"
						className={cn(
							"mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
							draft.trim() && !closed
								? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
								: "bg-bg-weak-100 text-text-soft-400 dark:bg-white/8 dark:text-white/25",
						)}
					>
						<ArrowUp className="h-4 w-4" />
					</button>
				</div>
				<p className="mt-2 text-center text-[11px] text-text-soft-400 dark:text-white/25">
					{ready ? "Live · Reloop support" : "Reconnecting…"}
				</p>
			</div>
		</div>
	);
}
