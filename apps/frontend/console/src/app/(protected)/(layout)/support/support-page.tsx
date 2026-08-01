"use client";

import { StatusPill } from "@fe/console/components/ui/status-pill";
import { useSupportSocket } from "@fe/console/hooks/use-support-socket";
import {
	SUPPORT_UNREAD_KEY,
	useSupportUnread,
} from "@fe/console/hooks/use-support-unread";
import { adminGet, adminPatch, adminPost } from "@fe/console/lib/admin-api";
import { formatRelativeTime } from "@fe/console/lib/format";
import type {
	SupportConversation,
	SupportMessage,
	SupportServerEvent,
} from "@fe/console/lib/support-types";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import {
	ArrowUp,
	CheckCircle2,
	Inbox,
	MessageSquare,
	RotateCcw,
	Search,
} from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { SupportContextPanel } from "./support-context-panel";

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
		<div className="flex items-center gap-3 py-2">
			<div className="h-px flex-1 bg-orange-400/60" />
			<span className="shrink-0 rounded-full bg-orange-500/15 px-2.5 py-0.5 font-semibold text-[10px] text-orange-700 uppercase tracking-wide dark:text-orange-400">
				New from customer
			</span>
			<div className="h-px flex-1 bg-orange-400/60" />
		</div>
	);
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
	size?: "24" | "32" | "40";
}) {
	const label = name || email || "User";
	return (
		<Avatar.Root
			size={size === "40" ? "40" : size}
			color="blue"
			className="shrink-0"
		>
			{image ? (
				<Avatar.Image src={image} alt={label} />
			) : (
				<Avatar.Image asChild>
					<div
						className={cn(
							"flex h-full w-full items-center justify-center rounded-full bg-blue-200 font-semibold text-blue-950 uppercase dark:bg-blue-500/25 dark:text-blue-100",
							size === "24"
								? "text-[10px]"
								: size === "40"
									? "text-[13px]"
									: "text-[11px]",
						)}
					>
						{avatarInitial(name, email)}
					</div>
				</Avatar.Image>
			)}
		</Avatar.Root>
	);
}

function formatMsgTime(value: string) {
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
		return value;
	}
}

type FilterTab = "open" | "closed" | "all";

