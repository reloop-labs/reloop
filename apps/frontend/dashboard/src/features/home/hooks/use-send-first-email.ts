import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";

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

export async function sendFirstEmail(): Promise<SendFirstEmailResult> {
	const res = await fetch("/api/email/v1/onboarding/send-test-email", {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({}),
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

/**
 * One-click send: uses the onboarding-test template, from the first active
 * domain, to the signed-in user. Server picks all fields.
 */
export function useSendFirstEmail() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: sendFirstEmail,
		onSuccess: (result) => {
			toast.success("Test email sent", {
				description: `Sent to ${result.to} from ${result.from}`,
			});
			void queryClient.invalidateQueries({ queryKey: queryKeys.emails.all });
			void queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all });
		},
		onError: (err: Error & { why?: string; fix?: string }) => {
			toast.error(err.message || "Failed to send test email", {
				description: err.fix || err.why,
			});
		},
	});
}
