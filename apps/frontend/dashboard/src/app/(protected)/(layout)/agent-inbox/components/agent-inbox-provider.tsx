"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import useSWR, { useSWRConfig } from "swr";
import type { AgentMailbox, InboundThread } from "../mock-data";

export type NewAgentAddressInput = {
	label: string;
	localPart: string;
	domain: string;
	domainId: string;
	description: string;
	securityLevel: AgentMailbox["securityLevel"];
};

interface BackendMailbox {
	id: string;
	email: string;
	quota: string;
	status: string;
	displayName: string | null;
	description: string | null;
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

interface AgentInboxContextValue {
	mailboxes: AgentMailbox[];
	threads: InboundThread[];
	isLoadingMailboxes: boolean;
	isLoadingThreads: boolean;
	getMailbox: (id: string) => AgentMailbox | undefined;
	addMailbox: (input: NewAgentAddressInput) => Promise<AgentMailbox>;
	refresh: () => Promise<void>;
	markMessageRead: (id: string, isRead: boolean) => Promise<void>;
	deleteMessage: (id: string) => Promise<void>;
	markMessageSpam: (id: string, isSpam: boolean) => Promise<void>;
}

const AgentInboxContext = createContext<AgentInboxContextValue | null>(null);

export const AgentInboxProvider = ({ children }: { children: ReactNode }) => {
	const { mutate } = useSWRConfig();

	// Fetch mailboxes from actual endpoint
	const {
		data: mailboxesData,
		isLoading: isLoadingMailboxes,
		mutate: mutateMailboxes,
	} = useSWR<BackendMailbox[]>("/api/inbox/v1/mailboxes/list");

	// Fetch messages from actual endpoint
	const {
		data: messagesData,
		isLoading: isLoadingThreads,
		mutate: mutateMessages,
	} = useSWR<BackendMessage[]>("/api/inbox/v1/messages");

	// Map backend mailboxes to UI structures
	const mailboxes = useMemo(() => {
		if (!mailboxesData) return [];
		return mailboxesData.map((mb) => ({
			id: mb.id,
			email: mb.email,
			label: mb.displayName || mb.email.split("@")[0] || "Agent",
			description: mb.description || "",
			status:
				mb.status === "active" ? ("active" as const) : ("disabled" as const),
			securityLevel: 5 as const,
			createdAt:
				typeof mb.createdAt === "string"
					? mb.createdAt
					: mb.createdAt.toISOString(),
		}));
	}, [mailboxesData]);

	// Map backend messages to UI threads
	const threads = useMemo(() => {
		if (!messagesData) return [];
		return messagesData.map((msg) => {
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
						: msg.isRead
							? ("handled" as const)
							: ("new" as const),
				securityLevel: 5 as const,
				unread: !msg.isRead,
				cc: msg.ccEmails || undefined,
				replyTo: msg.replyTo || undefined,
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
		});
	}, [messagesData]);

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
				description: input.description,
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

			await mutateMessages();
		},
		[mutateMessages],
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
				{ revalidate: false },
			);
		},
		[mutateMessages],
	);

	const refresh = useCallback(async () => {
		await Promise.all([mutateMailboxes(), mutateMessages()]);
	}, [mutateMailboxes, mutateMessages]);

	const value = useMemo(
		() => ({
			mailboxes,
			threads,
			isLoadingMailboxes,
			isLoadingThreads,
			getMailbox,
			addMailbox,
			refresh,
			markMessageRead,
			deleteMessage,
			markMessageSpam,
		}),
		[
			mailboxes,
			threads,
			isLoadingMailboxes,
			isLoadingThreads,
			getMailbox,
			addMailbox,
			refresh,
			markMessageRead,
			deleteMessage,
			markMessageSpam,
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
