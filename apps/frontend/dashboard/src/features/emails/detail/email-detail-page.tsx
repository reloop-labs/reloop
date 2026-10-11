"use client";

import { Skeleton } from "@reloop/ui/skeleton";
import { useCallback, useMemo } from "react";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { useEmailsLive } from "#/features/emails/hooks/use-emails-live";
import { useEmailDetailQuery } from "#/features/emails/hooks/use-emails-query";
import { useResendEmail } from "#/features/emails/hooks/use-resend-email";
import { useCreateTemplate } from "#/features/templates/hooks/use-templates-query";

import { AnimatedActionButton } from "./animated-action-button";
import { EmailDetail } from "./email-detail";
import { EmailNotFound } from "./email-not-found";
import { EmailStatusBadge } from "./email-status-badge";

export function EmailDetailPage({ emailId }: { emailId: string }) {
	const { data, error, isPending, isFetching } = useEmailDetailQuery(emailId);
	useEmailsLive({ received: false });
	const resendEmailMutation = useResendEmail();
	const isResending = resendEmailMutation.isPending;
	const { isCreating: isSavingTemplate, create: createTemplate } =
		useCreateTemplate();

	const isLoading = isPending || (isFetching && !data);

	const isFailed = useMemo(() => {
		if (!data) return false;
		const s = data.status?.toLowerCase();
		if (s === "bounced") return false;
		return (
			s === "failed" ||
			(s !== "sent" &&
				s !== "delivered" &&
				s !== "pending" &&
				(!!data.errorMessage || !!data.failedAt))
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

	const handleSaveAsTemplate = useCallback(() => {
		if (!data) return;
		const html =
			data.htmlBody || (data.textBody ? textToHtml(data.textBody) : "");
		const subject = data.subject?.trim();
		void createTemplate({
			name: (subject || "Untitled").slice(0, 255),
			subject: subject?.slice(0, 500),
			content: html ? [{ html }] : [],
		});
	}, [data, createTemplate]);

	const primaryRecipient = data?.toEmails?.[0] ?? "";
	const extraRecipients = Math.max((data?.toEmails?.length ?? 0) - 1, 0);

	if (error && !data) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-6xl flex-col items-center justify-center p-6 lg:p-8">
				<EmailNotFound />
			</div>
		);
	}

	if (!data && !isLoading) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-6xl flex-col items-center justify-center p-6 lg:p-8">
				<EmailNotFound />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl p-6 lg:p-8">
			<div className="pb-8">
				<AnimatedBackButton fallbackHref="/" />
			</div>
			{/* Avatar + recipient + status + actions row (mirrors contact header) */}
			<div className="mb-8 flex h-10 items-center gap-4">
				{isLoading ? (
					<Skeleton className="size-10 shrink-0 rounded-full" />
				) : (
					<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-base text-white uppercase tracking-wide shadow-sm">
						{(primaryRecipient.charAt(0) || "?").toUpperCase()}
					</div>
				)}

				<div className="min-w-0 flex-1">
					{isLoading ? (
						<div className="flex items-center gap-2.5">
							<Skeleton className="h-7 w-64 rounded-lg" />
							<Skeleton className="h-6 w-20 rounded-md" />
						</div>
					) : (
						<div className="flex min-w-0 items-center gap-2.5">
							<h1 className="min-w-0 truncate pb-0.5 font-medium text-[22px] text-text-strong-950 leading-none tracking-tight">
								{primaryRecipient}
								{extraRecipients > 0 && (
									<span className="ml-1.5 font-normal text-text-sub-600">
										+{extraRecipients}
									</span>
								)}
							</h1>
							{data?.status && <EmailStatusBadge status={data.status} />}
						</div>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{isLoading ? (
						<Skeleton className="h-9 w-40 rounded-xl" />
					) : (
						<>
							{isFailed && (
								<AnimatedActionButton
									icon="send-2"
									label="Resend email"
									loadingLabel="Resending…"
									isLoading={isResending}
									onClick={handleResend}
								/>
							)}
							<AnimatedActionButton
								icon="layout"
								label="Save as template"
								loadingLabel="Creating template…"
								isLoading={isSavingTemplate}
								onClick={handleSaveAsTemplate}
							/>
						</>
					)}
				</div>
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

/** Plain-text-only emails: escape and keep line breaks so the editor gets paragraphs. */
function textToHtml(text: string): string {
	const escapeHtml = (v: string) =>
		v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	return text
		.split(/\n{2,}/)
		.map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
		.join("");
}
