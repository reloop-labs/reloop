import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
	ApiKeyStatusFilterDropdown,
	type ApiKeyStatusFilterOption,
} from "../filters/status-filter-dropdown";
import { ApiKeyUserFilterDropdown } from "../filters/user-filter-dropdown";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { CreatedByUser } from "../types";

export function ApiKeyListToolbar({
	availableCreators,
}: {
	availableCreators: CreatedByUser[];
}) {
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsString.withDefault(""),
	);
	const [creatorFilter, setCreatorFilter] = useQueryState(
		"creator",
		parseAsString.withDefault(""),
	);
	const [, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);

	const invalidate = useInvalidateApiKeys();

	return (
		<div className="flex items-center gap-2">
			<div className="flex-1">
				<Input.Root size="small" className="rounded-xl">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="small" />
						<Input.Input
							placeholder="Search API keys by name prefix..."
							value={searchQuery}
							onChange={(e) => {
								void setSearchQuery(e.target.value);
								void setCurrentPage(1);
							}}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
			<div className="flex items-center gap-2">
				<ApiKeyUserFilterDropdown
					value={creatorFilter || null}
					onChange={(userId) => {
						void setCreatorFilter(userId || "");
						void setCurrentPage(1);
					}}
					availableCreators={availableCreators}
				/>
				<ApiKeyStatusFilterDropdown
					value={(statusFilter as ApiKeyStatusFilterOption) || null}
					onChange={(status) => {
						void setStatusFilter(status || "");
						void setCurrentPage(1);
					}}
				/>
				<button
					type="button"
					onClick={() => void invalidate()}
					className="flex h-9 w-9 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40 shrink-0"
					title="Refresh API keys"
				>
					<Icon name="rotate-cw" className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
