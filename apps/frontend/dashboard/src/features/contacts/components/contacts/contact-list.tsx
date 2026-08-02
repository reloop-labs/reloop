import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useRouter } from "next/navigation";

import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useContactsQuery } from "../../hooks/use-contacts-query";
import {
	ContactFilterDropdown,
	type ContactFilterOption,
} from "./contact-filter-dropdown";
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
	const [filter, setFilter] = useState<ContactFilterOption>(null);
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

	const { data, error, isPending, isFetching, refetch } = useContactsQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		search: searchQuery ?? "",
		status: filter ?? "",
		enabled: !!activeOrganization?.id,
	});
	const isLoading = isPending || (isFetching && !data);

	const handleDownloadCSV = async () => {
		try {
			const response = await fetch("/api/contacts/list?limit=10000", {
				credentials: "include",
			});
			const allData = (await response.json()) as typeof data;
			if (!allData?.contacts?.length) {
				toast.error("No contacts to export");
				return;
			}
			const headers = ["Email", "Status", "Created At"];
			const csvRows = allData.contacts.map((contact) => [
				contact.email,
				contact.status,
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
	};

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "add-contact",
				label: "Add Contact",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => router.push("/contacts/add"),
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
		],
		[router],
	);

	useRegisterCommandActions("contacts", "Contacts", actions);

	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			router.push("/contacts/add");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"e",
		(e) => {
			e.preventDefault();
			void handleDownloadCSV();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"s",
		(e) => {
			e.preventDefault();
			window.dispatchEvent(
				new CustomEvent("api-details:open", {
					detail: { docSection: "contacts" },
				}),
			);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			window.open("https://reloop.sh/docs/learn/contacts", "_blank");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

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

			<div className="flex items-center gap-2">
				<div className="flex-1">
					<Input.Root size="small" className="rounded-xl">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="small" />
							<Input.Input
								placeholder="Search by email"
								value={searchQuery ?? ""}
								onChange={(e) => {
									void setSearchQuery(e.target.value || null);
									void setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<ContactFilterDropdown
					value={filter}
					onChange={(newFilter) => {
						setFilter(newFilter);
						void setCurrentPage(1);
					}}
				/>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => void refetch()}
					disabled={isFetching}
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl p-0"
					title="Refresh contacts"
					aria-label="Refresh contacts"
				>
					<Button.Icon
						as={Icon}
						name="refresh-cw"
						className={cn(
							"h-4 w-4 text-text-sub-600 transition-transform",
							isFetching && "animate-spin",
						)}
					/>
				</Button.Root>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => void handleDownloadCSV()}
					disabled={!data?.contacts || data.contacts.length === 0}
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl p-0"
					title="Export CSV"
					aria-label="Export CSV"
				>
					<Icon name="file-download" className="h-4 w-4" />
				</Button.Root>
			</div>

			<div className="mt-4">
				<ContactTable
					contacts={data?.contacts || []}
					total={data?.total || 0}
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
