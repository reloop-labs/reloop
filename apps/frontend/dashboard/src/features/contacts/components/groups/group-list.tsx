import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useGroupsQuery } from "../../hooks/use-contacts-query";
import { GroupTable } from "./group-table";

export function GroupList() {
	const { activeOrganization } = useActiveOrganization();
	const [searchQuery, setSearchQuery] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [, setModal] = useQueryState("modal");
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const { data, error, isPending, isFetching, refetch } = useGroupsQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		search: searchQuery ?? "",
		enabled: !!activeOrganization?.id,
	});
	const isLoading = isPending || (isFetching && !data);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-12 text-center">
				<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-error-light/10">
					<Icon name="alert-circle" className="h-5 w-5 text-error-base" />
				</div>
				<h3 className="font-semibold text-text-strong-950">
					Failed to load groups
				</h3>
				<p className="mx-auto max-w-xs text-sm text-text-sub-600">
					Something went wrong while fetching the groups list. Please try again.
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center gap-2">
				<div className="flex-1">
					<Input.Root size="small" className="rounded-xl">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="small" />
							<Input.Input
								placeholder="Search groups..."
								value={searchQuery ?? ""}
								onChange={(e) => {
									void setSearchQuery(e.target.value || null);
									void setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => void refetch()}
					disabled={isFetching}
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl p-0"
					title="Refresh groups"
					aria-label="Refresh groups"
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
			</div>
			<div className="mt-4">
				<GroupTable
					groups={
						(data?.groups || []).map((g) => ({
							...g,
							organizationId: g.organizationId || "",
							createdAt: g.createdAt || "",
							updatedAt: g.updatedAt || "",
							deletedAt: g.deletedAt ?? null,
						})) as any
					}
					total={data?.total || 0}
					isLoading={isLoading}
					onAddGroup={() => void setModal("create-group")}
					searchQuery={searchQuery ?? ""}
					onClearSearch={() => void setSearchQuery(null)}
					currentPage={currentPage ?? 1}
					pageSize={pageSize ?? 10}
					onPageChange={(p) => void setCurrentPage(p)}
					onPageSizeChange={(v) => {
						void setPageSize(v);
						void setCurrentPage(1);
					}}
				/>
			</div>
		</div>
	);
}
