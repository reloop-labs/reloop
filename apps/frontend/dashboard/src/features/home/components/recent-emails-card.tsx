import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Link from "next/link";
import { useSentEmailsQuery } from "#/features/emails/hooks/use-emails-query";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { HomeCardBody, HomeCardHeader, HomeCardShell } from "./home-card-shell";
import { SendFirstEmailButton } from "./send-first-email-button";

const getEmailIcon = (status: string) => {
	switch (status?.toLowerCase()) {
		case "sent":
			return "send";
		case "delivered":
			return "check-circle";
		case "opened":
			return "eye-outline";
		case "clicked":
			return "cursor-click";
		case "bounced":
		case "failed":
			return "cross-circle";
		case "spam":
		case "complained":
			return "alert-triangle";
		default:
			return "mail-send";
	}
};

const getEmailIconColorClass = (status: string) => {
	switch (status?.toLowerCase()) {
		case "sent":
			return "text-information-base";
		case "delivered":
			return "text-success-base";
		case "opened":
		case "clicked":
			return "text-text-sub-600";
		case "bounced":
		case "failed":
		case "spam":
		case "complained":
			return "text-error-base";
		default:
			return "text-text-sub-600";
	}
};

export function RecentEmailsCard({
	enabled,
	canSendFirstEmail,
	readyDomainName,
}: {
	enabled: boolean;
	/** Show one-click send when empty and a domain is ready. */
	canSendFirstEmail?: boolean;
	readyDomainName?: string | null;
}) {
	const { data, isPending } = useSentEmailsQuery({
		page: 1,
		limit: 8,
		search: "",
		domain: "",
		apiKeyId: "",
		status: "",
		startDate: "",
		endDate: "",
		enabled,
	});

	const emails = data?.data ?? [];
	const hasEmails = emails.length > 0;

	return (
		<HomeCardShell
			className="h-full"
			header={
				<HomeCardHeader>
					<div className="flex items-center gap-2">
						<Icon name="mail-single" className="h-4 w-4 text-text-sub-600" />
						<h2 className="font-medium text-label-md text-text-strong-950">
							Recent emails
						</h2>
					</div>
					<Link
						href="/emails"
						className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
					>
						View all
						<Icon name="arrow-right" className="h-3.5 w-3.5" />
					</Link>
				</HomeCardHeader>
			}
		>
			<HomeCardBody className="min-h-[280px]">
				{isPending ? (
					<div className="space-y-0 px-5 py-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between border-stroke-soft-100 border-b py-3 last:border-b-0 dark:border-stroke-soft-100/40"
							>
								<div className="flex items-center gap-3">
									<Skeleton className="h-4 w-4 rounded-full" />
									<Skeleton className="h-4 w-36" />
								</div>
								<Skeleton className="h-3 w-12" />
							</div>
						))}
					</div>
				) : hasEmails ? (
					<ul className="px-5">
						{emails.slice(0, 8).map((email) => (
							<li key={email.id}>
								<Link
									href={`/emails/${email.id}`}
									className="group flex items-center justify-between gap-3 border-stroke-soft-100 border-b py-3 transition-colors last:border-b-0 hover:bg-bg-weak-50/40 dark:border-stroke-soft-100/40 dark:hover:bg-white/[0.02]"
								>
									<div className="flex min-w-0 items-center gap-3">
										<span title={email.status} className="shrink-0">
											<Icon
												name={getEmailIcon(email.status)}
												className={cn(
													"h-4 w-4",
													getEmailIconColorClass(email.status),
												)}
											/>
										</span>
										<div className="min-w-0">
											<p className="truncate font-medium text-paragraph-sm text-text-strong-950 group-hover:underline">
												{email.toEmails?.[0] ||
													email.fromEmail ||
													"(No recipient)"}
											</p>
											{email.subject ? (
												<p className="truncate text-paragraph-xs text-text-soft-400">
													{email.subject}
												</p>
											) : null}
										</div>
									</div>
									<span className="shrink-0 text-paragraph-xs text-text-soft-400 tabular-nums">
										{formatRelativeTime(email.createdAt)}
									</span>
								</Link>
							</li>
						))}
					</ul>
				) : (
					<div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 py-8 text-center">
						<Icon name="mail-send" className="h-6 w-6 text-text-soft-400" />
						<h3 className="mt-4 font-semibold text-label-md text-text-strong-950">
							No emails sent yet
						</h3>
						<p className="mt-1.5 max-w-[260px] text-paragraph-sm text-text-sub-600">
							{readyDomainName
								? `${readyDomainName} is ready — one click sends a test email from hello@${readyDomainName}.`
								: "One click sends a test email to you from your verified domain."}
						</p>
						{canSendFirstEmail ? (
							<div className="mt-5">
								<SendFirstEmailButton variant="stroke" />
							</div>
						) : (
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="small"
								asChild
								className="mt-5 rounded-xl"
							>
								<Link href="/domain">Add a domain</Link>
							</Button.Root>
						)}
					</div>
				)}
			</HomeCardBody>
		</HomeCardShell>
	);
}
