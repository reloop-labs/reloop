import { useQueryClient } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useMailboxId } from "#/features/agent-inbox/lib/use-mailbox-id";
import { useSWR } from "#/features/agent-inbox/lib/use-swr-compat";
import { extractBareEmail, extractDisplayName } from "../lib/email-address";
import type {
	AgentMailbox,
	BatchThreadAction,
	ComposeDraft,
	ComposeDraftKind,
	InboundThread,
	SaveComposeDraftInput,
} from "../types";
import { findComposeDraft } from "../utils/find-compose-draft";
import {
	parseComposeDraft,
	parseComposeDraftsList,
} from "../utils/parse-compose-drafts";

const parseEmailAddress = (emailStr: string) =>
	extractBareEmail(emailStr).toLowerCase();

const normalizeFrom = (fromEmail: string, fromName?: string | null) => {
	const email = extractBareEmail(fromEmail);
	const name =
		extractDisplayName(fromName || "") ||
		extractDisplayName(fromEmail) ||
		undefined;
	return { name, email };
};

const toEmailList = (value: string | string[] | undefined): string[] => {
	if (!value) return [];
	return (Array.isArray(value) ? value : [value])
		.map((e) => e.trim())
		.filter(Boolean);
};

function buildOptimisticOutboundThread(input: {
	pendingId: string;
	mailboxId: string;
	fromEmail: string;
	fromName?: string;
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
}): InboundThread {
	const toEmails = toEmailList(input.to);
	const now = new Date().toISOString();
	const previewSource = (input.text || "").trim();
	return {
		id: input.pendingId,
		mailboxId: input.mailboxId,
		messageId: input.pendingId,
		from: normalizeFrom(input.fromEmail, input.fromName),
		subject: input.subject || "(No Subject)",
		preview: previewSource
			? previewSource.substring(0, 120) +
				(previewSource.length > 120 ? "..." : "")
			: "",
		bodyText: input.text || "",
		bodyHtml: input.html,
		receivedAt: now,
		status: "handled",
		securityLevel: 5,
		unread: false,
		isStarred: false,
		isArchived: false,
		isImportant: false,
		isPinned: false,
		messageCount: 1,
		isSpam: false,
		isTrashed: false,
		direction: "outbound",
		toEmails,
		attachments: [],
		timeline: [
			{ label: "Email composed", at: now, state: "done" },
			{ label: "Sending…", at: now, state: "active" },
		],
	};
}

export type NewAgentAddressInput = {
	label: string;
	localPart: string;
	domain: string;
	domainId: string;
	securityLevel: AgentMailbox["securityLevel"];
};

interface BackendMailbox {
	id: string;
	email: string;
	quota: string;
	status: string;
	displayName: string | null;
	createdAt: string | Date;
}

interface BackendAttachment {
	id: string;
	inboundEmailId: string;
	filename: string;
	contentType: string;
	size: number;
	storagePath: string;
	contentDisposition: string | null;
	contentId: string | null;
	createdAt: string | Date;
}

interface BackendMessage {
	id: string;
	mailboxId: string;
	organizationId: string;
	fromEmail: string;
	fromName: string | null;
	toEmails: string[];
	ccEmails?: string[] | null;
	bccEmails?: string[] | null;
	replyTo: string | null;
	subject: string | null;
	textBody: string | null;
	htmlBody: string | null;
	snippet: string | null;
	size: number;
	status: string;
	isRead: boolean;
	isStarred: boolean;
	isSpam: boolean;
	spamScore: number | null;
	messageId: string | null;
	threadId: string | null;
	inReplyTo: string | null;
	references?: string[] | null;
	headers?: Record<string, string> | null;
	date: string | Date | null;
	createdAt: string | Date;
	attachments?: BackendAttachment[];
}

interface BackendSentMessage {
	id: string;
	messageId: string;
	organizationId: string;
	domainId: string;
	fromEmail: string;
	fromName: string | null;
	toEmails: string[];
	ccEmails?: string[] | null;
	bccEmails?: string[] | null;
	subject: string;
	textBody: string | null;
	htmlBody: string | null;
	status: string;
	createdAt: string | Date;
	threadId?: string | null;
	isStarred?: boolean;
}

interface BackendThread {
	id: string;
	mailboxId: string | null;
	organizationId: string;
	subject: string | null;
	lastMessagePreview: string | null;
	lastMessageAt: string | Date;
	status: string;
	messageCount: number;
	participants: string[];
	isRead: boolean;
	isStarred: boolean;
	isImportant?: boolean;
	isPinned?: boolean;
	pinnedAt?: string | Date | null;
	labels?: { id: string; name: string; color: string }[];
	deletedAt?: string | Date | null;
	createdAt: string | Date;
	updatedAt: string | Date;
}

