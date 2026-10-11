import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "#/lib/query-keys";

export type SmtpSecurity = "starttls" | "none";

export type SmtpProvider = {
	object: "smtp_provider";
	id: string;
	name: string;
	host: string;
	port: number;
	security: SmtpSecurity;
	username: string | null;
	hasPassword: boolean;
	/** Sending domains relayed through this provider. */
	domains: { id: string; domain: string }[];
	status: "unverified" | "ok" | "failing";
	lastTestedAt: string | null;
	lastError: string | null;
	createdAt: string;
	updatedAt: string;
};

export type SmtpProviderList = {
	object: "list";
	/** Plan cap; null = unlimited (self-hosted). */
	limit: number | null;
	items: SmtpProvider[];
};

export type SmtpProviderInput = {
	/** Sending domain; created in Reloop automatically. Required on create. */
	domain?: string;
	/** Defaults to the domain on create. */
	name?: string;
	host: string;
	port: number;
	security: SmtpSecurity;
	/** Required on create. */
	username?: string;
	/** Omit on update to keep the stored password. */
	password?: string;
};

const BASE = "/api/domain/v1/smtp-providers";

export function apiErrorMessage(error: unknown, fallback: string): string {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as
			| { message?: string; why?: string }
			| undefined;
		return data?.why || data?.message || fallback;
	}
	return fallback;
}

export function useSmtpProviders(enabled = true) {
	return useQuery({
		queryKey: queryKeys.smtpProviders.list(),
		queryFn: async () => {
			const res = await axios.get<SmtpProviderList>(BASE, {
				withCredentials: true,
			});
			return res.data;
		},
		enabled,
		refetchOnWindowFocus: false,
	});
}

function useInvalidate() {
	const queryClient = useQueryClient();
	return () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: queryKeys.smtpProviders.all }),
			// Adding/deleting a provider creates or removes domains.
			queryClient.invalidateQueries({ queryKey: queryKeys.domain.all }),
			// Agent-inbox domain pickers cache the list under their own key.
			queryClient.invalidateQueries({
				predicate: (q) =>
					q.queryKey[0] === "agent-inbox" &&
					String(q.queryKey[1] ?? "").startsWith("/api/domain/v1/list"),
			}),
		]);
}

export function useSaveSmtpProvider() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: async ({
			id,
			input,
		}: {
			id?: string;
			input: SmtpProviderInput;
		}) => {
			const res = id
				? await axios.patch<SmtpProvider>(`${BASE}/${id}`, input, {
						withCredentials: true,
					})
				: await axios.post<SmtpProvider>(BASE, input, {
						withCredentials: true,
					});
			return res.data;
		},
		onSuccess: () => invalidate(),
	});
}

export function useTestSmtpProvider() {
	const invalidate = useInvalidate();
	return useMutation({
		/** Pass `to` to deliver a real test email instead of only logging in. */
		mutationFn: async (
			arg: string | { id: string; to?: string; from?: string },
		) => {
			const { id, to, from } =
				typeof arg === "string"
					? { id: arg, to: undefined, from: undefined }
					: arg;
			const res = await axios.post<{
				ok: boolean;
				error: string | null;
				provider: SmtpProvider;
			}>(`${BASE}/${id}/test`, to ? { to, from } : undefined, {
				withCredentials: true,
			});
			return res.data;
		},
		onSuccess: () => invalidate(),
	});
}

export function useDeleteSmtpProvider() {
	const invalidate = useInvalidate();
	return useMutation({
		mutationFn: async (id: string) => {
			await axios.delete(`${BASE}/${id}`, { withCredentials: true });
		},
		onSuccess: () => invalidate(),
	});
}

/** Turn a raw SMTP error into a hint the user can act on. */
export function explainSmtpError(error: string): string | null {
	const e = error.toLowerCase();
	if (/\b535\b|auth|credentials|username and password/.test(e)) {
		return "The server rejected the username or password.";
	}
	if (/\b55[0-4]\b|sender|from address|not owned|unverified|relay/.test(e)) {
		return "The server refused this From address. Verify the sender or domain with your provider.";
	}
	if (/econnrefused|etimedout|timeout|ehostunreach|enotfound/.test(e)) {
		return "Couldn't reach the server. Check the host and port.";
	}
	if (/starttls|tls|certificate|ssl/.test(e)) {
		return "TLS failed. Use port 587 (or 2525) with STARTTLS.";
	}
	return null;
}
