import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";

type SendFromOwnDomainInput = {
	from: string;
	to: string;
};

type SendFromOwnDomainResult = {
	success?: boolean;
	id?: string;
	messageId?: string;
	message?: string;
	why?: string;
	fix?: string;
};

async function sendFromOwnDomain(
	input: SendFromOwnDomainInput,
): Promise<SendFromOwnDomainResult> {
	const res = await fetch("/api/mail/v1/send", {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			from: input.from,
			to: input.to,
			subject: "Hello World!",
			text: "Congrats on sending your first email from your domain!",
			html: "<p>Congrats on sending your first email from your domain!</p>",
		}),
	});

	const payload = (await res
		.json()
		.catch(() => ({}))) as SendFromOwnDomainResult;

	if (!res.ok) {
		const err = new Error(
			payload.message || payload.why || `Failed to send email (${res.status})`,
		) as Error & { why?: string; fix?: string };
		err.why = payload.why;
		err.fix = payload.fix;
		throw err;
	}

	return payload;
}

export function useSendFromOwnDomain() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: sendFromOwnDomain,
		onSuccess: (_result, variables) => {
			toast.success("Test email sent", {
				description: `Sent to ${variables.to} from ${variables.from}`,
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