interface AgentInboxContextValue {
	mailboxes: AgentMailbox[];
	threads: InboundThread[];
	archivedThreads: InboundThread[];
	trashThreads: InboundThread[];
	isLoadingMailboxes: boolean;
	isLoadingThreads: boolean;
	mailboxesError: Error | null;
	threadsError: Error | null;
	retryMailboxes: () => Promise<void>;
	retryThreads: () => Promise<void>;
	getMailbox: (id: string) => AgentMailbox | undefined;
	addMailbox: (input: NewAgentAddressInput) => Promise<AgentMailbox>;
	updateMailboxDisplayName: (id: string, displayName: string) => Promise<void>;
	refresh: () => Promise<void>;
	markMessageRead: (
		id: string,
		isRead: boolean,
		options?: { threadId?: string | null },
	) => Promise<void>;
	deleteMessage: (id: string) => Promise<void>;
	markMessageSpam: (id: string, isSpam: boolean) => Promise<void>;
	toggleMessageStar: (id: string, isStarred: boolean) => Promise<void>;
	archiveThread: (threadId: string) => Promise<void>;
	unarchiveThread: (threadId: string) => Promise<void>;
	trashThread: (threadId: string) => Promise<void>;
	restoreThread: (threadId: string) => Promise<void>;
	toggleThreadImportant: (
		threadId: string,
		isImportant: boolean,
	) => Promise<void>;
	toggleThreadPinned: (threadId: string, isPinned: boolean) => Promise<void>;
	batchThreads: (ids: string[], action: BatchThreadAction) => Promise<void>;
	sendReply: (
		id: string,
		text: string,
		html?: string,
		attachments?: Array<{
			filename?: string;
			path?: string;
			content_type?: string;
		}>,
		recipients?: {
			to?: string | string[];
			cc?: string | string[];
			bcc?: string | string[];
		},
	) => Promise<void>;
	sendReplyAll: (
		id: string,
		text: string,
		html?: string,
		attachments?: Array<{
			filename?: string;
			path?: string;
			content_type?: string;
		}>,
		recipients?: {
			to?: string | string[];
			cc?: string | string[];
			bcc?: string | string[];
		},
	) => Promise<void>;
	sendForward: (
		id: string,
		to: string | string[],
		options?: {
			text?: string;
			html?: string;
			cc?: string | string[];
			bcc?: string | string[];
			attachments?: Array<{
				filename?: string;
				path?: string;
				content_type?: string;
			}>;
		},
	) => Promise<void>;
	sendMessage: (input: {
		mailboxId: string;
		to: string | string[];
		subject: string;
		text?: string;
		html?: string;
		cc?: string | string[];
		bcc?: string | string[];
		attachments?: Array<{
			filename?: string;
			path?: string;
			content_type?: string;
		}>;
		scheduledAt?: string;
		undoWindowSeconds?: number;
	}) => Promise<{
		pending?: boolean;
		id?: string;
		sendAt?: string;
		messageId?: string;
		success?: boolean;
	} | void>;
	/** Remove a pending optimistic Sent row (e.g. after Undo cancel). */
	removeOptimisticOutbound: (pendingId: string) => void;
	saveDraft: (input: SaveComposeDraftInput) => Promise<{ id: string }>;
	getDraft: (id: string) => Promise<ComposeDraft | null>;
	deleteDraft: (id: string) => Promise<void>;
	listComposeDrafts: (
		mailboxId: string,
		filters?: { threadId?: string; kind?: ComposeDraftKind },
	) => Promise<ComposeDraft[]>;
	findDraft: (input: {
		mailboxId: string;
		threadId: string;
		kind: ComposeDraftKind;
	}) => Promise<ComposeDraft | null>;
	refreshDrafts: (mailboxId?: string) => Promise<void>;
}

const AgentInboxContext = createContext<AgentInboxContextValue | null>(null);

