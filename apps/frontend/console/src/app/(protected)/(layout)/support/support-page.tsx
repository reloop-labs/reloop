"use client";

import { useSupportSocket } from "@fe/console/hooks/use-support-socket";
import { adminGet, adminPatch, adminPost } from "@fe/console/lib/admin-api";
import type {
	SupportConversation,
	SupportMessage,
	SupportServerEvent,
} from "@fe/console/lib/support-types";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

type ConversationsResponse = { items: SupportConversation[]; total: number };
type ConversationDetail = {
	conversation: SupportConversation;
	messages: SupportMessage[];
};

function formatTime(value: string) {
	try {
		return new Date(value).toLocaleString(undefined, {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return value;
	}
}

export default function SupportPage() {
	const [status, setStatus] = useState<"open" | "closed" | "">("open");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [messages, setMessages] = useState<SupportMessage[]>([]);
	const [draft, setDraft] = useState("");
	const [sending, setSending] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const listKey = ["/support/conversations", status] as const;
	const { data, isLoading, mutate } = useSWR<ConversationsResponse>(
		listKey,
		() =>
			adminGet<ConversationsResponse>("/support/conversations", {
				status: status || undefined,
				limit: 100,
			}),
	);

	const conversations = data?.items ?? [];
	const selected = useMemo(
		() => conversations.find((c) => c.id === selectedId) ?? null,
		[conversations, selectedId],
	);

	const loadConversation = useCallback(async (id: string) => {
		const detail = await adminGet<ConversationDetail>(
			`/support/conversations/${id}`,
		);
		setMessages(detail.messages);
		return detail;
	}, []);

	useEffect(() => {
		if (!selectedId) {
			setMessages([]);
			return;
		}
		void loadConversation(selectedId);
	}, [selectedId, loadConversation]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const onEvent = useCallback(
		(event: SupportServerEvent) => {
			if (event.type === "conversation_updated") {
				void mutate(
					(current) => {
						if (!current) return current;
						const idx = current.items.findIndex(
							(c) => c.id === event.conversation.id,
						);
						const items = [...current.items];
						if (idx >= 0) {
							items[idx] = event.conversation;
						} else if (!status || event.conversation.status === status) {
							items.unshift(event.conversation);
						}
						items.sort(
							(a, b) =>
								new Date(b.lastMessageAt).getTime() -
								new Date(a.lastMessageAt).getTime(),
						);
						const filtered =
							status === ""
								? items
								: items.filter((c) => c.status === status);
						return { items: filtered, total: filtered.length };
					},
					{ revalidate: false },
				);
			}

			if (event.type === "message_created") {
				if (event.message.conversationId === selectedId) {
					setMessages((prev) => {
						if (prev.some((m) => m.id === event.message.id)) return prev;
						return [...prev, event.message];
					});
				}
			}
		},
		[mutate, selectedId, status],
	);

	const { ready, join, leave, sendMessage } = useSupportSocket({
		enabled: true,
		onEvent,
	});

	useEffect(() => {
		if (!ready || !selectedId) return;
		join(selectedId);
		return () => {
			leave(selectedId);
		};
	}, [ready, selectedId, join, leave]);

	const handleSend = async () => {
		const body = draft.trim();
		if (!body || !selectedId || sending) return;
		setSending(true);
		try {
			const sent = sendMessage(selectedId, body);
			if (!sent) {
				await adminPost(`/support/conversations/${selectedId}/messages`, {
					body,
				});
				await loadConversation(selectedId);
			}
			setDraft("");
		} finally {
			setSending(false);
		}
	};

	const toggleStatus = async () => {
		if (!selected) return;
		const next = selected.status === "open" ? "closed" : "open";
		await adminPatch(`/support/conversations/${selected.id}`, {
			status: next,
		});
		await mutate();
		if (status && next !== status) {
			setSelectedId(null);
		}
	};

	return (
		<div className="-m-6 flex h-[calc(100%+3rem)] min-h-0 flex-col">
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-6 py-4">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h4">
						Support
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						Live customer conversations
						{ready ? " · connected" : " · connecting…"}
					</p>
				</div>
				<select
					className="h-10 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-paragraph-sm"
					value={status}
					onChange={(e) => {
						setStatus(e.target.value as "open" | "closed" | "");
						setSelectedId(null);
					}}
				>
					<option value="open">Open</option>
					<option value="closed">Closed</option>
					<option value="">All</option>
				</select>
			</div>

			<div className="flex min-h-0 flex-1">
				<aside className="flex w-80 shrink-0 flex-col border-stroke-soft-100 border-r">
					<div className="flex-1 overflow-y-auto">
						{isLoading ? (
							<p className="px-4 py-6 text-paragraph-sm text-text-sub-600">
								Loading…
							</p>
						) : conversations.length === 0 ? (
							<p className="px-4 py-6 text-paragraph-sm text-text-sub-600">
								No conversations yet.
							</p>
						) : (
							conversations.map((c) => {
								const active = c.id === selectedId;
								return (
									<button
										key={c.id}
										type="button"
										onClick={() => setSelectedId(c.id)}
										className={cn(
											"w-full border-stroke-soft-100 border-b px-4 py-3 text-left transition-colors",
											active
												? "bg-bg-weak-50"
												: "hover:bg-bg-weak-50/60",
										)}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<p className="truncate font-medium text-label-sm text-text-strong-950">
													{c.userName || c.userEmail || c.userId}
												</p>
												<p className="truncate text-[12px] text-text-sub-600">
													{c.userEmail}
												</p>
											</div>
											<Badge.Root
												variant="light"
												color={c.status === "open" ? "green" : "gray"}
											>
												{c.status}
											</Badge.Root>
										</div>
										<p className="mt-1 line-clamp-2 text-[12px] text-text-sub-600">
											{c.lastMessagePreview || "No messages yet"}
										</p>
										<p className="mt-1 text-[11px] text-text-soft-400">
											{formatTime(c.lastMessageAt)}
										</p>
									</button>
								);
							})
						)}
					</div>
				</aside>

				<section className="flex min-w-0 flex-1 flex-col">
					{!selected ? (
						<div className="flex flex-1 items-center justify-center text-paragraph-sm text-text-sub-600">
							Select a conversation
						</div>
					) : (
						<>
							<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-3">
								<div className="min-w-0">
									<p className="truncate font-medium text-label-sm text-text-strong-950">
										{selected.userName || selected.userEmail}
									</p>
									<p className="truncate text-[12px] text-text-sub-600">
										{selected.userEmail}
									</p>
								</div>
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="small"
									onClick={() => void toggleStatus()}
								>
									{selected.status === "open" ? "Close" : "Reopen"}
								</Button.Root>
							</div>

							<div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
								{messages.map((m) => {
									const isAdmin = m.senderRole === "admin";
									return (
										<div
											key={m.id}
											className={cn(
												"flex",
												isAdmin ? "justify-end" : "justify-start",
											)}
										>
											<div
												className={cn(
													"max-w-[75%] rounded-2xl px-3 py-2 text-paragraph-sm",
													isAdmin
														? "bg-orange-500 text-white"
														: "bg-bg-weak-50 text-text-strong-950",
												)}
											>
												<p className="whitespace-pre-wrap break-words">
													{m.body}
												</p>
												<p
													className={cn(
														"mt-1 text-[10px]",
														isAdmin ? "text-white/70" : "text-text-soft-400",
													)}
												>
													{m.senderName || m.senderRole} ·{" "}
													{formatTime(m.createdAt)}
												</p>
											</div>
										</div>
									);
								})}
								<div ref={bottomRef} />
							</div>

							<div className="border-stroke-soft-100 border-t p-4">
								<div className="flex gap-2">
									<textarea
										value={draft}
										onChange={(e) => setDraft(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												void handleSend();
											}
										}}
										disabled={selected.status === "closed"}
										placeholder={
											selected.status === "closed"
												? "Conversation is closed"
												: "Reply to customer…"
										}
										rows={2}
										className="min-h-[44px] flex-1 resize-none rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-paragraph-sm outline-none focus:border-stroke-strong-950"
									/>
									<Button.Root
										variant="primary"
										mode="filled"
										disabled={
											!draft.trim() ||
											sending ||
											selected.status === "closed"
										}
										onClick={() => void handleSend()}
									>
										Send
									</Button.Root>
								</div>
							</div>
						</>
					)}
				</section>
			</div>
		</div>
	);
}
