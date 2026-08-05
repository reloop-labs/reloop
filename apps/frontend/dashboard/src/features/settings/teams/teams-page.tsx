import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useRouter } from "next/navigation";

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
	const router = useRouter();
	const { canManageTeam, canInvite, isPending } = useOrgPermissions();

	useEffect(() => {
		if (!isPending && !canManageTeam) {
			router.push(SETTINGS_MEMBER_HOME);
		}
	}, [canManageTeam, isPending, router]);

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
					Manage organization members, set access levels, and invite new users.
				</p>
			</div>

			<div className="flex items-center gap-2">
				<div className="flex-1">
					<Input.Root size="small" className="rounded-xl">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="small" />
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
					<FancyButton.Root
						variant="blue"
						size="small"
						onClick={() => void setModal("invite")}
						className="h-9 rounded-xl font-medium"
					>
						<FancyButton.Icon as={Icon} name="user-plus" />
						<span>Invite member</span>
						<span className="inline-flex items-center gap-0.5 opacity-90">
							<Icon
								name="command"
								className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
							/>
							<span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-white/20 p-px font-medium text-[9px] uppercase">
								a
							</span>
						</span>
					</FancyButton.Root>
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
