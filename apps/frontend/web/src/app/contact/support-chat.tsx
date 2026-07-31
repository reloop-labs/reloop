"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Fragment,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

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

const QUICK_TOPICS = [
	{
		id: "sending",
		label: "Sending issue",
		message:
			"I'm having trouble sending emails. Can you help me diagnose delivery or domain configuration?",
	},
	{
		id: "domain",
		label: "Domain / DNS",
		message:
			"I need help verifying my domain or fixing DNS records for sending.",
	},
	{
		id: "billing",
		label: "Billing & credits",
		message:
			"I have a question about my plan, credits, or billing. Can someone from support help?",
	},
	{
		id: "api",
		label: "API / SMTP",
		message:
			"I need help with the API or SMTP integration. Here's what I'm trying to do:",
	},
] as const;

function supportWsUrl() {
	if (typeof window === "undefined") return "";
	const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
	return `${proto}//${window.location.host}${API}/ws`;
}

async function supportFetch<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
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

export function ContactSupportChat({
	userName,
}: {
	userName?: string | null;
}) {
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
					await supportFetch(
						`/conversations/${data.conversation.id}/read`,
						{ method: "POST", body: "{}" },
					);
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

	const applyTopic = (message: string) => {
		setDraft(message);
		requestAnimationFrame(() => {
			const el = textareaRef.current;
			if (!el) return;
			el.focus();
			el.style.height = "auto";
			el.style.height = `${el.scrollHeight}px`;
			const len = message.length;
			el.setSelectionRange(len, len);
		});
	};

	const closed = conversation?.status === "closed";
	const hasMessages = messages.length > 0;

	return (
		<div className="relative flex h-[min(520px,calc(100dvh-12rem))] min-h-[360px] w-full flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/[0.08] dark:bg-[#0c0c0c]">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between gap-3 border-stroke-soft-200 border-b px-4 py-3.5 dark:border-white/10">
				<div className="flex min-w-0 items-center gap-3">
					<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
						<Icon name="headset" className="size-4" />
					</div>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h2 className="font-semibold text-[14px] text-text-strong-950 tracking-tight dark:text-white">
								Reloop support
							</h2>
							<span
								className={cn(
									"inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium text-[10px]",
									closed
										? "bg-bg-weak-50 text-text-sub-600 dark:bg-white/5 dark:text-white/40"
										: ready
											? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
											: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/5 dark:text-white/40",
								)}
							>
								<span
									className={cn(
										"size-1.5 rounded-full",
										closed
											? "bg-text-soft-400"
											: ready
												? "bg-emerald-500"
												: "animate-pulse bg-text-soft-400",
									)}
								/>
								{closed ? "Closed" : ready ? "Online" : "Connecting"}
							</span>
						</div>
						<p className="mt-0.5 truncate text-[11px] text-text-sub-600 dark:text-white/40">
							{closed
								? "This conversation was closed by our team"
								: "Real people · typically reply in a few minutes"}
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
					<div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10">
						<Icon
							name="headset"
							className="size-5 animate-pulse text-blue-600 dark:text-blue-400"
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
						className="relative min-h-0 flex-1 overflow-y-auto"
						role="log"
						aria-label="Support messages"
						aria-relevant="additions"
						data-autoscrolling={followOutput ? "true" : "false"}
					>
						{!hasMessages ? (
							<div className="flex h-full min-h-[200px] flex-col px-4 py-6">
								<div className="flex flex-1 flex-col items-center justify-center text-center">
									<div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/10 ring-1 ring-blue-500/10">
										<Icon
											name="headset"
											className="size-6 text-blue-600 dark:text-blue-400"
										/>
									</div>
									<p className="font-semibold text-[17px] text-text-strong-950 dark:text-white">
										{greetingForHour()}, {firstName}
									</p>
									<p className="mt-1.5 max-w-[280px] text-[13px] text-text-sub-600 leading-relaxed dark:text-white/45">
										We&apos;re here to help with domains, sending, billing, and
										API issues. Pick a topic or type your own message.
									</p>
								</div>

								{!closed ? (
									<div className="mx-auto w-full max-w-sm space-y-2 pb-2">
										<p className="text-center font-medium text-[11px] text-text-soft-400 uppercase tracking-wide dark:text-white/30">
											Common topics
										</p>
										<div className="grid grid-cols-2 gap-2">
											{QUICK_TOPICS.map((topic) => (
												<button
													key={topic.id}
													type="button"
													onClick={() => applyTopic(topic.message)}
													className="group flex items-center gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/80 px-3 py-2.5 text-left transition-all hover:border-blue-500/30 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/25 dark:hover:bg-white/[0.05]"
												>
													<span className="min-w-0 font-medium text-[12px] text-text-strong-950 dark:text-white">
														{topic.label}
													</span>
												</button>
											))}
										</div>
									</div>
								) : null}
							</div>
						) : (
							<div className="mx-auto flex w-full max-w-md flex-col gap-1 px-4 py-5">
								<div className="mb-3 flex justify-center">
									<span className="rounded-full bg-bg-weak-50 px-3 py-1 text-[11px] text-text-sub-600 dark:bg-white/5 dark:text-white/40">
										Conversation with Reloop support
									</span>
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
														"flex max-w-[92%] items-end gap-2",
														mine ? "flex-row-reverse" : "flex-row",
													)}
												>
													<div
														className={cn(
															"min-w-0 px-3.5 py-2.5 text-[13px] leading-relaxed",
															mine
																? "rounded-2xl rounded-br-md bg-blue-600 text-white"
																: "rounded-2xl rounded-bl-md border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/90",
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
															"mt-1 text-[10px] text-text-soft-400 dark:text-white/30",
															mine ? "mr-1" : "ml-1",
														)}
													>
														{mine ? "You" : m.senderName || "Reloop support"} ·{" "}
														{formatTime(m.createdAt)}
													</p>
												) : null}
											</div>
										</Fragment>
									);
								})}
								<div ref={bottomRef} className="h-px w-full shrink-0" />
							</div>
						)}
					</div>

					{showJumpLatest ? (
						<div className="pointer-events-none absolute inset-x-0 bottom-[120px] z-10 flex justify-center">
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
					<div className="shrink-0 border-stroke-soft-200 border-t bg-bg-white-0 px-4 py-4 dark:border-white/10 dark:bg-[#0c0c0c]">
						{closed ? (
							<div className="mb-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
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

						{!closed && !hasMessages ? (
							<p className="mb-2 text-center text-[11px] text-text-soft-400 dark:text-white/30">
								Or write your own message below
							</p>
						) : null}

						<div
							className={cn(
								"flex flex-col rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-2.5 focus-within:border-primary-base/40 focus-within:ring-2 focus-within:ring-primary-base/10 dark:border-white/10 dark:bg-white/[0.02]",
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
										: hasMessages
											? "Reply to support…"
											: "What can we help you with?"
								}
								rows={2}
								className="w-full resize-none bg-transparent px-2.5 py-1 text-text-strong-950 text-xs placeholder-text-soft-400 outline-none dark:text-white/90 dark:placeholder-white/20"
							/>
							<div className="mt-2.5 flex items-center justify-between border-stroke-soft-200/50 border-t pt-2 dark:border-white/5">
								<span className="px-1.5 text-[10px] text-text-soft-400 dark:text-white/25">
									{closed
										? "Closed"
										: ready
											? "Live · Enter to send"
											: "Reconnecting…"}
								</span>
								<button
									type="button"
									onClick={() => void handleSend()}
									disabled={!draft.trim() || sending || closed}
									className={cn(
										"flex h-7 items-center gap-1 rounded-lg px-3 font-semibold text-xs transition-all",
										draft.trim() && !closed
											? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
											: "bg-bg-weak-100 text-text-sub-400 dark:bg-white/5 dark:text-white/20",
									)}
								>
									{sending ? "Sending" : "Send"}
									<Icon name="arrow-top" className="size-3.5" />
								</button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
