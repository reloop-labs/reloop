"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Link from "next/link";
import useSWR from "swr";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmailEvent {
	id: string;
	type: string;
	metadata: Record<string, string> | null;
	createdAt: string;
}

interface ActivityEntry {
	id: string;
	subject: string;
	fromEmail: string;
	toEmails: string[];
	status: string;
	sentAt: string | null;
	deliveredAt: string | null;
	failedAt: string | null;
	errorMessage: string | null;
	createdAt: string;
	events: EmailEvent[];
}

interface ContactActivityResponse {
	object: "contact_activity";
	email: string;
	data: ActivityEntry[];
	total: number;
	page: number;
	limit: number;
}

// ─── Unified timeline item ───────────────────────────────────────────────────

type TimelineItem =
	| {
			kind: "email";
			id: string;
			entry: ActivityEntry;
			timestamp: string;
	  }
	| {
			kind: "event";
			id: string;
			emailId: string;
			subject: string;
			eventType: string;
			timestamp: string;
	  }
	| {
			kind: "contact_created";
			id: string;
			timestamp: string;
	  };

// ─── Config ──────────────────────────────────────────────────────────────────

type EmailStatus =
	| "pending"
	| "sent"
	| "delivered"
	| "failed"
	| "bounced"
	| "spam"
	| "archived";

const STATUS_BADGE: Record<EmailStatus, { label: string; cls: string }> = {
	delivered: { label: "Delivered", cls: "bg-success-base/10 text-success-base border-success-base/20" },
	sent: { label: "Sent", cls: "bg-blue-50 text-blue-600 border-blue-200" },
	pending: { label: "Pending", cls: "bg-warning-base/10 text-warning-base border-warning-base/20" },
	bounced: { label: "Bounced", cls: "bg-error-base/10 text-error-base border-error-base/20" },
	failed: { label: "Failed", cls: "bg-error-base/10 text-error-base border-error-base/20" },
	spam: { label: "Spam", cls: "bg-error-base/10 text-error-base border-error-base/20" },
	archived: { label: "Archived", cls: "bg-neutral-100 text-text-sub-600 border-stroke-soft-200" },
};

const ICON_MAP: Record<string, { icon: string; bg: string; ring: string }> = {
	// Email-level
	email_sent: {
		icon: "send-1",
		bg: "bg-blue-50",
		ring: "ring-blue-100",
	},
	email_delivered: {
		icon: "check-circle",
		bg: "bg-emerald-50",
		ring: "ring-emerald-100",
	},
	email_bounced: {
		icon: "alert-circle",
		bg: "bg-red-50",
		ring: "ring-red-100",
	},
	email_failed: {
		icon: "x-circle",
		bg: "bg-red-50",
		ring: "ring-red-100",
	},
	email_pending: {
		icon: "clock",
		bg: "bg-amber-50",
		ring: "ring-amber-100",
	},
	email_spam: {
		icon: "alert-octagon",
		bg: "bg-red-50",
		ring: "ring-red-100",
	},
	// Event-level
	sent: {
		icon: "send-1",
		bg: "bg-blue-50",
		ring: "ring-blue-100",
	},
	delivered: {
		icon: "check-circle",
		bg: "bg-emerald-50",
		ring: "ring-emerald-100",
	},
	opened: {
		icon: "mail-open",
		bg: "bg-purple-50",
		ring: "ring-purple-100",
	},
	clicked: {
		icon: "mouse-pointer-outline",
		bg: "bg-indigo-50",
		ring: "ring-indigo-100",
	},
	bounced: {
		icon: "alert-circle",
		bg: "bg-red-50",
		ring: "ring-red-100",
	},
	failed: {
		icon: "x-circle",
		bg: "bg-red-50",
		ring: "ring-red-100",
	},
	complaint: {
		icon: "alert-octagon",
		bg: "bg-red-50",
		ring: "ring-red-100",
	},
	deferred: {
		icon: "clock",
		bg: "bg-amber-50",
		ring: "ring-amber-100",
	},
	// Contact
	contact_created: {
		icon: "user-plus",
		bg: "bg-neutral-100",
		ring: "ring-neutral-200",
	},
};

