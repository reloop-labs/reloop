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
import {
	ArrowDown,
	ArrowUp,
	CheckCircle2,
	CreditCard,
	Globe,
	Headphones,
	KeyRound,
	LifeBuoy,
	Mail,
	MessageSquare,
	RotateCcw,
	Send,
	X,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

type ConversationPayload = {
	conversation: SupportConversation;
	messages: SupportMessage[];
};

const QUICK_TOPICS = [
	{
		id: "sending",
		label: "Sending issue",
		icon: Mail,
		message:
			"I'm having trouble sending emails. Can you help me diagnose delivery or domain configuration?",
	},
	{
		id: "domain",
		label: "Domain / DNS",
		icon: Globe,
		message:
			"I need help verifying my domain or fixing DNS records for sending.",
	},
	{
		id: "billing",
		label: "Billing & credits",
		icon: CreditCard,
		message:
			"I have a question about my plan, credits, or billing. Can someone from support help?",
	},
	{
		id: "api",
		label: "API / SMTP",
		icon: KeyRound,
		message:
			"I need help with the API or SMTP integration. Here's what I'm trying to do:",
	},
] as const;

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
			<div className="h-px flex-1 bg-blue-400/50" />
			<span className="shrink-0 rounded-full bg-blue-500/15 px-2.5 py-0.5 font-semibold text-[10px] text-blue-700 uppercase tracking-wide dark:text-blue-300">
				New from Reloop
			</span>
			<div className="h-px flex-1 bg-blue-400/50" />
		</div>
	);
}

function greetingForHour() {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}

