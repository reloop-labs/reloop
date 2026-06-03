"use client";

import type { DomainListResponse } from "@fe/dashboard/types/api.types";
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
}

const AgentInboxContext = createContext<AgentInboxContextValue | null>(null);

export const AgentInboxProvider = ({ children }: { children: ReactNode }) => {
	const { mutate } = useSWRConfig();

	// Fetch mailboxes from actual endpoint
	const {
		data: mailboxesData,
		isLoading: isLoadingMailboxes,
		mutate: mutateMailboxes,
	} = useSWR<any[]>("/api/inbox/v1/mailboxes/list");

	// Fetch messages from actual endpoint
	const {
		data: messagesData,
		isLoading: isLoadingThreads,
		mutate: mutateMessages,
	} = useSWR<any[]>("/api/inbox/v1/messages");

	// Map backend mailboxes to UI structures
	const mailboxes = useMemo(() => {
		if (!mailboxesData) return [];
		return mailboxesData.map((mb) => ({
			id: mb.id,
			email: mb.email,
			label: mb.email.split("@")[0] || "Agent",
			description: `Quota: ${mb.quota || "5 GB"}`,
			status:
				mb.status === "active" ? ("active" as const) : ("disabled" as const),
			securityLevel: 5 as const,
			createdAt: mb.createdAt || new Date().toISOString(),
		}));
	}, [mailboxesData]);

	// Map backend messages to UI threads
	const threads = useMemo(() => {
		if (!messagesData) return [];
		return messagesData.map((msg) => ({
			id: msg.id,
			mailboxId: msg.mailboxId,
			from: { email: msg.fromEmail },
			subject: msg.subject || "(No Subject)",
			preview: msg.textBody
				? msg.textBody.substring(0, 120) +
					(msg.textBody.length > 120 ? "..." : "")
				: "",
			bodyText: msg.textBody || "",
			bodyHtml: msg.htmlBody || undefined,
			receivedAt: msg.createdAt,
			status: msg.isRead ? ("handled" as const) : ("new" as const),
			securityLevel: 5 as const,
			unread: !msg.isRead,
			attachments:
				msg.attachments?.map((att: any) => ({
					name: att.filename,
					size: `${(att.size / 1024).toFixed(1)} KB`,
				})) || [],
			timeline: [
				{ label: "Email received", at: msg.createdAt, state: "done" as const },
				{
					label: "Delivered to NATS",
					at: msg.createdAt,
					state: "done" as const,
				},
				{
					label: "Inbox storage complete",
					at: msg.createdAt,
					state: "done" as const,
				},
			],
		}));
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

			const data = await res.json();

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
