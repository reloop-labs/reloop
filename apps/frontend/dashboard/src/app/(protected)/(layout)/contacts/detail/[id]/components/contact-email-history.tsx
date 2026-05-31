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
			metadata: Record<string, string> | null;
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

/** Status pill shown inline in the action text */
const STATUS_PILL: Record<
	EmailStatus,
	{ label: string; cls: string; dotCls: string }
> = {
	delivered: {
		label: "Delivered",
		cls: "bg-success-base/10 text-success-base",
		dotCls: "bg-success-base",
	},
	sent: {
		label: "Sent",
		cls: "bg-blue-50 text-blue-600",
		dotCls: "bg-blue-500",
	},
	pending: {
		label: "Pending",
		cls: "bg-warning-base/10 text-warning-base",
		dotCls: "bg-warning-base",
	},
	bounced: {
		label: "Bounced",
		cls: "bg-error-base/10 text-error-base",
		dotCls: "bg-error-base",
	},
	failed: {
		label: "Failed",
		cls: "bg-error-base/10 text-error-base",
		dotCls: "bg-error-base",
	},
	spam: {
		label: "Spam",
		cls: "bg-error-base/10 text-error-base",
		dotCls: "bg-error-base",
	},
	archived: {
		label: "Archived",
		cls: "bg-neutral-100 text-text-sub-600",
		dotCls: "bg-text-soft-400",
	},
};

/** Icon shown in the avatar circle for each event type */
const EVENT_ICON: Record<string, { icon: string; bg: string; text: string }> = {
	// Email-level
	email_sent: { icon: "send-1", bg: "bg-blue-100", text: "text-blue-600" },
	email_delivered: {
		icon: "check-circle",
		bg: "bg-emerald-100",
		text: "text-emerald-600",
	},
	email_bounced: {
		icon: "alert-circle",
		bg: "bg-red-100",
		text: "text-red-600",
	},
	email_failed: { icon: "x-circle", bg: "bg-red-100", text: "text-red-600" },
	email_pending: { icon: "clock", bg: "bg-amber-100", text: "text-amber-600" },
	email_spam: { icon: "alert-octagon", bg: "bg-red-100", text: "text-red-600" },
	// Event-level
	sent: { icon: "send-1", bg: "bg-blue-100", text: "text-blue-600" },
	delivered: {
		icon: "check-circle",
		bg: "bg-emerald-100",
		text: "text-emerald-600",
	},
	opened: { icon: "mail-open", bg: "bg-purple-100", text: "text-purple-600" },
	clicked: {
		icon: "mouse-pointer-outline",
		bg: "bg-indigo-100",
		text: "text-indigo-600",
	},
	bounced: { icon: "alert-circle", bg: "bg-red-100", text: "text-red-600" },
	failed: { icon: "x-circle", bg: "bg-red-100", text: "text-red-600" },
	complaint: { icon: "alert-octagon", bg: "bg-red-100", text: "text-red-600" },
	deferred: { icon: "clock", bg: "bg-amber-100", text: "text-amber-600" },
	// Contact created
	contact_created: {
		icon: "user-plus",
		bg: "bg-neutral-100",
		text: "text-text-sub-600",
	},
};

