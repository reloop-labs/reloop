"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon, type IconName } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { queryKeys } from "#/lib/query-keys";
import { formatRelativeTime } from "#/utils/format-relative-time";

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

interface HistoryChange {
	field: string;
	from: string | number | null;
	to: string | number | null;
	label?: string;
}

interface HistoryEntry {
	id: string;
	event: string;
	action: string;
	createdAt: string;
	actorType: string | null;
	actorId: string | null;
	actorName: string | null;
	actorImage: string | null;
	title: string;
	summary: string | null;
	changes: HistoryChange[] | null;
	requestBody: Record<string, unknown> | null;
	metadata: Record<string, unknown>;
}

interface ContactHistoryResponse {
	object: "contact_history";
	contactId: string;
	data: HistoryEntry[];
	total: number;
	page: number;
	limit: number;
}

export type ActivityFilter = "all" | "emails";

// ─── Formatting Helpers ──────────────────────────────────────────────────────

/** Compact time: "4h ago", "2d ago" */
function formatCompactTime(date: string | Date): string {
	const target = new Date(date).getTime();
	if (Number.isNaN(target)) return "—";

	const diffSec = Math.max(0, Math.floor((Date.now() - target) / 1000));
	if (diffSec < 45) return "just now";
	if (diffSec < 60) return `${diffSec}s ago`;

	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m ago`;

	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h ago`;

	const diffDay = Math.floor(diffHr / 24);
	if (diffDay < 7) return `${diffDay}d ago`;
	if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;

	const diffMonth = Math.floor(diffDay / 30);
	if (diffMonth < 12) return `${diffMonth}mo ago`;
	return `${Math.floor(diffMonth / 12)}y ago`;
}

function dayKey(date: string | Date): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "unknown";
	return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** "FRIDAY, SEPTEMBER 11, 2026" */
function formatDayHeader(date: string | Date): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "—";
	const now = new Date();
	const withYear = d.getFullYear() !== now.getFullYear();
	return d
		.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			...(withYear ? { year: "numeric" } : {}),
		})
		.toUpperCase();
}

/** "6:19 pm" */
function formatTimeAmPm(date: string | Date): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "—";
	return d
		.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
		.toLowerCase();
}

function formatRowDate(date: string): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getActorAttribution(entry: HistoryEntry): string | null {
	if (entry.actorName) {
		if (entry.actorType === "api_key") {
			return `via API Key "${entry.actorName}"`;
		}
		if (entry.actorType === "user") {
			return `by ${entry.actorName}`;
		}
		if (entry.actorType === "workflow") {
			return `via Workflow "${entry.actorName}"`;
		}
		return `by ${entry.actorName}`;
	}
	if (entry.actorType === "api_key") return "via API";
	if (entry.actorType === "system") return "via System";
	return null;
}

function getGroupDetails(entry: HistoryEntry): {
	name: string;
	id: string | null;
} {
	const changes = entry.changes ?? [];
	const group = changes.find((c) => c.field === "group");
	const fromChanges = group?.to ?? group?.from;
	const meta = entry.metadata ?? {};
	const body = (entry.requestBody ?? {}) as Record<string, unknown>;

	const name =
		(fromChanges !== null &&
		fromChanges !== undefined &&
		String(fromChanges).trim() !== ""
			? String(fromChanges)
			: null) ||
		(typeof meta.groupName === "string" && meta.groupName) ||
		(typeof meta.name === "string" && meta.name) ||
		(typeof body.groupName === "string" && body.groupName) ||
		(typeof meta.groupId === "string" && meta.groupId) ||
		"Group";

	const id =
		(typeof meta.groupId === "string" && meta.groupId) ||
		(typeof meta.id === "string" && meta.id) ||
		(typeof body.group_id === "string" && (body.group_id as string)) ||
		null;

	return { name, id };
}

