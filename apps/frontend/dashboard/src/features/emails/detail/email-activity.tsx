"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Fragment, type ReactNode, useMemo, useState } from "react";
import {
	dayKey,
	formatCompactTime,
	formatDayHeader,
	formatTimeAmPm,
	TimelineItemWrapper,
	timelineCardClass,
} from "#/components/timeline/timeline-parts";
import type { EmailEvent } from "./timeline/types";
import {
	BrowserIcon,
	ClientIcon,
	CountryFlag,
	DeviceIcon,
	OsIcon,
} from "./timeline-icons";

type ActivityMeta = {
	url?: string;
	client?: string | null;
	device?: string | null;
	os?: string | null;
	browser?: string | null;
	country?: string | null;
	city?: string | null;
	proxied?: boolean;
	machine?: boolean;
	machineReason?: "apple_privacy" | "security_scanner" | null;
	inferred?: "click";
};

type ActivityEvent = EmailEvent & {
	requestHeaders?: Record<string, string> | null;
	clientIp?: string | null;
};

/**
 * Node icon (a name from the @reloop/ui icon sprite) and colour, matching
 * the Sent → Delivered → Opened → Clicked steps at the top of the page.
 */
type Kind = { label: string; icon: string; color: string };

const COLOR = {
	blue: "text-information-base",
	green: "text-success-base",
	orange: "text-orange-600 dark:text-orange-400",
	purple: "text-purple-600 dark:text-purple-400",
	red: "text-error-base",
	gray: "text-text-soft-400",
};

const SENT: Kind = { label: "Sent", icon: "send-1", color: COLOR.blue };

const KINDS: Record<string, Kind> = {
	sent: SENT,
	delivered: { label: "Delivered", icon: "check-circle", color: COLOR.green },
	deferred: { label: "Delivery delayed", icon: "clock", color: COLOR.gray },
	bounced: { label: "Bounced", icon: "cross-circle", color: COLOR.red },
	failed: { label: "Failed", icon: "cross-circle", color: COLOR.red },
	complaint: {
		label: "Marked as spam",
		icon: "alert-triangle",
		color: COLOR.red,
	},
	opened: { label: "Opened", icon: "mail-open", color: COLOR.orange },
	clicked: {
		label: "Clicked a link",
		icon: "cursor-click",
		color: COLOR.purple,
	},
};

const regionNames =
	typeof Intl !== "undefined" && "DisplayNames" in Intl
		? new Intl.DisplayNames(undefined, { type: "region" })
		: null;

