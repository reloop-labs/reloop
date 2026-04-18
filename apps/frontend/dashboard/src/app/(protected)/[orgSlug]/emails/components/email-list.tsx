"use client";
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
		? `/api/logs/v1/emails?limit=${pageSize}&page=${currentPage}${
				searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
			}`
		: null;

	const { data, error, isLoading } = useSWR<EmailListResponse>(fetchUrl, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	const totalLogs = data?.total || 0;

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
					currentPage={currentPage}
					pageSize={pageSize}
					totalLogs={totalLogs}
					onPageChange={setCurrentPage}
					onPageSizeChange={(value) => {
						setPageSize(value);
						setCurrentPage(1);
					}}
				/>
			</div>
		</div>
	);
};
