"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import useSWR from "swr";
import { ApiKeySelector } from "./api-key-selector";
import { DateRangeFilter } from "./date-range-filter";
import { DomainSelector } from "./domain-selector";
import { EmailTable } from "./email-table";
import { StatusSelector } from "./status-selector";

interface EmailLogData {
	id: string;
	subject: string;
	fromEmail: string;
	toEmails: string[];
	status: string;
	createdAt: string;
}

interface EmailListResponse {
	object: "list";
	data: EmailLogData[];
	total: number;
	page: number;
	limit: number;
}

export const EmailList = () => {
	const { activeOrganization } = useUserOrganization();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);
	const [selectedDomain, setSelectedDomain] = useQueryState(
		"domain",
		parseAsString.withDefault(""),
	);
	const [selectedApiKey, setSelectedApiKey] = useQueryState(
		"api_key",
		parseAsString.withDefault(""),
	);
	const [selectedStatus, setSelectedStatus] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);
	const [startDate, setStartDate] = useQueryState(
		"start_date",
		parseAsString.withDefault(""),
	);
	const [endDate, setEndDate] = useQueryState(
		"end_date",
		parseAsString.withDefault(""),
	);
	const [datePreset, setDatePreset] = useQueryState(
		"preset",
		parseAsString.withDefault(""),
	);

	const fetchUrl = activeOrganization?.id
		? `/api/logs/v1/emails?limit=${pageSize}&page=${currentPage}${
				searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
			}${selectedDomain ? `&domain=${selectedDomain}` : ""}${
				selectedApiKey ? `&api_key=${selectedApiKey}` : ""
			}${selectedStatus ? `&status=${selectedStatus}` : ""}${
				startDate ? `&start_date=${startDate}` : ""
			}${endDate ? `&end_date=${endDate}` : ""}`
		: null;

	const { data, error, isLoading } = useSWR<EmailListResponse>(fetchUrl, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	const totalLogs = data?.total || 0;

	const handleDateChange = (
		newStartDate: string | null,
		newEndDate: string | null,
		preset: string | null,
	) => {
		setStartDate(newStartDate || "");
		setEndDate(newEndDate || "");
		setDatePreset(preset || "");
		setCurrentPage(1);
	};

	const hasAnyFilter = !!(
		searchQuery ||
		selectedDomain ||
		selectedApiKey ||
		selectedStatus ||
		startDate ||
		endDate ||
		datePreset
	);

	const handleClearAll = () => {
		setSearchQuery("");
		setSelectedDomain("");
		setSelectedApiKey("");
		setSelectedStatus("");
		setStartDate("");
		setEndDate("");
		setDatePreset("");
		setCurrentPage(1);
	};

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
				<p className="text-center text-sm text-text-sub-600">
					Failed to load email logs
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center gap-2">
				<div className="flex-1">
					<Input.Root size="xsmall" className="rounded-[10px]">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="xsmall" />
							<Input.Input
								placeholder="Search subject or sender..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<DateRangeFilter
					startDate={startDate || null}
					endDate={endDate || null}
					activePreset={datePreset || null}
					onDateChange={handleDateChange}
				/>
				<StatusSelector
					value={selectedStatus}
					onChange={(val) => {
						setSelectedStatus(val);
						setCurrentPage(1);
					}}
				/>
				<DomainSelector
					value={selectedDomain}
					onChange={(val) => {
						setSelectedDomain(val);
						setCurrentPage(1);
					}}
				/>
				<ApiKeySelector
					value={selectedApiKey}
					onChange={(val) => {
						setSelectedApiKey(val);
						setCurrentPage(1);
					}}
				/>
				{hasAnyFilter && (
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={handleClearAll}
						className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						Clear filters
					</Button.Root>
				)}
			</div>

			<div className="mt-4">
				<EmailTable
					logs={data?.data || []}
					isLoading={isLoading}
					loadingRows={pageSize}
					currentPage={currentPage}
					pageSize={pageSize}
					totalLogs={totalLogs}
					onPageChange={setCurrentPage}
					onPageSizeChange={(value) => {
						setPageSize(value);
						setCurrentPage(1);
					}}
					hasFilters={hasAnyFilter}
					onClearFilters={handleClearAll}
				/>
			</div>
		</div>
	);
};
