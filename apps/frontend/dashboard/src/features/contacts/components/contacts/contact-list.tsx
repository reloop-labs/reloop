import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useContactColumnVisibility } from "../../hooks/use-contact-column-visibility";
import {
	useContactsQuery,
	useSubscriptionActivityQuery,
} from "../../hooks/use-contacts-query";
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
			<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
				{label}
			</p>
			{isLoading ? (
				<Skeleton className="mt-1 h-5 w-16 rounded-lg" />
			) : (
				<p className="mt-1 truncate font-medium text-sm text-text-strong-950 tabular-nums">
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
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const { columnVisibility, setColumnVisible } = useContactColumnVisibility();

	/** Exactly one status applies a filter (same pattern as API keys). */
	const statusParam = statusFilter.length === 1 ? (statusFilter[0] ?? "") : "";

	const { data, error, isPending, isFetching } = useContactsQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		search: searchQuery ?? "",
		status: statusParam,
		enabled: !!activeOrganization?.id,
	});
	const isLoading = isPending || (isFetching && !data);

	const { data: activityData, isPending: activityPending } =
		useSubscriptionActivityQuery(7, !!activeOrganization?.id);

	const chartContainerRef = useRef<HTMLDivElement>(null);
	const [hasChartSize, setHasChartSize] = useState(false);

	useEffect(() => {
		const el = chartContainerRef.current;
		if (!el) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				setHasChartSize(width > 0 && height > 0);
			}
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const chartData = useMemo(() => {
		if (!activityData?.dates?.length) return [];
		return activityData.dates.map((date, i) => ({
			date: formatChartDayLabel(date),
			subscribed: activityData.subscribed[i] ?? 0,
			unsubscribed: activityData.unsubscribed[i] ?? 0,
		}));
	}, [activityData]);

	const weekSubscribed = useMemo(
		() => chartData.reduce((sum, d) => sum + d.subscribed, 0),
		[chartData],
	);
	const weekUnsubscribed = useMemo(
		() => chartData.reduce((sum, d) => sum + d.unsubscribed, 0),
		[chartData],
	);

	const handleDownloadCSV = useCallback(async () => {
		try {
			const response = await fetch("/api/contacts/list?limit=10000", {
				credentials: "include",
			});
			const allData = (await response.json()) as typeof data;
			if (!allData?.contacts?.length) {
				toast.error("No contacts to export");
				return;
			}
			const headers = ["Email", "Name", "Status", "Last Updated", "Created At"];
			const csvRows = allData.contacts.map((contact) => [
				contact.email,
				[contact.firstName, contact.lastName].filter(Boolean).join(" "),
				contact.status,
				new Date(contact.updatedAt).toISOString(),
				new Date(contact.createdAt).toISOString(),
			]);
			const csvContent = [
				headers.join(","),
				...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
			].join("\n");
			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = `contacts_${new Date().toISOString().split("T")[0]}.csv`;
			link.click();
			URL.revokeObjectURL(link.href);
			toast.success("Contacts exported successfully");
		} catch {
			toast.error("Failed to export contacts");
		}
	}, [data]);

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
				onSelect: () => void handleDownloadCSV(),
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
		[router, handleDownloadCSV],
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
			{/* Audience snapshot + 7-day trend — matches API key detail two-box layout */}
			<div className="mb-4 grid gap-4 lg:grid-cols-2">
				<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
					<div className="space-y-3 p-4">
						<div>
							<p className="font-medium text-sm text-text-strong-950">
								Audience
							</p>
							<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
								Contact volume and subscription status across your organization.
							</p>
						</div>
						<div className="grid grid-cols-3 gap-4">
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
						</div>
					</div>
				</div>

				<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
					<div className="flex h-full flex-col space-y-3 p-4">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p className="font-medium text-sm text-text-strong-950">
									Last 7 days
								</p>
							</div>
							<div className="flex shrink-0 items-center gap-3">
								<div className="flex items-center gap-1.5">
									<span className="h-1.5 w-1.5 rounded-full bg-[#1868DF]" />
									<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
										{activityPending ? "—" : weekSubscribed.toLocaleString()}{" "}
										subscribed
									</span>
								</div>
								<div className="flex items-center gap-1.5">
									<span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
									<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
										{activityPending ? "—" : weekUnsubscribed.toLocaleString()}{" "}
										unsubscribed
									</span>
								</div>
							</div>
						</div>

						<div ref={chartContainerRef} className="h-[108px] w-full">
							{activityPending ? (
								<Skeleton className="h-full w-full rounded-xl" />
							) : hasChartSize && chartData.length > 0 ? (
								<Suspense fallback={null}>
									<SubscriptionActivityChart data={chartData} />
								</Suspense>
							) : null}
						</div>
					</div>
				</div>
			</div>

			<ContactListToolbar
				columnVisibility={columnVisibility}
				onColumnVisibleChange={setColumnVisible}
				onExport={() => void handleDownloadCSV()}
				canExport={!!data?.contacts && data.contacts.length > 0}
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
				/>
			</div>
		</div>
	);
}
