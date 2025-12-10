"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useState } from "react";
import { InviteModal } from "./invite-modal";
import { TeamList } from "./team-list";

const Team = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

	return (
		<div className="w-full space-y-6 pt-5">
			{/* Header */}
			<div>
				<h1 className="font-medium text-label-lg text-text-strong-950">Members and teams</h1>
				<p className="text-paragraph-sm text-text-sub-600">
					Manage workspace members and teams, set access levels, and invite new users.
				</p>
			</div>

			{/* Search, Filter, and Invite Button */}
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" />
							<Input.Input
								placeholder="Search name or email"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
				>
					<Icon name="filter" className="h-4 w-4" />
					<span>Filter</span>
				</Button.Root>

				<Button.Root
					variant="neutral"
					size="small"
					onClick={() => setIsInviteModalOpen(true)}
				>
					<Icon name="user-plus" className="h-4 w-4" />
					<span>Invite team members</span>
				</Button.Root>
			</div>

			{/* Team List */}
			<TeamList searchQuery={searchQuery} />

			{/* Invite Modal */}
			<InviteModal
				open={isInviteModalOpen}
				onOpenChange={setIsInviteModalOpen}
			/>
		</div>
	);
};

export default Team;
