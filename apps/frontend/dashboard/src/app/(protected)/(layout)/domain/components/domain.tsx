"use client";
import type { DomainListResponse } from "@reloop/api";
import { useRouter } from "next/navigation";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";
import { DeleteDomainModal } from "./delete-domain";
import { DomainErrorState } from "./domain-error-state";
import { DomainListHeader } from "./domain-list-header";
import { DomainListToolbar } from "./domain-list-toolbar";
import { DomainTable } from "./domain-table";

export const Domain = () => {
	const router = useRouter();
	const [statusFilters] = useQueryState(
		"status",
		parseAsStringLiteral([
			"start-verify",
			"verifying",
			"active",
			"suspended",
			"failed",
		] as const),
	);
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

	const { data, error, isLoading } = useSWR<DomainListResponse>(
		`/api/domain/v1/list?limit=${pageSize}&page=${currentPage}${statusFilters ? `&status=${statusFilters}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	useHotkeys("mod+a", () => {
		router.push("/domain/add");
	});

	const domains = data?.domains || [];

	return (
		<div className="mx-auto max-w-4xl sm:px-8">
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
			<DeleteDomainModal domains={data?.domains || []} />
		</div>
	);
};
