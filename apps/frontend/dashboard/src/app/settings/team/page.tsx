"use client";

import { useQueryState } from "nuqs";
import { InviteForm } from "./invite-form";
import { InviteTabs } from "./invite-tabs";

const Team = () => {
	const [tabValue, setTabValue] = useQueryState("tab", {
		defaultValue: "members",
	});

	return (
		<div className="px-10 pt-5 pb-10">
			<div className="space-y-1">
				<div className="text-2xl text-text-strong-950">Team</div>
				<div className="text-paragraph-sm text-text-sub-600">
					Manage your team and invite new members.
				</div>
			</div>
			<InviteForm />
			<div className="my-4 rounded-xl border border-stroke-soft-200 bg-neutral-alpha-10">
				<InviteTabs />
				<div className="mx-0.5 mb-0.5 rounded-lg bg-bg-white-0">
					{tabValue === "members" && (
						<div className="p-4">
							<div className="text-2xl text-text-strong-950">Members</div>
						</div>
					)}
					{tabValue === "invites" && (
						<div className="p-4">
							<div className="text-2xl text-text-strong-950">Invites</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Team;