function countryName(code: string): string {
	try {
		return regionNames?.of(code) ?? code;
	} catch {
		return code;
	}
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function metaOf(event: ActivityEvent): ActivityMeta {
	return (event.metadata ?? {}) as ActivityMeta;
}

function plural(count: number, word: string): string {
	return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function titleFor(event: ActivityEvent): string {
	const meta = metaOf(event);
	const base = KINDS[event.type]?.label ?? capitalize(event.type);
	if (event.type === "opened" && meta.client)
		return `${base} in ${meta.client}`;
	return base;
}

/** Icon followed by text, for inline values like "[logo] Gmail". */
function WithIcon({
	icon,
	children,
}: {
	icon: ReactNode;
	children: ReactNode;
}) {
	return (
		<span className="inline-flex min-w-0 items-center gap-1.5">
			{icon}
			<span className="truncate">{children}</span>
		</span>
	);
}

/** Title with the email client's logo, e.g. "Opened in [Gmail logo] Gmail". */
function TitleNode({ event }: { event: ActivityEvent }) {
	const meta = metaOf(event);
	if (event.type === "opened" && meta.client) {
		return (
			<span className="inline-flex flex-wrap items-center gap-x-1.5">
				Opened in
				<WithIcon icon={<ClientIcon name={meta.client} />}>
					{meta.client}
				</WithIcon>
			</span>
		);
	}
	return <>{titleFor(event)}</>;
}

/** Badge chips like the contact history's Sent / Failed badges. */
function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
	return (
		<span className="inline-flex items-center gap-1.5 rounded-md bg-bg-weak-50 px-2 py-0.5 font-medium text-text-sub-600 text-xs [&_svg]:size-3.5">
			{icon}
			<span>{children}</span>
		</span>
	);
}

/** Location, device, OS and browser as chips, in that order. */
function chipsFor(meta: ActivityMeta): ReactNode[] {
	const chips: ReactNode[] = [];
	if (meta.country) {
		chips.push(
			<Chip
				key="location"
				icon={<CountryFlag code={meta.country} className="h-2.5 w-[15px]" />}
			>
				{[meta.city, countryName(meta.country)].filter(Boolean).join(", ")}
			</Chip>,
		);
	}
	if (meta.device) {
		chips.push(
			<Chip key="device" icon={<DeviceIcon type={meta.device} />}>
				{capitalize(meta.device)}
			</Chip>,
		);
	}
	if (meta.os) {
		chips.push(
			<Chip key="os" icon={<OsIcon name={meta.os} />}>
				{meta.os}
			</Chip>,
		);
	}
	if (meta.browser) {
		chips.push(
			<Chip key="browser" icon={<BrowserIcon name={meta.browser} />}>
				{meta.browser}
			</Chip>,
		);
	}
	return chips;
}

/** Muted second line: the clicked link, or why device and place are missing. */
function subtitleFor(event: ActivityEvent): ReactNode {
	const meta = metaOf(event);
	if (event.type === "clicked" && meta.url) {
		return (
			<span className="min-w-0 truncate">
				to{" "}
				<a
					href={meta.url}
					target="_blank"
					rel="noreferrer"
					title={meta.url}
					className="font-mono text-text-sub-600 underline-offset-2 hover:underline"
				>
					{meta.url.replace(/^https?:\/\//, "")}
				</a>
			</span>
		);
	}
	if (meta.machineReason === "apple_privacy") {
		return "Apple Mail Privacy Protection loaded images automatically";
	}
	if (meta.machineReason === "security_scanner") {
		return "A security scanner checked the link, not a person";
	}
	if (meta.inferred === "click")
		return "Counted as opened because a link was clicked";
	if (meta.proxied) {
		return `Through ${meta.client ?? "the provider"}'s image proxy, so device and location are hidden`;
	}
	return null;
}

/** The raw request behind an open or click: IP and headers. */
function RequestDetails({ event }: { event: ActivityEvent }) {
	const entries = Object.entries(event.requestHeaders ?? {});
	if (entries.length === 0 && !event.clientIp) return null;

	return (
		<dl className="mt-2.5 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 rounded-xl bg-bg-weak-50 p-3 font-mono text-[12px] text-text-strong-950 leading-5">
			{event.clientIp ? (
				<>
					<dt className="text-text-soft-400">ip</dt>
					<dd className="min-w-0 break-all">{event.clientIp}</dd>
				</>
			) : null}
			{entries.map(([name, value]) => (
				<Fragment key={name}>
					<dt className="text-text-soft-400">{name}</dt>
					<dd className="min-w-0 break-all">{value}</dd>
				</Fragment>
			))}
		</dl>
	);
}

function EventCard({
	event,
	isLast,
}: {
	event: ActivityEvent;
	isLast: boolean;
}) {
	const meta = metaOf(event);
	const kind = KINDS[event.type] ?? SENT;
	const isMachine = meta.machine === true;
	const subtitle = subtitleFor(event);
	const chips = isMachine ? [] : chipsFor(meta);
	const hasRequest =
		(event.type === "opened" || event.type === "clicked") &&
		!isMachine &&
		(Object.keys(event.requestHeaders ?? {}).length > 0 || !!event.clientIp);
	const [showRequest, setShowRequest] = useState(false);

	// Chevron at the end of the chip row (or the subtitle when there are no
	// chips) that reveals the raw request.
	const toggle = hasRequest ? (
		<button
			type="button"
			onClick={() => setShowRequest((v) => !v)}
			aria-expanded={showRequest}
			aria-label={showRequest ? "Hide request details" : "Show request details"}
			title={showRequest ? "Hide request details" : "Show request details"}
			className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
		>
			<Icon
				name="chevron-down"
				className={cn(
					"size-3.5 transition-transform",
					showRequest && "rotate-180",
				)}
			/>
		</button>
	) : null;

	return (
		<TimelineItemWrapper
			isLast={isLast}
			node={
				<Icon
					name={isMachine ? "robot" : kind.icon}
					className={cn(
						"size-3.5",
						isMachine ? "text-text-soft-400" : kind.color,
					)}
				/>
			}
		>
			<div className={timelineCardClass}>
				<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
					{/* Relative time beside the title, where the eye lands first. */}
					<span className="flex min-w-0 flex-wrap items-center gap-x-2">
						<span
							className={cn(
								"font-medium text-paragraph-sm",
								isMachine ? "text-text-sub-600" : "text-text-strong-950",
							)}
						>
							<TitleNode event={event} />
						</span>
						<span className="text-paragraph-xs text-text-soft-400 tabular-nums">
							{formatCompactTime(event.createdAt)}
						</span>
					</span>
					<span className="shrink-0 font-medium text-paragraph-xs text-text-sub-600 tabular-nums">
						{formatTimeAmPm(event.createdAt)}
					</span>
				</div>
				{subtitle ? (
					<div className="mt-1 flex items-center gap-1 text-paragraph-xs text-text-soft-400">
						{subtitle}
						{chips.length === 0 ? toggle : null}
					</div>
				) : null}
				{chips.length > 0 ? (
					<div className="mt-2 flex flex-wrap items-center gap-1.5">
						{chips}
						{toggle}
					</div>
				) : null}
				{!subtitle && chips.length === 0 && toggle ? (
					<div className="mt-1">{toggle}</div>
				) : null}
				{showRequest ? <RequestDetails event={event} /> : null}
			</div>
		</TimelineItemWrapper>
	);
}

/** A day's automatic opens and scanner clicks, folded into one row. */
function AutomaticEventsCard({
	events,
	isLast,
}: {
	events: ActivityEvent[];
	isLast: boolean;
}) {
	const [open, setOpen] = useState(false);
	return (
		<TimelineItemWrapper
			isLast={isLast}
			node={<Icon name="robot" className="size-3.5 text-text-soft-400" />}
		>
			<div className={timelineCardClass}>
				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					aria-expanded={open}
					className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-sub-600 hover:text-text-strong-950"
				>
					{plural(events.length, "automatic event")}
					<Icon
						name="chevron-right"
						className={cn("size-3.5 transition-transform", open && "rotate-90")}
					/>
				</button>
				{open ? (
					<ul className="mt-2 space-y-1.5">
						{events.map((event) => (
							<li
								key={event.id}
								className="flex flex-wrap items-center justify-between gap-x-3 text-paragraph-xs text-text-soft-400"
							>
								<span>
									<span className="text-text-sub-600">{titleFor(event)}</span>
									{" · "}
									{subtitleFor(event)}
								</span>
								<span className="tabular-nums">
									{formatTimeAmPm(event.createdAt)}
								</span>
							</li>
						))}
					</ul>
				) : null}
			</div>
		</TimelineItemWrapper>
	);
}

type Item =
	| { kind: "event"; event: ActivityEvent }
	| { kind: "automatic"; events: ActivityEvent[] };

/** Newest first, by day; a run of automatic events folds into one row. */
function groupByDay(items: ActivityEvent[]): { date: string; items: Item[] }[] {
	const sorted = items
		.filter((e) => KINDS[e.type])
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
	const grouped = new Map<string, { date: string; items: Item[] }>();
	for (const event of sorted) {
		const key = dayKey(event.createdAt);
		const day = grouped.get(key) ?? { date: event.createdAt, items: [] };
		if (metaOf(event).machine === true) {
			const last = day.items.at(-1);
			if (last?.kind === "automatic") last.events.push(event);
			else day.items.push({ kind: "automatic", events: [event] });
		} else {
			day.items.push({ kind: "event", event });
		}
		grouped.set(key, day);
	}
	return [...grouped.values()];
}

/**
 * Everything that happened to this email, grouped by day, newest first:
 * each open and click with the reader's location, device, OS and browser
 * and the raw request, then delivery. A day's automatic opens and link
 * scanners fold into one row.
 */
export function EmailActivity({
	events,
	sentAt,
	deliveredAt,
	failedAt,
	only,
}: {
	events: ActivityEvent[];
	sentAt?: string | null;
	deliveredAt?: string | null;
	failedAt?: string | null;
	/** Show just opens or just clicks (the step drawers), without delivery. */
	only?: "opened" | "clicked";
}) {
	const days = useMemo(() => {
		if (only) {
			return groupByDay(events.filter((e) => e.type === only));
		}
		const items: ActivityEvent[] = [...events];
		const has = (type: string) => items.some((e) => e.type === type);
		if (sentAt && !has("sent")) {
			items.push({
				id: "synthetic-sent",
				type: "sent",
				metadata: {},
				createdAt: sentAt,
			});
		}
		if (deliveredAt && !has("delivered")) {
			items.push({
				id: "synthetic-delivered",
				type: "delivered",
				metadata: {},
				createdAt: deliveredAt,
			});
		}
		if (failedAt && !has("failed") && !has("bounced")) {
			items.push({
				id: "synthetic-failed",
				type: "failed",
				metadata: {},
				createdAt: failedAt,
			});
		}
		return groupByDay(items);
	}, [events, sentAt, deliveredAt, failedAt, only]);

	return (
		<div className="space-y-6">
			{days.map((day) => (
				<section key={dayKey(day.date)}>
					<h4 className="mb-2.5 font-semibold text-subheading-2xs text-text-sub-600 uppercase tracking-wider">
						{formatDayHeader(day.date)}
					</h4>
					<div className="space-y-1.5">
						{day.items.map((item, index) => {
							const isLast = index === day.items.length - 1;
							return item.kind === "event" ? (
								<EventCard
									key={item.event.id}
									event={item.event}
									isLast={isLast}
								/>
							) : (
								<AutomaticEventsCard
									key={item.events[0]?.id}
									events={item.events}
									isLast={isLast}
								/>
							);
						})}
					</div>
				</section>
			))}
		</div>
	);
}
