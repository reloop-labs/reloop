import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";

interface LogDetailProps {
	log?: {
		uuid: string;
		service: string;
		event: string;
		level: string;
		message: string | null;
		occurred_at: string;
		properties: Record<string, unknown>;
		metadata: Record<string, unknown>;
		request_id: string | null;
		trace_id: string | null;
	};
	isLoading: boolean;
}

const getLevelBadgeColor = (level: string) => {
	switch (level?.toLowerCase()) {
		case "error":
		case "fatal":
			return "text-error-base border-error-soft-200 bg-error-alpha-10";
		case "warn":
			return "text-warning-base border-warning-soft-200 bg-warning-alpha-10";
		case "info":
			return "text-primary-base border-primary-soft-200 bg-primary-alpha-10";
		default:
			return "text-text-sub-600 border-stroke-soft-200 bg-neutral-alpha-10";
	}
};

export const LogDetail = ({ log, isLoading }: LogDetailProps) => {
	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-8 w-8 rounded-full" />
					<Skeleton className="h-8 w-64" />
				</div>
				<div className="grid grid-cols-2 gap-6">
					<Skeleton className="h-32 rounded-xl" />
					<Skeleton className="h-32 rounded-xl" />
				</div>
				<Skeleton className="h-64 rounded-xl" />
			</div>
		);
	}

	if (!log) return null;

	return (
		<div className="space-y-6">
			{/* Level indication - kept as a small badge */}
			<div className="flex items-center gap-2">
				<span
					className={cn(
						"inline-flex items-center rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px] capitalize",
						getLevelBadgeColor(log.level),
					)}
				>
					{log.level}
				</span>
			</div>

			{/* Basic Info Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="rounded-xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/50">
					<h3 className="mb-3 font-medium text-text-sub-600 text-xs uppercase">
						Event Information
					</h3>
					<div className="space-y-3">
						<div className="flex justify-between text-sm">
							<span className="text-text-sub-600">Service</span>
							<span className="font-medium text-text-strong-950">
								{log.service}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-sub-600">Event</span>
							<span className="font-medium text-text-strong-950">
								{log.event}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-sub-600">Timestamp</span>
							<span className="text-text-strong-950">
								{new Date(log.occurred_at).toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/50">
					<h3 className="mb-3 font-medium text-text-sub-600 text-xs uppercase">
						Context
					</h3>
					<div className="space-y-3">
						<div className="flex justify-between text-sm">
							<span className="text-text-sub-600">Log UUID</span>
							<span className="max-w-[150px] truncate font-mono text-text-strong-950 text-xs">
								{log.uuid}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-sub-600">Request ID</span>
							<span className="max-w-[150px] truncate font-mono text-text-strong-950 text-xs">
								{log.request_id || "N/A"}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-sub-600">Trace ID</span>
							<span className="max-w-[150px] truncate font-mono text-text-strong-950 text-xs">
								{log.trace_id || "N/A"}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Message */}
			{log.message && (
				<div className="rounded-xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/50">
					<h3 className="mb-2 font-medium text-text-sub-600 text-xs uppercase">
						Message
					</h3>
					<p className="whitespace-pre-wrap text-sm text-text-strong-950">
						{log.message}
					</p>
				</div>
			)}

			{/* Properties & Metadata */}
			<div className="space-y-6">
				<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/50">
					<h3 className="mb-3 font-medium text-text-sub-600 text-xs uppercase">
						Properties
					</h3>
					<pre className="overflow-x-auto rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-4 font-mono text-text-strong-950 text-xs">
						{JSON.stringify(log.properties, null, 2)}
					</pre>
				</div>

				<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/50">
					<h3 className="mb-3 font-medium text-text-sub-600 text-xs uppercase">
						Metadata
					</h3>
					<pre className="overflow-x-auto rounded-lg border border-stroke-soft-100 bg-bg-white-0 p-4 font-mono text-text-strong-950 text-xs">
						{JSON.stringify(log.metadata, null, 2)}
					</pre>
				</div>
			</div>
		</div>
	);
};
