"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import useSWR from "swr";
import type { AgentMailbox, InboundThread } from "../types";

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
	createdAt: string | Date;
	updatedAt: string | Date;
}

interface AgentInboxContextValue {
	mailboxes: AgentMailbox[];
	threads: InboundThread[];
	archivedThreads: InboundThread[];
	isLoadingMailboxes: boolean;
	isLoadingThreads: boolean;
	getMailbox: (id: string) => AgentMailbox | undefined;
	addMailbox: (input: NewAgentAddressInput) => Promise<AgentMailbox>;
	refresh: () => Promise<void>;
	markMessageRead: (id: string, isRead: boolean) => Promise<void>;
	deleteMessage: (id: string) => Promise<void>;
	markMessageSpam: (id: string, isSpam: boolean) => Promise<void>;
	toggleMessageStar: (id: string, isStarred: boolean) => Promise<void>;
	archiveThread: (threadId: string) => Promise<void>;
	sendReply: (id: string, text: string, html?: string) => Promise<void>;
	sendForward: (
		id: string,
		to: string | string[],
		options?: {
			text?: string;
			html?: string;
			cc?: string | string[];
			bcc?: string | string[];
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
	}) => Promise<void>;
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
		from: { name: msg.fromName || undefined, email: msg.fromEmail },
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
		isArchived: thread.status === "archived",
		direction: "inbound",
		timeline: [],
	};
};

export const AgentInboxProvider = ({ children }: { children: ReactNode }) => {
	const {
		data: mailboxesData,
		isLoading: isLoadingMailboxes,
		mutate: mutateMailboxes,
	} = useSWR<BackendMailbox[]>("/api/inbox/v1/mailboxes/list");

	const {
		data: messagesData,
		isLoading: isLoadingInboundThreads,
		mutate: mutateMessages,
	} = useSWR<BackendMessage[]>("/api/inbox/v1/messages");

	const {
		data: sentMessagesData,
		isLoading: isLoadingSentMessages,
		mutate: mutateSentMessages,
	} = useSWR<BackendSentMessage[]>("/api/inbox/v1/messages/sent");

	const { data: allThreadsData, mutate: mutateThreads } = useSWR<
		BackendThread[]
	>("/api/inbox/v1/threads?limit=100");

	const isLoadingThreads = isLoadingInboundThreads || isLoadingSentMessages;

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
		const archivedThreadIds = new Set(
			(allThreadsData || [])
				.filter((t) => t.status === "archived")
				.map((t) => t.id),
		);

		const threadMeta = new Map(
			(allThreadsData || []).map((t) => [t.id, t]),
		);

		const mappedInbound = messagesData
			? messagesData
					.filter((msg) => !archivedThreadIds.has(msg.threadId || ""))
					.map((msg) => {
						const base = mapMessageToThread(msg);
						if (msg.threadId && threadMeta.has(msg.threadId)) {
							const meta = threadMeta.get(msg.threadId)!;
							return {
								...base,
								isStarred: base.isStarred || meta.isStarred,
								unread: base.unread || !meta.isRead,
							};
						}
						return base;
					})
			: [];

		const parseEmail = (emailStr: string) => {
			const match = emailStr.match(/<([^>]+)>/);
			return (match?.[1] ?? emailStr).trim().toLowerCase();
		};

		const mappedSent = sentMessagesData
			? sentMessagesData.map((msg) => {
					const receivedAtDate = msg.createdAt;
					const receivedAt =
						typeof receivedAtDate === "string"
							? receivedAtDate
							: receivedAtDate.toISOString();

					const fromEmailParsed = parseEmail(msg.fromEmail);
					const mailbox = mailboxes.find(
						(mb) => parseEmail(mb.email) === fromEmailParsed,
					);

					return {
						id: msg.id,
						mailboxId: mailbox?.id ?? "",
						threadId: undefined,
						messageId: msg.id,
						from: { name: msg.fromName || undefined, email: msg.fromEmail },
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
						isStarred: false,
						isArchived: false,
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

		return [...mappedInbound, ...mappedSent].sort(
			(a, b) =>
				new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
		);
	}, [messagesData, sentMessagesData, mailboxes, allThreadsData]);

	const archivedThreads = useMemo(() => {
		if (!allThreadsData) return [];
		return allThreadsData
			.filter((t) => t.status === "archived")
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
				}),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to create mailbox");
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

	const markMessageRead = useCallback(
		async (id: string, isRead: boolean) => {
			const res = await fetch(`/api/inbox/v1/messages/${id}/read`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isRead }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(
					body || `Failed to mark message as ${isRead ? "read" : "unread"}`,
				);
			}

			await mutateMessages();
		},
		[mutateMessages],
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
			await mutateMessages(
				(current) => {
					if (!current) return current;
					return current.map((msg) =>
						msg.id === id
							? { ...msg, isSpam, status: isSpam ? "spam" : "received" }
							: msg,
					);
				},
				{ revalidate: true },
			);
		},
		[mutateMessages],
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

			await Promise.all([mutateMessages(), mutateThreads()]);
		},
		[mutateMessages, mutateThreads],
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

	const sendReply = useCallback(
		async (id: string, text: string, html?: string) => {
			const res = await fetch(`/api/inbox/v1/messages/${id}/reply`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text, html }),
			});

			if (!res.ok) {
				const body = await res.text();
				throw new Error(body || "Failed to send reply");
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

			await Promise.all([mutateMessages(), mutateSentMessages()]);
		},
		[mutateMessages, mutateSentMessages],
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
			isLoadingMailboxes,
			isLoadingThreads,
			getMailbox,
			addMailbox,
			refresh,
			markMessageRead,
			deleteMessage,
			markMessageSpam,
			toggleMessageStar,
			archiveThread,
			sendReply,
			sendForward,
			sendMessage,
		}),
		[
			mailboxes,
			threads,
			archivedThreads,
			isLoadingMailboxes,
			isLoadingThreads,
			getMailbox,
			addMailbox,
			refresh,
			markMessageRead,
			deleteMessage,
			markMessageSpam,
			toggleMessageStar,
			archiveThread,
			sendReply,
			sendForward,
			sendMessage,
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
