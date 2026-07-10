"use client";

import { useSupportSocket } from "@fe/dashboard/hooks/use-support-socket";
import type {
	SupportConversation,
	SupportMessage,
	SupportServerEvent,
} from "@fe/dashboard/lib/support-types";
import { cn } from "@reloop/ui/cn";
import axios from "axios";
import { ArrowUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

export function SupportChatPanel() {
	const [conversation, setConversation] = useState<SupportConversation | null>(
		null,
	);
	const [messages, setMessages] = useState<SupportMessage[]>([]);
	const [draft, setDraft] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sending, setSending] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const bootstrap = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data } = await axios.post<ConversationPayload>(
				"/api/admin/v1/support/conversations",
				{},
				{ withCredentials: true },
			);
			setConversation(data.conversation);
			setMessages(data.messages);
		} catch (e) {
			setError(
				e instanceof Error ? e.message : "Failed to start support chat",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void bootstrap();
	}, [bootstrap]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

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
		}
		if (event.type === "conversation_updated") {
			setConversation(event.conversation);
		}
		if (event.type === "error") {
			// Ignore transient socket auth blips once the conversation is loaded;
			// REST send still works as a fallback.
			if (event.message === "Unauthorized") return;
			setError(event.message);
		}
	}, []);

	const { ready, join, leave, sendMessage } = useSupportSocket({
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

	const handleSend = async () => {
		const body = draft.trim();
		if (!body || !conversation || sending || conversation.status === "closed") {
			return;
		}
		setSending(true);
		setError(null);
		try {
			const sent = sendMessage(conversation.id, body);
			if (!sent) {
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
			}
			setDraft("");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to send message");
		} finally {
			setSending(false);
		}
	};

	if (loading) {
		return (
			<div className="flex flex-1 items-center justify-center text-text-sub-600 text-xs">
				Connecting to support…
			</div>
		);
	}

	if (error && !conversation) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
				<p className="text-text-sub-600 text-xs">{error}</p>
				<button
					type="button"
					onClick={() => void bootstrap()}
					className="rounded-lg bg-orange-500 px-3 py-1.5 font-semibold text-white text-xs"
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0c0c0c]">
			<div className="border-stroke-soft-100 border-b px-4 py-3 dark:border-white/10">
				<p className="font-medium text-text-strong-950 text-xs dark:text-white/90">
					Live support
				</p>
				<p className="text-[11px] text-text-sub-600 dark:text-white/40">
					{conversation?.status === "closed"
						? "This conversation is closed"
						: ready
							? "Connected — we typically reply quickly"
							: "Connecting…"}
				</p>
			</div>

			<div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
				{messages.length === 0 ? (
					<p className="px-1 py-6 text-center text-[12px] text-text-sub-600 dark:text-white/40">
						Send a message and a Reloop admin will reply here.
					</p>
				) : (
					messages.map((m) => {
						const mine = m.senderRole === "user";
						return (
							<div
								key={m.id}
								className={cn("flex", mine ? "justify-end" : "justify-start")}
							>
								<div
									className={cn(
										"max-w-[85%] rounded-2xl px-3 py-2 text-xs",
										mine
											? "bg-orange-500 text-white"
											: "bg-bg-weak-50 text-text-strong-950 dark:bg-white/5 dark:text-white/90",
									)}
								>
									<p className="whitespace-pre-wrap break-words">{m.body}</p>
									<p
										className={cn(
											"mt-1 text-[10px]",
											mine ? "text-white/70" : "text-text-soft-400",
										)}
									>
										{mine ? "You" : m.senderName || "Support"} ·{" "}
										{formatTime(m.createdAt)}
									</p>
								</div>
							</div>
						);
					})
				)}
				<div ref={bottomRef} />
			</div>

			{error ? (
				<p className="px-3 pb-1 text-[11px] text-red-500">{error}</p>
			) : null}

			<div className="border-stroke-soft-100 border-t p-3 dark:border-white/10">
				<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-white/10 dark:bg-white/[0.03]">
					<textarea
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								void handleSend();
							}
						}}
						disabled={conversation?.status === "closed"}
						placeholder={
							conversation?.status === "closed"
								? "Conversation closed"
								: "How can we help?"
						}
						rows={2}
						className="scrollbar-none w-full resize-none bg-transparent px-2.5 py-1 text-text-strong-950 text-xs placeholder-text-soft-400 outline-none dark:text-white/90 dark:placeholder-white/20"
					/>
					<div className="mt-2.5 flex items-center justify-end border-stroke-soft-100/50 border-t pt-2 dark:border-white/5">
						<button
							type="button"
							onClick={() => void handleSend()}
							disabled={
								!draft.trim() || sending || conversation?.status === "closed"
							}
							className={cn(
								"flex h-7 items-center gap-1 rounded-lg px-3 font-semibold text-xs transition-all",
								draft.trim() && conversation?.status !== "closed"
									? "bg-orange-500 text-white shadow-sm hover:bg-orange-600"
									: "bg-bg-weak-100 text-text-sub-400 dark:bg-white/5 dark:text-white/20",
							)}
						>
							Send
							<ArrowUp className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
