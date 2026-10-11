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
	username?: string | null;
	/** Omit on update to keep the stored password. */
	password?: string | null;
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
			// Deleting a provider detaches it from domains.
			queryClient.invalidateQueries({ queryKey: queryKeys.domain.all }),
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
		mutationFn: async (id: string) => {
			const res = await axios.post<{
				ok: boolean;
				error: string | null;
				provider: SmtpProvider;
			}>(`${BASE}/${id}/test`, undefined, { withCredentials: true });
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
