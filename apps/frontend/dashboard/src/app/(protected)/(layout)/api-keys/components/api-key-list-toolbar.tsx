"use client";

import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
	ApiKeyStatusFilterDropdown,
	type ApiKeyStatusFilterOption,
} from "./api-key-status-filter-dropdown";
import {
	ApiKeyUserFilterDropdown,
	type CreatedByUser,
} from "./api-key-user-filter-dropdown";

interface ApiKeyListToolbarProps {
	availableCreators: CreatedByUser[];
}

export const ApiKeyListToolbar = ({
	availableCreators,
}: ApiKeyListToolbarProps) => {
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
		<div className="flex items-center gap-3">
			<div className="flex-1">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="xsmall" />
						<Input.Input
							placeholder="Search API keys..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setCurrentPage(1);
							}}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
			<div className="flex items-center gap-3">
				<ApiKeyUserFilterDropdown
					value={creatorFilter || null}
					onChange={(userId) => {
						setCreatorFilter(userId || "");
						setCurrentPage(1);
					}}
					availableCreators={availableCreators}
				/>
				<ApiKeyStatusFilterDropdown
					value={(statusFilter as ApiKeyStatusFilterOption) || null}
					onChange={(status) => {
						setStatusFilter(status || "");
						setCurrentPage(1);
					}}
				/>
			</div>
		</div>
	);
};
