import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
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

type DisplayStatus =
	| "clicked"
	| "opened"
	| "delivered"
	| "sent"
	| "pending"
	| "failed"
	| "bounced"
	| "spam"
	| "archived";

interface ParsedLifecycle {
	hasOpened: boolean;
	openedCount: number;
	hasClicked: boolean;
	clickedCount: number;
	hasFailed: boolean;
	failedType: "failed" | "bounced" | "complaint" | null;
	failedReason: string | null;
	hasDelivered: boolean;
}

type TimelineItem =
	| { kind: "email"; id: string; entry: ActivityEntry; timestamp: string }
	| { kind: "contact_created"; id: string; timestamp: string };

interface DayGroup {
	key: string;
	label: string;
	items: TimelineItem[];
}

// ─── Status / visual config (AlignUI semantic tokens — matches email timeline) ─

type BadgeColor =
	| "blue"
	| "green"
	| "orange"
	| "red"
	| "yellow"
	| "purple"
	| "gray";

const STATUS_META: Record<
	DisplayStatus,
	{
		label: string;
		icon: string;
		badgeColor: BadgeColor;
	}
> = {
	// Matches EmailTimeline step colors + AlignUI Badge
	clicked: {
		label: "Clicked",
		icon: "cursor-click",
		badgeColor: "purple",
	},
	opened: {
		label: "Opened",
		icon: "eye-outline",
		badgeColor: "orange",
	},
	delivered: {
		label: "Delivered",
		icon: "check-circle",
		badgeColor: "green",
	},
	sent: {
		label: "Sent",
		icon: "send-1",
		badgeColor: "blue",
	},
	pending: {
		label: "Pending",
		icon: "clock",
		badgeColor: "yellow",
	},
	failed: {
		label: "Failed",
		icon: "cross-circle",
		badgeColor: "red",
	},
	bounced: {
		label: "Bounced",
		icon: "alert-circle",
		badgeColor: "red",
	},
	spam: {
		label: "Spam",
		icon: "alert-octagon",
		badgeColor: "red",
	},
	archived: {
		label: "Archived",
		icon: "mail",
		badgeColor: "gray",
	},
};

