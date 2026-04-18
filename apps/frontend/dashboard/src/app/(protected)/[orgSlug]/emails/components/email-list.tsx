"use client";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import useSWR from "swr";
import { EmailTable } from "./email-table";

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

	const fetchUrl = activeOrganization?.id
		? `/api/mail/v1/logs?limit=${pageSize}&page=${currentPage}${
				searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
			}`
		: null;

	const { data, error, isLoading } = useSWR<EmailListResponse>(fetchUrl, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	const totalLogs = data?.total || 0;
	const totalPages = Math.ceil(totalLogs / pageSize) || 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, totalLogs);

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
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<Input.Root size="xsmall">
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
			</div>

			<div className="mt-4">
				<EmailTable
					logs={data?.data || []}
					isLoading={isLoading}
					loadingRows={pageSize}
				/>
			</div>

			{/* Pagination */}
			{data && totalLogs > 0 && (
				<div className="mt-4 flex items-center justify-between pb-8 text-paragraph-sm text-text-sub-600">
					<div className="flex items-center gap-3">
						<span>
							Showing {startIndex}–{endIndex} of {totalLogs} log
							{totalLogs !== 1 ? "s" : ""}
						</span>
						<PageSizeDropdown
							value={pageSize}
							onValueChange={(value) => {
								setPageSize(value);
								setCurrentPage(1);
							}}
						/>
					</div>
					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						isLoading={isLoading}
					/>
				</div>
			)}
		</div>
	);
};