export default function SupportPage() {
	const [filter, setFilter] = useState<FilterTab>("open");
	const [listSearch, setListSearch] = useState("");
	const [selectedId, setSelectedId] = useQueryState(
		"c",
		parseAsString.withDefault(""),
	);
	const [selectedDetail, setSelectedDetail] =
		useState<SupportConversation | null>(null);
	const [messages, setMessages] = useState<SupportMessage[]>([]);
	const [draft, setDraft] = useState("");
	const [sending, setSending] = useState(false);
	const [unreadAnchorId, setUnreadAnchorId] = useState<string | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const unreadBannerRef = useRef<HTMLDivElement>(null);
	const didScrollToUnreadRef = useRef(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const activeId = selectedId || null;
	const activeIdRef = useRef(activeId);
	activeIdRef.current = activeId;
	const { mutateUnread, unreadCount } = useSupportUnread();

	const statusParam =
		filter === "all" ? undefined : filter === "open" ? "open" : "closed";

	const listKey = ["/support/conversations", filter] as const;
	const { data, isLoading, mutate } = useSWR<ConversationsResponse>(
		listKey,
		() =>
			adminGet<ConversationsResponse>("/support/conversations", {
				status: statusParam,
				limit: 100,
			}),
	);

	const conversations = useMemo(() => {
		const items = [...(data?.items ?? [])];
		const needle = listSearch.trim().toLowerCase();
		const filtered = needle
			? items.filter((c) => {
					const hay = [c.userName, c.userEmail, c.lastMessagePreview, c.userId]
						.filter(Boolean)
						.join(" ")
						.toLowerCase();
					return hay.includes(needle);
				})
			: items;
		// Unread first, then recency
		filtered.sort((a, b) => {
			const ua = (a.unreadCount ?? 0) > 0 ? 1 : 0;
			const ub = (b.unreadCount ?? 0) > 0 ? 1 : 0;
			if (ua !== ub) return ub - ua;
			return (
				new Date(b.lastMessageAt).getTime() -
				new Date(a.lastMessageAt).getTime()
			);
		});
		return filtered;
	}, [data?.items, listSearch]);

	const waitingCount = useMemo(
		() =>
			(data?.items ?? []).filter(
				(c) => c.status === "open" && (c.unreadCount ?? 0) > 0,
			).length,
		[data?.items],
	);

	const selected = useMemo(() => {
		if (!activeId) return null;
		return (
			conversations.find((c) => c.id === activeId) ??
			(data?.items ?? []).find((c) => c.id === activeId) ??
			selectedDetail ??
			null
		);
	}, [conversations, data?.items, activeId, selectedDetail]);

	const selectConversation = useCallback(
		(id: string | null) => {
			void setSelectedId(id || null);
		},
		[setSelectedId],
	);

	// Auto-pick first waiting / first open thread when nothing selected
	useEffect(() => {
		if (activeId || isLoading || conversations.length === 0) return;
		const first =
			conversations.find((c) => (c.unreadCount ?? 0) > 0) ?? conversations[0];
		if (first) selectConversation(first.id);
	}, [activeId, isLoading, conversations, selectConversation]);

	const markRead = useCallback(
		async (id: string) => {
			if (id !== activeIdRef.current) return;
			try {
				const res = await adminPost<{ conversation: SupportConversation }>(
					`/support/conversations/${id}/read`,
				);
				if (id !== activeIdRef.current) return;
				setSelectedDetail(res.conversation);
				void mutate(
					(current) => {
						if (!current) return current;
						return {
							...current,
							items: current.items.map((c) =>
								c.id === id ? { ...c, unreadCount: 0 } : c,
							),
						};
					},
					{ revalidate: false },
				);
				void globalMutate(SUPPORT_UNREAD_KEY);
				void mutateUnread();
			} catch {
				// non-fatal
			}
		},
		[mutate, mutateUnread],
	);

	const loadConversation = useCallback(
		async (id: string) => {
			didScrollToUnreadRef.current = false;
			const detail = await adminGet<ConversationDetail>(
				`/support/conversations/${id}`,
			);
			const anchor = findFirstUnreadMessageId(
				detail.messages,
				detail.conversation.adminLastReadAt,
				"user",
			);
			setUnreadAnchorId(anchor);
			setSelectedDetail(detail.conversation);
			setMessages(detail.messages);
			await markRead(id);
			return detail;
		},
		[markRead],
	);

	useEffect(() => {
		if (!activeId) {
			setMessages([]);
			setSelectedDetail(null);
			setUnreadAnchorId(null);
			return;
		}
		void loadConversation(activeId);
	}, [activeId, loadConversation]);

	useEffect(() => {
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
		if (unreadAnchorId && !didScrollToUnreadRef.current) return;
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length, unreadAnchorId]);

	const onEvent = useCallback(
		(event: SupportServerEvent) => {
			if (event.type === "conversation_updated") {
				const conv = event.conversationAdmin ?? event.conversation;
				if (conv.id === activeId) {
					setSelectedDetail(conv);
				}
				void mutate(
					(current) => {
						if (!current) return current;
						const idx = current.items.findIndex((c) => c.id === conv.id);
						const items = [...current.items];
						if (idx >= 0) {
							items[idx] = conv;
						} else if (!statusParam || conv.status === statusParam) {
							items.unshift(conv);
						}
						items.sort(
							(a, b) =>
								new Date(b.lastMessageAt).getTime() -
								new Date(a.lastMessageAt).getTime(),
						);
						const filtered = statusParam
							? items.filter((c) => c.status === statusParam)
							: items;
						return { items: filtered, total: filtered.length };
					},
					{ revalidate: false },
				);
				void mutateUnread();
			}

			if (event.type === "message_created") {
				if (event.message.conversationId === activeId) {
					setMessages((prev) => {
						if (prev.some((m) => m.id === event.message.id)) return prev;
						return [...prev, event.message];
					});
					if (event.message.senderRole === "user" && activeId) {
						void markRead(activeId);
					}
				} else if (event.message.senderRole === "user") {
					void mutate(
						(current) => {
							if (!current) return current;
							return {
								...current,
								items: current.items.map((c) =>
									c.id === event.message.conversationId
										? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 }
										: c,
								),
							};
						},
						{ revalidate: false },
					);
				}
				void mutateUnread();
			}
		},
		[mutate, activeId, statusParam, mutateUnread, markRead],
	);

	const { ready, join, leave } = useSupportSocket({
		enabled: true,
		onEvent,
	});

	useEffect(() => {
		if (!ready || !activeId) return;
		join(activeId);
		return () => {
			leave(activeId);
		};
	}, [ready, activeId, join, leave]);

	const handleSend = async () => {
		const body = draft.trim();
		if (!body || !activeId || sending) return;
		setSending(true);
		try {
			const res = await adminPost<{
				message: SupportMessage;
				conversation: SupportConversation;
			}>(`/support/conversations/${activeId}/messages`, {
				body,
			});
			setMessages((prev) => {
				if (prev.some((m) => m.id === res.message.id)) return prev;
				return [...prev, res.message];
			});
			setSelectedDetail(res.conversation);
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
		const res = await adminPatch<{ conversation: SupportConversation }>(
			`/support/conversations/${selected.id}`,
			{ status: next },
		);
		setSelectedDetail(res.conversation);
		await mutate();
		if (filter !== "all" && next !== filter) {
			setFilter(next);
		}
	};

	const tabs: Array<{ id: FilterTab; label: string }> = [
		{ id: "open", label: "Open" },
		{ id: "closed", label: "Closed" },
		{ id: "all", label: "All" },
	];

	return (
		<div className="-m-5 md:-m-7 flex h-[calc(100%+2.5rem)] min-h-0 flex-col md:h-[calc(100%+3.5rem)]">
			{/* Top bar */}
			<header className="flex flex-wrap items-center justify-between gap-3 border-stroke-soft-100 border-b bg-bg-white-0 px-4 py-3 md:px-5 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
				<div className="flex min-w-0 flex-wrap items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
						<Inbox className="h-4 w-4" />
					</div>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="font-semibold text-[18px] text-text-strong-950 tracking-tight">
								Support desk
							</h1>
							<span
								className={cn(
									"inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium text-[10px]",
									ready
										? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
										: "bg-bg-weak-50 text-text-sub-600",
								)}
							>
								<span
									className={cn(
										"h-1.5 w-1.5 rounded-full",
										ready ? "bg-emerald-500" : "animate-pulse bg-text-soft-400",
									)}
								/>
								{ready ? "Live" : "Connecting…"}
							</span>
							{waitingCount > 0 ? (
								<span className="rounded-full bg-orange-500 px-2 py-0.5 font-semibold text-[10px] text-white tabular-nums">
									{waitingCount} waiting
								</span>
							) : null}
						</div>
						<p className="text-[12px] text-text-sub-600">
							Reply on the left · customer tools on the right
							{unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
						</p>
					</div>
				</div>
			</header>

			<div className="flex min-h-0 flex-1">
				{/* Inbox column */}
				<aside className="flex w-[300px] shrink-0 flex-col border-stroke-soft-100 border-r bg-bg-weak-50/60 lg:w-[320px] dark:border-stroke-soft-100/40 dark:bg-black/25">
					<div className="space-y-2 border-stroke-soft-100 border-b px-3 py-3 dark:border-stroke-soft-100/40">
						<div className="relative">
							<Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 text-text-soft-400" />
							<input
								value={listSearch}
								onChange={(e) => setListSearch(e.target.value)}
								placeholder="Search name, email, message…"
								className="h-9 w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 pr-3 pl-8 text-[13px] outline-none placeholder:text-text-soft-400 focus:border-stroke-strong-950 dark:bg-[#0c0c0c]"
							/>
						</div>
						<div className="flex gap-1 rounded-xl bg-bg-white-0 p-1 ring-1 ring-stroke-soft-100 dark:bg-[#0c0c0c] dark:ring-stroke-soft-100/40">
							{tabs.map((t) => (
								<button
									key={t.id}
									type="button"
									onClick={() => setFilter(t.id)}
									className={cn(
										"flex-1 rounded-lg py-1.5 font-medium text-[12px] transition-colors",
										filter === t.id
											? "bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black"
											: "text-text-sub-600 hover:text-text-strong-950",
									)}
								>
									{t.label}
								</button>
							))}
						</div>
					</div>

					<div className="flex-1 overflow-y-auto">
						{isLoading ? (
							<p className="px-4 py-8 text-center text-[13px] text-text-sub-600">
								Loading inbox…
							</p>
						) : conversations.length === 0 ? (
							<div className="px-4 py-10 text-center">
								<p className="font-medium text-[13px] text-text-strong-950">
									{listSearch ? "No matches" : "Inbox clear"}
								</p>
								<p className="mt-1 text-[12px] text-text-sub-600">
									{listSearch
										? "Try another search"
										: filter === "open"
											? "No open conversations"
											: "Nothing here"}
								</p>
							</div>
						) : (
							conversations.map((c) => {
								const active = c.id === activeId;
								const unread = c.unreadCount ?? 0;
								const waiting = unread > 0 && c.status === "open";
								return (
									<button
										key={c.id}
										type="button"
										onClick={() => selectConversation(c.id)}
										className={cn(
											"relative w-full border-stroke-soft-100 border-b px-3 py-3 text-left transition-colors dark:border-stroke-soft-100/40",
											active
												? "bg-bg-white-0 shadow-[inset_3px_0_0_0] shadow-blue-500 dark:bg-white/[0.07]"
												: "hover:bg-bg-white-0/80 dark:hover:bg-white/[0.03]",
											waiting && !active ? "bg-orange-500/[0.06]" : "",
										)}
									>
										<div className="flex gap-2.5">
											<div className="relative shrink-0">
												<SupportPersonAvatar
													name={c.userName}
													email={c.userEmail}
													image={c.userImage}
													size="32"
												/>
												{waiting ? (
													<span className="-right-0.5 -bottom-0.5 absolute h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-bg-weak-50 dark:ring-black" />
												) : null}
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-start justify-between gap-2">
													<p
														className={cn(
															"truncate text-[13px] text-text-strong-950",
															waiting ? "font-semibold" : "font-medium",
														)}
													>
														{c.userName || c.userEmail || "Customer"}
													</p>
													<span className="shrink-0 text-[10px] text-text-soft-400 tabular-nums">
														{formatRelativeTime(c.lastMessageAt)}
													</span>
												</div>
												<p className="truncate text-[11px] text-text-sub-600">
													{c.userEmail}
												</p>
												<p
													className={cn(
														"mt-1 line-clamp-2 text-[12px] leading-snug",
														waiting
															? "font-medium text-text-strong-950"
															: "text-text-sub-600",
													)}
												>
													{c.lastMessagePreview || "No messages yet"}
												</p>
												<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
													<StatusPill status={c.status} />
													{waiting ? (
														<span className="rounded-full bg-orange-500 px-1.5 py-0.5 font-semibold text-[9px] text-white uppercase tracking-wide">
															Needs reply
														</span>
													) : null}
													{unread > 0 ? (
														<span className="rounded-full bg-bg-white-0 px-1.5 py-0.5 font-semibold text-[10px] text-text-sub-600 tabular-nums ring-1 ring-stroke-soft-100 dark:bg-transparent">
															{unread > 99 ? "99+" : unread}
														</span>
													) : null}
												</div>
											</div>
										</div>
									</button>
								);
							})
						)}
					</div>
				</aside>

				{/* Thread column */}
				<section className="flex min-w-0 flex-1 flex-col bg-bg-white-0 dark:bg-transparent">
					{!selected ? (
						<div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
							<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
								<MessageSquare className="h-6 w-6" />
							</div>
							<p className="font-semibold text-[15px] text-text-strong-950">
								Pick a conversation
							</p>
							<p className="max-w-sm text-[13px] text-text-sub-600 leading-relaxed">
								Threads that need a reply are highlighted in orange. Customer
								context and top-ups stay on the right.
							</p>
						</div>
					) : (
						<>
							{/* Thread header */}
							<div className="flex flex-wrap items-center justify-between gap-3 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
								<div className="flex min-w-0 items-center gap-3">
									<SupportPersonAvatar
										name={selected.userName}
										email={selected.userEmail}
										image={selected.userImage}
										size="40"
									/>
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<p className="truncate font-semibold text-[15px] text-text-strong-950">
												{selected.userName || selected.userEmail}
											</p>
											<StatusPill status={selected.status} />
											{(selected.unreadCount ?? 0) > 0 ? (
												<span className="rounded-full bg-orange-500/15 px-2 py-0.5 font-semibold text-[10px] text-orange-700 dark:text-orange-400">
													Customer waiting
												</span>
											) : null}
										</div>
										<p className="mt-0.5 truncate text-[12px] text-text-sub-600">
											{selected.userEmail}
											<span className="text-text-soft-400">
												{" "}
												· last active{" "}
												{formatRelativeTime(selected.lastMessageAt)}
											</span>
										</p>
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-1.5">
									{selected.userId ? (
										<Button.Root
											asChild
											variant="neutral"
											mode="stroke"
											size="small"
										>
											<Link href={`/users/${selected.userId}`}>User</Link>
										</Button.Root>
									) : null}
									{selected.organizationId ? (
										<Button.Root
											asChild
											variant="neutral"
											mode="stroke"
											size="small"
										>
											<Link href={`/organizations/${selected.organizationId}`}>
												Org
											</Link>
										</Button.Root>
									) : null}
									<Button.Root
										variant={selected.status === "open" ? "neutral" : "primary"}
										mode={selected.status === "open" ? "stroke" : "filled"}
										size="small"
										onClick={() => void toggleStatus()}
										className="gap-1.5"
									>
										{selected.status === "open" ? (
											<>
												<CheckCircle2 className="h-3.5 w-3.5" />
												Close thread
											</>
										) : (
											<>
												<RotateCcw className="h-3.5 w-3.5" />
												Reopen
											</>
										)}
									</Button.Root>
								</div>
							</div>

							{/* Messages */}
							<div className="flex-1 space-y-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bg-weak-50/80 to-transparent px-4 py-4 dark:from-white/[0.02]">
								{messages.length === 0 ? (
									<div className="flex h-full flex-col items-center justify-center py-12 text-center">
										<p className="font-medium text-[13px] text-text-strong-950">
											No messages yet
										</p>
										<p className="mt-1 text-[12px] text-text-sub-600">
											Send the first reply below.
										</p>
									</div>
								) : (
									messages.map((m, idx) => {
										const isAdmin = m.senderRole === "admin";
										const showUnreadBanner = m.id === unreadAnchorId;
										const prev = messages[idx - 1];
										const showAvatar =
											!prev || prev.senderRole !== m.senderRole;
										return (
											<Fragment key={m.id}>
												{showUnreadBanner ? (
													<div ref={unreadBannerRef} className="py-2">
														<UnreadMessagesBanner />
													</div>
												) : null}
												<div
													className={cn(
														"flex flex-col",
														isAdmin ? "items-end" : "items-start",
														showAvatar ? "mt-4" : "mt-1",
													)}
												>
													<div
														className={cn(
															"flex max-w-[min(520px,88%)] items-end gap-2",
															isAdmin ? "flex-row-reverse" : "flex-row",
														)}
													>
														{showAvatar ? (
															<SupportPersonAvatar
																name={m.senderName}
																email={m.senderEmail}
																image={m.senderImage}
																size="24"
															/>
														) : (
															<span className="w-6 shrink-0" />
														)}
														<div
															className={cn(
																"min-w-0 px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
																isAdmin
																	? "rounded-2xl rounded-br-md bg-blue-600 text-white"
																	: "rounded-2xl rounded-bl-md border border-stroke-soft-100 bg-bg-white-0 text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-[#121212]",
															)}
														>
															<p className="whitespace-pre-wrap break-words">
																{m.body}
															</p>
														</div>
													</div>
													{showAvatar ? (
														<p
															className={cn(
																"mt-1 text-[10px] text-text-soft-400",
																isAdmin ? "mr-8" : "ml-8",
															)}
														>
															{isAdmin
																? m.senderName || "You"
																: m.senderName || "Customer"}{" "}
															· {formatMsgTime(m.createdAt)}
														</p>
													) : null}
												</div>
											</Fragment>
										);
									})
								)}
								<div ref={bottomRef} />
							</div>

							{/* Composer */}
							<div className="border-stroke-soft-100 border-t bg-bg-white-0 px-4 py-3 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
								{selected.status === "closed" ? (
									<div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-bg-weak-50 px-3 py-2 text-[12px] text-text-sub-600 dark:bg-white/[0.04]">
										<span>This thread is closed. Reopen to reply.</span>
										<button
											type="button"
											onClick={() => void toggleStatus()}
											className="font-medium text-primary-base hover:underline"
										>
											Reopen thread
										</button>
									</div>
								) : null}
								<div
									className={cn(
										"flex items-end gap-2 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/90 p-1.5 pl-3 dark:bg-white/[0.04]",
										selected.status === "closed" && "opacity-50",
									)}
								>
									<textarea
										ref={textareaRef}
										value={draft}
										onChange={(e) => {
											setDraft(e.target.value);
											e.target.style.height = "auto";
											e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
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
												? "Thread is closed"
												: "Write a reply… (Enter to send, Shift+Enter for line)"
										}
										rows={1}
										className="max-h-[140px] min-h-[42px] flex-1 resize-none overflow-y-auto bg-transparent py-2.5 text-[13px] text-text-strong-950 outline-none placeholder:text-text-soft-400"
									/>
									<button
										type="button"
										onClick={() => void handleSend()}
										disabled={
											!draft.trim() || sending || selected.status === "closed"
										}
										aria-label="Send reply"
										className={cn(
											"mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
											draft.trim() && selected.status !== "closed"
												? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
												: "bg-bg-white-0 text-text-soft-400 ring-1 ring-stroke-soft-100",
										)}
									>
										<ArrowUp className="h-4 w-4" />
									</button>
								</div>
							</div>
						</>
					)}
				</section>

				{selected ? <SupportContextPanel conversation={selected} /> : null}
			</div>
		</div>
	);
}
