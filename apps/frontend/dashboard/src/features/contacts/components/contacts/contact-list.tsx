import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useContactColumnVisibility } from "../../hooks/use-contact-column-visibility";
import {
	useChannelsQuery,
	useContactsQuery,
	useSubscriptionActivityQuery,
} from "../../hooks/use-contacts-query";
import { ContactExportModal } from "./contact-export-modal";
import { ContactListToolbar } from "./contact-list-toolbar";
import { ContactTable } from "./contact-table";

const SubscriptionActivityChart = lazy(() =>
	import("./subscription-activity-chart").then((m) => ({
		default: m.SubscriptionActivityChart,
	})),
);

/** Compact stat matching API key / group summary layout. */
function StatItem({
	label,
	value,
	isLoading,
}: {
	label: string;
	value: string;
	isLoading?: boolean;
}) {
	return (
		<div className="min-w-0">
			<p className="truncate font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
				{label}
			</p>
			{isLoading ? (
				<Skeleton className="mt-1 h-6 w-16 rounded-lg" />
			) : (
				<p className="mt-1 truncate font-medium text-base text-text-strong-950 tabular-nums">
					{value}
				</p>
			)}
		</div>
	);
}

function formatChartDayLabel(isoDate: string): string {
	const [, month, day] = isoDate.split("-");
	if (!month || !day) return isoDate;
	return `${month}/${day}`;
}