const EVENT_LABELS: Record<string, string> = {
	sent: "Email sent",
	delivered: "Email delivered",
	opened: "Email opened",
	clicked: "Link clicked",
	bounced: "Email bounced",
	failed: "Delivery failed",
	complaint: "Spam complaint",
	deferred: "Delivery deferred",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string) {
	return new Date(iso).toLocaleString([], {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

function getIconConfig(key: string) {
	return (
		ICON_MAP[key] ?? {
			icon: "circle",
			bg: "bg-neutral-100",
			ring: "ring-neutral-200",
		}
	);
}

/**
 * Flattens activity entries into a single chronological timeline.
 * Each email becomes a "sent" item, and each subsequent event
 * (delivered, opened, clicked, bounced, etc.) becomes its own line.
 */
function buildFlatTimeline(
	entries: ActivityEntry[],
	contactCreatedAt?: string,
): TimelineItem[] {
	const items: TimelineItem[] = [];

	for (const entry of entries) {
		// 1. The email send itself
		items.push({
			kind: "email",
			id: `email-${entry.id}`,
			entry,
			timestamp: entry.createdAt,
		});

		// 2. Build events from explicit event records + synthesised timestamps
		const eventTypes = new Set(entry.events.map((e) => e.type));
		const allEvents = [...entry.events];

		if (entry.deliveredAt && !eventTypes.has("delivered")) {
			allEvents.push({
				id: `synth-delivered-${entry.id}`,
				type: "delivered",
				createdAt: entry.deliveredAt,
				metadata: null,
			});
		}
		if (
			entry.failedAt &&
			!eventTypes.has("failed") &&
			!eventTypes.has("bounced")
		) {
			allEvents.push({
				id: `synth-failed-${entry.id}`,
				type: "failed",
				createdAt: entry.failedAt,
				metadata: null,
			});
		}

		// Remove "sent" events — we already show the email row for that
		const subsequentEvents = allEvents.filter((e) => e.type !== "sent");
		subsequentEvents.sort(
			(a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		);

		for (const ev of subsequentEvents) {
			items.push({
				kind: "event",
				id: ev.id,
				emailId: entry.id,
				subject: entry.subject,
				eventType: ev.type,
				timestamp: ev.createdAt,
			});
		}
	}

	// 3. Contact created — always at the bottom
	if (contactCreatedAt) {
		items.push({
			kind: "contact_created",
			id: "contact-created",
			timestamp: contactCreatedAt,
		});
	}

	// Sort descending (newest first), but keep contact_created at the end
	items.sort((a, b) => {
		if (a.kind === "contact_created") return 1;
		if (b.kind === "contact_created") return -1;
		return (
			new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);
	});

	return items;
}

// ─── Timeline node ───────────────────────────────────────────────────────────

function TimelineNode({
	iconKey,
	isLast,
}: {
	iconKey: string;
	isLast: boolean;
}) {
	const cfg = getIconConfig(iconKey);
	return (
		<div className="relative flex flex-col items-center">
			{/* Icon circle */}
			<div
				className={cn(
					"relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-[3px]",
					cfg.bg,
					cfg.ring,
				)}
			>
				<Icon
					name={cfg.icon as Parameters<typeof Icon>[0]["name"]}
					className="h-4 w-4 text-text-sub-600"
				/>
			</div>
			{/* Vertical connector */}
			{!isLast && (
				<div className="absolute top-8 left-1/2 h-[calc(100%+8px)] w-px -translate-x-1/2 bg-stroke-soft-200" />
			)}
		</div>
	);
}

// ─── Renderers ───────────────────────────────────────────────────────────────

function EmailItem({
	entry,
	isLast,
}: {
	entry: ActivityEntry;
	isLast: boolean;
}) {
	const badge =
		STATUS_BADGE[entry.status as EmailStatus] ?? STATUS_BADGE.pending;

	return (
		<div className="relative flex gap-4 pb-6">
			<TimelineNode
				iconKey={`email_${entry.status}`}
				isLast={isLast}
			/>
			<div className="min-w-0 flex-1 pt-0.5">
				<Link
					href={`/emails/${entry.id}`}
					className="group block rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3 transition-all hover:border-stroke-soft-300 hover:shadow-sm"
				>
					<div className="flex items-start justify-between gap-3">
						<p className="min-w-0 truncate font-medium text-[13px] text-text-strong-950 group-hover:text-primary-base transition-colors">
							{entry.subject || "(no subject)"}
						</p>
						<span className="flex-shrink-0 text-[11px] text-text-soft-400">
							{formatRelativeTime(entry.createdAt)}
						</span>
					</div>
					<div className="mt-1.5 flex items-center gap-2">
						<span className="truncate text-[11px] text-text-soft-400">
							From {entry.fromEmail}
						</span>
						<span
							className={cn(
								"inline-flex flex-shrink-0 items-center rounded-md border px-1.5 py-0.5 font-medium text-[10px]",
								badge.cls,
							)}
						>
							{badge.label}
						</span>
					</div>
				</Link>
			</div>
		</div>
	);
}

function EventItem({
	emailId,
	subject,
	eventType,
	timestamp,
	isLast,
}: {
	emailId: string;
	subject: string;
	eventType: string;
	timestamp: string;
	isLast: boolean;
}) {
	const label =
		EVENT_LABELS[eventType] ?? eventType.charAt(0).toUpperCase() + eventType.slice(1);

	return (
		<div className="relative flex gap-4 pb-6">
			<TimelineNode iconKey={eventType} isLast={isLast} />
			<div className="min-w-0 flex-1 pt-1">
				<div className="flex items-baseline justify-between gap-3">
					<div className="flex min-w-0 items-center gap-1.5">
						<span className="font-medium text-[13px] text-text-strong-950">
							{label}
						</span>
						<span className="text-[11px] text-text-soft-400">·</span>
						<span className="text-[11px] text-text-soft-400">
							{formatTimestamp(timestamp)}
						</span>
					</div>
				</div>
				<Link
					href={`/emails/${emailId}`}
					className="mt-0.5 block truncate text-[11px] text-primary-base transition-opacity hover:opacity-70"
				>
					{subject || "(no subject)"}
				</Link>
			</div>
		</div>
	);
}

function ContactCreatedItem({
	timestamp,
	isLast,
}: {
	timestamp: string;
	isLast: boolean;
}) {
	return (
		<div className="relative flex gap-4 pb-2">
			<TimelineNode iconKey="contact_created" isLast={isLast} />
			<div className="min-w-0 flex-1 pt-1">
				<div className="flex items-baseline justify-between gap-3">
					<span className="font-medium text-[13px] text-text-strong-950">
						Contact created
					</span>
					<span className="flex-shrink-0 text-[11px] text-text-soft-400">
						{formatTimestamp(timestamp)}
					</span>
				</div>
			</div>
		</div>
	);
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function TimelineSkeleton() {
	return (
		<div className="space-y-0">
			{Array.from({ length: 4 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
				<div key={i} className="relative flex gap-4 pb-6">
					<div className="relative flex flex-col items-center">
						<Skeleton className="h-8 w-8 rounded-full" />
						{i < 3 && (
							<div className="absolute top-8 left-1/2 h-[calc(100%+8px)] w-px -translate-x-1/2 bg-stroke-soft-200" />
						)}
					</div>
					<div className="min-w-0 flex-1 space-y-2 pt-1">
						<Skeleton className="h-4 w-48 rounded" />
						<Skeleton className="h-3 w-32 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}

// ─── Main component ──────────────────────────────────────────────────────────

interface ContactEmailHistoryProps {
	email: string;
	/** ISO timestamp of when the contact was created */
	contactCreatedAt?: string;
}

export function ContactEmailHistory({
	email,
	contactCreatedAt,
}: ContactEmailHistoryProps) {
	const url = email
		? `/api/logs/v1/emails/contact-activity?email=${encodeURIComponent(email)}&limit=20&page=1`
		: null;

	const { data, isLoading } = useSWR<ContactActivityResponse>(url, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

	const entries = data?.data ?? [];
	const total = data?.total ?? 0;

	const timeline = buildFlatTimeline(entries, contactCreatedAt);

	return (
		<div className="mt-12 pb-12">
			{/* Section header */}
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h3 className="font-medium text-paragraph-sm text-text-strong-950">
						Activity
					</h3>
					{!isLoading && total > 0 && (
						<span className="rounded-full bg-neutral-alpha-10 px-2 py-0.5 font-medium text-[11px] text-text-sub-600">
							{total}
						</span>
					)}
				</div>
			</div>

			{/* Timeline */}
			{isLoading ? (
				<TimelineSkeleton />
			) : timeline.length === 0 ? (
				<div className="flex flex-col items-center gap-2 rounded-xl border border-stroke-soft-200 py-10 text-center">
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-alpha-10">
						<Icon name="mail" className="h-4 w-4 text-text-sub-600" />
					</div>
					<p className="font-medium text-paragraph-sm text-text-sub-600">
						No activity yet
					</p>
					<p className="max-w-xs text-[12px] text-text-soft-400">
						Emails sent to{" "}
						<span className="font-medium text-text-sub-600">{email}</span>{" "}
						will appear here.
					</p>
				</div>
			) : (
				<div>
					{timeline.map((item, idx) => {
						const isLast = idx === timeline.length - 1;

						if (item.kind === "email") {
							return (
								<EmailItem
									key={item.id}
									entry={item.entry}
									isLast={isLast}
								/>
							);
						}
						if (item.kind === "event") {
							return (
								<EventItem
									key={item.id}
									emailId={item.emailId}
									subject={item.subject}
									eventType={item.eventType}
									timestamp={item.timestamp}
									isLast={isLast}
								/>
							);
						}
						return (
							<ContactCreatedItem
								key={item.id}
								timestamp={item.timestamp}
								isLast={isLast}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
