"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { useResendEmail } from "#/features/emails/hooks/use-resend-email";
import { useEmailDetailQuery } from "#/features/emails/hooks/use-emails-query";

import { EmailDetail } from "./email-detail";
import { EmailNotFound } from "./email-not-found";

export function EmailDetailPage({ emailId }: { emailId: string }) {
	const router = useRouter();
	const { data, error, isPending, isFetching } = useEmailDetailQuery(emailId);
	const resendEmailMutation = useResendEmail();
	const isResending = resendEmailMutation.isPending;

	const isLoading = isPending || (isFetching && !data);

	const isFailed = useMemo(() => {
		if (!data) return false;
		const s = data.status?.toLowerCase();
		return (
			s === "failed" ||
			s === "bounced" ||
			s === "spam" ||
			!!data.errorMessage ||
			!!data.failedAt
		);
	}, [data]);

	const handleResend = useCallback(async () => {
		if (!data || isResending) return;
		try {
			await resendEmailMutation.mutateAsync({
				emailId: data.id,
				recipient: data.toEmails?.join(", "),
			});
		} catch {
			// Error toasted by useResendEmail
		}
	}, [data, isResending, resendEmailMutation]);

	if (error && !data) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center sm:px-8">
				<EmailNotFound />
			</div>
		);
	}

	if (!data && !isLoading) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center sm:px-8">
				<EmailNotFound />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-10 pb-8">
				<AnimatedBackButton onClick={() => router.push("/")} />
				{isFailed && (
					<Button.Root
						size="small"
						variant="neutral"
						mode="stroke"
						disabled={isResending}
						onClick={handleResend}
						className="h-8 gap-1.5 rounded-lg px-3 font-medium text-xs shadow-xs"
					>
						<Icon
							name={isResending ? "loader-2" : "send-2"}
							className={cn("h-3.5 w-3.5", isResending && "animate-spin")}
						/>
						<span>{isResending ? "Resending…" : "Resend email"}</span>
					</Button.Root>
				)}
			</div>
			<EmailDetail
				email={data}
				isLoading={isLoading}
				onResend={isFailed ? handleResend : undefined}
				isResending={isResending}
			/>
		</div>
	);
}
