"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useState } from "react";
import { InviteModal } from "./invite-modal";
import { TeamFilterDropdown, type TeamFilters } from "./team-filter-dropdown";
import { TeamList } from "./team-list";

const Team = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState<TeamFilters>([]);
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

	return (
		<div className="w-full space-y-6 pt-5">
			{/* Header */}
			<div>
				<h1 className="font-medium text-label-lg text-text-strong-950">Team</h1>
				<p className="text-paragraph-sm text-text-sub-600">
					Manage workspace members, set access levels, and invite new users.
				</p>
			</div>

			{/* Search, Filter, and Invite Button */}
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<Input.Root size="xsmall">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="xsmall" />
							<Input.Input
								placeholder="Search name or email"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<TeamFilterDropdown value={filters} onChange={setFilters} />

				<Button.Root
					variant="neutral"
					size="xsmall"
					onClick={() => setIsInviteModalOpen(true)}
				>
					<Icon name="user-plus" className="h-4 w-4" />
					<span>Invite members</span>
				</Button.Root>
			</div>

			{/* Team List */}
			<TeamList searchQuery={searchQuery} filters={filters} />

			{/* Invite Modal */}
			<InviteModal
				open={isInviteModalOpen}
				onOpenChange={setIsInviteModalOpen}
			/>
		</div>
	);
};

export default Team;
