import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
	ApiKeyStatusFilterDropdown,
	type ApiKeyStatusFilterOption,
} from "../filters/status-filter-dropdown";
import { ApiKeyUserFilterDropdown } from "../filters/user-filter-dropdown";
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

	return (
		<div className="flex items-center gap-2">
			<div className="flex-1">
				<Input.Root size="xsmall" className="rounded-[10px]">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="xsmall" />
						<Input.Input
							placeholder="Search API keys..."
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
			</div>
		</div>
	);
}
