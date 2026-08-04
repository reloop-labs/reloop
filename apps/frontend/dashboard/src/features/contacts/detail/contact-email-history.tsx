"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { queryKeys } from "#/lib/query-keys";

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

type TimelineItem =
	| { kind: "email"; id: string; entry: ActivityEntry; timestamp: string }
	| { kind: "action"; id: string; entry: HistoryEntry; timestamp: string }
	| { kind: "contact_created"; id: string; timestamp: string };

type ActivityFilter = "all" | "changes" | "emails";

const ACTIVITY_FILTERS: { id: ActivityFilter; label: string }[] = [
	{ id: "all", label: "All" },
	{ id: "changes", label: "Changes" },
	{ id: "emails", label: "Emails" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatChangeValue(value: string | number | null): string {
	if (value === null || value === "") return "—";
	return String(value);
}

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

/** Resource type → icon used next to the target name */
const RESOURCE_ICON = {
	group: "users",
	channel: "notification-indicator",
	property: "modules",
	name: "user",
	email: "mail-single",
	status: "activity",
	profile: "edit",
	mail: "mail-single",
} as const;

type ActivityTarget = {
	label: string;
	icon?: string;
	href?: string;
};

type ActivityDescription = {
	phrase: string;
	/** One or more targets (group, property value, etc.) each with the right icon */
	targets: ActivityTarget[];
	marker: "arrow" | "circle";
};

/** Resolve group display name from changes or raw metadata. */
function groupLabel(entry: HistoryEntry): string {
	const changes = entry.changes ?? [];
	const group = changes.find((c) => c.field === "group");
	const fromChanges = group?.to ?? group?.from;
	if (fromChanges !== null && fromChanges !== undefined && fromChanges !== "") {
		return formatChangeValue(fromChanges);
	}
	const meta = entry.metadata ?? {};
	const body = entry.requestBody ?? {};
	const name =
		(typeof meta.groupName === "string" && meta.groupName) ||
		(typeof meta.name === "string" && meta.name) ||
		(typeof body.groupName === "string" && body.groupName) ||
		(typeof meta.groupId === "string" && meta.groupId) ||
		null;
	return name || "group";
}

/** Resolve channel display name from changes or raw metadata. */
function channelLabel(entry: HistoryEntry): string {
	const changes = entry.changes ?? [];
	const channel = changes.find((c) => c.field === "channel");
	const fromChanges = channel?.to ?? channel?.from;
	if (fromChanges !== null && fromChanges !== undefined && fromChanges !== "") {
		return formatChangeValue(fromChanges);
	}
	const meta = entry.metadata ?? {};
	const name =
		(typeof meta.channelName === "string" && meta.channelName) ||
		(typeof meta.name === "string" && meta.name) ||
		(typeof meta.channelId === "string" && meta.channelId) ||
		null;
	return name || "channel";
}

/**
 * Reference-style line copy with resource icons:
 * "Added to 👥 General" · "Opted in to ⚡ ddvs" · "company 📦 Acme"
 */
function describeHistory(entry: HistoryEntry): ActivityDescription {
	const changes = entry.changes ?? [];
	const sub = changes.find((c) => c.field === "channel_subscription");

	switch (entry.action) {
		case "created":
			return { phrase: "Contact created", targets: [], marker: "circle" };
		case "deleted":
			return { phrase: "Contact deleted", targets: [], marker: "circle" };
		case "added_to_group":
			return {
				phrase: "Added to",
				targets: [
					{ label: groupLabel(entry), icon: RESOURCE_ICON.group },
				],
				marker: "arrow",
			};
		case "removed_from_group":
			return {
				phrase: "Removed from",
				targets: [
					{ label: groupLabel(entry), icon: RESOURCE_ICON.group },
				],
				marker: "arrow",
			};
		case "added_to_channel":
			return {
				phrase: "Opted in to",
				targets: [
					{ label: channelLabel(entry), icon: RESOURCE_ICON.channel },
				],
				marker: "arrow",
			};
		case "updated_channel": {
			const to = String(sub?.to ?? "").toLowerCase();
			const label = channelLabel(entry);
			const isOut =
				to === "opt_out" ||
				to === "unenrolled" ||
				to === "unsubscribed";
			return {
				phrase: isOut ? "Opted out of" : "Opted in to",
				targets: [{ label, icon: RESOURCE_ICON.channel }],
				marker: "arrow",
			};
		}
		case "updated": {
			const fields = new Set(changes.map((c) => c.field));
			if (fields.size === 0) {
				return {
					phrase: "Profile updated",
					targets: [],
					marker: "arrow",
				};
			}

			// Name fields
			if (
				[...fields].every((f) => f === "firstName" || f === "lastName") &&
				fields.size > 0
			) {
				const parts = changes
					.filter((c) => c.field === "firstName" || c.field === "lastName")
					.map((c) => formatChangeValue(c.to))
					.filter((v) => v !== "—");
				return {
					phrase: "Name updated",
					targets:
						parts.length > 0
							? [{ label: parts.join(" "), icon: RESOURCE_ICON.name }]
							: [],
					marker: "arrow",
				};
			}

			// Email field
			if (fields.size === 1 && fields.has("email")) {
				const email = changes.find((c) => c.field === "email");
				return {
					phrase: "Email updated",
					targets: email
						? [
								{
									label: formatChangeValue(email.to),
									icon: RESOURCE_ICON.email,
								},
							]
						: [],
					marker: "arrow",
				};
			}

			// Subscription status
			if (fields.size === 1 && fields.has("status")) {
				const status = changes.find((c) => c.field === "status");
				return {
					phrase: "Status changed",
					targets: status
						? [
								{
									label: formatChangeValue(status.to),
									icon: RESOURCE_ICON.status,
								},
							]
						: [],
					marker: "arrow",
				};
			}

			// Custom properties — show each property with modules icon
			const propertyChanges = changes.filter((c) =>
				c.field.startsWith("properties."),
			);
			if (
				propertyChanges.length > 0 &&
				propertyChanges.length === changes.length
			) {
				if (propertyChanges.length === 1) {
					const c = propertyChanges[0]!;
					const propName = c.label ?? c.field.replace("properties.", "");
					const value = formatChangeValue(c.to);
					return {
						phrase: "Property updated",
						targets: [
							{
								label: value !== "—" ? `${propName}: ${value}` : propName,
								icon: RESOURCE_ICON.property,
							},
						],
						marker: "arrow",
					};
				}
				return {
					phrase: "Properties updated",
					targets: propertyChanges.slice(0, 3).map((c) => ({
						label: c.label ?? c.field.replace("properties.", ""),
						icon: RESOURCE_ICON.property,
					})),
					marker: "arrow",
				};
			}

			// Mixed / generic field update — pick icon from field type
			if (fields.size === 1) {
				const c = changes[0]!;
				const icon = c.field.startsWith("properties.")
					? RESOURCE_ICON.property
					: c.field === "email"
						? RESOURCE_ICON.email
						: c.field === "status"
							? RESOURCE_ICON.status
							: c.field === "group"
								? RESOURCE_ICON.group
								: c.field === "channel"
									? RESOURCE_ICON.channel
									: RESOURCE_ICON.profile;
				return {
					phrase: `${c.label ?? "Field"} updated`,
					targets:
						c.to !== null
							? [{ label: formatChangeValue(c.to), icon }]
							: [],
					marker: "arrow",
				};
			}

			// Mixed update: render a target per change type
			const targets: ActivityTarget[] = changes.slice(0, 4).map((c) => {
				if (c.field.startsWith("properties.")) {
					return {
						label: c.label ?? c.field.replace("properties.", ""),
						icon: RESOURCE_ICON.property,
					};
				}
				if (c.field === "email") {
					return {
						label: formatChangeValue(c.to),
						icon: RESOURCE_ICON.email,
					};
				}
				if (c.field === "status") {
					return {
						label: formatChangeValue(c.to),
						icon: RESOURCE_ICON.status,
					};
				}
				if (c.field === "firstName" || c.field === "lastName") {
					return {
						label: formatChangeValue(c.to),
						icon: RESOURCE_ICON.name,
					};
				}
				if (c.field === "group") {
					return {
						label: formatChangeValue(c.to ?? c.from),
						icon: RESOURCE_ICON.group,
					};
				}
				if (c.field === "channel") {
					return {
						label: formatChangeValue(c.to ?? c.from),
						icon: RESOURCE_ICON.channel,
					};
				}
				return {
					label: formatChangeValue(c.to ?? c.label ?? c.field),
					icon: RESOURCE_ICON.profile,
				};
			});

			return {
				phrase: "Profile updated",
				targets,
				marker: "arrow",
			};
		}
		default:
			return { phrase: entry.title, targets: [], marker: "arrow" };
	}
}

function describeEmail(entry: ActivityEntry): ActivityDescription {
	const subject = entry.subject?.trim() || "(no subject)";
	const types = new Set(entry.events.map((e) => e.type));

	let phrase = "Email sent";
	if (types.has("complaint") || entry.status === "spam") phrase = "Email spam";
	else if (types.has("bounced") || entry.status === "bounced")
		phrase = "Email bounced";
	else if (types.has("failed") || entry.failedAt || entry.status === "failed")
		phrase = "Email failed";
	else if (types.has("clicked")) phrase = "Email clicked";
	else if (types.has("opened")) phrase = "Email opened";
	else if (types.has("delivered") || entry.deliveredAt)
		phrase = "Email delivered";
	else if (entry.status === "pending") phrase = "Email pending";

	return {
		phrase,
		targets: [
			{
				label: subject,
				icon: RESOURCE_ICON.mail,
				href: `/emails/${entry.id}`,
			},
		],
		marker: "arrow",
	};
}

function buildTimelineItems(
	entries: ActivityEntry[],
	historyEntries: HistoryEntry[],
	contactCreatedAt?: string,
): TimelineItem[] {
	const items: TimelineItem[] = [
		...entries.map((entry) => ({
			kind: "email" as const,
			id: `email-${entry.id}`,
			entry,
			timestamp: entry.createdAt,
		})),
		...historyEntries.map((entry) => ({
			kind: "action" as const,
			id: `action-${entry.id}`,
			entry,
			timestamp: entry.createdAt,
		})),
	];

	const hasCreatedAction = historyEntries.some((e) => e.action === "created");
	if (contactCreatedAt && !hasCreatedAction) {
		items.push({
			kind: "contact_created",
			id: "contact-created",
			timestamp: contactCreatedAt,
		});
	}

	items.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	);

	return items;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

function SpineMarker({
	marker,
	isLast,
}: {
	marker: "arrow" | "circle";
	isLast: boolean;
}) {
	return (
		<div className="relative flex w-5 shrink-0 flex-col items-center self-stretch">
			<div className="relative z-10 flex h-5 w-5 items-center justify-center text-text-soft-400">
				{marker === "circle" ? (
					<span className="block h-2 w-2 rounded-full border border-text-soft-400 dark:border-white/35" />
				) : (
					<Icon name="arrow-up-right" className="h-3.5 w-3.5" />
				)}
			</div>
			{!isLast && (
				<div
					className="absolute top-5 bottom-0 w-px bg-stroke-soft-200 dark:bg-white/15"
					aria-hidden
				/>
			)}
		</div>
	);
}

function TargetLink({ target }: { target: ActivityTarget }) {
	// Icon sits outside the underline so group/channel icons stay clear
	const label = (
		<span className="truncate font-medium text-text-strong-950 underline decoration-stroke-soft-200 decoration-dashed underline-offset-[5px] transition-colors group-hover:text-primary-base group-hover:decoration-primary-base/50 dark:decoration-white/25">
			{target.label}
		</span>
	);

	const inner = (
		<span className="group inline-flex max-w-[260px] items-center gap-1.5">
			{target.icon ? (
				<Icon
					name={target.icon as Parameters<typeof Icon>[0]["name"]}
					className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
					aria-hidden
				/>
			) : null}
			{label}
		</span>
	);

	if (target.href) {
		return (
			<Link href={target.href} className="min-w-0">
				{inner}
			</Link>
		);
	}
	return inner;
}

/**
 * Reference row:
 * ↗  Added to  👥 General          4h ago
 * ○  Contact created               4h ago
 */
function ActivityLine({
	isLast,
	phrase,
	targets,
	marker,
	timestamp,
	href,
}: {
	isLast: boolean;
	phrase: string;
	targets?: ActivityTarget[];
	marker: "arrow" | "circle";
	timestamp: string;
	href?: string;
}) {
	const phraseNode = href ? (
		<Link
			href={href}
			className="text-paragraph-sm text-text-strong-950 transition-colors hover:text-primary-base"
		>
			{phrase}
		</Link>
	) : (
		<span className="text-paragraph-sm text-text-strong-950">{phrase}</span>
	);

	return (
		<div className="flex gap-2.5">
			<SpineMarker marker={marker} isLast={isLast} />
			<div
				className={cn(
					"flex min-w-0 flex-1 items-baseline justify-between gap-3",
					isLast ? "pb-0.5" : "pb-3.5",
				)}
			>
				<div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-px text-paragraph-sm leading-snug">
					{phraseNode}
					{targets?.map((t, i) => (
						<TargetLink key={`${t.label}-${i}`} target={t} />
					))}
				</div>
				<span className="shrink-0 text-paragraph-xs text-text-soft-400 tabular-nums">
					{formatCompactTime(timestamp)}
				</span>
			</div>
		</div>
	);
}

function ActionActivityRow({
	entry,
	isLast,
}: {
	entry: HistoryEntry;
	isLast: boolean;
}) {
	const { phrase, targets, marker } = describeHistory(entry);
	return (
		<ActivityLine
			isLast={isLast}
			phrase={phrase}
			targets={targets}
			marker={marker}
			timestamp={entry.createdAt}
			href={`/logs?log=${entry.id}`}
		/>
	);
}

function EmailActivityRow({
	entry,
	isLast,
}: {
	entry: ActivityEntry;
	isLast: boolean;
}) {
	const { phrase, targets, marker } = describeEmail(entry);
	return (
		<ActivityLine
			isLast={isLast}
			phrase={phrase}
			targets={targets}
			marker={marker}
			timestamp={entry.createdAt}
			href={`/emails/${entry.id}`}
		/>
	);
}

function ContactCreatedRow({
	timestamp,
	isLast,
}: {
	timestamp: string;
	isLast: boolean;
}) {
	return (
		<ActivityLine
			isLast={isLast}
			phrase="Contact created"
			marker="circle"
			timestamp={timestamp}
		/>
	);
}

function ActivitySkeleton() {
	return (
		<div className="space-y-3.5">
			{Array.from({ length: 4 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
				<div key={i} className="flex gap-2.5">
					<div className="flex h-5 w-5 shrink-0 items-center justify-center">
						<Skeleton className="h-3 w-3 rounded-sm" />
					</div>
					<div className="flex flex-1 items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<Skeleton className="h-3.5 w-20 rounded" />
							<Skeleton className="h-3.5 w-24 rounded" />
						</div>
						<Skeleton className="h-3 w-12 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}

// ─── Main ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

interface ContactEmailHistoryProps {
	contactId: string;
	email: string;
	contactCreatedAt?: string;
}

export function ContactEmailHistory({
	contactId,
	email,
	contactCreatedAt,
}: ContactEmailHistoryProps) {
	const [filter, setFilter] = useState<ActivityFilter>("all");

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

	const isLoading = emailQuery.isPending || historyQuery.isPending;
	const isError = emailQuery.isError && historyQuery.isError;
	const isFetchingNextPage =
		emailQuery.isFetchingNextPage || historyQuery.isFetchingNextPage;

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
	const createdFallback = contactCreatedAt && !hasCreatedAudit ? 1 : 0;
	const changesTotal = historyTotal + createdFallback;
	const total = emailTotal + changesTotal;

	const items = useMemo(() => {
		const emailItems = filter === "changes" ? [] : entries;
		const actionItems = filter === "emails" ? [] : historyEntries;
		const createdAt = filter === "emails" ? undefined : contactCreatedAt;
		return buildTimelineItems(emailItems, actionItems, createdAt);
	}, [entries, historyEntries, contactCreatedAt, filter]);

	const showEmpty = !isLoading && !isError && items.length === 0;

	const emptyCopy = (() => {
		if (filter === "changes") {
			return {
				title: "No profile changes yet",
				body: "Edits to name, status, properties, groups, and channels will show up here.",
			};
		}
		if (filter === "emails") {
			return {
				title: "No emails yet",
				body: `Emails sent to ${email} will appear here.`,
			};
		}
		return {
			title: "No activity yet",
			body: `Profile changes and emails for ${email} will appear here.`,
		};
	})();

	const handleLoadMore = () => {
		if (filter !== "changes" && emailQuery.hasNextPage) {
			void emailQuery.fetchNextPage();
		}
		if (filter !== "emails" && historyQuery.hasNextPage) {
			void historyQuery.fetchNextPage();
		}
	};

	const showLoadMore =
		(filter === "all" &&
			!!(emailQuery.hasNextPage || historyQuery.hasNextPage)) ||
		(filter === "emails" && !!emailQuery.hasNextPage) ||
		(filter === "changes" && !!historyQuery.hasNextPage);

	const visibleCount =
		filter === "all"
			? total
			: filter === "emails"
				? emailTotal
				: changesTotal;

	return (
		<div className="mt-12 pb-12">
			{/* Section header */}
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight">
						Activity
					</h3>
					{!isLoading && visibleCount > 0 && (
						<span className="rounded-full bg-neutral-alpha-10 px-2 py-0.5 font-medium text-[11px] text-text-sub-600 tabular-nums">
							{visibleCount}
						</span>
					)}
				</div>

				<div
					className="flex flex-wrap gap-1"
					role="tablist"
					aria-label="Activity filters"
				>
					{ACTIVITY_FILTERS.map((chip) => {
						const active = filter === chip.id;
						const count =
							chip.id === "all"
								? total
								: chip.id === "emails"
									? emailTotal
									: changesTotal;
						return (
							<button
								key={chip.id}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setFilter(chip.id)}
								className={cn(
									"rounded-full px-2.5 py-1 font-medium text-[12px] transition-colors",
									active
										? "bg-text-strong-950 text-bg-white-0 dark:bg-white dark:text-black"
										: "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]",
								)}
							>
								{chip.label}
								{!isLoading && count > 0 ? (
									<span
										className={cn(
											"ml-1.5 tabular-nums",
											active ? "opacity-70" : "text-text-soft-400",
										)}
									>
										{count}
									</span>
								) : null}
							</button>
						);
					})}
				</div>
			</div>

			{/* Card shell matching reference */}
			<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-4 dark:border-white/10 dark:bg-white/[0.02]">
				{isLoading ? (
					<ActivitySkeleton />
				) : isError ? (
					<div className="flex flex-col items-center gap-2 py-8 text-center">
						<div className="flex h-9 w-9 items-center justify-center rounded-full border border-error-light bg-error-lighter">
							<Icon name="alert-circle" className="h-4 w-4 text-error-base" />
						</div>
						<p className="font-medium text-paragraph-sm text-text-strong-950">
							Couldn&apos;t load activity
						</p>
						<p className="max-w-xs text-paragraph-xs text-text-soft-400">
							Something went wrong fetching activity for this contact.
						</p>
					</div>
				) : showEmpty ? (
					<div className="flex flex-col items-center gap-2 py-8 text-center">
						<div className="flex h-9 w-9 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50">
							<Icon
								name={filter === "emails" ? "mail-single" : "activity"}
								className="h-4 w-4 text-text-sub-600"
							/>
						</div>
						<p className="font-medium text-paragraph-sm text-text-sub-600">
							{emptyCopy.title}
						</p>
						<p className="max-w-xs text-paragraph-xs text-text-soft-400">
							{emptyCopy.body}
						</p>
					</div>
				) : (
					<div>
						{items.map((item, index) => {
							const isLast = index === items.length - 1;

							if (item.kind === "email") {
								return (
									<EmailActivityRow
										key={item.id}
										entry={item.entry}
										isLast={isLast}
									/>
								);
							}

							if (item.kind === "action") {
								return (
									<ActionActivityRow
										key={item.id}
										entry={item.entry}
										isLast={isLast}
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

						{showLoadMore && (
							<div className="mt-3 ml-7">
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={handleLoadMore}
									disabled={isFetchingNextPage}
									className="gap-1.5"
								>
									{isFetchingNextPage ? (
										"Loading…"
									) : (
										<>
											Load more
											<span className="text-text-soft-400 tabular-nums">
												{items.length}/{visibleCount}
											</span>
										</>
									)}
								</Button.Root>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