/** Icon node styles — same language as `features/emails/detail/timeline/steps/*` */
const NODE_STYLE = {
	email: {
		box: "border-information-base/20 bg-information-lighter/50 text-information-base",
		icon: "mail-single" as const,
	},
	"email-error": {
		box: "border-error-light bg-error-lighter text-error-base",
		icon: "mail-single" as const,
	},
	contact: {
		box: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
		icon: "user-plus" as const,
	},
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseLifecycle(entry: ActivityEntry): ParsedLifecycle {
	const deliveredEvent = entry.events.find((e) => e.type === "delivered");
	const openedEvents = entry.events.filter((e) => e.type === "opened");
	const clickedEvents = entry.events.filter((e) => e.type === "clicked");
	const bouncedEvent = entry.events.find((e) => e.type === "bounced");
	const failedEvent = entry.events.find((e) => e.type === "failed");
	const complaintEvent = entry.events.find((e) => e.type === "complaint");

	const hasDelivered = !!(
		entry.deliveredAt ||
		deliveredEvent ||
		openedEvents.length > 0 ||
		clickedEvents.length > 0
	);

	let failedType: "failed" | "bounced" | "complaint" | null = null;
	let failedReason: string | null = null;

	if (complaintEvent) {
		failedType = "complaint";
		failedReason =
			complaintEvent.metadata?.reason ||
			complaintEvent.metadata?.description ||
			null;
	} else if (bouncedEvent) {
		failedType = "bounced";
		failedReason =
			bouncedEvent.metadata?.reason ||
			bouncedEvent.metadata?.description ||
			null;
	} else if (failedEvent || entry.failedAt || entry.status === "failed") {
		failedType = "failed";
		failedReason =
			entry.errorMessage ||
			failedEvent?.metadata?.reason ||
			failedEvent?.metadata?.error ||
			null;
	}

	return {
		hasOpened: openedEvents.length > 0 || clickedEvents.length > 0,
		openedCount: openedEvents.length,
		hasClicked: clickedEvents.length > 0,
		clickedCount: clickedEvents.length,
		hasFailed: failedType !== null,
		failedType,
		failedReason,
		hasDelivered,
	};
}

function getDisplayStatus(
	lifecycle: ParsedLifecycle,
	entryStatus: string,
): DisplayStatus {
	if (lifecycle.hasFailed) {
		if (lifecycle.failedType === "bounced") return "bounced";
		if (lifecycle.failedType === "complaint") return "spam";
		return "failed";
	}
	if (lifecycle.hasClicked) return "clicked";
	if (lifecycle.hasOpened) return "opened";
	if (lifecycle.hasDelivered) return "delivered";
	if (entryStatus === "pending") return "pending";
	if (entryStatus === "archived") return "archived";
	return "sent";
}

function emailTitle(status: DisplayStatus): string {
	switch (status) {
		case "bounced":
			return "Email bounced";
		case "failed":
			return "Email failed";
		case "spam":
			return "Email marked as spam";
		case "clicked":
			return "Email sent";
		case "opened":
			return "Email sent";
		case "pending":
			return "Email pending";
		default:
			return "Email sent";
	}
}

function sameCalendarDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function dayKey(iso: string): string {
	const d = new Date(iso);
	return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Matches reference: "23 JULY 2026" */
function dayLabel(iso: string): string {
	const d = new Date(iso);
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	if (sameCalendarDay(d, today)) return "TODAY";
	if (sameCalendarDay(d, yesterday)) return "YESTERDAY";

	const day = d.getDate();
	const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
	const year = d.getFullYear();
	return `${day} ${month} ${year}`;
}

/** Matches reference: "9:14 AM" */
function formatClockTime(iso: string): string {
	return new Date(iso).toLocaleTimeString(undefined, {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

function buildTimelineItems(
	entries: ActivityEntry[],
	contactCreatedAt?: string,
): TimelineItem[] {
	const items: TimelineItem[] = entries.map((entry) => ({
		kind: "email" as const,
		id: `email-${entry.id}`,
		entry,
		timestamp: entry.createdAt,
	}));

	if (contactCreatedAt) {
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

function groupByDay(items: TimelineItem[]): DayGroup[] {
	const groups: DayGroup[] = [];
	const indexByKey = new Map<string, number>();

	for (const item of items) {
		const key = dayKey(item.timestamp);
		const existing = indexByKey.get(key);
		if (existing === undefined) {
			indexByKey.set(key, groups.length);
			groups.push({
				key,
				label: dayLabel(item.timestamp),
				items: [item],
			});
		} else {
			groups[existing]?.items.push(item);
		}
	}

	return groups;
}

// ─── Status badge (AlignUI Badge) ────────────────────────────────────────────

function StatusBadge({
	label,
	icon,
	color,
}: {
	label: string;
	icon?: string;
	color: BadgeColor;
}) {
	return (
		<Badge.Root
			size="medium"
			variant="lighter"
			color={color}
			className="h-5 gap-1 rounded-md px-1.5 font-medium"
		>
			{icon && (
				<Badge.Icon
					as={Icon}
					name={icon as Parameters<typeof Icon>[0]["name"]}
					className="size-3"
				/>
			)}
			{label}
		</Badge.Root>
	);
}

// ─── Spine node ──────────────────────────────────────────────────────────────

function TimelineNode({
	variant,
	isLast,
	/** Spacer so the node aligns with the title when a day header sits above content */
	topOffset = false,
	/** Draw a connector through the day-header spacer (not used on the very first item) */
	connectFromAbove = false,
}: {
	variant: "email" | "email-error" | "contact";
	isLast: boolean;
	topOffset?: boolean;
	connectFromAbove?: boolean;
}) {
	const styles = NODE_STYLE[variant];
	const lineCls = "w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/40";

	return (
		<div className="flex w-8 shrink-0 flex-col items-center self-stretch">
			{/* Day-header offset: keep spine continuous when a date sits above the title */}
			{topOffset && (
				<div
					className="flex h-[26px] w-full shrink-0 flex-col items-center"
					aria-hidden
				>
					{connectFromAbove && <div className={cn("h-full", lineCls)} />}
				</div>
			)}
			{/* rounded-[10px] matches EmailTimeline step nodes */}
			<div
				className={cn(
					"relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border",
					styles.box,
				)}
			>
				<Icon name={styles.icon} className="h-3.5 w-3.5" />
			</div>
			{!isLast && (
				<div className={cn("min-h-[8px] w-px flex-1", lineCls)} aria-hidden />
			)}
		</div>
	);
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ActivitySkeleton() {
	return (
		<div className="space-y-8">
			{Array.from({ length: 3 }).map((_, groupIdx) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
				<div key={groupIdx} className="space-y-4">
					<Skeleton className="ml-11 h-2.5 w-24 rounded" />
					{Array.from({ length: groupIdx === 0 ? 2 : 1 }).map((__, rowIdx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
						<div key={rowIdx} className="flex gap-3">
							<Skeleton className="h-8 w-8 shrink-0 rounded-[10px]" />
							<div className="min-w-0 flex-1 space-y-2 pt-1">
								<div className="flex items-start justify-between gap-4">
									<Skeleton className="h-4 w-44 rounded" />
									<Skeleton className="h-3 w-14 rounded" />
								</div>
								<Skeleton className="h-3.5 w-52 rounded" />
								<div className="flex gap-1.5 pt-0.5">
									<Skeleton className="h-5 w-16 rounded-md" />
								</div>
							</div>
						</div>
					))}
				</div>
			))}
		</div>
	);
}

// ─── Rows ────────────────────────────────────────────────────────────────────

function DayHeader({ label, isFirst }: { label: string; isFirst: boolean }) {
	// Same label language as contact detail property headers
	return (
		<p
			className={cn(
				"font-medium text-[10px] text-text-sub-600 uppercase tracking-wider",
				isFirst ? "mb-3" : "mt-0.5 mb-3",
			)}
		>
			{label}
		</p>
	);
}

function EmailActivityRow({
	entry,
	isLast,
	dayLabel: day,
	isFirstOfDay,
	isFirstOverall,
}: {
	entry: ActivityEntry;
	isLast: boolean;
	dayLabel?: string;
	isFirstOfDay: boolean;
	isFirstOverall: boolean;
}) {
	const lifecycle = useMemo(() => parseLifecycle(entry), [entry]);
	const displayStatus = getDisplayStatus(lifecycle, entry.status);
	const meta = STATUS_META[displayStatus];
	const isError = lifecycle.hasFailed;
	const subject = entry.subject?.trim() || "(no subject)";
	const title = emailTitle(displayStatus);

	type Pill = { label: string; icon: string; color: BadgeColor };
	const pills: Pill[] = [];

	// When clicked, show Opened first if we also have opens
	if (
		displayStatus === "clicked" &&
		lifecycle.openedCount > 0 &&
		lifecycle.openedCount !== lifecycle.clickedCount
	) {
		pills.push({
			label:
				lifecycle.openedCount > 1
					? `Opened ${lifecycle.openedCount}×`
					: "Opened",
			icon: STATUS_META.opened.icon,
			color: STATUS_META.opened.badgeColor,
		});
	}

	pills.push({
		label:
			displayStatus === "opened" && lifecycle.openedCount > 1
				? `Opened ${lifecycle.openedCount}×`
				: displayStatus === "clicked" && lifecycle.clickedCount > 1
					? `Clicked ${lifecycle.clickedCount}×`
					: meta.label,
		icon: meta.icon,
		color: meta.badgeColor,
	});

	const showDay = isFirstOfDay && !!day;

	return (
		<div className="flex gap-3">
			<TimelineNode
				variant={isError ? "email-error" : "email"}
				isLast={isLast}
				topOffset={showDay}
				connectFromAbove={showDay && !isFirstOverall}
			/>

			<div className={cn("min-w-0 flex-1", isLast ? "pb-1" : "pb-8")}>
				{showDay && day && <DayHeader label={day} isFirst={isFirstOverall} />}

				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						{/* Link style matches Groups/Channels on this page */}
						<Link
							href={`/emails/${entry.id}`}
							className={cn(
								"font-medium text-paragraph-sm text-text-strong-950 leading-snug",
								"underline decoration-stroke-soft-200 decoration-dashed underline-offset-4",
								"transition-colors hover:text-primary-base hover:decoration-primary-base/40",
							)}
						>
							{title}
						</Link>
						<p className="mt-0.5 truncate text-paragraph-xs text-text-sub-600 leading-snug">
							{subject !== "(no subject)" ? `“${subject}”` : subject}
							{entry.fromEmail ? (
								<span className="text-text-soft-400">
									{" · "}
									{entry.fromEmail}
								</span>
							) : null}
						</p>

						{pills.length > 0 && (
							<div className="mt-2 flex flex-wrap items-center gap-1.5">
								{pills.map((p) => (
									<StatusBadge
										key={p.label}
										label={p.label}
										icon={p.icon}
										color={p.color}
									/>
								))}
							</div>
						)}

						{lifecycle.failedReason && (
							<p className="mt-1.5 max-w-md truncate text-error-base text-paragraph-xs">
								{lifecycle.failedReason}
							</p>
						)}
					</div>

					<span className="shrink-0 pt-0.5 text-paragraph-xs text-text-soft-400 tabular-nums">
						{formatClockTime(entry.createdAt)}
					</span>
				</div>
			</div>
		</div>
	);
}

function ContactCreatedRow({
	timestamp,
	isLast,
	dayLabel: day,
	isFirstOfDay,
	isFirstOverall,
}: {
	timestamp: string;
	isLast: boolean;
	dayLabel?: string;
	isFirstOfDay: boolean;
	isFirstOverall: boolean;
}) {
	const showDay = isFirstOfDay && !!day;

	return (
		<div className="flex gap-3">
			<TimelineNode
				variant="contact"
				isLast={isLast}
				topOffset={showDay}
				connectFromAbove={showDay && !isFirstOverall}
			/>
			<div className={cn("min-w-0 flex-1", isLast ? "pb-1" : "pb-8")}>
				{showDay && day && <DayHeader label={day} isFirst={isFirstOverall} />}

				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<p className="font-medium text-paragraph-sm text-text-strong-950 leading-snug">
							Contact created
						</p>
						<p className="mt-0.5 text-paragraph-xs text-text-sub-600 leading-snug">
							Added to your audience
						</p>
					</div>
					<span className="shrink-0 pt-0.5 text-paragraph-xs text-text-soft-400 tabular-nums">
						{formatClockTime(timestamp)}
					</span>
				</div>
			</div>
		</div>
	);
}

// ─── Main ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

interface ContactEmailHistoryProps {
	email: string;
	/** ISO timestamp of when the contact was created */
	contactCreatedAt?: string;
}

export function ContactEmailHistory({
	email,
	contactCreatedAt,
}: ContactEmailHistoryProps) {
	const {
		data,
		isPending: isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isError,
	} = useInfiniteQuery({
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

	const entries = useMemo(
		() => data?.pages.flatMap((page) => page.data) ?? [],
		[data],
	);
	const total = data?.pages[0]?.total ?? 0;

	const dayGroups = useMemo(() => {
		const items = buildTimelineItems(entries, contactCreatedAt);
		return groupByDay(items);
	}, [entries, contactCreatedAt]);

	/** Flatten for continuous spine across day groups */
	const flatItems = useMemo(
		() => dayGroups.flatMap((g) => g.items),
		[dayGroups],
	);

	const showEmpty = !isLoading && !isError && flatItems.length === 0;

	return (
		<div className="mt-12 pb-12">
			{/* Section header */}
			<div className="mb-6 flex items-center gap-2">
				<h3 className="font-medium text-paragraph-sm text-text-strong-950">
					Activity
				</h3>
				{!isLoading && total > 0 && (
					<span className="rounded-full bg-neutral-alpha-10 px-2 py-0.5 font-medium text-[11px] text-text-sub-600 tabular-nums">
						{total}
					</span>
				)}
			</div>

			{isLoading ? (
				<ActivitySkeleton />
			) : isError ? (
				<div className="flex flex-col items-center gap-2 rounded-2xl border border-stroke-soft-100 py-10 text-center dark:border-stroke-soft-100/40">
					<div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-error-light bg-error-lighter">
						<Icon name="alert-circle" className="h-4 w-4 text-error-base" />
					</div>
					<p className="font-medium text-paragraph-sm text-text-strong-950">
						Couldn&apos;t load activity
					</p>
					<p className="max-w-xs text-paragraph-xs text-text-soft-400">
						Something went wrong fetching email history for this contact.
					</p>
				</div>
			) : showEmpty ? (
				<div className="flex flex-col items-center gap-2 rounded-2xl border border-stroke-soft-100 border-dashed py-10 text-center dark:border-stroke-soft-100/40">
					<div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-stroke-soft-200 bg-bg-weak-50">
						<Icon name="mail-single" className="h-4 w-4 text-text-sub-600" />
					</div>
					<p className="font-medium text-paragraph-sm text-text-sub-600">
						No activity yet
					</p>
					<p className="max-w-xs text-paragraph-xs text-text-soft-400">
						Emails sent to{" "}
						<span className="font-medium text-text-sub-600">{email}</span> will
						appear here.
					</p>
				</div>
			) : (
				<div>
					{dayGroups.map((group, groupIdx) => {
						const itemsBefore = dayGroups
							.slice(0, groupIdx)
							.reduce((n, g) => n + g.items.length, 0);

						return (
							<div key={group.key}>
								{group.items.map((item, itemIdx) => {
									const flatIndex = itemsBefore + itemIdx;
									const isLast = flatIndex === flatItems.length - 1;
									const isFirstOfDay = itemIdx === 0;
									const isFirstOverall = flatIndex === 0;

									if (item.kind === "email") {
										return (
											<EmailActivityRow
												key={item.id}
												entry={item.entry}
												isLast={isLast}
												dayLabel={group.label}
												isFirstOfDay={isFirstOfDay}
												isFirstOverall={isFirstOverall}
											/>
										);
									}

									return (
										<ContactCreatedRow
											key={item.id}
											timestamp={item.timestamp}
											isLast={isLast}
											dayLabel={group.label}
											isFirstOfDay={isFirstOfDay}
											isFirstOverall={isFirstOverall}
										/>
									);
								})}
							</div>
						);
					})}

					{hasNextPage && (
						<div className="ml-11 flex pt-1">
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={() => void fetchNextPage()}
								disabled={isFetchingNextPage}
								className="gap-1.5"
							>
								{isFetchingNextPage ? (
									"Loading…"
								) : (
									<>
										Load more
										<span className="text-text-soft-400 tabular-nums">
											{entries.length}/{total}
										</span>
									</>
								)}
							</Button.Root>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