function getChannelDetails(entry: HistoryEntry): {
	name: string;
	id: string | null;
	isOptOut: boolean;
} {
	const changes = entry.changes ?? [];
	const channel = changes.find((c) => c.field === "channel");
	const sub = changes.find((c) => c.field === "channel_subscription");
	const fromChanges = channel?.to ?? channel?.from;
	const meta = entry.metadata ?? {};
	const body = (entry.requestBody ?? {}) as Record<string, unknown>;

	const name =
		(fromChanges !== null &&
		fromChanges !== undefined &&
		String(fromChanges).trim() !== ""
			? String(fromChanges)
			: null) ||
		(typeof meta.channelName === "string" && meta.channelName) ||
		(typeof meta.name === "string" && meta.name) ||
		(typeof meta.channelId === "string" && meta.channelId) ||
		"Channel";

	const id =
		(typeof meta.channelId === "string" && meta.channelId) ||
		(typeof body.channel_id === "string" && (body.channel_id as string)) ||
		null;

	const to = String(sub?.to ?? meta.subscription ?? "").toLowerCase();
	const isOptOut =
		entry.action === "removed_from_channel" ||
		to === "opt_out" ||
		to === "unenrolled" ||
		to === "unsubscribed";

	return { name, id, isOptOut };
}

const getEmailStatusColorClass = (status: string): string => {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "text-success-base";
		case "failed":
		case "bounced":
		case "spam":
			return "text-error-base";
		case "pending":
		case "scheduled":
			return "text-warning-base";
		case "opened":
			return "text-information-base";
		case "clicked":
			return "text-feature-base";
		default:
			return "text-text-sub-600";
	}
};

const getEmailStatusIcon = (status: string): IconName => {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "check-circle";
		case "failed":
		case "bounced":
		case "spam":
			return "minus-circle";
		case "pending":
		case "scheduled":
			return "clock";
		case "opened":
			return "eye-outline";
		case "clicked":
			return "cursor-click";
		default:
			return "mail-single";
	}
};

const getEmailStatusLabel = (status: string): string => {
	switch (status.toLowerCase()) {
		case "delivered":
			return "Delivered";
		case "sent":
			return "Sent";
		case "failed":
			return "Failed";
		case "bounced":
			return "Bounced";
		case "spam":
			return "Spam";
		case "pending":
			return "Pending";
		case "scheduled":
			return "Scheduled";
		case "opened":
			return "Opened";
		case "clicked":
			return "Clicked";
		default:
			return status;
	}
};

function getEmailStatus(entry: ActivityEntry): string {
	const types = new Set(entry.events.map((e) => e.type));
	if (types.has("complaint") || entry.status === "spam") return "spam";
	if (types.has("bounced") || entry.status === "bounced") return "bounced";
	if (types.has("failed") || entry.failedAt || entry.status === "failed")
		return "failed";
	if (types.has("clicked")) return "clicked";
	if (types.has("opened")) return "opened";
	if (types.has("delivered") || entry.deliveredAt) return "delivered";
	if (entry.status === "pending" || entry.status === "scheduled")
		return entry.status === "scheduled" ? "scheduled" : "pending";
	return entry.status || "sent";
}

/** Exact stroke checkmark matching the pricing page geometry, scaled to standard 24x24 icon grid */
function PricingCheckmark({
	className,
	strokeWidth = 2,
}: {
	className?: string;
	strokeWidth?: number;
}) {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			className={cn("shrink-0", className)}
			aria-hidden="true"
		>
			<path
				d="M4.5 12.5L9.5 17.5L19.5 7.5"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
}

/** Status indicator matching the main Emails page (`email-table.tsx`) */
function EmailStatusIndicator({
	status,
	className,
}: {
	status: string;
	className?: string;
}) {
	const normalized = status.toLowerCase();
	return (
		<div className="flex items-center">
			<div
				className={cn(
					"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
					getEmailStatusColorClass(normalized),
					className,
				)}
			>
				<Icon
					name={getEmailStatusIcon(normalized)}
					className="h-3.5 w-3.5 shrink-0"
				/>
				{getEmailStatusLabel(normalized)}
			</div>
		</div>
	);
}

function EmailStatusLabel({ entry }: { entry: ActivityEntry }) {
	const status = getEmailStatus(entry);
	return <EmailStatusIndicator status={status} />;
}

// ─── Diff & Property Components ──────────────────────────────────────────────

