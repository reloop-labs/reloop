"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface LogDetailProps {
	log?: {
		uuid: string;
		event: string;
		level: string;
		status_code?: number | null;
		created_at: string;
		metadata: Record<string, unknown>;
		requestDetails: {
			endpoint?: string;
			method?: string;
			userAgent?: string;
			ipAddress?: string;
			[key: string]: unknown;
		};
		trace_id: string | null;
		email?: any;
	};
	isLoading: boolean;
}

import Link from "next/link";
import { useParams } from "next/navigation";

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
				className={cn("h-3.5 w-3.5", copied && "text-success-base")}
			/>
		</button>
	);
}

export const LogDetail = ({ log, isLoading }: LogDetailProps) => {
	
	const metadataEntries = log ? Object.entries(log.metadata || {}) : [];

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-medium text-paragraph-sm text-text-strong-950">
							Metadata
						</h3>
					</div>
					<div className="grid grid-cols-3 gap-x-8 gap-y-8">
						<Skeleton className="h-10 w-full rounded-lg" />
						<Skeleton className="h-10 w-full rounded-lg" />
						<Skeleton className="h-10 w-full rounded-lg" />
					</div>
				</div>
			</div>
		);
	}

	if (!log) return null;

	return (
		<div className="space-y-12">
			{/* Metadata Section */}
			<section>
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-medium text-paragraph-sm text-text-strong-950">
						Metadata
					</h3>
					{metadataEntries.length > 0 && (
						<CopyButton
							value={JSON.stringify(log.metadata, null, 2)}
							label="Metadata"
						/>
					)}
				</div>
				{metadataEntries.length > 0 ? (
					<div className="grid grid-cols-3 gap-x-8 gap-y-8">
						{metadataEntries.map(([key, value]) => (
							<div key={key} className="flex flex-col gap-1">
								<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
									{key}
								</span>
								<span className="max-w-[300px] truncate font-medium text-paragraph-sm text-text-strong-950">
									{typeof value === "object"
										? JSON.stringify(value)
										: String(value ?? "-")}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className="font-medium text-paragraph-sm text-text-soft-400 italic">
						No metadata
					</p>
				)}
			</section>

			{/* Email Details Section (if enriched) */}
			{log.email && (
				<section>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-medium text-paragraph-sm text-text-strong-950">
							Email Details
						</h3>
						<Link
							href={`/emails/${log.email.id}`}
							className="flex items-center gap-1 text-primary-base text-xs hover:underline"
						>
							View Full Details
							<Icon name="arrow-right" className="h-3 w-3" />
						</Link>
					</div>
					<div className="grid grid-cols-3 gap-x-8 gap-y-8 rounded-xl border border-stroke-soft-100 p-6 dark:border-stroke-soft-100/50">
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Subject
							</span>
							<span className="truncate font-medium text-paragraph-sm text-text-strong-950">
								{log.email.subject}
							</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								To
							</span>
							<span className="truncate font-medium text-paragraph-sm text-text-strong-950">
								{log.email.toEmails.join(", ")}
							</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Status
							</span>
							<span className="font-medium text-paragraph-sm text-text-strong-950 capitalize">
								{log.email.status}
							</span>
						</div>
					</div>
				</section>
			)}
		</div>
	);
};