export function ContactList() {
	const router = useRouter();
	const { activeOrganization } = useActiveOrganization();
	const [searchQuery, setSearchQuery] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [statusFilter] = useQueryState(
		"status",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const [channelId, setChannelId] = useQueryState(
		"channelId",
		parseAsString.withDefault(""),
	);
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const { columnVisibility, setColumnVisible } = useContactColumnVisibility();
	const [exportOpen, setExportOpen] = useState(false);

	/** All selected statuses, comma-separated; the API matches any of them. */
	const statusParam = [...statusFilter].sort().join(",");
	/** The export modal can only preselect a single status. */
	const singleStatus = statusFilter.length === 1 ? statusFilter[0] : undefined;
	const channelFilter = channelId?.trim() || undefined;

	const { data: channelsData } = useChannelsQuery(!!channelFilter);
	const channelName = useMemo(() => {
		if (!channelFilter) return undefined;
		return channelsData?.channels?.find((c) => c.id === channelFilter)?.name;
	}, [channelFilter, channelsData?.channels]);

	const { data, error, isPending, isFetching } = useContactsQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		search: searchQuery ?? "",
		status: statusParam,
		channelId: channelFilter,
		enabled: !!activeOrganization?.id,
	});
	const isLoading = isPending || (isFetching && !data);

	const { data: activityData, isPending: activityPending } =
		useSubscriptionActivityQuery(30, !!activeOrganization?.id);

	const [hasChartSize, setHasChartSize] = useState(false);
	// Callback ref so the observer re-attaches whenever the sparkline box remounts
	const chartObserverRef = useRef<ResizeObserver | null>(null);
	const chartContainerRef = useCallback((el: HTMLDivElement | null) => {
		chartObserverRef.current?.disconnect();
		chartObserverRef.current = null;
		if (!el) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				setHasChartSize(width > 0 && height > 0);
			}
		});
		observer.observe(el);
		chartObserverRef.current = observer;
	}, []);

	// Running totals over the last 30 days (the metrics page default range), so
	// the sparkline shows growth instead of mostly-flat daily counts
	const chartData = useMemo(() => {
		if (!activityData?.dates?.length) return [];
		let subscribed = 0;
		let unsubscribed = 0;
		return activityData.dates.map((date, i) => {
			subscribed += activityData.subscribed[i] ?? 0;
			unsubscribed += activityData.unsubscribed[i] ?? 0;
			return { date: formatChartDayLabel(date), subscribed, unsubscribed };
		});
	}, [activityData]);

	const openExportModal = useCallback(() => {
		setExportOpen(true);
	}, []);

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "add-contact",
				label: "Add Contact",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => router.push("/contacts/create"),
			},
			{
				id: "export-contacts",
				label: "Export Contacts CSV",
				icon: "download",
				shortcut: { label: "E", keys: ["e"] },
				onSelect: () => openExportModal(),
			},
			{
				id: "open-api-reference",
				label: "Open API Reference",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "contacts" },
						}),
					),
			},
			{
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () =>
					window.open("https://reloop.sh/docs/learn/contacts", "_blank"),
			},
			{
				id: "select-all",
				label: "Select All",
				icon: "check-square",
				shortcut: { label: "⌘A", keys: ["mod+a"] },
				onSelect: () =>
					window.dispatchEvent(new CustomEvent("contacts:select-all")),
			},
		],
		[router, openExportModal],
	);

	useRegisterCommandActions("contacts", "Contacts", actions);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load contacts
				</p>
			</div>
		);
	}

	return (
		<div>
			{/* Audience snapshot; the trend sparkline opens the full metrics page */}
			<div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-4 pt-4 sm:grid-cols-4">
				<StatItem
					label="Total"
					value={(data?.totalContacts ?? 0).toLocaleString()}
					isLoading={isLoading}
				/>
				<StatItem
					label="Subscribed"
					value={(data?.subscribedContacts ?? 0).toLocaleString()}
					isLoading={isLoading}
				/>
				<StatItem
					label="Unsubscribed"
					value={(data?.unsubscribedContacts ?? 0).toLocaleString()}
					isLoading={isLoading}
				/>
				<Link
					href="/contacts/metrics"
					aria-label="Open audience metrics"
					className="block min-w-0 justify-self-end rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950"
				>
					<p className="truncate font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
						Metrics
					</p>
					{/* Same height as the stat values so the row lines up */}
					<div ref={chartContainerRef} className="mt-1 h-6 w-44">
						{activityPending ? (
							<Skeleton className="h-full w-full rounded-lg" />
						) : hasChartSize && chartData.length > 0 ? (
							<Suspense fallback={null}>
								<SubscriptionActivityChart data={chartData} />
							</Suspense>
						) : null}
					</div>
				</Link>
			</div>

			<ContactListToolbar
				columnVisibility={columnVisibility}
				onColumnVisibleChange={setColumnVisible}
				onExport={() => setExportOpen(true)}
				canExport={!!data?.contacts && data.contacts.length > 0}
				channelFilter={
					channelFilter
						? {
								id: channelFilter,
								name: channelName ?? "Channel",
								onClear: () => void setChannelId(null),
							}
						: undefined
				}
			/>

			<div className="mt-4">
				<ContactTable
					contacts={data?.contacts || []}
					total={data?.total || 0}
					columnVisibility={columnVisibility}
					isLoading={isLoading}
					loadingRows={6}
					onAddContact={() => router.push("/contacts/create")}
					searchQuery={searchQuery ?? ""}
					onClearSearch={() => void setSearchQuery(null)}
					emptyStateTitle={
						channelFilter ? "No subscribers in this channel" : undefined
					}
					emptyStateDescription={
						channelFilter
							? "Enroll contacts in this channel to see them here. Existing contacts are not added automatically."
							: undefined
					}
				/>
			</div>

			<ContactExportModal
				open={exportOpen}
				onOpenChange={setExportOpen}
				scope={{
					search: searchQuery ?? undefined,
					channelId: channelFilter,
					channelName,
				}}
				counts={{
					total: data?.totalContacts ?? 0,
					subscribed: data?.subscribedContacts ?? 0,
					unsubscribed: data?.unsubscribedContacts ?? 0,
				}}
				defaultStatus={
					singleStatus === "subscribed" ||
					singleStatus === "unsubscribed" ||
					singleStatus === "blocked"
						? singleStatus
						: "all"
				}
			/>
		</div>
	);
}
