import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useContactColumnVisibility } from "../../hooks/use-contact-column-visibility";
import { useContactsQuery } from "../../hooks/use-contacts-query";
import { ContactListToolbar } from "./contact-list-toolbar";
import { ContactTable } from "./contact-table";

function SummaryCard({
	label,
	count,
	icon,
	isLoading,
}: {
	label: string;
	count?: number;
	icon: string;
	isLoading: boolean;
}) {
	return (
		<div className="flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-3 dark:border-stroke-soft-100/50">
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-weak-50">
				<Icon name={icon} className="h-4 w-4 text-text-sub-600" />
			</div>
			<div className="flex flex-col">
				<p className="text-text-sub-600 text-xs">{label}</p>
				{isLoading ? (
					<div className="mt-0.5 h-5 w-12 animate-pulse rounded bg-bg-weak-50" />
				) : (
					<p className="font-semibold text-sm text-text-strong-950">
						{count?.toLocaleString() || 0}
					</p>
				)}
			</div>
		</div>
	);
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
			const headers = ["Email", "Name", "Status", "Updated At", "Created At"];
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
			<div className="mb-4 grid grid-cols-3 gap-3">
				<SummaryCard
					label="Total Contacts"
					icon="users"
					count={data?.totalContacts}
					isLoading={isLoading}
				/>
				<SummaryCard
					label="Subscribed"
					icon="check-circle"
					count={data?.subscribedContacts}
					isLoading={isLoading}
				/>
				<SummaryCard
					label="Unsubscribed"
					icon="minus-circle"
					count={data?.unsubscribedContacts}
					isLoading={isLoading}
				/>
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