const EVENT_LABELS: Record<string, string> = {
	sent: "sent",
	delivered: "delivered",
	opened: "opened",
	clicked: "clicked a link in",
	bounced: "bounced for",
	failed: "failed to deliver",
	complaint: "marked as spam",
	deferred: "deferred delivery of",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getIconConfig(key: string) {
	return (
		EVENT_ICON[key] ?? {
			icon: "circle",
			bg: "bg-neutral-100",
			text: "text-text-sub-600",
		}
	);
}

function getInitials(email: string): string {
	return email.charAt(0).toUpperCase();
}

function getAvatarGradient(email: string): string {
	// Deterministic gradient based on email string
	const gradients = [
		"from-blue-500 to-indigo-600",
		"from-emerald-500 to-teal-600",
		"from-violet-500 to-purple-600",
		"from-rose-500 to-pink-600",
		"from-amber-500 to-orange-600",
		"from-cyan-500 to-sky-600",
	];
	const hash = email.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
	return gradients[hash % gradients.length] ?? "from-blue-500 to-indigo-600";
}

/**
 * Flattens activity entries into a single chronological timeline.
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

		// 2. Build events from explicit records + synthesised timestamps
		const eventTypes = new Set(entry.events.map((e) => e.type));
		const allEvents = [...entry.events];

		// Synthesise a "failed" event from failedAt if not already in the event list
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

		// Remove "sent" and "delivered" events — the email row already shows the
		// delivery status via its status pill, so a separate "delivered" row is redundant.
		const subsequentEvents = allEvents.filter(
			(e) => e.type !== "sent" && e.type !== "delivered",
		);
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
				metadata: ev.metadata,
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

	// Sort descending (newest first), contact_created always last
	items.sort((a, b) => {
		if (a.kind === "contact_created") return 1;
		if (b.kind === "contact_created") return -1;
		return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
	});

	return items;
}

// ─── Avatar node ─────────────────────────────────────────────────────────────

function AvatarNode({
	iconKey,
	email,
	isLast,
}: {
	iconKey: string;
	email?: string;
	isLast: boolean;
}) {
	const cfg = getIconConfig(iconKey);
	return (
		<div
			className="relative flex flex-shrink-0 flex-col items-center"
			style={{ width: 32 }}
		>
			{/* Avatar / icon circle */}
			<div
				className={cn(
					"relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
					email ? `bg-gradient-to-br ${getAvatarGradient(email)}` : cfg.bg,
				)}
			>
				{email ? (
					<span className="select-none font-semibold text-[13px] text-white">
						{getInitials(email)}
					</span>
				) : (
					<Icon
						name={cfg.icon as Parameters<typeof Icon>[0]["name"]}
						className={cn("h-4 w-4", cfg.text)}
					/>
				)}
			</div>
			{/* Vertical connector */}
			{!isLast && (
				<div
					className="-translate-x-1/2 absolute top-8 left-1/2 w-px bg-stroke-soft-200"
					style={{ height: "calc(100% + 8px)" }}
				/>
			)}
		</div>
	);
}

// ─── Status pill ─────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
	const pill = STATUS_PILL[status as EmailStatus] ?? STATUS_PILL.pending;
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[11px]",
				pill.cls,
			)}
		>
			<span
				className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", pill.dotCls)}
			/>
			{pill.label}
		</span>
	);
}

// ─── Detail card (nested below action row) ───────────────────────────────────

function DetailCard({
	subject,
	emailId,
	errorMessage,
}: {
	subject?: string;
	emailId?: string;
	errorMessage?: string | null;
}) {
	if (!subject && !errorMessage) return null;
	return (
		<div className="mt-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3">
			{subject && emailId && (
				<Link
					href={`/emails/${emailId}`}
					className="block truncate font-medium text-[12px] text-text-strong-950 transition-colors hover:text-primary-base"
				>
					{subject}
				</Link>
			)}
			{errorMessage && (
				<p className="mt-1 text-[12px] text-error-base leading-relaxed">
					{errorMessage}
				</p>
			)}
		</div>
	);
}

// ─── Email row ───────────────────────────────────────────────────────────────

function EmailRow({
	entry,
	isLast,
	contactEmail,
}: {
	entry: ActivityEntry;
	isLast: boolean;
	contactEmail: string;
}) {
	const status = entry.status as EmailStatus;

	return (
		<div className="relative flex gap-3 pb-6">
			<AvatarNode
				iconKey={`email_${status}`}
				email={contactEmail}
				isLast={isLast}
			/>

			<div className="min-w-0 flex-1 pt-0.5">
				{/* Action line */}
				<div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
					<span className="max-w-[160px] truncate font-medium text-[13px] text-text-strong-950">
						{contactEmail}
					</span>
					<span className="text-[13px] text-text-sub-600">
						received an email
					</span>
					<StatusPill status={status} />
					<span className="text-[11px] text-text-soft-400">·</span>
					<span className="whitespace-nowrap text-[11px] text-text-soft-400">
						{formatRelativeTime(entry.createdAt)}
					</span>
				</div>

				{/* Nested card with subject */}
				<DetailCard
					subject={entry.subject || "(no subject)"}
					emailId={entry.id}
				/>
			</div>
		</div>
	);
}

// ─── Event row ───────────────────────────────────────────────────────────────

