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
		<div className="w-full space-y-6 pt-5">
			<div className="mb-6">
				<p className="font-medium text-label-md text-text-strong-950">Team</p>
				<p className="text-paragraph-sm text-text-sub-600">
					Manage your team members and send invitations.
				</p>
			</div>
			<div className="space-y-3">
				<p className="font-medium text-label-sm text-text-strong-950">
					Invite Members
				</p>
				<InviteForm />
			</div>
			<div className="space-y-3">
				<p className="font-medium text-label-sm text-text-strong-950">
					Team Overview
				</p>

				<InviteTabs />
				{tabValue === "members" && <MemberList />}
				{tabValue === "invites" && <InviteList />}
			</div>
		</div>
	);
};

export default Team;
