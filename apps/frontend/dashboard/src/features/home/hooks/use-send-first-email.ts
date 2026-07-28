import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

export type SendFirstEmailInput = {
	domainId: string;
	localPart?: string;
	fromName?: string;
};

export type SendFirstEmailResult = {
	object?: string;
	event?: string;
	to: string;
	from: string;
	domainId: string;
	domain: string;
	id?: string;
	message?: string;
	why?: string;
	fix?: string;
};

export async function sendFirstEmail(
	input: SendFirstEmailInput,
): Promise<SendFirstEmailResult> {
	const res = await fetch("/api/email/v1/onboarding/send-test-email", {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			domainId: input.domainId,
			...(input.localPart ? { localPart: input.localPart } : {}),
			...(input.fromName?.trim()
				? { fromName: input.fromName.trim() }
				: {}),
		}),
	});

	const payload = (await res.json().catch(() => ({}))) as SendFirstEmailResult & {
		message?: string;
		why?: string;
		fix?: string;
	};

	if (!res.ok) {
		const err = new Error(
			payload.message || payload.why || `Failed to send email (${res.status})`,
		) as Error & { why?: string; fix?: string; status?: number };
		err.why = payload.why;
		err.fix = payload.fix;
		err.status = res.status;
		throw err;
	}

	return payload;
}

export function useSendFirstEmail() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: sendFirstEmail,
		onSuccess: () => {
			// Refresh recent emails + metrics so Overview reflects the send.
			void queryClient.invalidateQueries({ queryKey: queryKeys.emails.all });
			void queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all });
		},
	});
}
