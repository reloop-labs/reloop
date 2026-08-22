import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";

export interface ResendEmailResult {
	success: boolean;
	messageId: string;
	status: string;
	timestamp: string;
	id: string;
	message?: string;
	why?: string;
	fix?: string;
}

export interface ResendEmailVariables {
	emailId: string;
	recipient?: string;
}

async function resendEmail({
	emailId,
}: ResendEmailVariables): Promise<ResendEmailResult> {
	const res = await fetch(`/api/mail/v1/resend/${emailId}`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	const payload = (await res.json().catch(() => ({}))) as ResendEmailResult;

	if (!res.ok) {
		const err = new Error(
			payload.message ||
				payload.why ||
				`Failed to resend email (${res.status})`,
		) as Error & { why?: string; fix?: string };
		err.why = payload.why;
		err.fix = payload.fix;
		throw err;
	}

	return payload;
}

export function useResendEmail() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resendEmail,
		onSuccess: (_result, variables) => {
			toast.success("Email resend initiated", {
				description: variables.recipient
					? `Resending to ${variables.recipient}`
					: "The email has been queued for delivery.",
			});
			void queryClient.invalidateQueries({ queryKey: queryKeys.emails.all });
			void queryClient.invalidateQueries({
				queryKey: queryKeys.emails.detail(variables.emailId),
			});
			void queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all });
		},
		onError: (err: Error & { why?: string; fix?: string }) => {
			toast.error(err.message || "Failed to resend email", {
				description: err.fix || err.why,
			});
		},
	});
}