function PropertyDiffList({ changes }: { changes: HistoryChange[] }) {
	const [expanded, setExpanded] = useState(false);

	const validChanges = changes.filter(
		(c) =>
			c.field &&
			(c.to !== null ||
				c.from !== null ||
				c.label !== undefined ||
				c.field !== ""),
	);

	if (validChanges.length === 0) {
		return null;
	}

	const displayChanges = expanded ? validChanges : validChanges.slice(0, 3);
	const remaining = validChanges.length - 3;

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex flex-wrap items-center gap-1.5">
				{displayChanges.map((change, idx) => {
					const rawLabel =
						change.label ||
						(change.field.startsWith("properties.")
							? change.field.replace("properties.", "")
							: change.field);
					const formattedLabel = rawLabel
						.replace(/([A-Z])/g, " $1")
						.replace(/^./, (str) => str.toUpperCase())
						.trim();

					const hasFrom =
						change.from !== null &&
						change.from !== undefined &&
						String(change.from).trim() !== "" &&
						String(change.from).trim() !== "—";
					const hasTo =
						change.to !== null &&
						change.to !== undefined &&
						String(change.to).trim() !== "" &&
						String(change.to).trim() !== "—";

					return (
						<span
							key={`${change.field}-${idx}`}
							className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-bg-weak-50 px-2 py-0.5 font-mono text-paragraph-xs dark:bg-bg-weak-50/60"
						>
							<span className="font-medium font-sans text-text-sub-600">
								{formattedLabel}:
							</span>
							{hasFrom && hasTo ? (
								<span className="inline-flex items-center gap-1">
									<span className="max-w-[120px] truncate text-text-soft-400 line-through">
										{String(change.from)}
									</span>
									<span className="text-text-soft-400">→</span>
									<span className="max-w-[140px] truncate font-medium text-text-strong-950">
										{String(change.to)}
									</span>
								</span>
							) : hasTo ? (
								<span className="max-w-[160px] truncate font-medium text-text-strong-950">
									{String(change.to)}
								</span>
							) : hasFrom ? (
								<span className="text-text-soft-400">
									cleared (was {String(change.from)})
								</span>
							) : (
								<span className="font-medium text-text-strong-950">
									updated
								</span>
							)}
						</span>
					);
				})}
			</div>
			{validChanges.length > 3 && (
				<button
					type="button"
					onClick={() => setExpanded(!expanded)}
					className="w-fit cursor-pointer font-medium text-[11px] text-text-sub-600 hover:text-text-strong-950"
				>
					{expanded ? "Show less" : `+${remaining} more properties`}
				</button>
			)}
		</div>
	);
}

// ─── Timeline Card Components ────────────────────────────────────────────────

const timelineCardClass = "relative py-2";

function TimelineMeta({
	createdAt,
	actor,
}: {
	createdAt: string;
	actor?: string | null;
}) {
	return (
		<div className="flex shrink-0 items-center gap-1.5 text-paragraph-xs text-text-soft-400">
			{actor && (
				<>
					<span
						className="max-w-[130px] truncate font-medium text-text-sub-600 sm:max-w-[180px]"
						title={actor}
					>
						{actor}
					</span>
					<span className="text-text-soft-400/80">·</span>
				</>
			)}
			<span className="font-medium text-text-sub-600 tabular-nums">
				{formatTimeAmPm(createdAt)}
			</span>
			<span className="text-text-soft-400/80">·</span>
			<span className="tabular-nums">{formatCompactTime(createdAt)}</span>
		</div>
	);
}

