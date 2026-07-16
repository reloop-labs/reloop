import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { SETTINGS_MEMBER_HOME } from "#/features/dashboard/navigation";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { InviteModal } from "./invite-modal";
import {
	TeamFilterDropdown,
	type TeamFilterValue,
} from "./team-filter-dropdown";
import { TeamList } from "./team-list";

export function TeamsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState<TeamFilterValue>("all");
	const [modal, setModal] = useQueryState("modal", { history: "replace" });
	const navigate = useNavigate();
	const { canManageTeam, canInvite, isPending } = useOrgPermissions();

	useEffect(() => {
		if (!isPending && !canManageTeam) {
			void navigate({
				to: SETTINGS_MEMBER_HOME,
				search: { from: undefined },
			});
		}
	}, [canManageTeam, isPending, navigate]);

	useHotkeys(
		"mod+a",
		(e) => {
			e.preventDefault();
			if (canInvite) void setModal("invite");
		},
		{ enabled: canInvite },
	);

	if (isPending || !canManageTeam) {
		return null;
	}

	return (
		<div className="w-full space-y-6 pt-5">
			<div>
				<h1 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
					Teams
				</h1>
				<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
					Manage workspace members, set access levels, and invite new users.
				</p>
			</div>

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

				{canInvite && (
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={() => void setModal("invite")}
						className="rounded-[10px]"
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
				)}
			</div>

			<TeamList searchQuery={searchQuery} filters={filters} />

			{canInvite && (
				<InviteModal
					open={modal === "invite"}
					onOpenChange={(open) => void setModal(open ? "invite" : null)}
				/>
			)}
		</div>
	);
}
