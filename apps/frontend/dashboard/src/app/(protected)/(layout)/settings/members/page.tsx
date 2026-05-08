"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { InviteModal } from "./invite-modal";
import { TeamFilterDropdown, type TeamFilterValue } from "./team-filter-dropdown";
import { TeamList } from "./team-list";

const Team = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState<TeamFilterValue>("all");
	const [modal, setModal] = useQueryState("modal", { history: "replace" });

	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		setModal("invite");
	});

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
					<Input.Root size="xsmall" className="rounded-[10px]!">
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
					onClick={() => setModal("invite")}
				>
					<Icon name="user-plus" className="h-4 w-4" />
					<span>Invite members</span>
					<span className="inline-flex items-center gap-0.5">
						<Icon
							name="command"
							className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
						/>
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
							a
						</span>
					</span>
				</Button.Root>
			</div>

			{/* Team List */}
			<TeamList searchQuery={searchQuery} filters={filters} />

			{/* Invite Modal */}
			<InviteModal
				open={modal === "invite"}
				onOpenChange={(open) => setModal(open ? "invite" : null)}
			/>
		</div>
	);
};

export default Team;
