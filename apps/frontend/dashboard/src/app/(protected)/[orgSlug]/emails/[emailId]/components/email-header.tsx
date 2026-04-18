"use client";

import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface EmailHeaderProps {
	email?: {
		id: string;
		subject: string;
		status: string;
		createdAt: string;
	};
	isLoading: boolean;
}

const getStatusColor = (status: string) => {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "text-success-base";
		case "failed":
		case "bounced":
		case "spam":
			return "text-error-base";
		case "pending":
			return "text-warning-base";
		default:
			return "text-text-sub-600";
	}
};

const getStatusIcon = (status: string) => {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "check-circle";
		case "failed":
		case "bounced":
		case "spam":
			return "cross-circle";
		case "pending":
			return "clock";
		default:
			return "minus";
	}
};

export const EmailHeader = ({ email, isLoading }: EmailHeaderProps) => {
	const { orgSlug } = useParams();
	const router = useRouter();
	const [copiedId, setCopiedId] = useState(false);

	const handleCopy = useCallback(
		async (value: string, setCopied: (v: boolean) => void, label: string) => {
			try {
				await navigator.clipboard.writeText(value);
				setCopied(true);
				toast.success(`${label} copied`);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				toast.error("Failed to copy");
			}
		},
		[],
	);

	if (!email && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => router.push(`/${orgSlug}/emails`)} />
				<div className="flex items-center justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Email
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div className="flex items-center gap-1 text-error-base">
								<Icon name="alert-circle" className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-xs">Not found</p>
							</div>
						</div>
						<h1 className="font-medium text-text-strong-950 text-title-h6 leading-8">
							Email not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-10 pb-8">
			<AnimatedBackButton onClick={() => router.push(`/${orgSlug}/emails`)} />
			<div className="flex items-center justify-between pt-6">
				<div className="flex flex-col gap-1">
					{isLoading ? (
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-4 w-10 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-20 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<div className="flex items-center gap-1">
								<Skeleton className="h-3.5 w-3.5 rounded-full" />
								<Skeleton className="h-4 w-12 rounded-full" />
							</div>
						</div>
					) : (
						<div className="flex items-center gap-1.5 font-medium text-paragraph-xs text-text-sub-600">
							<span>Email</span>
							<span className="font-semibold">•</span>
							<span>
								{email?.createdAt ? formatRelativeTime(email.createdAt) : "---"}
							</span>
							<span className="font-semibold">•</span>
							<div
								className={cn(
									"flex items-center gap-1",
									getStatusColor(email?.status || ""),
								)}
							>
								<Icon
									name={getStatusIcon(email?.status || "") as any}
									className="h-3.5 w-3.5"
								/>
								<span className="capitalize">{email?.status || "---"}</span>
							</div>
						</div>
					)}
					{isLoading ? (
						<Skeleton className="mt-1 h-8 w-64" />
					) : (
						<div className="flex items-center gap-2">
							<Icon name="mail" className="h-5 w-5 text-text-sub-600" />
							<h1 className="font-medium text-text-strong-950 text-title-h6 leading-8">
								{email?.subject || "No Subject"}
							</h1>
						</div>
					)}
				</div>
			</div>

			{/* Stats Grid */}
			<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
				{/* Timestamp */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5 text-text-sub-600">
						<Icon name="clock" className="h-3.5 w-3.5" />
						<span className="font-medium text-[10px] uppercase tracking-wider">
							Sent At
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-32 rounded-lg" />
					) : (
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{email?.createdAt
								? new Date(email.createdAt).toLocaleString()
								: "---"}
						</span>
					)}
				</div>

				{/* ID */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5 text-text-sub-600">
						<Icon name="fingerprint" className="h-3.5 w-3.5" />
						<span className="font-medium text-[10px] uppercase tracking-wider">
							Email ID
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-6 w-28 rounded-lg" />
					) : (
						<button
							className="group/copy flex w-fit cursor-pointer items-center gap-1.5"
							type="button"
							onClick={() =>
								email?.id && handleCopy(email.id, setCopiedId, "Email ID")
							}
						>
							<code className="max-w-[120px] truncate rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
								{email?.id}
							</code>
							<Icon
								name={copiedId ? "check" : "copy"}
								className={cn(
									"h-3 w-3 flex-shrink-0 transition-all",
									copiedId
										? "text-success-base"
										: "text-text-sub-600 opacity-0 group-hover/copy:opacity-100",
								)}
							/>
						</button>
					)}
				</div>

				{/* Status */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5 text-text-sub-600">
						<Icon name="check-circle" className="h-3.5 w-3.5" />
						<span className="font-medium text-[10px] uppercase tracking-wider">
							Final Status
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-20 rounded-lg" />
					) : (
						<span
							className={cn(
								"inline-flex w-fit rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px] capitalize",
								getStatusColor(email?.status || "")
									.replace("text-", "border-")
									.replace("-base", "-soft-200") +
									" " +
									getStatusColor(email?.status || "")
										.replace("text-", "bg-")
										.replace("-base", "-alpha-10") +
									" " +
									getStatusColor(email?.status || ""),
							)}
						>
							{email?.status || "---"}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
