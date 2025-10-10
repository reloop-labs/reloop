"use client";

import { useQueryState } from "nuqs";
import { InviteForm } from "./invite-form";
import { InviteList } from "./invite-list";
import { InviteTabs } from "./invite-tabs";
import { MemberList } from "./member-list";

const Team = () => {
	const [tabValue] = useQueryState("tab", {
		defaultValue: "members",
	});

	return (
		<div>
			<div>
				<p className="font-medium text-2xl text-text-strong-950">Team</p>
				<p className="text-paragraph-sm text-text-sub-600">
					Manage your team and invite new members.
				</p>
			</div>
			<InviteForm />
			<InviteTabs />
			<div className="mx-0.5 mb-0.5 rounded-lg bg-bg-white-0">
				{tabValue === "members" && (
					<div className="p-4">
						<MemberList />
					</div>
				)}
				{tabValue === "invites" && (
					<div className="p-4">
						<InviteList />
					</div>
				)}
			</div>
		</div>
	);
};

export default Team;
