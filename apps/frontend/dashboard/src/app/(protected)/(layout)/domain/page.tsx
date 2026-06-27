"use client";
import type { DomainListResponse } from "@fe/dashboard/types/api.types";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";
import { DeleteDomainModal } from "./components/delete-domain";
import { DomainErrorState } from "./components/domain-error-state";
import { DomainListHeader } from "./components/domain-list-header";
import { DomainListToolbar } from "./components/domain-list-toolbar";
import { DomainTable } from "./components/domain-table";

dayjs.extend(relativeTime);

const DomainPage = () => {
	const getBackToUrl = useGetBackToUrl();
	const router = useRouter();
	const [statusFilters] = useQueryState(
		"status",
		parseAsStringLiteral([
			"pending",
			"verifying",
			"active",
			"suspended",
			"failed",
		] as const),
	);
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

	const { data, error, isLoading, mutate } = useSWR<DomainListResponse>(
		`/api/domain/v1/list?limit=${pageSize}&page=${currentPage}${statusFilters ? `&status=${statusFilters}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	useHotkeys("mod+a", () => {
		router.push(getBackToUrl("/domain/add"));
	});

	const domains = data?.domains || [];

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<DomainListHeader />
			<DomainListToolbar />
			<div className="mt-4">
				{error ? (
					<DomainErrorState />
				) : (
					<DomainTable
						domains={domains}
						total={data?.total || 0}
						isLoading={isLoading}
					/>
				)}
			</div>
			<DeleteDomainModal domains={data?.domains || []} mutate={mutate} />
		</div>
	);
};

export default DomainPage;