function SupportPersonAvatar({
	name,
	email,
	image,
	size = "32",
	supportAgent = false,
}: {
	name: string | null;
	email: string | null;
	image: string | null;
	size?: "24" | "32";
	supportAgent?: boolean;
}) {
	const label = name || email || "User";
	const seed = email || name || "user";
	return (
		<Avatar.Root size={size} color="gray" className="shrink-0">
			{image ? (
				<Avatar.Image src={image} alt={label} />
			) : supportAgent ? (
				<Avatar.Image asChild>
					<div
						className={cn(
							"flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-white",
							size === "24" ? "text-[10px]" : "text-[11px]",
						)}
					>
						<Headphones className={size === "24" ? "h-3 w-3" : "h-3.5 w-3.5"} />
					</div>
				</Avatar.Image>
			) : (
				<Avatar.Image asChild>
					<div
						className={cn(
							"flex h-full w-full items-center justify-center rounded-full font-semibold text-white uppercase tracking-wide",
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
	const setIsAiPanelOpen = useUIStore((s) => s.setIsAiPanelOpen);
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
	}, [queryClient]);

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

	const onEvent = useCallback(
		(event: SupportServerEvent) => {
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
		},
		[queryClient],
	);

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
			if (!override) {
				setDraft("");
				if (textareaRef.current) {
					textareaRef.current.style.height = "auto";
				}
			} else {
				setDraft("");
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
			// Place cursor at end so user can continue typing
			const len = message.length;
			el.setSelectionRange(len, len);
		});
	};

	if (loading) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
				<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
					<LifeBuoy className="h-5 w-5 animate-pulse text-blue-600 dark:text-blue-400" />
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
		);
	}

	if (error && !conversation) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
				<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
					<MessageSquare className="h-5 w-5 text-red-500" />
				</div>
				<div>
					<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
						Couldn’t open support
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
					<RotateCcw className="h-3.5 w-3.5" />
					Try again
				</button>
			</div>
		);
	}

	const closed = conversation?.status === "closed";
	const hasMessages = messages.length > 0;

	return (
		<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#0c0c0c]">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between gap-3 border-stroke-soft-100 border-b px-4 py-3.5 dark:border-white/8">
				<div className="flex min-w-0 items-center gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
						<Headphones className="h-4 w-4" />
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
										"h-1.5 w-1.5 rounded-full",
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
								: "Real people · usually replies within a few hours"}
						</p>
					</div>
				</div>
				<div className="flex shrink-0 items-center gap-1.5">
					<button
						type="button"
						onClick={() => void bootstrap()}
						title={closed ? "Start a new conversation" : "Refresh"}
						className="flex h-8 w-8 items-center justify-center rounded-xl border border-stroke-soft-100 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
					>
						<RotateCcw className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onClick={() => setIsAiPanelOpen(false)}
						title="Close support"
						className="flex h-8 w-8 items-center justify-center rounded-xl border border-stroke-soft-100 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>

			{/* Transcript */}
			<div
				ref={viewportRef}
				onScroll={onViewportScroll}
				className="scrollbar-thin relative min-h-0 flex-1 overflow-y-auto"
				role="log"
				aria-label="Support messages"
				aria-relevant="additions"
				data-autoscrolling={followOutput ? "true" : "false"}
			>
				{!hasMessages ? (
					<div className="flex h-full min-h-[280px] flex-col px-4 py-6">
						<div className="flex flex-1 flex-col items-center justify-center text-center">
							<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/10 ring-1 ring-blue-500/10">
								<LifeBuoy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
							<p className="font-semibold text-[17px] text-text-strong-950 dark:text-white">
								{greetingForHour()}, {firstName}
							</p>
							<p className="mt-1.5 max-w-[280px] text-[13px] text-text-sub-600 leading-relaxed dark:text-white/45">
								We’re here to help with domains, sending, billing, and API
								issues. Pick a topic or type your own message.
							</p>
						</div>

						{!closed ? (
							<div className="mx-auto w-full max-w-sm space-y-2 pb-2">
								<p className="text-center font-medium text-[11px] text-text-soft-400 uppercase tracking-wide dark:text-white/30">
									Common topics
								</p>
								<div className="grid grid-cols-2 gap-2">
									{QUICK_TOPICS.map((topic) => {
										const Icon = topic.icon;
										return (
											<button
												key={topic.id}
												type="button"
												onClick={() => applyTopic(topic.message)}
												className="group flex items-center gap-2.5 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/80 px-3 py-2.5 text-left transition-all hover:border-blue-500/30 hover:bg-white dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-blue-500/25 dark:hover:bg-white/[0.05]"
											>
												<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-text-sub-600 ring-1 ring-stroke-soft-100 transition-colors group-hover:text-blue-600 dark:bg-white/5 dark:ring-white/10 dark:group-hover:text-blue-400">
													<Icon className="h-3.5 w-3.5" />
												</span>
												<span className="min-w-0 font-medium text-[12px] text-text-strong-950 dark:text-white">
													{topic.label}
												</span>
											</button>
										);
									})}
								</div>
							</div>
						) : null}
					</div>
				) : (
					<div className="mx-auto flex w-full max-w-md flex-col gap-1 px-4 py-5">
						{/* Thread intro chip */}
						<div className="mb-3 flex justify-center">
							<span className="rounded-full bg-bg-weak-50 px-3 py-1 text-[11px] text-text-sub-600 dark:bg-white/5 dark:text-white/40">
								Conversation with Reloop support
							</span>
						</div>

						{messages.map((m, idx) => {
							const mine = m.senderRole === "user";
							const showUnreadBanner = m.id === unreadAnchorId;
							const prev = messages[idx - 1];
							const showMeta = !prev || prev.senderRole !== m.senderRole;
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
											{showMeta ? (
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
													size="24"
													supportAgent={!mine}
												/>
											) : (
												<span className="w-6 shrink-0" />
											)}
											<div
												className={cn(
													"min-w-0 px-3.5 py-2.5 text-[13px] leading-relaxed",
													mine
														? "rounded-2xl rounded-br-md bg-blue-600 text-white"
														: "rounded-2xl rounded-bl-md border border-stroke-soft-100 bg-bg-weak-50 text-text-strong-950 dark:border-white/8 dark:bg-white/[0.06] dark:text-white/90",
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
													mine ? "mr-8" : "ml-8",
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
				<div className="pointer-events-none absolute inset-x-0 bottom-[100px] z-10 flex justify-center">
					<button
						type="button"
						onClick={() => scrollToLatest()}
						className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-white px-3 font-medium text-[12px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-[#161616] dark:text-white dark:hover:bg-white/5"
					>
						Jump to latest
						<ArrowDown className="h-3.5 w-3.5" />
					</button>
				</div>
			) : null}

			{error ? (
				<p className="shrink-0 px-4 pb-1 text-[12px] text-red-500">{error}</p>
			) : null}

			{/* Composer — matches Ask AI input chrome */}
			<div className="shrink-0 border-stroke-soft-100 border-t bg-white px-4 py-4 dark:border-white/5 dark:bg-[#0c0c0c]/80">
				{closed ? (
					<div className="mb-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50 px-3.5 py-3 dark:border-white/8 dark:bg-white/[0.03]">
						<div className="flex items-start gap-2.5">
							<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-text-sub-600 dark:text-white/40" />
							<div className="min-w-0 flex-1">
								<p className="font-medium text-[12px] text-text-strong-950 dark:text-white">
									This conversation is closed
								</p>
								<p className="mt-0.5 text-[11px] text-text-sub-600 dark:text-white/40">
									Need more help? Start a fresh conversation with the team.
								</p>
								<button
									type="button"
									onClick={() => {
										autoSentRef.current = false;
										void bootstrap();
									}}
									className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-text-strong-950 px-3 font-medium text-[11px] text-white dark:bg-white dark:text-black"
								>
									<Send className="h-3 w-3" />
									Start new conversation
								</button>
							</div>
						</div>
					</div>
				) : null}

				{!closed && !hasMessages ? (
					<p className="mb-2 text-center text-[11px] text-text-soft-400 dark:text-white/30">
						Or write your own message below
					</p>
				) : null}

				<div
					className={cn(
						"flex flex-col rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-2.5 focus-within:border-orange-500/40 focus-within:ring-2 focus-within:ring-orange-500/10 dark:border-white/10 dark:bg-white/[0.02]",
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
						className="scrollbar-none w-full resize-none bg-transparent px-2.5 py-1 text-text-strong-950 text-xs placeholder-text-soft-400 outline-none dark:text-white/90 dark:placeholder-white/20"
					/>
					<div className="mt-2.5 flex items-center justify-between border-stroke-soft-100/50 border-t pt-2 dark:border-white/5">
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
									? "bg-orange-500 text-white hover:bg-orange-600"
									: "bg-bg-weak-100 text-text-sub-400 dark:bg-white/5 dark:text-white/20",
							)}
						>
							{sending ? "Sending" : "Send"}
							<ArrowUp className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
