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
	email_failed: {
		icon: "cross-circle",
		bg: "bg-red-100",
		text: "text-red-600",
	},
	email_pending: { icon: "clock", bg: "bg-amber-100", text: "text-amber-600" },
	email_spam: { icon: "alert-octagon", bg: "bg-red-100", text: "text-red-600" },
	// Contact created
	contact_created: {
		icon: "user-plus",
		bg: "bg-neutral-100",
		text: "text-text-sub-600",
	},
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getIconConfig(key: string) {
	return (
		EVENT_ICON[key] ?? {
			icon: "mail",
			bg: "bg-neutral-100",
			text: "text-text-sub-600",
		}
	);
}

interface ParsedLifecycle {
	hasSent: boolean;
	sentTime: string | null;
	hasDelivered: boolean;
	deliveredTime: string | null;
	hasOpened: boolean;
	openedTime: string | null;
	openedCount: number;
	hasClicked: boolean;
	clickedTime: string | null;
	clickedCount: number;
	hasFailed: boolean;
	failedType: "failed" | "bounced" | "complaint" | null;
	failedTime: string | null;
	failedReason: string | null;
}

function parseLifecycle(entry: ActivityEntry): ParsedLifecycle {
	const sentEvent = entry.events.find((e) => e.type === "sent");
	const deliveredEvent = entry.events.find((e) => e.type === "delivered");
	const openedEvents = entry.events.filter((e) => e.type === "opened");
	const clickedEvents = entry.events.filter((e) => e.type === "clicked");

	const bouncedEvent = entry.events.find((e) => e.type === "bounced");
	const failedEvent = entry.events.find((e) => e.type === "failed");
	const complaintEvent = entry.events.find((e) => e.type === "complaint");

	const hasSent = true;
	const sentTime = entry.sentAt || sentEvent?.createdAt || entry.createdAt;

	const hasDelivered = !!(
		entry.deliveredAt ||
		deliveredEvent ||
		openedEvents.length > 0 ||
		clickedEvents.length > 0
	);
	const deliveredTime =
		entry.deliveredAt ||
		deliveredEvent?.createdAt ||
		openedEvents[0]?.createdAt ||
		clickedEvents[0]?.createdAt ||
		null;

	const hasOpened = openedEvents.length > 0 || clickedEvents.length > 0;
	const openedTime =
		openedEvents[0]?.createdAt || clickedEvents[0]?.createdAt || null;
	const openedCount = openedEvents.length;

	const hasClicked = clickedEvents.length > 0;
	const clickedTime = clickedEvents[0]?.createdAt || null;
	const clickedCount = clickedEvents.length;

	let failedType: "failed" | "bounced" | "complaint" | null = null;
	let failedTime: string | null = null;
	let failedReason: string | null = null;

	if (complaintEvent) {
		failedType = "complaint";
		failedTime = complaintEvent.createdAt;
		failedReason =
			complaintEvent.metadata?.reason ||
			complaintEvent.metadata?.description ||
			null;
	} else if (bouncedEvent) {
		failedType = "bounced";
		failedTime = bouncedEvent.createdAt;
		failedReason =
			bouncedEvent.metadata?.reason ||
			bouncedEvent.metadata?.description ||
			null;
	} else if (failedEvent || entry.failedAt || entry.status === "failed") {
		failedType = "failed";
		failedTime = entry.failedAt || failedEvent?.createdAt || entry.createdAt;
		failedReason =
			entry.errorMessage ||
			failedEvent?.metadata?.reason ||
			failedEvent?.metadata?.error ||
			null;
	}

	return {
		hasSent,
		sentTime,
		hasDelivered,
		deliveredTime,
		hasOpened,
		openedTime,
		openedCount,
		hasClicked,
		clickedTime,
		clickedCount,
		hasFailed: failedType !== null,
		failedType,
		failedTime,
		failedReason,
	};
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
		items.push({
			kind: "email",
			id: `email-${entry.id}`,
			entry,
			timestamp: entry.createdAt,
		});
	}

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

