"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface EmailDetailProps {
	email?: {
		id: string;
		fromEmail: string;
		fromName: string | null;
		toEmails: string[];
		ccEmails: string[] | null;
		bccEmails: string[] | null;
		subject: string;
		textBody: string | null;
		htmlBody: string | null;
		errorMessage: string | null;
		provider: string;
		size: number;
		headers: Record<string, string> | null;
		createdAt: string;
	};
	isLoading: boolean;
}

function CopyButton({ value, label }: { value: string; label?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			toast.success(label ? `${label} copied` : "Copied");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	}, [value, label]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="rounded p-1 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
			title={`Copy ${label || "value"}`}
		>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn("h-3 w-3", copied && "text-success-base")}
			/>
		</button>
	);
}

export const EmailDetail = ({ email, isLoading }: EmailDetailProps) => {
	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="space-y-4">
					<Skeleton className="h-6 w-32" />
					<div className="grid grid-cols-2 gap-8">
						<Skeleton className="h-20 w-full rounded-xl" />
						<Skeleton className="h-20 w-full rounded-xl" />
					</div>
				</div>
				<div className="space-y-4">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-64 w-full rounded-xl" />
				</div>
			</div>
		);
	}

	if (!email) return null;

	return (
		<div className="space-y-12">
			{/* Delivery Info */}
			<section>
				<h3 className="mb-4 font-medium text-paragraph-sm text-text-strong-950">
					Delivery Details
				</h3>
				<div className="grid grid-cols-2 gap-x-12 gap-y-6 rounded-xl border border-stroke-soft-100 p-6 dark:border-stroke-soft-100/50">
					<div className="flex flex-col gap-1">
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							From
						</span>
						<span className="truncate font-medium text-paragraph-sm text-text-strong-950">
							{email.fromName
								? `${email.fromName} <${email.fromEmail}>`
								: email.fromEmail}
						</span>
					</div>
					<div className="flex flex-col gap-1">
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							To
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{email.toEmails.join(", ")}
						</span>
					</div>
					{email.ccEmails && email.ccEmails.length > 0 && (
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								CC
							</span>
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{email.ccEmails.join(", ")}
							</span>
						</div>
					)}
					<div className="flex flex-col gap-1">
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Provider
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950 capitalize">
							{email.provider}
						</span>
					</div>
					<div className="flex flex-col gap-1">
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Size
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{(email.size / 1024).toFixed(2)} KB
						</span>
					</div>
				</div>
			</section>

			{/* Error Message if failed */}
			{email.errorMessage && (
				<section>
					<h3 className="mb-4 font-medium text-paragraph-sm text-text-strong-950">
						Error Details
					</h3>
					<div className="rounded-xl border border-error-soft-200 bg-error-alpha-10 p-6">
						<p className="whitespace-pre-wrap font-mono text-error-base text-sm">
							{email.errorMessage}
						</p>
					</div>
				</section>
			)}

			{/* Content Preview */}
			<section>
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-medium text-paragraph-sm text-text-strong-950">
						Message Content
					</h3>
				</div>
				<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
					<div className="flex items-center justify-between border-stroke-soft-100 border-b bg-bg-weak-50/50 px-4 py-2 dark:border-stroke-soft-100/50">
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							{email.htmlBody ? "HTML Body" : "Text Body"}
						</span>
						<CopyButton
							value={email.htmlBody || email.textBody || ""}
							label="Content"
						/>
					</div>
					<div className="p-6">
						{email.htmlBody ? (
							<div
								className="message-content prose prose-sm max-w-none"
								dangerouslySetInnerHTML={{ __html: email.htmlBody }}
							/>
						) : (
							<pre className="whitespace-pre-wrap font-mono text-sm text-text-strong-950">
								{email.textBody || "No content"}
							</pre>
						)}
					</div>
				</div>
			</section>

			{/* Headers */}
			{email.headers && Object.keys(email.headers).length > 0 && (
				<section>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-medium text-paragraph-sm text-text-strong-950">
							SMTP Headers
						</h3>
						<CopyButton
							value={JSON.stringify(email.headers, null, 2)}
							label="Headers"
						/>
					</div>
					<div className="overflow-auto rounded-xl border border-stroke-soft-100 p-6 dark:border-stroke-soft-100/50">
						<pre className="font-mono text-[11px] text-text-sub-600 leading-relaxed">
							{JSON.stringify(email.headers, null, 2)}
						</pre>
					</div>
				</section>
			)}
		</div>
	);
};
