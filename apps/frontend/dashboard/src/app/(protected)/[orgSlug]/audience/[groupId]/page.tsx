"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { AudienceGroup, AudienceListResponse } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { AddAudience } from "./components/add-audience";
import { AudienceGroupHeader } from "./components/audience-group-header";
import { AudienceTable } from "./components/audience-table";
import { EmptyState } from "./components/empty-state";

const AudienceGroupPage = () => {
	const { groupId, orgSlug } = useParams();
	const router = useRouter();

	const { activeOrganization } = useUserOrganization();
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [showAddAudience, setShowAddAudience] = useState(false);
	const {
		data: groupData,
		error: groupError,
		isLoading: groupLoading,
	} = useSWR<AudienceGroup>(`/api/audience/v1/groups/get/${groupId}`, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});
	const { data, isLoading } = useSWR<AudienceListResponse>(
		`/api/audience/v1/list?audienceGroupId=${groupId}&limit=100`,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);
	const filteredAudiences =
		data?.audiences?.filter((audience) => {
			const matchesStatus =
				statusFilter === "all" || audience.status === statusFilter;
			const matchesSearch =
				searchQuery === "" ||
				audience.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				audience.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				audience.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		}) || [];

	const handleSubscribe = async (audienceId: string) => {
		try {
			await fetch(`/api/audience/v1/subscribe/${audienceId}`, {
				method: "POST",
				headers: { credentials: "include" },
			});
			window.location.reload();
		} catch (error) {
			console.error("Failed to subscribe audience:", error);
		}
	};

	const handleUnsubscribe = async (audienceId: string) => {
		try {
			await fetch(`/api/audience/v1/unsubscribe/${audienceId}`, {
				method: "POST",
				headers: { credentials: "include" },
			});
			window.location.reload();
		} catch (error) {
			console.error("Failed to unsubscribe audience:", error);
		}
	};

	const handleDelete = async (audienceId: string) => {
		try {
			await fetch(`/api/audience/v1/delete/${audienceId}`, {
				method: "DELETE",
				headers: { credentials: "include" },
			});
			window.location.reload();
		} catch (error) {
			console.error("Failed to delete audience:", error);
		}
	};

	const handleDownloadCSV = () => {
		if (!data?.audiences || data.audiences.length === 0) {
			return;
		}

		// Create CSV headers
		const headers = [
			"Email",
			"First Name",
			"Last Name",
			"Status",
			"Added At",
			"Unsubscribed At",
		];

		// Create CSV rows
		const csvRows = data.audiences.map((audience) => [
			audience.email,
			audience.firstName || "",
			audience.lastName || "",
			audience.status,
			audience.addedAt,
			audience.unsubscribedAt || "",
		]);

		// Combine headers and rows
		const csvContent = [headers, ...csvRows]
			.map((row) => row.map((field) => `"${field}"`).join(","))
			.join("\n");

		// Create and download the file
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`${groupData?.name || "audience"}-export.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Listen for custom events from empty state
	useState(() => {
		const handleOpenAddAudience = () => setShowAddAudience(true);
		const handleOpenBulkImport = () =>
			router.push(`/${orgSlug}/audience/${groupId}/bulk-import`);

		window.addEventListener("openAddAudience", handleOpenAddAudience);
		window.addEventListener("openBulkImport", handleOpenBulkImport);

		return () => {
			window.removeEventListener("openAddAudience", handleOpenAddAudience);
			window.removeEventListener("openBulkImport", handleOpenBulkImport);
		};
	});

	return (
		<div className="mx-auto max-w-3xl">
			<AudienceGroupHeader
				group={groupData || null}
				isLoading={groupLoading}
				isFailed={!!groupError}
				onOpenAddAudience={() => setShowAddAudience(true)}
				onOpenBulkImport={() =>
					router.push(`/${orgSlug}/audience/${groupId}/bulk-import`)
				}
			/>

			{groupError ? (
				<div className="flex flex-col items-center justify-center gap-2 p-4">
					<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
					<p className="text-center text-sm text-text-sub-600">
						Failed to load audience group
					</p>
				</div>
			) : data?.audiences && data.audiences.length === 0 ? (
				<EmptyState />
			) : (
				<div>
					<div className="mb-6 flex items-center justify-between gap-3">
						<div className="flex w-full items-center gap-3">
							<div className="flex-1">
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Icon
											as={() => <Icon name="search" className="h-4 w-4" />}
										/>
										<Input.Input
											type="text"
											placeholder="Search audiences..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div className="w-48">
								<Select.Root
									size="small"
									value={statusFilter}
									onValueChange={setStatusFilter}
									disabled={isLoading}
								>
									<Select.Trigger className="rounded-xl">
										<Select.Value placeholder="Status" />
									</Select.Trigger>
									<Select.Content className="w-48">
										<Select.Item value="all">
											<div className="flex items-center gap-2 text-sm">
												<Icon name="users" className="h-4 w-4" />
												All Status
											</div>
										</Select.Item>
										<Select.Item value="subscribed">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name="bell-plus"
													className="h-4 w-4 text-success-base"
												/>
												Subscribed
											</div>
										</Select.Item>
										<Select.Item value="unsubscribed">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name="bell-minus"
													className="h-4 w-4 text-text-sub-600"
												/>
												Unsubscribed
											</div>
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={handleDownloadCSV}
							disabled={!data?.audiences || data.audiences.length === 0}
						>
							<Icon name="file-download" className="h-4 w-4" />
						</Button.Root>
					</div>

					<div className="mt-4">
						<AudienceTable
							audiences={filteredAudiences}
							activeOrganizationSlug={activeOrganization.slug}
							isLoading={isLoading}
							loadingRows={4}
							onSubscribe={handleSubscribe}
							onUnsubscribe={handleUnsubscribe}
							onDelete={handleDelete}
						/>
					</div>
				</div>
			)}
			<AddAudience
				groupId={groupId as string}
				groupName={groupData?.name || "Unknown"}
				open={showAddAudience}
				onOpenChange={setShowAddAudience}
			/>
		</div>
	);
};

export default AudienceGroupPage;
