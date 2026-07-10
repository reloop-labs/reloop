"use client";

import { useSupportSocket } from "@fe/console/hooks/use-support-socket";
import { adminGet, adminPatch, adminPost } from "@fe/console/lib/admin-api";
import type {
	SupportConversation,
	SupportMessage,
	SupportServerEvent,
} from "@fe/console/lib/support-types";
import * as Avatar from "@reloop/ui/avatar";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { ArrowUp, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

type ConversationsResponse = { items: SupportConversation[]; total: number };
type ConversationDetail = {
	conversation: SupportConversation;
	messages: SupportMessage[];
};

function avatarInitial(name: string | null, email: string | null) {
	if (name?.trim()) return name.trim().charAt(0).toUpperCase();
	if (email?.trim()) return email.trim().charAt(0).toUpperCase();
	return "?";
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
	return (
		<Avatar.Root size={size} color="blue" className="shrink-0">
			{image ? (
				<Avatar.Image src={image} alt={label} />
			) : (
				<Avatar.Image asChild>
					<div
						className={cn(
							"flex h-full w-full items-center justify-center rounded-full bg-blue-200 font-semibold text-blue-950 uppercase",
							size === "24" ? "text-[10px]" : "text-[11px]",
						)}
					>
						{avatarInitial(name, email)}
					</div>
				</Avatar.Image>
			)}
		</Avatar.Root>
	);
}

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
	const textareaRef = useRef<HTMLTextAreaElement>(null);

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
							status === "" ? items : items.filter((c) => c.status === status);
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

	const { ready, join, leave } = useSupportSocket({
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
			const res = await adminPost<{
				message: SupportMessage;
				conversation: SupportConversation;
			}>(`/support/conversations/${selectedId}/messages`, {
				body,
			});
			setMessages((prev) => {
				if (prev.some((m) => m.id === res.message.id)) return prev;
				return [...prev, res.message];
			});
			setDraft("");
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		} catch (e) {
			console.error("Failed to send support message", e);
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
											active ? "bg-bg-weak-50" : "hover:bg-bg-weak-50/60",
										)}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex min-w-0 items-center gap-2.5">
												<SupportPersonAvatar
													name={c.userName}
													email={c.userEmail}
													image={c.userImage}
													size="32"
												/>
												<div className="min-w-0">
													<p className="truncate font-medium text-label-sm text-text-strong-950">
														{c.userName || c.userEmail || c.userId}
													</p>
													<p className="truncate text-[12px] text-text-sub-600">
														{c.userEmail}
													</p>
												</div>
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

				<section className="flex min-w-0 flex-1 flex-col bg-bg-white-0">
					{!selected ? (
						<div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stroke-soft-200 border-dashed bg-bg-weak-50">
								<MessageSquare className="h-5 w-5 text-text-sub-600" />
							</div>
							<p className="font-medium text-label-sm text-text-strong-950">
								Select a conversation
							</p>
							<p className="max-w-xs text-[13px] text-text-sub-600">
								Pick a thread on the left to reply to a customer in real time.
							</p>
						</div>
					) : (
						<>
							<div className="flex items-start justify-between gap-3 border-stroke-soft-100 border-b px-5 py-4">
								<div className="flex min-w-0 items-center gap-3">
									<SupportPersonAvatar
										name={selected.userName}
										email={selected.userEmail}
										image={selected.userImage}
										size="32"
									/>
									<div className="min-w-0">
										<p className="truncate font-semibold text-[15px] text-text-strong-950 tracking-tight">
											{selected.userName || selected.userEmail}
										</p>
										<p className="mt-0.5 truncate text-[13px] text-text-sub-600">
											{selected.userEmail}
											{ready ? " · live" : " · connecting…"}
										</p>
									</div>
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

							<div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
								{messages.length === 0 ? (
									<p className="py-10 text-center text-[13px] text-text-sub-600">
										No messages yet. Say hello to start the thread.
									</p>
								) : (
									messages.map((m) => {
										const isAdmin = m.senderRole === "admin";
										return (
											<div
												key={m.id}
												className={cn(
													"flex flex-col gap-1",
													isAdmin ? "items-end" : "items-start",
												)}
											>
												<div
													className={cn(
														"flex max-w-[85%] items-end gap-2",
														isAdmin ? "flex-row-reverse" : "flex-row",
													)}
												>
													<SupportPersonAvatar
														name={m.senderName}
														email={m.senderEmail}
														image={m.senderImage}
													/>
													<div
														className={cn(
															"min-w-0 rounded-[22px] px-3.5 py-2.5 text-[13px] leading-relaxed",
															isAdmin
																? "rounded-br-md bg-text-strong-950 text-white"
																: "rounded-bl-md bg-bg-weak-50 text-text-strong-950",
														)}
													>
														<p className="whitespace-pre-wrap break-words">
															{m.body}
														</p>
													</div>
												</div>
												<p
													className={cn(
														"text-[11px] text-text-soft-400",
														isAdmin ? "mr-10" : "ml-10",
													)}
												>
													{m.senderName || m.senderRole} ·{" "}
													{formatTime(m.createdAt)}
												</p>
											</div>
										);
									})
								)}
								<div ref={bottomRef} />
							</div>

							<div className="px-4 pt-1 pb-4">
								<div
									className={cn(
										"flex items-end gap-2 rounded-[28px] border border-stroke-soft-100 bg-bg-weak-50/80 p-1.5 pl-2",
										selected.status === "closed" && "opacity-60",
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
										disabled={selected.status === "closed"}
										placeholder={
											selected.status === "closed"
												? "Conversation is closed"
												: "Reply to customer…"
										}
										rows={1}
										className="scrollbar-thin max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[13px] text-text-strong-950 outline-none placeholder:text-text-soft-400 overflow-y-auto"
									/>
									<button
										type="button"
										onClick={() => void handleSend()}
										disabled={
											!draft.trim() || sending || selected.status === "closed"
										}
										aria-label="Send reply"
										className={cn(
											"mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
											draft.trim() && selected.status !== "closed"
												? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
												: "bg-bg-weak-100 text-text-soft-400",
										)}
									>
										<span className="sr-only">Send</span>
										<ArrowUp className="h-4 w-4" />
									</button>
								</div>
							</div>
						</>
					)}
				</section>
			</div>
		</div>
	);
}
