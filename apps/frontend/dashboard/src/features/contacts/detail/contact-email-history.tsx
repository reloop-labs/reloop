"use client";

import * as Button from "@reloop/ui/button";
import { Icon, type IconName } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
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

/**
 * Resource type for change targets (group, channel, property, …).
 */
type ResourceKind =
	| "group"
	| "channel"
	| "property"
	| "name"
	| "email"
	| "status"
	| "profile"
	| "mail";

type ActivityTarget = {
	label: string;
	/** What kind of resource this target is — drives the icon */
	resource: ResourceKind;
	href?: string;
};

type ActivityMarker = "arrow" | "circle" | "plus" | "minus" | "contact";

type ActivityDescription = {
	phrase: string;
	/** One or more targets (group, property value, etc.) each with the right icon */
	targets: ActivityTarget[];
	marker: ActivityMarker;
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
			return { phrase: "Contact created", targets: [], marker: "contact" };
		case "deleted":
			return { phrase: "Contact deleted", targets: [], marker: "minus" };
		case "added_to_group":
			return {
				phrase: "Added to",
				targets: [{ label: groupLabel(entry), resource: "group" }],
				marker: "plus",
			};
		case "removed_from_group":
			return {
				phrase: "Removed from",
				targets: [{ label: groupLabel(entry), resource: "group" }],
				marker: "minus",
			};
		case "added_to_channel":
			return {
				phrase: "Opted in to",
				targets: [{ label: channelLabel(entry), resource: "channel" }],
				marker: "plus",
			};
		case "updated_channel": {
			const to = String(sub?.to ?? "").toLowerCase();
			const label = channelLabel(entry);
			const isOut =
				to === "opt_out" || to === "unenrolled" || to === "unsubscribed";
			return {
				phrase: isOut ? "Opted out of" : "Opted in to",
				targets: [{ label, resource: "channel" }],
				marker: isOut ? "minus" : "plus",
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
							? [{ label: parts.join(" "), resource: "name" }]
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
									resource: "email",
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
									resource: "status",
								},
							]
						: [],
					marker: "arrow",
				};
			}

			// Custom properties — each with property icon
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
								resource: "property",
							},
						],
						marker: "arrow",
					};
				}
				return {
					phrase: "Properties updated",
					targets: propertyChanges.slice(0, 3).map((c) => ({
						label: c.label ?? c.field.replace("properties.", ""),
						resource: "property",
					})),
					marker: "arrow",
				};
			}

			// Single field — pick resource from field type
			if (fields.size === 1) {
				const c = changes[0]!;
				const resource: ResourceKind = c.field.startsWith("properties.")
					? "property"
					: c.field === "email"
						? "email"
						: c.field === "status"
							? "status"
							: c.field === "group"
								? "group"
								: c.field === "channel"
									? "channel"
									: "profile";
				return {
					phrase: `${c.label ?? "Field"} updated`,
					targets:
						c.to !== null ? [{ label: formatChangeValue(c.to), resource }] : [],
					marker: "arrow",
				};
			}

			// Mixed update: one target per change with matching resource icon
			const targets: ActivityTarget[] = changes.slice(0, 4).map((c) => {
				if (c.field.startsWith("properties.")) {
					return {
						label: c.label ?? c.field.replace("properties.", ""),
						resource: "property" as const,
					};
				}
				if (c.field === "email") {
					return {
						label: formatChangeValue(c.to),
						resource: "email" as const,
					};
				}
				if (c.field === "status") {
					return {
						label: formatChangeValue(c.to),
						resource: "status" as const,
					};
				}
				if (c.field === "firstName" || c.field === "lastName") {
					return {
						label: formatChangeValue(c.to),
						resource: "name" as const,
					};
				}
				if (c.field === "group") {
					return {
						label: formatChangeValue(c.to ?? c.from),
						resource: "group" as const,
					};
				}
				if (c.field === "channel") {
					return {
						label: formatChangeValue(c.to ?? c.from),
						resource: "channel" as const,
					};
				}
				return {
					label: formatChangeValue(c.to ?? c.label ?? c.field),
					resource: "profile" as const,
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

// ─── UI ──────────────────────────────────────────────────────────────────────

/** Grid columns mirroring the dashboard emails table, minus the To column. */
const contactEmailGridStyle = {
	gridTemplateColumns: "minmax(0, 1fr) 140px 120px",
};

/** Fixed pastel tile tones (light + dark) for activity icons. */
const tileTones = {
	blue: "border-[#C9DCFA] bg-[#EAF1FD] text-[#1D5FD0] dark:border-white/15 dark:bg-white/10 dark:text-[#8AB4F8]",
	purple:
		"border-[#DDCFFA] bg-[#F2EBFD] text-[#7C3AED] dark:border-white/15 dark:bg-white/10 dark:text-[#C4B5FD]",
	amber:
		"border-[#EFDDB0] bg-[#FAF3E0] text-[#B45309] dark:border-white/15 dark:bg-white/10 dark:text-[#FCD34D]",
	green:
		"border-[#BDE5C8] bg-[#E9F7EE] text-[#15803D] dark:border-white/15 dark:bg-white/10 dark:text-[#86EFAC]",
} as const;

type TileTone = keyof typeof tileTones;

function ResourceTile({ tone, icon }: { tone: TileTone; icon: IconName }) {
	return (
		<span
			className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] border ${tileTones[tone]}`}
		>
			<Icon name={icon} className="size-4" />
		</span>
	);
}

/**
 * Definite icon per resource — group gets the group icon, channel the
 * channel icon, etc. No more generic +/- tiles.
 */
function ChangeIconTile({
	marker,
	resource,
}: {
	marker: ActivityMarker;
	resource?: ResourceKind;
}) {
	if (marker === "contact") {
		return <ResourceTile tone="green" icon="user" />;
	}
	switch (resource) {
		case "group":
			return <ResourceTile tone="blue" icon="modules" />;
		case "channel":
			return <ResourceTile tone="purple" icon="notification-indicator" />;
		case "property":
			return <ResourceTile tone="amber" icon="tag" />;
		case "email":
		case "mail":
			return <ResourceTile tone="blue" icon="mail-single" />;
		case "status":
			return <ResourceTile tone="purple" icon="activity" />;
		case "name":
		case "profile":
			return <ResourceTile tone="blue" icon="user" />;
		default:
			return <ResourceTile tone="blue" icon="activity" />;
	}
}

/** Tinted square icon tile for email rows — tint follows delivery status. */
function EmailActivityIcon({ entry }: { entry: ActivityEntry }) {
	const { tone } = getEmailStatus(entry);
	if (tone === "green") {
		return (
			<span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-green-alpha-16 bg-green-alpha-10 text-success-base">
				<Icon name="mail-single" className="size-4" />
			</span>
		);
	}
	if (tone === "red") {
		return (
			<span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-red-alpha-16 bg-red-alpha-10 text-error-base">
				<Icon name="mail-single" className="size-4" />
			</span>
		);
	}
	return (
		<span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-primary-alpha-16 bg-primary-alpha-10 text-primary-base">
			<Icon name="mail-single" className="size-4" />
		</span>
	);
}
const activityGridStyle = {
	gridTemplateColumns: "minmax(0, 1fr) 120px",
};

function dayKey(date: string | Date): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "unknown";
	return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** "FRIDAY, JANUARY 3" — with year when not the current year. */
function formatDayHeader(date: string | Date): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "—";
	const now = new Date();
	const withYear = d.getFullYear() !== now.getFullYear();
	const s = d.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		...(withYear ? { year: "numeric" } : {}),
	});
	return s.toUpperCase();
}

/** "6:19 am" */
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

type EmailTone = "green" | "red" | "gray" | "neutral";

function getEmailStatus(entry: ActivityEntry): {
	label: string;
	tone: EmailTone;
} {
	const types = new Set(entry.events.map((e) => e.type));
	if (types.has("complaint") || entry.status === "spam")
		return { label: "Spam", tone: "red" };
	if (types.has("bounced") || entry.status === "bounced")
		return { label: "Bounced", tone: "red" };
	if (types.has("failed") || entry.failedAt || entry.status === "failed")
		return { label: "Failed", tone: "red" };
	if (types.has("clicked")) return { label: "Clicked", tone: "green" };
	if (types.has("opened")) return { label: "Opened", tone: "green" };
	if (types.has("delivered") || entry.deliveredAt)
		return { label: "Delivered", tone: "green" };
	if (entry.status === "pending" || entry.status === "scheduled")
		return {
			label: entry.status === "scheduled" ? "Scheduled" : "Pending",
			tone: "gray",
		};
	if (entry.sentAt) return { label: "Sent", tone: "neutral" };
	return { label: "Sent", tone: "neutral" };
}

function EmailStatusLabel({ entry }: { entry: ActivityEntry }) {
	const { label, tone } = getEmailStatus(entry);
	if (tone === "green") {
		return (
			<span className="flex shrink-0 items-center gap-1 font-medium text-[13px] text-success-base">
				{label}
				<Icon name="check" className="size-3.5" />
			</span>
		);
	}
	if (tone === "red") {
		return (
			<span className="shrink-0 font-medium text-[13px] text-error-base">
				{label}
			</span>
		);
	}
	if (tone === "gray") {
		return (
			<span className="shrink-0 font-medium text-[13px] text-text-soft-400">
				{label}
			</span>
		);
	}
	return (
		<span className="shrink-0 font-medium text-[13px] text-text-sub-600">
			{label}
		</span>
	);
}

function Section({
	title,
	count,
	children,
}: {
	title: string;
	count?: number;
	children: ReactNode;
}) {
	return (
		<section>
			<div className="mb-3 flex items-baseline gap-2">
				<h3 className="text-[15px] text-text-sub-600">{title}</h3>
				{typeof count === "number" && count > 0 && (
					<span className="text-[13px] text-text-soft-400 tabular-nums">
						{count}
					</span>
				)}
			</div>
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
				{children}
			</div>
		</section>
	);
}

function CardSkeletonRows() {
	return (
		<div className="flex flex-col gap-8">
			<div>
				<Skeleton className="h-4 w-48 rounded" />
				<div className="mt-2 divide-y divide-stroke-soft-200 border-t border-stroke-soft-200 dark:divide-white/10 dark:border-white/10">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={`card-skeleton-${i}`}
							style={activityGridStyle}
							className="grid items-center gap-4 py-4"
						>
							<div className="flex items-center gap-3">
								<Skeleton className="size-10 shrink-0 rounded-[10px]" />
								<div className="flex flex-1 flex-col gap-2">
									<Skeleton className="h-4 w-2/5 rounded" />
									<Skeleton className="h-3 w-1/4 rounded" />
								</div>
							</div>
							<Skeleton className="h-4 w-20 rounded" />
						</div>
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
	icon: "mail" | "change";
	title: string;
	body: string;
}) {
	return (
		<div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center">
			<div className="mb-1 flex h-9 w-9 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]">
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

// ─── Main ────────────────────────────────────────────────────────────────────

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

			{/* ── Merged activity · emails + changes interleaved by time ── */}
			{showMerged && (
				<section>
					{emailQuery.isPending || historyQuery.isPending ? (
						<CardSkeletonRows />
					) : emailsEmpty && changesEmpty ? (
						<CardEmpty
							icon="mail"
							title="No activity yet"
							body="Emails sent and profile changes will appear here."
						/>
					) : (
						(() => {
							type MergedItem =
								| { kind: "email"; id: string; createdAt: string; email: ActivityEntry }
								| { kind: "change"; id: string; createdAt: string; entry: HistoryEntry }
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
									new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
							);
							const groups = new Map<string, { date: string; items: MergedItem[] }>();
							for (const item of merged) {
								const key = dayKey(item.createdAt);
								const g = groups.get(key);
								if (g) g.items.push(item);
								else groups.set(key, { date: item.createdAt, items: [item] });
							}
							return (
								<div className="flex flex-col gap-8">
									{[...groups.values()].map((group) => (
										<div key={dayKey(group.date)}>
											<h4 className="font-semibold text-[13px] text-text-strong-950 tracking-wide">
												{formatDayHeader(group.date)}
											</h4>
											<div className="mt-2 divide-y divide-stroke-soft-200 border-t border-stroke-soft-200 dark:divide-white/10 dark:border-white/10">
												{group.items.map((item) => {
													if (item.kind === "email") {
														const subject =
															item.email.subject?.trim() || "(No Subject)";
														const { label } = getEmailStatus(item.email);
														return (
															<Link
																key={item.id}
																href={`/emails/${item.email.id}`}
																style={activityGridStyle}
																className="grid items-center gap-4 py-4 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]"
															>
																<div className="flex min-w-0 items-center gap-3">
																	<EmailActivityIcon entry={item.email} />
																	<div className="min-w-0">
																		<p className="truncate font-medium text-[15px] text-text-strong-950">
																			{subject}
																			<span className="font-normal text-text-sub-600">
																				{" "}
																				- {label}
																			</span>
																		</p>
																		<p className="mt-0.5 text-[13px] text-text-sub-600">
																			{formatTimeAmPm(item.createdAt)}
																		</p>
																	</div>
																</div>
																<span className="text-right text-[14px] text-text-strong-950 tabular-nums sm:text-left">
																	{formatCompactTime(item.createdAt)}
																</span>
															</Link>
														);
													}
													if (item.kind === "fallback") {
														return (
															<div
																key={item.id}
																style={activityGridStyle}
																className="grid items-center gap-4 py-4"
															>
																<div className="flex min-w-0 items-center gap-3">
																	<ChangeIconTile marker="contact" />
																	<div className="min-w-0">
																		<p className="truncate font-medium text-[15px] text-text-strong-950">
																			Contact created
																		</p>
																		<p className="mt-0.5 text-[13px] text-text-sub-600">
																			{formatTimeAmPm(item.createdAt)}
																		</p>
																	</div>
																</div>
																<span className="text-right text-[14px] text-text-sub-600 tabular-nums sm:text-left">
																	{formatCompactTime(item.createdAt)}
																</span>
															</div>
														);
													}
													const { phrase, targets, marker } = describeHistory(item.entry);
													const targetLabel = targets
														.slice(0, 2)
														.map((t) => t.label)
														.join(", ");
													return (
														<Link
															key={item.id}
															href={`/logs?log=${item.entry.id}`}
															style={activityGridStyle}
															className="grid items-center gap-4 py-4 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]"
														>
															<div className="flex min-w-0 items-center gap-3">
																<ChangeIconTile marker={marker} resource={targets[0]?.resource} />
																<div className="min-w-0">
																	<p className="truncate font-medium text-[15px] text-text-strong-950">
																		{phrase}
																		{targetLabel ? (
																			<span className="font-normal text-text-sub-600">
																				{" "}
																				- {targetLabel}
																			</span>
																		) : null}
																	</p>
																	<p className="mt-0.5 text-[13px] text-text-sub-600">
																		{formatTimeAmPm(item.createdAt)}
																	</p>
																</div>
															</div>
															<span className="text-right text-[14px] text-text-strong-950 tabular-nums sm:text-left">
																{formatCompactTime(item.createdAt)}
															</span>
														</Link>
													);
												})}
											</div>
										</div>
									))}
									{(emailQuery.hasNextPage || historyQuery.hasNextPage) && (
										<div className="flex flex-col gap-1">
											{emailQuery.hasNextPage && (
												<button
													type="button"
													onClick={handleLoadMoreEmails}
													disabled={emailQuery.isFetchingNextPage}
													className="flex cursor-pointer items-center gap-2 py-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950"
												>
													{emailQuery.isFetchingNextPage ? (
														"Loading…"
													) : (
														<>
															Load more emails
															<span className="text-text-soft-400 tabular-nums">
																{sortedEmails.length}/{emailTotal}
															</span>
														</>
													)}
												</button>
											)}
											{historyQuery.hasNextPage && (
												<button
													type="button"
													onClick={handleLoadMoreChanges}
													disabled={historyQuery.isFetchingNextPage}
													className="flex cursor-pointer items-center gap-2 py-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950"
												>
													{historyQuery.isFetchingNextPage ? (
														"Loading…"
													) : (
														<>
															Load more changes
															<span className="text-text-soft-400 tabular-nums">
																{sortedChanges.length}/{historyTotal}
															</span>
														</>
													)}
												</button>
											)}
										</div>
									)}
								</div>
							);
						})()
					)}
				</section>
			)}

			{showEmails && (
				<section>
					<div className="w-full text-paragraph-sm">
						<div
							style={contactEmailGridStyle}
							className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
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
												className="grid w-full cursor-pointer items-center px-4 py-2.5 text-left transition-colors hover:bg-bg-weak-50"
											>
												<span className="truncate font-medium text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2">
													{subject}
												</span>
												<EmailStatusLabel entry={entry} />
												<span
													className="whitespace-nowrap font-medium text-[13px] text-text-sub-600"
													title={formatRowDate(
														entry.sentAt ?? entry.createdAt,
													)}
												>
													{formatRelativeTime(
														entry.sentAt ?? entry.createdAt,
													)}
												</span>
											</Link>
										);
									})}
									{emailQuery.hasNextPage && (
										<button
											type="button"
											onClick={handleLoadMoreEmails}
											disabled={emailQuery.isFetchingNextPage}
											className="flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-3.5 font-medium text-[13px] text-text-sub-600 transition-colors hover:bg-bg-weak-50/70 hover:text-text-strong-950"
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
				<Section title="Activity">
					<div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
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
				</Section>
			)}
		</div>
	);
}
