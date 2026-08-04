import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useSWR } from "#/features/home/lib/use-swr-compat";

interface LogData {
	uuid: string;
	event: string;
	level: string;
	status_code?: number | null;
	created_at: string;
	metadata?: Record<string, unknown>;
}

interface LogListResponse {
	logs: LogData[];
	count: number;
}

// Map event namespace → sidebar icon name (same icons as the nav)
const EVENT_ICONS: Record<string, string> = {
	domain: "globe",
	email: "mail-single",
	contact: "users",
	api_key: "key-new",
	member: "users",
	webhook: "webhook",
	workflow: "workflow",
	template: "layout",
	log: "logs",
	settings: "gear",
};

const getEventIcon = (event: string): string => {
	const ns = event.split(".")[0] ?? "log";
	return EVENT_ICONS[ns] ?? "file-text";
};
const EVENT_LABELS: Record<string, string> = {
	"domain.created": "Create Domain",
	"domain.deleted": "Delete Domain",
	"domain.verified": "Verify Domain",
	"domain.verification_failed": "Verification Failed",
	"domain.dns_updated": "Update DNS Record",
	"domain.dns_created": "Create DNS Record",
	"email.sent": "Send Email",
	"email.bounced": "Email Bounced",
	"email.opened": "Email Opened",
	"email.clicked": "Email Clicked",
	"email.unsubscribed": "Unsubscribe",
	"contact.created": "Create Contact",
	"contact.updated": "Update Contact",
	"contact.deleted": "Delete Contact",
	"contact.added_to_group": "Add to Group",
	"contact.removed_from_group": "Remove from Group",
	"contact.added_to_channel": "Add to Channel",
	"contact.updated_channel": "Update Channel",
	"api_key.created": "Create API Key",
	"api_key.deleted": "Delete API Key",
	"member.invited": "Invite Member",
	"member.removed": "Remove Member",
	"webhook.created": "Create Webhook",
	"webhook.deleted": "Delete Webhook",
};

const formatEventLabel = (event: string): string => {
	if (EVENT_LABELS[event]) return EVENT_LABELS[event];
	// Fallback: split on dots and title-case
	return event
		.split(".")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
};

// Extract a readable resource name from the event or metadata
const getResource = (log: LogData): string | null => {
	const meta = log.metadata as Record<string, unknown> | undefined;
	if (meta?.domain && typeof meta.domain === "string") return meta.domain;
	if (meta?.email && typeof meta.email === "string") return meta.email;
	if (meta?.name && typeof meta.name === "string") return meta.name as string;
	// Derive from event namespace
	const ns = log.event.split(".")[0];
	if (ns && ns !== log.event) return ns;
	return null;
};

// Relative time — "2m ago", "17h ago", "3d ago"
const formatRelativeTime = (isoDate: string): string => {
	const now = Date.now();
	const then = new Date(isoDate).getTime();
	const diffSec = Math.floor((now - then) / 1000);

	if (diffSec < 60) return `${diffSec}s ago`;
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h ago`;
	const diffDay = Math.floor(diffHr / 24);
	return `${diffDay}d ago`;
};

const isError = (log: LogData) =>
	log.level === "error" ||
	log.level === "fatal" ||
	(log.status_code != null && log.status_code >= 400);

export function AuditLogsCard() {
	const { activeOrganization } = useActiveOrganization();

	const { data: auditLogsData } = useSWR<LogListResponse>(
		activeOrganization?.id ? "/api/logs/v1/list?limit=6" : null,
	);

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<Link
					href="/logs"
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon name="logs" className="h-4 w-4 shrink-0" />
					Audit Logs
				</Link>
				<Link
					href="/logs"
					className="flex h-7 w-7 shrink-0 items-center justify-center text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60"
				>
					<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>

			{/* Body */}
			{auditLogsData?.logs && auditLogsData.logs.length > 0 ? (
				<div className="-mt-1.5 h-[250px] overflow-hidden rounded-xl border border-stroke-soft-100 bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					{auditLogsData.logs.slice(0, 6).map((log) => {
						const resource = getResource(log);
						const error = isError(log);
						const iconName = getEventIcon(log.event);
						return (
							<Link
								href={`/logs?log=${log.uuid}`}
								className="group/row flex items-center gap-3 border-stroke-soft-100 border-b py-3 no-underline last:border-b-0 dark:border-white/5"
								key={log.uuid}
							>
								{/* Icon */}
								<Icon
									name={iconName as any}
									className={cn(
										"h-3.5 w-3.5 shrink-0",
										error
											? "text-error-base"
											: "text-text-sub-600 dark:text-white/40",
									)}
								/>

								{/* Action label */}
								<span className="min-w-0 flex-1 truncate font-semibold text-text-strong-950 text-xs group-hover/row:underline dark:text-white">
									{formatEventLabel(log.event)}
								</span>

								{/* Resource */}
								{resource && (
									<span className="shrink-0 truncate text-text-sub-600 text-xs dark:text-white/40">
										{resource}
									</span>
								)}

								{/* Relative time */}
								<span className="shrink-0 text-text-sub-600 text-xs tabular-nums underline decoration-dotted underline-offset-2 dark:text-white/40">
									{formatRelativeTime(log.created_at)}
								</span>
							</Link>
						);
					})}
				</div>
			) : (
				<div className="-mt-1.5 flex h-[250px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<Icon
						name="logs"
						className="h-6 w-6 text-text-sub-600 dark:text-white/40"
					/>
					<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
						Track Workspace Activity
					</h4>
					<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
						See a complete history of account activity for security and
						compliance.
					</p>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="mt-6 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Link href="/logs">View audit logs</Link>
					</Button.Root>
				</div>
			)}
		</div>
	);
}
