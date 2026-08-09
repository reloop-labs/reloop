"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

type SupportConversation = {
	id: string;
	status: "open" | "closed";
	userLastReadAt: string | null;
};

type SupportMessage = {
	id: string;
	conversationId: string;
	senderRole: "user" | "admin";
	body: string;
	createdAt: string;
	senderName: string | null;
	senderEmail: string | null;
	senderImage: string | null;
};

type SupportServerEvent =
	| { type: "ready"; userId: string; isPlatformAdmin: boolean }
	| { type: "joined"; conversationId: string }
	| { type: "left"; conversationId: string }
	| { type: "message_created"; message: SupportMessage }
	| {
			type: "conversation_updated";
			conversation: SupportConversation;
	  }
	| { type: "error"; message: string };

type ConversationPayload = {
	conversation: SupportConversation;
	messages: SupportMessage[];
};

const API = "/api/admin/v1/support";
const NEAR_BOTTOM_PX = 80;

function supportWsUrl() {
	if (typeof window === "undefined") return "";
	const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
	return `${proto}//${window.location.host}${API}/ws`;
}

async function supportFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API}${path}`, {
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
		...init,
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(text || `Request failed (${res.status})`);
	}
	return res.json() as Promise<T>;
}

function formatTime(value: string) {
	try {
		const d = new Date(value);
		const now = new Date();
		const sameDay =
			d.getFullYear() === now.getFullYear() &&
			d.getMonth() === now.getMonth() &&
			d.getDate() === now.getDate();
		if (sameDay) {
			return d.toLocaleTimeString(undefined, {
				hour: "2-digit",
				minute: "2-digit",
			});
		}
		return d.toLocaleString(undefined, {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return "";
	}
}

function greetingForHour() {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}

function useSupportSocket({
	enabled,
	onEvent,
}: {
	enabled: boolean;
	onEvent: (event: SupportServerEvent) => void;
}) {
	const [ready, setReady] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const onEventRef = useRef(onEvent);
	onEventRef.current = onEvent;
	const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const send = useCallback((payload: Record<string, unknown>) => {
		const ws = wsRef.current;
		if (!ws || ws.readyState !== WebSocket.OPEN) return false;
		ws.send(JSON.stringify(payload));
		return true;
	}, []);

	const join = useCallback(
		(conversationId: string) => send({ type: "join", conversationId }),
		[send],
	);

	const leave = useCallback(
		(conversationId: string) => send({ type: "leave", conversationId }),
		[send],
	);

	useEffect(() => {
		if (!enabled) return;

		let closed = false;

		const connect = () => {
			const url = supportWsUrl();
			if (!url) return;
			const ws = new WebSocket(url);
			wsRef.current = ws;

			ws.onopen = () => setReady(true);

			ws.onmessage = (ev) => {
				try {
					const data = JSON.parse(String(ev.data)) as SupportServerEvent;
					onEventRef.current?.(data);
				} catch {
					// ignore malformed frames
				}
			};

			ws.onclose = () => {
				setReady(false);
				wsRef.current = null;
				if (!closed) {
					reconnectTimer.current = setTimeout(connect, 2000);
				}
			};

			ws.onerror = () => ws.close();
		};

		connect();

		return () => {
			closed = true;
			if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
			wsRef.current?.close();
			wsRef.current = null;
			setReady(false);
		};
	}, [enabled]);

	return { ready, join, leave };
}

export function FoundersAvatarStack() {
	return (
		<div className="relative flex items-center -space-x-2.5">
			<div className="flex size-7 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-semibold text-amber-700 ring-2 ring-white dark:bg-amber-500/20 dark:text-amber-300 dark:ring-[#0c0c0c]">
				MO
			</div>
			<div className="flex size-7 items-center justify-center rounded-full bg-blue-500/20 text-[11px] font-semibold text-blue-700 ring-2 ring-white dark:bg-blue-500/20 dark:text-blue-300 dark:ring-[#0c0c0c]">
				TL
			</div>
			<div className="relative flex size-7 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-semibold text-emerald-700 ring-2 ring-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-[#0c0c0c]">
				PR
				<span className="absolute bottom-0 right-0 size-2 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0c0c0c]" />
			</div>
		</div>
	);
}

function SendIcon({ className = "size-4" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className={className}
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M22 2L11 13"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M22 2L15 22L11 13L2 9L22 2Z"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function ContactSupportChat({ userName }: { userName?: string | null }) {
	const firstName = userName?.split(" ")[0] || "there";

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

	const viewportRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const followRef = useRef(true);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const conversationIdRef = useRef<string | null>(null);
	conversationIdRef.current = conversation?.id ?? null;

	const bootstrap = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await supportFetch<ConversationPayload>("/conversations", {
				method: "POST",
				body: "{}",
			});
			setConversation(data.conversation);
			setMessages(data.messages);
			followRef.current = true;
			setFollowOutput(true);
			setShowJumpLatest(false);

			if (data.conversation?.id) {
				try {
					await supportFetch(`/conversations/${data.conversation.id}/read`, {
						method: "POST",
						body: "{}",
					});
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
		if (!followRef.current) {
			setShowJumpLatest(messages.length > 0);
			return;
		}
		bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [messages.length, loading]);

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
			if (event.message.senderRole === "admin" && conversationIdRef.current) {
				const id = conversationIdRef.current;
				void supportFetch(`/conversations/${id}/read`, {
					method: "POST",
					body: "{}",
				}).catch(() => undefined);
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

	const handleSend = async (override?: string) => {
		const body = (override ?? draft).trim();
		if (!body || !conversation || sending || conversation.status === "closed") {
			return;
		}
		setSending(true);
		setError(null);
		followRef.current = true;
		setFollowOutput(true);
		setShowJumpLatest(false);
		try {
			const data = await supportFetch<{
				message: SupportMessage;
				conversation: SupportConversation;
			}>(`/conversations/${conversation.id}/messages`, {
				method: "POST",
				body: JSON.stringify({ body }),
			});
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

	const closed = conversation?.status === "closed";
	const hasMessages = messages.length > 0;

	return (
		<div className="relative flex h-[min(520px,calc(100dvh-12rem))] min-h-[420px] w-full flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-[#0c0c0c] dark:text-white">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between gap-3 border-b border-stroke-soft-200 bg-bg-weak-50/50 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.02]">
				<div className="flex min-w-0 items-center gap-3">
					<FoundersAvatarStack />
					<div className="min-w-0">
						<h2 className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
							The Founders
						</h2>
						<p className="truncate text-[11px] text-text-sub-600 dark:text-white/45">
							Maya · Theo · Priya · replies in ~2 mins
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={() => void bootstrap()}
					title={closed ? "Start a new conversation" : "Refresh"}
					className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-200 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
				>
					<Icon name="rotate-cw" className="size-3.5" />
				</button>
			</div>

			{loading ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
					<div className="flex size-12 items-center justify-center rounded-2xl bg-bg-weak-50 dark:bg-white/5">
						<Icon
							name="headset"
							className="size-5 animate-pulse text-text-sub-600 dark:text-white/60"
						/>
					</div>
					<div className="text-center">
						<p className="font-medium text-[13px] text-text-strong-950 dark:text-white">
							Connecting you to support
						</p>
						<p className="mt-0.5 text-[12px] text-text-sub-600 dark:text-white/40">
							One moment…
						</p>
					</div>
				</div>
			) : error && !conversation ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
					<div className="flex size-12 items-center justify-center rounded-2xl bg-red-500/10">
						<Icon name="message-body" className="size-5 text-red-500" />
					</div>
					<div>
						<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
							Couldn&apos;t open support
						</p>
						<p className="mt-1 max-w-[260px] text-[12px] text-text-sub-600 dark:text-white/45">
							{error}
						</p>
					</div>
					<button
						type="button"
						onClick={() => void bootstrap()}
						className="inline-flex h-9 items-center gap-2 rounded-xl bg-text-strong-950 px-4 font-medium text-white text-xs dark:bg-white dark:text-black"
					>
						<Icon name="rotate-cw" className="size-3.5" />
						Try again
					</button>
				</div>
			) : (
				<>
					{/* Transcript */}
					<div
						ref={viewportRef}
						onScroll={onViewportScroll}
						className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4"
						role="log"
						aria-label="Support messages"
						aria-relevant="additions"
						data-autoscrolling={followOutput ? "true" : "false"}
					>
						{/* Founders welcome greeting bubble matching Reloop design system */}
						<div className="mb-4 flex w-full flex-col items-start">
							<div className="max-w-[90%] rounded-2xl rounded-tl-xs border border-stroke-soft-200/80 bg-bg-weak-50 px-4 py-3 text-[14px] leading-relaxed text-text-strong-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
								<p className="whitespace-pre-wrap break-words">
									Hey — this goes straight to the founders&apos; inboxes. Whoever&apos;s free jumps in, so you might hear back from any of us. Tell us what&apos;s up.
								</p>
							</div>
							<p className="mt-1 ml-1 font-mono text-[11px] text-text-soft-400 dark:text-white/35">
								The founders
							</p>
						</div>

						{messages.map((m, idx) => {
							const mine = m.senderRole === "user";
							const prev = messages[idx - 1];
							const showMeta = !prev || prev.senderRole !== m.senderRole;
							return (
								<Fragment key={m.id}>
									<div
										data-message-id={m.id}
										className={cn(
											"flex w-full flex-col",
											mine ? "items-end" : "items-start",
											showMeta ? "mt-4" : "mt-1",
										)}
									>
										<div
											className={cn(
												"flex max-w-[90%] items-end gap-2",
												mine ? "flex-row-reverse" : "flex-row",
											)}
										>
											<div
												className={cn(
													"min-w-0 px-4 py-3 text-[14px] leading-relaxed",
													mine
														? "rounded-2xl rounded-br-xs bg-blue-600 text-white"
														: "rounded-2xl rounded-bl-xs border border-stroke-soft-200/80 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white",
												)}
											>
												<p className="whitespace-pre-wrap break-words">
													{m.body}
												</p>
											</div>
										</div>
										{showMeta ? (
											<p
												className={cn(
													"mt-1 font-mono text-[11px] text-text-soft-400 dark:text-white/35",
													mine ? "mr-1" : "ml-1",
												)}
											>
												{mine ? "You" : m.senderName || "The founders"} ·{" "}
												{formatTime(m.createdAt)}
											</p>
										) : null}
									</div>
								</Fragment>
							);
						})}

						<div ref={bottomRef} className="h-px w-full shrink-0" />
					</div>

					{showJumpLatest ? (
						<div className="pointer-events-none absolute inset-x-0 bottom-[80px] z-10 flex justify-center">
							<button
								type="button"
								onClick={() => scrollToLatest()}
								className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-white px-3 font-medium text-[12px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-[#161616] dark:text-white dark:hover:bg-white/5"
							>
								Jump to latest
								<Icon name="arrow-down" className="size-3.5" />
							</button>
						</div>
					) : null}

					{error ? (
						<p className="shrink-0 px-4 pb-1 text-[12px] text-red-500">
							{error}
						</p>
					) : null}

					{/* Composer */}
					<div className="shrink-0 border-t border-stroke-soft-200 bg-bg-white-0 p-3 dark:border-white/10 dark:bg-[#0c0c0c]">
						{closed ? (
							<div className="mb-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
								<p className="font-medium text-[12px] text-text-strong-950 dark:text-white">
									This conversation is closed
								</p>
								<p className="mt-0.5 text-[11px] text-text-sub-600 dark:text-white/40">
									Need more help? Start a fresh conversation with the team.
								</p>
								<button
									type="button"
									onClick={() => void bootstrap()}
									className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-text-strong-950 px-3 font-medium text-[11px] text-white dark:bg-white dark:text-black"
								>
									Start new conversation
								</button>
							</div>
						) : null}

						<div
							className={cn(
								"flex items-center gap-2.5 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 px-3.5 py-2.5 transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.02]",
								closed && "pointer-events-none opacity-40",
							)}
						>
							<textarea
								ref={textareaRef}
								value={draft}
								onChange={(e) => {
									setDraft(e.target.value);
									e.target.style.height = "auto";
									e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										void handleSend();
									}
								}}
								disabled={closed}
								placeholder={
									closed
										? "Conversation closed"
										: "Write your message…"
								}
								rows={1}
								className="flex-1 resize-none bg-transparent text-[14px] text-text-strong-950 placeholder-text-soft-400 outline-none dark:text-white dark:placeholder-white/30"
							/>
							<button
								type="button"
								onClick={() => void handleSend()}
								disabled={!draft.trim() || sending || closed}
								className={cn(
									"flex size-9 shrink-0 items-center justify-center rounded-full transition-all cursor-pointer",
									draft.trim() && !closed
										? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
										: "bg-bg-weak-100 text-text-sub-400 dark:bg-white/5 dark:text-white/20 cursor-not-allowed",
								)}
							>
								<SendIcon className="size-4" />
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
