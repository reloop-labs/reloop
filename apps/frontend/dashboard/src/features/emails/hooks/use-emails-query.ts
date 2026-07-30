import { queryKeys } from "#/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export type EmailLogData = {
	id: string;
	subject: string;
	fromEmail: string;
	toEmails: string[];
	status: string;
	createdAt: string;
};

export type EmailListResponse = {
	object: "list";
	data: EmailLogData[];
	total: number;
	page: number;
	limit: number;
};

export type SentEmailsParams = {
	page: number;
	limit: number;
	search: string;
	domain: string;
	apiKeyId: string;
	status: string;
	startDate: string;
	endDate: string;
	enabled?: boolean;
};

export function useSentEmailsQuery(params: SentEmailsParams) {
	return useQuery({
		queryKey: queryKeys.emails.sent(params),
		queryFn: async () => {
			const search = new URLSearchParams();
			search.set("limit", String(params.limit));
			search.set("page", String(params.page));
			if (params.search) search.set("search", params.search);
			if (params.domain) search.set("domain", params.domain);
			if (params.apiKeyId) search.set("api_key_id", params.apiKeyId);
			if (params.status) search.set("status", params.status);
			if (params.startDate) search.set("start_date", params.startDate);
			if (params.endDate) search.set("end_date", params.endDate);
			const res = await fetch(`/api/logs/v1/emails?${search.toString()}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to load emails (${res.status})`);
			return res.json() as Promise<EmailListResponse>;
		},
		enabled: params.enabled !== false,
		placeholderData: (prev) => prev,
	});
}

export type ReceivedEmailData = {
	id: string;
	mailboxId: string;
	fromEmail: string;
	fromName: string | null;
	toEmails: string[];
	subject: string | null;
	snippet: string | null;
	status: string;
	createdAt: string | Date;
	threadId: string | null;
};

export function useReceivedEmailsQuery(enabled = true) {
	return useQuery({
		queryKey: queryKeys.emails.received(),
		queryFn: async () => {
			const res = await fetch("/api/inbox/v1/messages", {
				credentials: "include",
			});
			if (!res.ok)
				throw new Error(`Failed to load received emails (${res.status})`);
			return res.json() as Promise<ReceivedEmailData[]>;
		},
		enabled,
	});
}

export type BackendMailbox = {
	id: string;
	email: string;
	displayName: string | null;
};

export function useMailboxesQuery(enabled = true) {
	return useQuery({
		queryKey: queryKeys.emails.mailboxes(),
		queryFn: async () => {
			const res = await fetch("/api/inbox/v1/mailboxes/list", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to load mailboxes");
			return res.json() as Promise<BackendMailbox[]>;
		},
		enabled,
	});
}

export type EmailDetailData = {
	id: string;
	messageId: string;
	organizationId: string;
	domainId: string;
	fromEmail: string;
	fromName: string | null;
	toEmails: string[];
	ccEmails: string[] | null;
	bccEmails: string[] | null;
	replyTo: string | null;
	subject: string;
	textBody: string | null;
	htmlBody: string | null;
	rawMessage?: string | null;
	status: string;
	errorMessage: string | null;
	provider: string;
	size: number;
	headers: Record<string, string> | null;
	sentAt: string | null;
	deliveredAt: string | null;
	failedAt: string | null;
	createdAt: string;
	updatedAt: string;
	events?: {
		id: string;
		type: string;
		metadata: Record<string, unknown> | null;
		createdAt: string;
	}[];
};

export function useEmailDetailQuery(emailId: string | null | undefined) {
	return useQuery({
		queryKey: queryKeys.emails.detail(emailId ?? ""),
		queryFn: async () => {
			const res = await fetch(`/api/logs/v1/emails/${emailId}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to load email (${res.status})`);
			return res.json() as Promise<EmailDetailData>;
		},
		enabled: !!emailId,
	});
}
