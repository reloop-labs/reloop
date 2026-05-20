"use client";

import { CopyCodeBlock } from "@fe/dashboard/app/(protected)/onboarding/steps/generate-api-key/components/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { DiagnosticCard } from "./diagnostic-card";

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
			<DiagnosticCard log={log} />

			{/* Metadata Section */}
			<section>
				{metadataEntries.length > 0 ? (
					<CopyCodeBlock
						code={JSON.stringify(log.metadata, null, 2)}
						lang="json"
						label="Response"
					/>
				) : (
					<div>
						<div className="mb-4 flex items-center justify-between">
							<h3 className="font-medium text-paragraph-sm text-text-strong-950">
								Metadata
							</h3>
						</div>
						<p className="font-medium text-paragraph-sm text-text-soft-400 italic">
							No metadata
						</p>
					</div>
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