function TimelineItemWrapper({
	isLast,
	node,
	children,
}: {
	isLast: boolean;
	node: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="relative flex items-start gap-2.5">
			{/* Connector line to next item */}
			{!isLast && (
				<div
					aria-hidden="true"
					className="-bottom-1.5 -translate-x-1/2 absolute top-[18px] left-3 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/40"
				/>
			)}

			{/* Node icon */}
			<div className="relative z-10 mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-white-0 dark:bg-bg-weak-50">
				{node}
			</div>

			{/* Card content */}
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}

function EmailTimelineCard({
	entry,
	contactEmail,
	isLast,
}: {
	entry: ActivityEntry;
	contactEmail: string;
	isLast: boolean;
}) {
	const status = getEmailStatus(entry);
	const subject = entry.subject?.trim() || "(No Subject)";
	const recipient = entry.toEmails?.[0] || contactEmail;
	const timestamp = entry.sentAt ?? entry.createdAt;

	return (
		<TimelineItemWrapper
			isLast={isLast}
			node={
				<Icon
					name="mail-single"
					className={cn("size-3.5", getEmailStatusColorClass(status))}
				/>
			}
		>
			<div className={timelineCardClass}>
				{/* Main line: Subject + Status indicator, and Timestamp */}
				<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
					<div className="flex min-w-0 flex-wrap items-center gap-2.5">
						<Link
							href={`/emails/${entry.id}`}
							className="truncate font-medium text-paragraph-sm text-text-strong-950 hover:text-primary-base hover:underline"
						>
							{subject}
						</Link>
						<EmailStatusIndicator
							status={status}
							className="gap-1.5 font-medium text-xs"
						/>
					</div>

					<TimelineMeta createdAt={timestamp} />
				</div>

				{/* Metadata line: sender, recipient, and view link */}
				<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-paragraph-xs text-text-soft-400">
					{entry.fromEmail && (
						<>
							<span>
								from{" "}
								<span className="font-mono text-text-sub-600">
									{entry.fromEmail}
								</span>
							</span>
							<span>·</span>
						</>
					)}
					<span>
						to <span className="font-mono text-text-sub-600">{recipient}</span>
					</span>
					<span>·</span>
					<Link
						href={`/emails/${entry.id}`}
						className="inline-flex items-center gap-0.5 font-medium text-text-sub-600 hover:text-text-strong-950"
					>
						<span>View email</span>
						<Icon name="arrow-up-right" className="size-3" />
					</Link>
				</div>
			</div>
		</TimelineItemWrapper>
	);
}

function GroupTimelineCard({
	entry,
	isLast,
}: {
	entry: HistoryEntry;
	isLast: boolean;
}) {
	const { name: groupName, id: groupId } = getGroupDetails(entry);
	const isRemoved = entry.action === "removed_from_group";
	const actor = getActorAttribution(entry);

	return (
		<TimelineItemWrapper
			isLast={isLast}
			node={
				<Icon
					name="modules"
					className={cn(
						"size-3.5",
						isRemoved ? "text-error-base" : "text-blue-600 dark:text-blue-400",
					)}
				/>
			}
		>
			<div className={timelineCardClass}>
				{/* Top Header */}
				<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{isRemoved ? "Removed from" : "Added to"}
						</span>

						{groupId ? (
							<Link
								href={`/contacts/groups/${groupId}`}
								className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-strong-950 hover:text-primary-base"
							>
								<Icon name="modules" className="size-3 text-text-sub-600" />
								<span className="underline decoration-dotted underline-offset-2">
									{groupName}
								</span>
							</Link>
						) : (
							<span className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-strong-950">
								<Icon name="modules" className="size-3 text-text-sub-600" />
								<span>{groupName}</span>
							</span>
						)}

						<span className="font-medium text-paragraph-sm text-text-strong-950">
							group
						</span>
					</div>

					<TimelineMeta createdAt={entry.createdAt} actor={actor} />
				</div>
			</div>
		</TimelineItemWrapper>
	);
}

function ChannelTimelineCard({
	entry,
	isLast,
}: {
	entry: HistoryEntry;
	isLast: boolean;
}) {
	const {
		name: channelName,
		id: channelId,
		isOptOut,
	} = getChannelDetails(entry);
	const actor = getActorAttribution(entry);

	return (
		<TimelineItemWrapper
			isLast={isLast}
			node={
				<Icon
					name="notification-indicator"
					className={cn(
						"size-3.5",
						isOptOut
							? "text-warning-base"
							: "text-purple-600 dark:text-purple-400",
					)}
				/>
			}
		>
			<div className={timelineCardClass}>
				{/* Top Header */}
				<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{isOptOut ? "Opted out of" : "Subscribed to"}
						</span>

						{channelId ? (
							<Link
								href={`/contacts?channelId=${channelId}`}
								className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-strong-950 hover:text-primary-base"
							>
								<Icon
									name="notification-indicator"
									className="size-3 text-text-sub-600"
								/>
								<span className="underline decoration-dotted underline-offset-2">
									{channelName}
								</span>
							</Link>
						) : (
							<span className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-strong-950">
								<Icon
									name="notification-indicator"
									className="size-3 text-text-sub-600"
								/>
								<span>{channelName}</span>
							</span>
						)}

						<span className="font-medium text-paragraph-sm text-text-strong-950">
							channel
						</span>
					</div>

					<TimelineMeta createdAt={entry.createdAt} actor={actor} />
				</div>
			</div>
		</TimelineItemWrapper>
	);
}

function ProfileUpdateTimelineCard({
	entry,
	isLast,
}: {
	entry: HistoryEntry;
	isLast: boolean;
}) {
	const changes = entry.changes ?? [];
	const actor = getActorAttribution(entry);

	const onlyCustomProps =
		changes.length > 0 &&
		changes.every((c) => c.field.startsWith("properties."));
	const title = onlyCustomProps
		? "Updated custom properties"
		: "Updated contact details";

	return (
		<TimelineItemWrapper
			isLast={isLast}
			node={
				<Icon
					name="user"
					className="size-3.5 text-amber-600 dark:text-amber-400"
				/>
			}
		>
			<div className={timelineCardClass}>
				{/* Top Header */}
				<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
					<span className="font-medium text-paragraph-sm text-text-strong-950">
						{title}
					</span>

					<TimelineMeta createdAt={entry.createdAt} actor={actor} />
				</div>

				{/* Middle: Diffs */}
				{changes.length > 0 && (
					<div className="mt-2.5">
						<PropertyDiffList changes={changes} />
					</div>
				)}
			</div>
		</TimelineItemWrapper>
	);
}

function ContactCreatedTimelineCard({
	createdAt,
	actor,
	isLast,
}: {
	createdAt: string;
	actor?: string | null;
	isLast: boolean;
}) {
	return (
		<TimelineItemWrapper
			isLast={isLast}
			node={
				<PricingCheckmark
					className="size-3.5 text-success-base"
					strokeWidth={2}
				/>
			}
		>
			<div className={timelineCardClass}>
				{/* Top Header */}
				<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
					<span className="font-medium text-paragraph-sm text-text-strong-950">
						Contact created
					</span>

					<TimelineMeta
						createdAt={createdAt}
						actor={actor || "Created in Reloop"}
					/>
				</div>
			</div>
		</TimelineItemWrapper>
	);
}

function GenericHistoryTimelineCard({
	entry,
	isLast,
}: {
	entry: HistoryEntry;
	isLast: boolean;
}) {
	const actor = getActorAttribution(entry);
	const title = entry.title || `Contact ${entry.action.replaceAll("_", " ")}`;

	return (
		<TimelineItemWrapper
			isLast={isLast}
			node={<Icon name="activity" className="size-3.5 text-text-sub-600" />}
		>
			<div className={timelineCardClass}>
				<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
					<span className="font-medium text-paragraph-sm text-text-strong-950">
						{title}
					</span>

					<TimelineMeta createdAt={entry.createdAt} actor={actor} />
				</div>

				{entry.summary && (
					<p className="mt-2 text-paragraph-xs text-text-sub-600">
						{entry.summary}
					</p>
				)}
			</div>
		</TimelineItemWrapper>
	);
}

function HistoryTimelineCard({
	entry,
	isLast,
}: {
	entry: HistoryEntry;
	isLast: boolean;
}) {
	switch (entry.action) {
		case "added_to_group":
		case "removed_from_group":
			return <GroupTimelineCard entry={entry} isLast={isLast} />;
		case "added_to_channel":
		case "updated_channel":
		case "removed_from_channel":
			return <ChannelTimelineCard entry={entry} isLast={isLast} />;
		case "updated":
			return <ProfileUpdateTimelineCard entry={entry} isLast={isLast} />;
		case "created":
			return (
				<ContactCreatedTimelineCard
					createdAt={entry.createdAt}
					actor={getActorAttribution(entry)}
					isLast={isLast}
				/>
			);
		default:
			return <GenericHistoryTimelineCard entry={entry} isLast={isLast} />;
	}
}

// ─── Skeletons & Empty States ────────────────────────────────────────────────

function TimelineSkeleton() {
	return (
		<div className="flex flex-col gap-8">
			<div>
				<Skeleton className="h-3.5 w-44 rounded" />
				<div className="mt-4 space-y-3.5">
					{Array.from({ length: 3 }).map((_, i) => (
						<TimelineItemWrapper
							key={`timeline-skel-${i}`}
							isLast={i === 2}
							node={<Skeleton className="size-3.5 rounded-full" />}
						>
							<div className={timelineCardClass}>
								<div className="flex items-center justify-between">
									<Skeleton className="h-4 w-36 rounded" />
									<Skeleton className="h-3 w-28 rounded" />
								</div>
							</div>
						</TimelineItemWrapper>
					))}
				</div>
			</div>
		</div>
	);
}

function CardEmpty({
	icon,
	title,
	body,
}: {
	icon: "mail" | "activity";
	title: string;
	body: string;
}) {
	return (
		<div className="flex flex-col items-center gap-1.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-12 text-center dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/10">
			<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
				<Icon
					name={icon === "mail" ? "mail-single" : "activity"}
					className="h-4 w-4 text-text-sub-600"
				/>
			</div>
			<p className="font-medium text-paragraph-sm text-text-strong-950">
				{title}
			</p>
			<p className="max-w-xs text-paragraph-xs text-text-soft-400">{body}</p>
		</div>
	);
}

const contactEmailGridStyle = {
	gridTemplateColumns: "minmax(0, 1fr) 140px 120px",
};

// ─── Main Component ──────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

interface ContactEmailHistoryProps {
	contactId: string;
	email: string;
	contactCreatedAt?: string;
	filter: ActivityFilter;
}

export function ContactEmailHistory({
	contactId,
	email,
	contactCreatedAt,
	filter,
}: ContactEmailHistoryProps) {
	const emailQuery = useInfiniteQuery({
		queryKey: queryKeys.contacts.activity(email),
		queryFn: async ({ pageParam }) => {
			const res = await fetch(
				`/api/logs/v1/emails/contact-activity?email=${encodeURIComponent(email)}&limit=${PAGE_SIZE}&page=${pageParam}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load contact activity");
			return res.json() as Promise<ContactActivityResponse>;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const loaded = lastPage.page * lastPage.limit;
			if (loaded >= lastPage.total) return undefined;
			return lastPage.page + 1;
		},
		enabled: !!email,
	});

	const historyQuery = useInfiniteQuery({
		queryKey: queryKeys.contacts.history(contactId),
		queryFn: async ({ pageParam }) => {
			const res = await fetch(
				`/api/logs/v1/contacts/${encodeURIComponent(contactId)}/history?limit=${PAGE_SIZE}&page=${pageParam}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load contact history");
			return res.json() as Promise<ContactHistoryResponse>;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const loaded = lastPage.page * lastPage.limit;
			if (loaded >= lastPage.total) return undefined;
			return lastPage.page + 1;
		},
		enabled: !!contactId,
	});

	const isError = emailQuery.isError && historyQuery.isError;
	const partialEmailError = emailQuery.isError && !historyQuery.isError;
	const partialHistoryError = historyQuery.isError && !emailQuery.isError;

	const entries = useMemo(
		() => emailQuery.data?.pages.flatMap((page) => page.data) ?? [],
		[emailQuery.data],
	);
	const historyEntries = useMemo(
		() => historyQuery.data?.pages.flatMap((page) => page.data) ?? [],
		[historyQuery.data],
	);

	const emailTotal = emailQuery.data?.pages[0]?.total ?? 0;
	const historyTotal = historyQuery.data?.pages[0]?.total ?? 0;
	const hasCreatedAudit = historyEntries.some((e) => e.action === "created");

	const showEmails = filter === "emails";
	const showMerged = filter === "all";

	const sortedEmails = useMemo(
		() =>
			[...entries].sort(
				(a, b) =>
					new Date(b.sentAt ?? b.createdAt).getTime() -
					new Date(a.sentAt ?? a.createdAt).getTime(),
			),
		[entries],
	);
	const sortedChanges = useMemo(
		() =>
			[...historyEntries].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			),
		[historyEntries],
	);

	const createdFallbackItem =
		contactCreatedAt && !hasCreatedAudit
			? { id: "contact-created", timestamp: contactCreatedAt }
			: null;

	const emailsEmpty =
		!emailQuery.isPending && !emailQuery.isError && sortedEmails.length === 0;
	const changesEmpty =
		!historyQuery.isPending &&
		!historyQuery.isError &&
		sortedChanges.length === 0 &&
		!createdFallbackItem;

	const handleLoadMoreEmails = () => {
		void emailQuery.fetchNextPage();
	};
	const handleLoadMoreChanges = () => {
		void historyQuery.fetchNextPage();
	};

	return (
		<div className="flex flex-col gap-10">
			{(partialEmailError || partialHistoryError) && (
				<div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-error-light bg-error-lighter/50 px-4 py-3 dark:border-error-base/30 dark:bg-error-base/10">
					<p className="text-error-base text-paragraph-xs">
						{partialEmailError && partialHistoryError
							? "Couldn't load some activity."
							: partialEmailError
								? "Couldn't load email activity."
								: "Couldn't load profile changes."}
					</p>
					<Button.Root
						type="button"
						variant="error"
						mode="stroke"
						size="xxsmall"
						onClick={() => {
							if (partialEmailError) void emailQuery.refetch();
							if (partialHistoryError) void historyQuery.refetch();
						}}
					>
						Retry
					</Button.Root>
				</div>
			)}

			{/* ── Merged activity · Connected vertical timeline ── */}
			{showMerged && (
				<section>
					{emailQuery.isPending || historyQuery.isPending ? (
						<TimelineSkeleton />
					) : emailsEmpty && changesEmpty ? (
						<CardEmpty
							icon="activity"
							title="No activity yet"
							body="Emails sent, audience changes, and profile edits will appear here."
						/>
					) : (
						(() => {
							type MergedItem =
								| {
										kind: "email";
										id: string;
										createdAt: string;
										email: ActivityEntry;
								  }
								| {
										kind: "change";
										id: string;
										createdAt: string;
										entry: HistoryEntry;
								  }
								| { kind: "fallback"; id: string; createdAt: string };

							const merged: MergedItem[] = [
								...sortedEmails.map(
									(e) =>
										({
											kind: "email",
											id: `email-${e.id}`,
											createdAt: e.sentAt ?? e.createdAt,
											email: e,
										}) as const,
								),
								...(createdFallbackItem
									? [
											{
												kind: "fallback",
												id: "contact-created",
												createdAt: createdFallbackItem.timestamp,
											} as const,
										]
									: []),
								...sortedChanges.map(
									(entry) =>
										({
											kind: "change",
											id: `change-${entry.id}`,
											createdAt: entry.createdAt,
											entry,
										}) as const,
								),
							].sort(
								(a, b) =>
									new Date(b.createdAt).getTime() -
									new Date(a.createdAt).getTime(),
							);

							const groups = new Map<
								string,
								{ date: string; items: MergedItem[] }
							>();
							for (const item of merged) {
								const key = dayKey(item.createdAt);
								const g = groups.get(key);
								if (g) g.items.push(item);
								else groups.set(key, { date: item.createdAt, items: [item] });
							}

							return (
								<div className="flex flex-col gap-6">
									{[...groups.values()].map((group) => (
										<div key={dayKey(group.date)}>
											<h4 className="mb-2.5 font-semibold text-subheading-2xs text-text-sub-600 uppercase tracking-wider">
												{formatDayHeader(group.date)}
											</h4>

											<div className="space-y-1.5">
												{group.items.map((item, idx) => {
													const isLast = idx === group.items.length - 1;
													if (item.kind === "email") {
														return (
															<EmailTimelineCard
																key={item.id}
																entry={item.email}
																contactEmail={email}
																isLast={isLast}
															/>
														);
													}
													if (item.kind === "fallback") {
														return (
															<ContactCreatedTimelineCard
																key={item.id}
																createdAt={item.createdAt}
																isLast={isLast}
															/>
														);
													}
													return (
														<HistoryTimelineCard
															key={item.id}
															entry={item.entry}
															isLast={isLast}
														/>
													);
												})}
											</div>
										</div>
									))}

									{(emailQuery.hasNextPage || historyQuery.hasNextPage) && (
										<div className="flex flex-wrap items-center gap-3 pt-2">
											{emailQuery.hasNextPage && (
												<Button.Root
													type="button"
													variant="neutral"
													mode="stroke"
													size="xsmall"
													onClick={handleLoadMoreEmails}
													disabled={emailQuery.isFetchingNextPage}
													className="gap-1.5"
												>
													{emailQuery.isFetchingNextPage ? (
														"Loading…"
													) : (
														<>
															Load more emails
															<span className="text-text-soft-400 tabular-nums">
																({sortedEmails.length}/{emailTotal})
															</span>
														</>
													)}
												</Button.Root>
											)}
											{historyQuery.hasNextPage && (
												<Button.Root
													type="button"
													variant="neutral"
													mode="stroke"
													size="xsmall"
													onClick={handleLoadMoreChanges}
													disabled={historyQuery.isFetchingNextPage}
													className="gap-1.5"
												>
													{historyQuery.isFetchingNextPage ? (
														"Loading…"
													) : (
														<>
															Load more changes
															<span className="text-text-soft-400 tabular-nums">
																({sortedChanges.length}/{historyTotal})
															</span>
														</>
													)}
												</Button.Root>
											)}
										</div>
									)}
								</div>
							);
						})()
					)}
				</section>
			)}

			{/* ── Emails-only tab · Table view ── */}
			{showEmails && (
				<section>
					<div className="w-full text-paragraph-sm">
						<div
							style={contactEmailGridStyle}
							className="grid items-center rounded-t-[14px] border border-stroke-soft-100 bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
						>
							<div className="flex items-center gap-1">
								<Icon name="file-text" className="h-3 w-3" />
								<span className="text-xs">Subject</span>
							</div>
							<div className="flex items-center gap-1">
								<Icon name="check-circle" className="h-3 w-3" />
								<span className="text-xs">Status</span>
							</div>
							<div className="flex items-center gap-1">
								<Icon name="clock" className="h-3 w-3" />
								<span className="text-xs">Time</span>
							</div>
						</div>
						<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
							{emailQuery.isPending ? (
								Array.from({ length: 3 }).map((_, i) => (
									<div
										key={`email-skeleton-${i}`}
										style={contactEmailGridStyle}
										className="grid items-center px-4 py-2.5"
									>
										<div className="h-4 w-48 rounded bg-bg-weak-50" />
										<div className="flex items-center gap-2">
											<div className="h-3.5 w-3.5 rounded-full bg-bg-weak-50" />
											<div className="h-4 w-16 rounded bg-bg-weak-50" />
										</div>
										<div className="h-4 w-20 rounded bg-bg-weak-50" />
									</div>
								))
							) : emailQuery.isError ? (
								<div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
									<div className="flex h-9 w-9 items-center justify-center rounded-full border border-error-light bg-error-lighter">
										<Icon
											name="alert-circle"
											className="h-4 w-4 text-error-base"
										/>
									</div>
									<p className="font-medium text-paragraph-sm text-text-strong-950">
										Couldn&apos;t load emails
									</p>
									<Button.Root
										type="button"
										variant="neutral"
										mode="stroke"
										size="xsmall"
										onClick={() => void emailQuery.refetch()}
									>
										Retry
									</Button.Root>
								</div>
							) : emailsEmpty ? (
								<CardEmpty
									icon="mail"
									title="No emails yet"
									body={`Emails sent to ${email} will appear here.`}
								/>
							) : (
								<>
									{sortedEmails.map((entry) => {
										const subject = entry.subject?.trim() || "(No Subject)";
										return (
											<Link
												key={entry.id}
												href={`/emails/${entry.id}`}
												style={contactEmailGridStyle}
												className="grid w-full cursor-pointer items-center px-4 py-2.5 text-left hover:bg-bg-weak-50"
											>
												<span className="truncate font-medium text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2">
													{subject}
												</span>
												<EmailStatusLabel entry={entry} />
												<span
													className="whitespace-nowrap font-medium text-[13px] text-text-sub-600"
													title={formatRowDate(entry.sentAt ?? entry.createdAt)}
												>
													{formatRelativeTime(entry.sentAt ?? entry.createdAt)}
												</span>
											</Link>
										);
									})}
									{emailQuery.hasNextPage && (
										<button
											type="button"
											onClick={handleLoadMoreEmails}
											disabled={emailQuery.isFetchingNextPage}
											className="flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-3.5 font-medium text-[13px] text-text-sub-600 hover:bg-bg-weak-50/70 hover:text-text-strong-950"
										>
											{emailQuery.isFetchingNextPage ? (
												"Loading…"
											) : (
												<>
													Load more
													<span className="text-text-soft-400 tabular-nums">
														{sortedEmails.length}/{emailTotal}
													</span>
												</>
											)}
										</button>
									)}
								</>
							)}
						</div>
					</div>
				</section>
			)}

			{isError && (
				<div className="flex flex-col items-center gap-2 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-10 text-center dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/10">
					<div className="flex h-9 w-9 items-center justify-center rounded-full border border-error-light bg-error-lighter">
						<Icon name="alert-circle" className="h-4 w-4 text-error-base" />
					</div>
					<p className="font-medium text-paragraph-sm text-text-strong-950">
						Couldn&apos;t load activity
					</p>
					<p className="max-w-xs text-paragraph-xs text-text-soft-400">
						Something went wrong fetching activity for this contact.
					</p>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => {
							void emailQuery.refetch();
							void historyQuery.refetch();
						}}
					>
						Retry
					</Button.Root>
				</div>
			)}
		</div>
	);
}