function EventRow({
	emailId,
	subject,
	eventType,
	timestamp,
	metadata,
	isLast,
	contactEmail,
}: {
	emailId: string;
	subject: string;
	eventType: string;
	timestamp: string;
	metadata: Record<string, string> | null;
	isLast: boolean;
	contactEmail: string;
}) {
	const actionVerb = EVENT_LABELS[eventType] ?? eventType;

	// Determine if this event warrants a detail card
	const showCard =
		eventType === "failed" ||
		eventType === "bounced" ||
		eventType === "complaint" ||
		eventType === "clicked" ||
		eventType === "opened" ||
		eventType === "deferred";

	// Error / detail info from metadata
	const errorDetail =
		metadata?.reason || metadata?.error || metadata?.description || null;

	return (
		<div className="relative flex gap-3 pb-6">
			<AvatarNode iconKey={eventType} isLast={isLast} />

			<div className="min-w-0 flex-1 pt-0.5">
				{/* Action line */}
				<div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
					<span className="max-w-[160px] truncate font-medium text-[13px] text-text-strong-950">
						{contactEmail}
					</span>
					<span className="text-[13px] text-text-sub-600">{actionVerb}</span>
					<span className="text-[11px] text-text-soft-400">·</span>
					<span className="whitespace-nowrap text-[11px] text-text-soft-400">
						{formatRelativeTime(timestamp)}
					</span>
				</div>

				{/* Nested card */}
				{showCard && (
					<DetailCard
						subject={subject || "(no subject)"}
						emailId={emailId}
						errorMessage={errorDetail}
					/>
				)}
			</div>
		</div>
	);
}

// ─── Contact created row ─────────────────────────────────────────────────────

function ContactCreatedRow({
	timestamp,
	isLast,
}: {
	timestamp: string;
	isLast: boolean;
}) {
	return (
		<div className="relative flex gap-3 pb-2">
			<AvatarNode iconKey="contact_created" isLast={isLast} />
			<div className="min-w-0 flex-1 pt-0.5">
				<div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
					<span className="font-medium text-[13px] text-text-strong-950">
						Contact created
					</span>
					<span className="text-[11px] text-text-soft-400">·</span>
					<span className="whitespace-nowrap text-[11px] text-text-soft-400">
						{formatRelativeTime(timestamp)}
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
				<div key={i} className="relative flex gap-3 pb-6">
					<div
						className="relative flex flex-shrink-0 flex-col items-center"
						style={{ width: 32 }}
					>
						<Skeleton className="h-8 w-8 rounded-full" />
						{i < 3 && (
							<div className="-translate-x-1/2 absolute top-8 left-1/2 h-[calc(100%+8px)] w-px bg-stroke-soft-200" />
						)}
					</div>
					<div className="min-w-0 flex-1 space-y-2 pt-1">
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-32 rounded" />
							<Skeleton className="h-4 w-20 rounded" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
						{i % 2 === 0 && <Skeleton className="h-14 w-full rounded-xl" />}
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
			<div className="mb-6 flex items-center gap-2">
				<h3 className="font-medium text-paragraph-sm text-text-strong-950">
					Activity
				</h3>
				{!isLoading && total > 0 && (
					<span className="rounded-full bg-neutral-alpha-10 px-2 py-0.5 font-medium text-[11px] text-text-sub-600">
						{total}
					</span>
				)}
			</div>

			{/* Divider */}
			<div className="mb-6 h-px bg-stroke-soft-200" />

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
						<span className="font-medium text-text-sub-600">{email}</span> will
						appear here.
					</p>
				</div>
			) : (
				<div>
					{timeline.map((item, idx) => {
						const isLast = idx === timeline.length - 1;

						if (item.kind === "email") {
							return (
								<EmailRow
									key={item.id}
									entry={item.entry}
									isLast={isLast}
									contactEmail={email}
								/>
							);
						}
						if (item.kind === "event") {
							return (
								<EventRow
									key={item.id}
									emailId={item.emailId}
									subject={item.subject}
									eventType={item.eventType}
									timestamp={item.timestamp}
									metadata={item.metadata}
									isLast={isLast}
									contactEmail={email}
								/>
							);
						}
						return (
							<ContactCreatedRow
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