const mapMessageToThread = (msg: BackendMessage): InboundThread => {
	const receivedAtDate = msg.date || msg.createdAt;
	const receivedAt =
		typeof receivedAtDate === "string"
			? receivedAtDate
			: receivedAtDate
				? receivedAtDate.toISOString()
				: new Date().toISOString();

	const createdAtStr =
		typeof msg.createdAt === "string"
			? msg.createdAt
			: msg.createdAt.toISOString();

	return {
		id: msg.id,
		mailboxId: msg.mailboxId,
		threadId: msg.threadId || undefined,
		messageId: msg.id,
		from: normalizeFrom(msg.fromEmail, msg.fromName),
		subject: msg.subject || "(No Subject)",
		preview:
			msg.snippet ||
			(msg.textBody
				? msg.textBody.substring(0, 120) +
					(msg.textBody.length > 120 ? "..." : "")
				: ""),
		bodyText: msg.textBody || "",
		bodyHtml: msg.htmlBody || undefined,
		receivedAt,
		status: msg.isSpam
			? ("blocked" as const)
			: msg.status === "processing"
				? ("parsing" as const)
				: msg.status === "needs_approval"
					? ("needs_approval" as const)
					: msg.isRead
						? ("handled" as const)
						: ("new" as const),
		securityLevel: 5 as const,
		unread: !msg.isRead,
		isStarred: msg.isStarred,
		isArchived: false,
		isImportant: false,
		isPinned: false,
		messageCount: 1,
		isSpam: msg.isSpam,
		isTrashed: false,
		direction: "inbound" as const,
		toEmails: msg.toEmails,
		attachments:
			msg.attachments?.map((att) => ({
				name: att.filename,
				size: `${(att.size / 1024).toFixed(1)} KB`,
				contentType: att.contentType,
				isInline: att.contentDisposition === "inline",
			})) || [],
		timeline: [
			{ label: "Email received", at: createdAtStr, state: "done" as const },
			{
				label: "Delivered to NATS",
				at: createdAtStr,
				state: "done" as const,
			},
			{
				label: "Inbox storage complete",
				at: createdAtStr,
				state: "done" as const,
			},
		],
	};
};

const mapBackendThreadToInbound = (
	thread: BackendThread,
	mailboxId: string,
): InboundThread => {
	const receivedAt =
		typeof thread.lastMessageAt === "string"
			? thread.lastMessageAt
			: thread.lastMessageAt.toISOString();
	const participant = thread.participants[0] || "unknown@unknown.com";
	const isTrashed = thread.status === "trash";
	const isArchived = thread.status === "archived";

	return {
		id: thread.id,
		mailboxId: thread.mailboxId || mailboxId,
		threadId: thread.id,
		messageId: thread.id,
		from: { email: participant, name: participant.split("@")[0] },
		subject: thread.subject || "(No Subject)",
		preview: thread.lastMessagePreview || "",
		bodyText: thread.lastMessagePreview || "",
		receivedAt,
		status: "handled",
		securityLevel: 5,
		unread: !thread.isRead,
		isStarred: thread.isStarred,
		isArchived,
		isImportant: thread.isImportant ?? false,
		isPinned: thread.isPinned ?? false,
		pinnedAt: thread.pinnedAt
			? typeof thread.pinnedAt === "string"
				? thread.pinnedAt
				: thread.pinnedAt.toISOString()
			: null,
		messageCount: thread.messageCount,
		labels: (thread.labels ?? []).map((l) => ({
			id: l.id,
			mailboxId: thread.mailboxId || mailboxId,
			name: l.name,
			color: l.color,
		})),
		isSpam: false,
		isTrashed,
		direction: "inbound",
		timeline: [],
	};
};