function AvatarNode({ iconKey, isLast }: { iconKey: string; isLast: boolean }) {
	const cfg = getIconConfig(iconKey);
	return (
		<div
			className="relative flex flex-shrink-0 flex-col items-center"
			style={{ width: 32 }}
		>
			{/* Icon circle */}
			<div
				className={cn(
					"relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-stroke-soft-200",
					cfg.bg,
				)}
			>
				<Icon
					name={cfg.icon as Parameters<typeof Icon>[0]["name"]}
					className={cn("h-4 w-4", cfg.text)}
				/>
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

// ─── Stepper Component ───────────────────────────────────────────────────────

const STEP_STYLE: Record<
	string,
	{ activeCls: string; icon: string }
> = {
	Sent: {
		activeCls: "border-blue-200 bg-blue-50 text-blue-600",
		icon: "send-1",
	},
	Delivered: {
		activeCls: "border-emerald-200 bg-emerald-50 text-emerald-600",
		icon: "check-circle",
	},
	Opened: {
		activeCls: "border-orange-200 bg-orange-50 text-orange-600",
		icon: "eye-outline",
	},
	Clicked: {
		activeCls: "border-purple-200 bg-purple-50 text-purple-600",
		icon: "cursor-click",
	},
	Failed: {
		activeCls: "border-red-200 bg-red-50 text-red-600",
		icon: "cross-circle",
	},
	Bounced: {
		activeCls: "border-red-200 bg-red-50 text-red-600",
		icon: "cross-circle",
	},
	Spam: {
		activeCls: "border-red-200 bg-red-50 text-red-600",
		icon: "cross-circle",
	},
};

function StepperItem({
	label,
	isActive,
	time,
	isLast,
	badge,
}: {
	label: string;
	isActive: boolean;
	time: string | null;
	isLast: boolean;
	badge?: string;
}) {
	const cfg = STEP_STYLE[label] || {
		activeCls: "border-information-base/20 bg-information-lighter/50 text-information-base",
		icon: "send-1",
	};

	return (
		<div className="flex flex-1 items-center last:flex-none">
			<div className="relative flex min-w-[90px] flex-col items-start pr-4">
				<div className="flex items-center gap-2">
					<div
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-[8px] border transition-all duration-300",
							isActive
								? cfg.activeCls
								: "border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400/60",
						)}
					>
						<Icon
							name={cfg.icon as Parameters<typeof Icon>[0]["name"]}
							className="h-4 w-4"
						/>
					</div>
					<div className="flex flex-col justify-center">
						<div className="flex items-center gap-1.5">
							<span
								className={cn(
									"font-semibold text-xs leading-none transition-colors",
									isActive
										? label === "Failed" ||
											label === "Bounced" ||
											label === "Spam"
											? "text-error-base"
											: label === "Sent"
												? "text-information-base"
												: label === "Delivered"
													? "text-success-base"
													: label === "Opened"
														? "text-orange-600"
														: "text-purple-600"
										: "text-text-sub-600",
								)}
							>
								{label}
							</span>
							{badge && isActive && (
								<span className="rounded border border-purple-100 bg-purple-50 px-1 py-0.5 font-semibold text-[9px] text-purple-600 leading-none">
									{badge}
								</span>
							)}
						</div>
						{time && isActive && (
							<span className="mt-1 whitespace-nowrap text-[10px] leading-none text-text-soft-400">
								{formatRelativeTime(time)}
							</span>
						)}
					</div>
				</div>
			</div>
			{!isLast && (
				<div
					className={cn(
						"mr-4 h-[1.5px] flex-1 border-t-[1.5px] border-dashed border-stroke-soft-200",
					)}
				/>
			)}
		</div>
	);
}

function EmailStatusSteps({ lifecycle }: { lifecycle: ParsedLifecycle }) {
	interface StepItem {
		label: string;
		isActive: boolean;
		time: string | null;
		badge?: string;
	}

	const steps: StepItem[] = lifecycle.hasFailed
		? [
				{ label: "Sent", isActive: lifecycle.hasSent, time: lifecycle.sentTime },
				{
					label:
						lifecycle.failedType === "bounced"
							? "Bounced"
							: lifecycle.failedType === "complaint"
								? "Spam"
								: "Failed",
					isActive: true,
					time: lifecycle.failedTime,
				},
			]
		: [
				{ label: "Sent", isActive: lifecycle.hasSent, time: lifecycle.sentTime },
				{
					label: "Delivered",
					isActive: lifecycle.hasDelivered,
					time: lifecycle.deliveredTime,
				},
				{
					label: "Opened",
					isActive: lifecycle.hasOpened,
					time: lifecycle.openedTime,
					badge: lifecycle.openedCount > 1 ? `${lifecycle.openedCount}x` : undefined,
				},
				{
					label: "Clicked",
					isActive: lifecycle.hasClicked,
					time: lifecycle.clickedTime,
					badge: lifecycle.clickedCount > 1 ? `${lifecycle.clickedCount}x` : undefined,
				},
			];

	return (
		<div className="flex w-full items-center px-2 py-1">
			{steps.map((step, idx) => (
				<StepperItem
					key={step.label}
					label={step.label}
					isActive={step.isActive}
					time={step.time}
					badge={step.badge}
					isLast={idx === steps.length - 1}
				/>
			))}
		</div>
	);
}

// ─── Detail card (nested below action row) ───────────────────────────────────

function EmailActivityCard({ entry }: { entry: ActivityEntry }) {
	const lifecycle = parseLifecycle(entry);

	return (
		<div className="mt-2.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2 py-3">
			<EmailStatusSteps lifecycle={lifecycle} />

			{lifecycle.hasFailed && lifecycle.failedReason && (
				<div className="mt-3 rounded-lg border border-red-100 bg-red-50/50 p-2.5">
					<div className="flex gap-2">
						<Icon
							name="alert-circle"
							className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"
						/>
						<div className="flex flex-col gap-0.5">
							<span className="font-semibold text-[10px] text-red-800 uppercase leading-none tracking-wide">
								{lifecycle.failedType === "bounced"
									? "Bounced"
									: lifecycle.failedType === "complaint"
										? "Spam Complaint"
										: "Delivery Failure"}
							</span>
							<p className="font-medium text-[11px] text-red-600 leading-normal">
								{lifecycle.failedReason}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// ─── Email row ───────────────────────────────────────────────────────────────

function EmailRow({
	entry,
	isLast,
}: {
	entry: ActivityEntry;
	isLast: boolean;
	contactEmail: string;
}) {
	const status = entry.status as EmailStatus;

	return (
		<div className="relative flex gap-3 pb-6">
			<AvatarNode iconKey={`email_${status}`} isLast={isLast} />

			<div className="min-w-0 flex-1 pt-0.5">
				{/* Action line */}
				<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
					<Link
						href={`/emails/${entry.id}`}
						className="max-w-[320px] truncate font-medium text-[13px] text-text-strong-950 underline decoration-stroke-soft-200 decoration-dashed underline-offset-4 transition-colors hover:text-primary-base"
					>
						{entry.subject || "(no subject)"}
					</Link>
					<span className="text-[11px] text-text-soft-400">·</span>
					<span className="whitespace-nowrap text-[11px] text-text-soft-400">
						{formatRelativeTime(entry.createdAt)}
					</span>
				</div>

				{/* Nested card with stepper */}
				<EmailActivityCard entry={entry} />
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
					<span className="font-semibold text-[13px] text-text-strong-950">
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