export const AgentInboxProvider = ({ children }: { children: ReactNode }) => {
	const queryClient = useQueryClient();
	const routeMailboxId = useMailboxId();
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [optimisticOutbound, setOptimisticOutbound] = useState<InboundThread[]>(
		[],
	);
	const pendingRefreshTimers = useRef<Map<string, number>>(new Map());

	const refreshDrafts = useCallback(
		async (mailboxId?: string) => {
			await queryClient.invalidateQueries({
				predicate: (query) => {
					const key = query.queryKey[1];
					if (typeof key !== "string") return false;
					if (!key.includes("/api/inbox/v1/drafts")) return false;
					if (!mailboxId) return true;
					return key.includes(`mailboxId=${encodeURIComponent(mailboxId)}`);
				},
			});
		},
		[queryClient],
	);

	const {
		data: mailboxesData,
		isLoading: isLoadingMailboxes,
		error: mailboxesQueryError,
		mutate: mutateMailboxes,
	} = useSWR<BackendMailbox[]>("/api/inbox/v1/mailboxes/list");

	const trimmedSearch = searchQuery.trim();
	const messagesListUrl = trimmedSearch
		? `/api/inbox/v1/messages?q=${encodeURIComponent(trimmedSearch)}&limit=200`
		: "/api/inbox/v1/messages";

	const {
		data: messagesData,
		isLoading: isLoadingInboundThreads,
		error: inboundThreadsError,
		mutate: mutateMessages,
	} = useSWR<BackendMessage[]>(messagesListUrl);

	const sentListUrl = (() => {
		const params = new URLSearchParams();
		if (routeMailboxId) params.set("mailboxId", routeMailboxId);
		if (trimmedSearch) params.set("q", trimmedSearch);
		const qs = params.toString();
		return qs
			? `/api/inbox/v1/messages/sent?${qs}`
			: "/api/inbox/v1/messages/sent";
	})();

	const {
		data: sentMessagesData,
		isLoading: isLoadingSentMessages,
		error: sentMessagesError,
		mutate: mutateSentMessages,
	} = useSWR<BackendSentMessage[]>(sentListUrl);

	const threadsListUrl = trimmedSearch
		? `/api/inbox/v1/threads?limit=200&q=${encodeURIComponent(trimmedSearch)}`
		: "/api/inbox/v1/threads?limit=200";

	const { data: allThreadsData, mutate: mutateThreads } = useSWR<
		BackendThread[]
	>(threadsListUrl);

	const isLoadingThreads = isLoadingInboundThreads || isLoadingSentMessages;

	const mailboxesError =
		mailboxesQueryError instanceof Error
			? mailboxesQueryError
			: mailboxesQueryError
				? new Error("Failed to load mailboxes")
				: null;

	const threadsErrorRaw = inboundThreadsError || sentMessagesError;
	const threadsError =
		threadsErrorRaw instanceof Error
			? threadsErrorRaw
			: threadsErrorRaw
				? new Error("Failed to load messages")
				: null;

	const retryMailboxes = useCallback(async () => {
		await mutateMailboxes();
	}, [mutateMailboxes]);

	const retryThreads = useCallback(async () => {
		await Promise.all([mutateMessages(), mutateSentMessages()]);
	}, [mutateMessages, mutateSentMessages]);

	const removeOptimisticOutbound = useCallback((pendingId: string) => {
		setOptimisticOutbound((prev) => prev.filter((t) => t.id !== pendingId));
		for (const key of [pendingId, `${pendingId}:retry`]) {
			const timer = pendingRefreshTimers.current.get(key);
			if (timer !== undefined) {
				window.clearTimeout(timer);
				pendingRefreshTimers.current.delete(key);
			}
		}
	}, []);

	useEffect(() => {
		return () => {
			for (const timer of pendingRefreshTimers.current.values()) {
				window.clearTimeout(timer);
			}
			pendingRefreshTimers.current.clear();
		};
	}, []);

	// Drop optimistic rows once a matching email_log row appears (pending id ≠ log id).
	useEffect(() => {
		if (!sentMessagesData?.length) return;
		const sentKeys = new Set(
			sentMessagesData.map(
				(m) =>
					`${(m.subject || "").toLowerCase()}|${(m.toEmails ?? [])
						.map(parseEmailAddress)
						.sort()
						.join(",")}`,
			),
		);
		setOptimisticOutbound((prev) => {
			if (prev.length === 0) return prev;
			const next = prev.filter((opt) => {
				const ageMs = Date.now() - new Date(opt.receivedAt).getTime();
				if (ageMs > 90_000) return false;
				const key = `${opt.subject.toLowerCase()}|${(opt.toEmails ?? [])
					.map(parseEmailAddress)
					.sort()
					.join(",")}`;
				if (sentKeys.has(key) && ageMs > 10_000) return false;
				return true;
			});
			return next.length === prev.length ? prev : next;
		});
	}, [sentMessagesData]);

	const mailboxes = useMemo(() => {
		if (!mailboxesData) return [];
		return mailboxesData.map((mb) => ({
			id: mb.id,
			email: mb.email,
			label: mb.displayName || mb.email.split("@")[0] || "Agent",
			status:
				mb.status === "active" ? ("active" as const) : ("disabled" as const),
			securityLevel: 5 as const,
			createdAt:
				typeof mb.createdAt === "string"
					? mb.createdAt
					: mb.createdAt.toISOString(),
		}));
	}, [mailboxesData]);

	const threads = useMemo(() => {
		const excludedThreadIds = new Set(
			(allThreadsData || [])
				.filter((t) => t.status === "archived" || t.status === "trash")
				.map((t) => t.id),
		);

		const threadMeta = new Map((allThreadsData || []).map((t) => [t.id, t]));

		const mappedInbound = messagesData
			? messagesData
					.filter((msg) => !excludedThreadIds.has(msg.threadId || ""))
					.map((msg) => {
						const base = mapMessageToThread(msg);
						if (msg.threadId && threadMeta.has(msg.threadId)) {
							const meta = threadMeta.get(msg.threadId)!;
							const isArchived = meta.status === "archived";
							const isTrashed = meta.status === "trash";
							return {
								...base,
								isStarred: base.isStarred || meta.isStarred,
								// Message read state is source of truth for list rows; thread
								// flag is also OR'd so bulk/thread-only updates still show unread.
								// Both are kept in sync by the mark-read API.
								unread: base.unread || !meta.isRead,
								isImportant: meta.isImportant ?? base.isImportant,
								isPinned: meta.isPinned ?? base.isPinned,
								pinnedAt: meta.pinnedAt
									? typeof meta.pinnedAt === "string"
										? meta.pinnedAt
										: meta.pinnedAt.toISOString()
									: null,
								messageCount: meta.messageCount ?? base.messageCount,
								labels: (meta.labels ?? []).map((l) => ({
									id: l.id,
									mailboxId: meta.mailboxId || base.mailboxId,
									name: l.name,
									color: l.color,
								})),
								isSpam: base.isSpam,
								isTrashed,
								isArchived,
								status: base.isSpam ? ("blocked" as const) : base.status,
							};
						}
						return base;
					})
			: [];

		const mappedSent = sentMessagesData
			? sentMessagesData.map((msg) => {
					const receivedAtDate = msg.createdAt;
					const receivedAt =
						typeof receivedAtDate === "string"
							? receivedAtDate
							: receivedAtDate.toISOString();

					const fromEmailParsed = parseEmailAddress(msg.fromEmail);
					const mailbox = mailboxes.find(
						(mb) => parseEmailAddress(mb.email) === fromEmailParsed,
					);

					return {
						id: msg.id,
						mailboxId: mailbox?.id ?? "",
						threadId: msg.threadId ?? undefined,
						messageId: msg.id,
						from: normalizeFrom(msg.fromEmail, msg.fromName),
						subject: msg.subject || "(No Subject)",
						preview: msg.textBody
							? msg.textBody.substring(0, 120) +
								(msg.textBody.length > 120 ? "..." : "")
							: "",
						bodyText: msg.textBody || "",
						bodyHtml: msg.htmlBody || undefined,
						receivedAt,
						status: "handled" as const,
						securityLevel: 5 as const,
						unread: false,
						isStarred: Boolean(msg.isStarred),
						isArchived: false,
						isImportant: false,
						isPinned: false,
						messageCount: 1,
						isSpam: false,
						isTrashed: false,
						direction: "outbound" as const,
						toEmails: msg.toEmails,
						attachments: [],
						timeline: [
							{
								label: "Email composed",
								at: receivedAt,
								state: "done" as const,
							},
							{
								label: "Sent to KumoMTA",
								at: receivedAt,
								state: "done" as const,
							},
							{
								label: "Delivered",
								at: receivedAt,
								state: "done" as const,
							},
						],
					};
				})
			: [];

		const sentIds = new Set(mappedSent.map((t) => t.id));
		const pendingOptimistic = optimisticOutbound.filter(
			(t) => !sentIds.has(t.id),
		);

		return [...mappedInbound, ...mappedSent, ...pendingOptimistic].sort(
			(a, b) =>
				new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
		);
	}, [
		messagesData,
		sentMessagesData,
		mailboxes,
		allThreadsData,
		optimisticOutbound,
	]);

	const archivedThreads = useMemo(() => {
		if (!allThreadsData) return [];
		return allThreadsData
			.filter((t) => t.status === "archived")
			.map((t) => mapBackendThreadToInbound(t, t.mailboxId || ""));
	}, [allThreadsData]);

	const trashThreads = useMemo(() => {
		if (!allThreadsData) return [];
		return allThreadsData
			.filter((t) => t.status === "trash")
			.map((t) => mapBackendThreadToInbound(t, t.mailboxId || ""));
	}, [allThreadsData]);

	const getMailbox = useCallback(
		(id: string) => mailboxes.find((m) => m.id === id),
		[mailboxes],
	);

	const addMailbox = useCallback(
		async (input: NewAgentAddressInput) => {
			const email = `${input.localPart}@${input.domain}`;
			const res = await fetch("/api/inbox/v1/mailboxes/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					domainId: input.domainId,
					email,
					quota: "5 GB",
					displayName: input.label,
				}),
			});

			if (!res.ok) {
				const body = await res.text();
				let message = "Failed to create mailbox";
				try {
					const parsed = JSON.parse(body) as { message?: string };
					if (parsed.message) message = parsed.message;
				} catch {
					if (body) message = body;
				}
				throw new Error(message);
			}

			const data = (await res.json()) as {
				id: string;
				email: string;
				status: string;
			};

			const newMailbox: AgentMailbox = {
				id: data.id,
				email: data.email,
				label: input.label,
				status: "active" as const,
				securityLevel: input.securityLevel,
				createdAt: new Date().toISOString(),
			};

			await mutateMailboxes();
			return newMailbox;
		},
		[mutateMailboxes],
	);

	const updateMailboxDisplayName = useCallback(
		async (id: string, displayName: string) => {
			const trimmed = displayName.trim();
			if (!trimmed) {
				throw new Error("Display name is required");
			}

			const res = await fetch(`/api/inbox/v1/mailboxes/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ displayName: trimmed }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to update mailbox name");
			}

			await mutateMailboxes(
				(current) =>
					current?.map((mb) =>
						mb.id === id ? { ...mb, displayName: trimmed } : mb,
					),
				{ revalidate: true },
			);
		},
		[mutateMailboxes],
	);

	const markMessageRead = useCallback(
		async (
			id: string,
			isRead: boolean,
			options?: { threadId?: string | null },
		) => {
			const threadId = options?.threadId;

			// Optimistic list update so the unread badge clears immediately on open
			await mutateMessages(
				(current) =>
					current?.map((msg) => {
						const sameMessage = msg.id === id;
						const sameThread = threadId
							? msg.threadId === threadId
							: msg.threadId && msg.threadId === id;
						if (sameMessage || sameThread) {
							return { ...msg, isRead };
						}
						return msg;
					}),
				{ revalidate: false },
			);
			await mutateThreads(
				(current) =>
					current?.map((t) => {
						if (t.id === threadId || t.id === id) {
							return { ...t, isRead };
						}
						return t;
					}),
				{ revalidate: false },
			);

			// Prefer thread endpoint when we have a canonical conversation id.
			// List APIs return email_thread.id via thread_message (thr_…); message
			// endpoint also resolves via thread_message when only a message id is known.
			const endpoint =
				threadId && threadId.startsWith("thr_")
					? `/api/inbox/v1/threads/${encodeURIComponent(threadId)}/read`
					: `/api/inbox/v1/messages/${encodeURIComponent(id)}/read`;

			let res: Response;
			try {
				res = await fetch(endpoint, {
					method: "PATCH",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ isRead }),
				});
			} catch (error) {
				// Network / abort failures — roll back optimistic state
				await Promise.all([mutateMessages(), mutateThreads()]);
				throw error;
			}

			if (!res.ok) {
				// Revalidate to roll back optimistic state
				await Promise.all([mutateMessages(), mutateThreads()]);
				const body = await res.text();
				throw new Error(
					body || `Failed to mark message as ${isRead ? "read" : "unread"}`,
				);
			}

			await Promise.all([mutateMessages(), mutateThreads()]);
		},
		[mutateMessages, mutateThreads],
	);

	const deleteMessage = useCallback(
		async (id: string) => {
			const res = await fetch(`/api/inbox/v1/messages/${id}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to delete message");
			}

			await Promise.all([mutateMessages(), mutateThreads()]);
		},
		[mutateMessages, mutateThreads],
	);

	const markMessageSpam = useCallback(
		async (id: string, isSpam: boolean) => {
			const res = await fetch(`/api/inbox/v1/messages/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isSpam }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to update spam status");
			}

			await Promise.all([mutateMessages(), mutateThreads()]);
		},
		[mutateMessages, mutateThreads],
	);

	const toggleMessageStar = useCallback(
		async (id: string, isStarred: boolean) => {
			const res = await fetch(`/api/inbox/v1/messages/${id}/star`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isStarred }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to update star status");
			}

			await Promise.all([
				mutateMessages(),
				mutateThreads(),
				mutateSentMessages(),
			]);
		},
		[mutateMessages, mutateThreads, mutateSentMessages],
	);

	const archiveThread = useCallback(
		async (threadId: string) => {
			const res = await fetch(`/api/inbox/v1/threads/${threadId}/archive`, {
				method: "POST",
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to archive thread");
			}

			await Promise.all([
				mutateMessages(),
				mutateThreads(),
				mutateSentMessages(),
			]);
		},
		[mutateMessages, mutateThreads, mutateSentMessages],
	);

	const unarchiveThread = useCallback(
		async (threadId: string) => {
			const res = await fetch(`/api/inbox/v1/threads/${threadId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "active" }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to unarchive thread");
			}

			await Promise.all([
				mutateMessages(),
				mutateThreads(),
				mutateSentMessages(),
			]);
		},
		[mutateMessages, mutateThreads, mutateSentMessages],
	);

	const trashThread = useCallback(
		async (threadId: string) => {
			const res = await fetch(`/api/inbox/v1/threads/${threadId}/trash`, {
				method: "POST",
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to trash thread");
			}

			await Promise.all([
				mutateMessages(),
				mutateThreads(),
				mutateSentMessages(),
			]);
		},
		[mutateMessages, mutateThreads, mutateSentMessages],
	);

	const restoreThread = useCallback(
		async (threadId: string) => {
			const res = await fetch(`/api/inbox/v1/threads/${threadId}/restore`, {
				method: "POST",
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to restore thread");
			}

			await Promise.all([
				mutateMessages(),
				mutateThreads(),
				mutateSentMessages(),
			]);
		},
		[mutateMessages, mutateThreads, mutateSentMessages],
	);

	const toggleThreadImportant = useCallback(
		async (threadId: string, isImportant: boolean) => {
			const res = await fetch(`/api/inbox/v1/threads/${threadId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isImportant }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to update important status");
			}

			await Promise.all([mutateMessages(), mutateThreads()]);
		},
		[mutateMessages, mutateThreads],
	);

	const toggleThreadPinned = useCallback(
		async (threadId: string, isPinned: boolean) => {
			const res = await fetch(`/api/inbox/v1/threads/${threadId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isPinned }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to update pinned status");
			}

			await Promise.all([mutateMessages(), mutateThreads()]);
		},
		[mutateMessages, mutateThreads],
	);

	const batchThreads = useCallback(
		async (ids: string[], action: BatchThreadAction) => {
			const res = await fetch("/api/inbox/v1/threads/batch", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids, action }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to batch update threads");
			}

			await Promise.all([
				mutateMessages(),
				mutateThreads(),
				mutateSentMessages(),
			]);
		},
		[mutateMessages, mutateThreads, mutateSentMessages],
	);

	const sendReply = useCallback(
		async (
			id: string,
			text: string,
			html?: string,
			attachments?: Array<{
				filename?: string;
				path?: string;
				content_type?: string;
			}>,
			recipients?: {
				to?: string | string[];
				cc?: string | string[];
				bcc?: string | string[];
			},
		) => {
			const res = await fetch(`/api/inbox/v1/messages/${id}/reply`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text, html, attachments, ...recipients }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to send reply");
			}

			await Promise.all([mutateMessages(), mutateSentMessages()]);
		},
		[mutateMessages, mutateSentMessages],
	);

	const sendReplyAll = useCallback(
		async (
			id: string,
			text: string,
			html?: string,
			attachments?: Array<{
				filename?: string;
				path?: string;
				content_type?: string;
			}>,
			recipients?: {
				to?: string | string[];
				cc?: string | string[];
				bcc?: string | string[];
			},
		) => {
			const res = await fetch(`/api/inbox/v1/messages/${id}/reply-all`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text, html, attachments, ...recipients }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to send reply all");
			}

			await Promise.all([mutateMessages(), mutateSentMessages()]);
		},
		[mutateMessages, mutateSentMessages],
	);

	const sendForward = useCallback(
		async (
			id: string,
			to: string | string[],
			options?: {
				text?: string;
				html?: string;
				cc?: string | string[];
				bcc?: string | string[];
				attachments?: Array<{
					filename?: string;
					path?: string;
					content_type?: string;
				}>;
			},
		) => {
			const res = await fetch(`/api/inbox/v1/messages/${id}/forward`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ to, ...options }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to forward message");
			}

			await Promise.all([mutateMessages(), mutateSentMessages()]);
		},
		[mutateMessages, mutateSentMessages],
	);

	const sendMessage = useCallback(
		async (input: {
			mailboxId: string;
			to: string | string[];
			subject: string;
			text?: string;
			html?: string;
			cc?: string | string[];
			bcc?: string | string[];
			attachments?: Array<{
				filename?: string;
				path?: string;
				content_type?: string;
			}>;
			scheduledAt?: string;
			undoWindowSeconds?: number;
		}) => {
			const res = await fetch("/api/inbox/v1/messages/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to send message");
			}

			const data = (await res.json()) as {
				pending?: boolean;
				id?: string;
				sendAt?: string;
				messageId?: string;
				success?: boolean;
			};

			if (!data.pending) {
				await Promise.all([mutateMessages(), mutateSentMessages()]);
				return data;
			}

			// Undo / scheduled path: show in Sent immediately, refresh after flush.
			if (data.id) {
				const mailbox = mailboxes.find((m) => m.id === input.mailboxId);
				const optimistic = buildOptimisticOutboundThread({
					pendingId: data.id,
					mailboxId: input.mailboxId,
					fromEmail: mailbox?.email || "",
					fromName: mailbox?.label,
					to: input.to,
					subject: input.subject,
					text: input.text,
					html: input.html,
				});
				setOptimisticOutbound((prev) => [
					optimistic,
					...prev.filter((t) => t.id !== data.id),
				]);

				const sendAtMs = data.sendAt
					? new Date(data.sendAt).getTime()
					: Date.now() + (input.undoWindowSeconds ?? 0) * 1000;
				const delayMs = Math.max(sendAtMs - Date.now() + 2_000, 2_000);

				const existing = pendingRefreshTimers.current.get(data.id);
				if (existing !== undefined) window.clearTimeout(existing);

				const pendingId = data.id;
				const timer = window.setTimeout(() => {
					pendingRefreshTimers.current.delete(pendingId);
					void mutateSentMessages().then(() => {
						// Cron can lag; one more refresh shortly after.
						const retry = window.setTimeout(() => {
							pendingRefreshTimers.current.delete(`${pendingId}:retry`);
							void mutateSentMessages();
						}, 15_000);
						pendingRefreshTimers.current.set(`${pendingId}:retry`, retry);
					});
				}, delayMs);
				pendingRefreshTimers.current.set(pendingId, timer);
			}

			return data;
		},
		[mailboxes, mutateMessages, mutateSentMessages, removeOptimisticOutbound],
	);

	const saveDraft = useCallback(
		async (input: SaveComposeDraftInput) => {
			const body = {
				mailboxId: input.mailboxId,
				kind: input.kind,
				threadId: input.threadId,
				inReplyToMessageId: input.inReplyToMessageId,
				to: input.to,
				cc: input.cc,
				bcc: input.bcc,
				subject: input.subject,
				html: input.html,
				text: input.text,
				attachments: input.attachments,
			};
			if (input.id) {
				const res = await fetch(`/api/inbox/v1/drafts/${input.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				});
				if (!res.ok) throw new Error("Failed to update draft");
				const data = (await res.json()) as { id: string };
				void refreshDrafts(input.mailboxId);
				return data;
			}
			const res = await fetch("/api/inbox/v1/drafts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok) throw new Error("Failed to create draft");
			const data = (await res.json()) as { id: string };
			void refreshDrafts(input.mailboxId);
			return data;
		},
		[refreshDrafts],
	);

	const getDraft = useCallback(async (id: string) => {
		const res = await fetch(`/api/inbox/v1/drafts/${id}`);
		if (!res.ok) return null;
		return parseComposeDraft(await res.json());
	}, []);

	const deleteDraft = useCallback(
		async (id: string) => {
			const res = await fetch(`/api/inbox/v1/drafts/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete draft");
			void refreshDrafts();
		},
		[refreshDrafts],
	);

	const listComposeDrafts = useCallback(
		async (
			mailboxId: string,
			filters?: { threadId?: string; kind?: ComposeDraftKind },
		) => {
			const params = new URLSearchParams({ mailboxId });
			if (filters?.threadId) params.set("threadId", filters.threadId);
			if (filters?.kind) params.set("kind", filters.kind);
			const res = await fetch(`/api/inbox/v1/drafts?${params.toString()}`);
			if (!res.ok) return [];
			return parseComposeDraftsList(await res.json());
		},
		[],
	);

	const findDraft = useCallback(
		async (input: {
			mailboxId: string;
			threadId: string;
			kind: ComposeDraftKind;
		}) => {
			const drafts = await listComposeDrafts(input.mailboxId, {
				threadId: input.threadId,
				kind: input.kind,
			});
			return findComposeDraft(drafts, input);
		},
		[listComposeDrafts],
	);

	const refresh = useCallback(async () => {
		await Promise.all([
			mutateMailboxes(),
			mutateMessages(),
			mutateSentMessages(),
			mutateThreads(),
		]);
	}, [mutateMailboxes, mutateMessages, mutateSentMessages, mutateThreads]);

	const value = useMemo(
		() => ({
			mailboxes,
			threads,
			archivedThreads,
			trashThreads,
			isLoadingMailboxes,
			isLoadingThreads,
			mailboxesError,
			threadsError,
			retryMailboxes,
			retryThreads,
			getMailbox,
			addMailbox,
			updateMailboxDisplayName,
			refresh,
			markMessageRead,
			deleteMessage,
			markMessageSpam,
			toggleMessageStar,
			archiveThread,
			unarchiveThread,
			trashThread,
			restoreThread,
			toggleThreadImportant,
			toggleThreadPinned,
			batchThreads,
			sendReply,
			sendReplyAll,
			sendForward,
			sendMessage,
			removeOptimisticOutbound,
			saveDraft,
			getDraft,
			deleteDraft,
			listComposeDrafts,
			findDraft,
			refreshDrafts,
		}),
		[
			mailboxes,
			threads,
			archivedThreads,
			trashThreads,
			isLoadingMailboxes,
			isLoadingThreads,
			mailboxesError,
			threadsError,
			retryMailboxes,
			retryThreads,
			getMailbox,
			addMailbox,
			updateMailboxDisplayName,
			refresh,
			markMessageRead,
			deleteMessage,
			markMessageSpam,
			toggleMessageStar,
			archiveThread,
			unarchiveThread,
			trashThread,
			restoreThread,
			toggleThreadImportant,
			toggleThreadPinned,
			batchThreads,
			sendReply,
			sendReplyAll,
			sendForward,
			sendMessage,
			removeOptimisticOutbound,
			saveDraft,
			getDraft,
			deleteDraft,
			listComposeDrafts,
			findDraft,
			refreshDrafts,
		],
	);

	return (
		<AgentInboxContext.Provider value={value}>
			{children}
		</AgentInboxContext.Provider>
	);
};

export const useAgentInbox = () => {
	const ctx = useContext(AgentInboxContext);
	if (!ctx) {
		throw new Error("useAgentInbox must be used within AgentInboxProvider");
	}
	return ctx;
};
