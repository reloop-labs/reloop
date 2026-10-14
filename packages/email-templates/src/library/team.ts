import {
	acme,
	acmeEmail,
	button,
	details,
	eyebrow,
	fallback,
	footer,
	heading,
	lead,
	logo,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

/** Merge-tag span the editor recognizes as a variable. */
function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

function inviteReminderHtml(origin: string): string {
	return acmeEmail({
		title: "Your invite to join a workspace on Acme",
		preview: "Your invitation is still waiting and expires in 3 days.",
		body: `${logo(origin)}
${heading("Your invite is still waiting")}
${lead(`${v("inviter_name")} invited you to join ${v("workspace_name")} on Acme a few days ago. Accept it to see the team's dashboards and reports.`)}
${details([
	{ label: "Workspace", value: v("workspace_name") },
	{ label: "Invited by", value: v("inviter_name") },
	{ label: "Expires", value: v("invite_expiry"), strong: true },
])}
${button("{{{invite_url}}}", "Accept invitation")}
${text("If you weren't expecting this invitation, you can ignore this email.", { marginBottom: 24 })}
${fallback("{{{invite_url}}}")}
${footer()}`,
	});
}

function inviteExpiredHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme invitation has expired",
		preview: "Ask for a new invite to join the workspace.",
		body: `${logo(origin)}
${heading("Your invitation has expired")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, the invitation to join ${v("workspace_name")} expired on ${v("invite_expiry")}. For security, invitations are valid for 7 days.`)}
${text(`You can ask ${v("inviter_name")} to send a new one, or request access below and a workspace admin will be notified.`, { marginBottom: 28 })}
${button("{{{request_access_url}}}", "Request a new invite")}
${text("If you've already joined from another invitation, there's nothing else to do.", { marginBottom: 24 })}
${fallback("{{{request_access_url}}}")}
${footer()}`,
	});
}

function roleChangedHtml(origin: string): string {
	return acmeEmail({
		title: "Your role on Acme has changed",
		preview: "You now have a new role in your workspace.",
		body: `${logo(origin)}
${heading("Your role has changed")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, ${v("changed_by")} updated your role in ${v("workspace_name")}.`)}
${details([
	{ label: "Previous role", value: v("previous_role") },
	{
		label: "New role",
		value: v("new_role"),
		note: "Can manage websites, goals, and team members",
		strong: true,
	},
])}
${button("{{{dashboard_url}}}", "Open workspace")}
${text(`If you think this was a mistake, reply to this email or contact ${v("changed_by")}.`, { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer()}`,
	});
}

function memberRemovedHtml(origin: string): string {
	return acmeEmail({
		title: "You've been removed from an Acme workspace",
		preview: "You no longer have access to this workspace.",
		body: `${logo(origin)}
${heading(`You no longer have access to ${v("workspace_name")}`)}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, a workspace admin removed you from ${v("workspace_name")} on ${v("removed_date")}. Its dashboards, reports, and shared links are no longer available to you.`)}
${text("Your Acme account is still active, along with any other workspaces you belong to. Nothing you created in your own workspaces has changed.", { marginBottom: 28 })}
${button("{{{dashboard_url}}}", "Go to my workspaces")}
${text("If you think this was a mistake, reach out to the workspace owner.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer()}`,
	});
}

function ownershipTransferredHtml(origin: string): string {
	return acmeEmail({
		title: "You're now the owner of an Acme workspace",
		preview:
			"Workspace ownership, including billing, has been transferred to you.",
		body: `${logo(origin)}
${eyebrow("Ownership transfer")}
${heading("You're now the workspace owner")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, ${v("previous_owner")} transferred ownership of ${v("workspace_name")} to you. Here's what that means.`, 32)}
${step(1, "Billing is yours", "Invoices and payment details now go to you. Review the payment method on file.")}
${step(2, "You manage the team", "You can invite people, change roles, and remove members.")}
${step(3, "Only you can delete it", `Deleting the workspace or transferring it again now requires your approval. ${v("previous_owner")} stays on as an admin.`)}
${button("{{{settings_url}}}", "Review workspace settings")}
${text("If you didn't expect this, contact support and we'll help sort it out.", { marginBottom: 24 })}
${fallback("{{{settings_url}}}")}
${footer()}`,
	});
}

function accessRequestHtml(origin: string): string {
	return acmeEmail({
		title: "Someone wants to join your Acme workspace",
		preview: "Review a request to join your workspace.",
		body: `${logo(origin)}
${heading("New request to join your workspace")}
${lead(`${v("requester_name")} asked to join ${v("workspace_name")}. As an admin, you can approve or decline the request.`)}
${details([
	{ label: "Name", value: v("requester_name") },
	{ label: "Email", value: v("requester_email") },
	{ label: "Requested role", value: "Viewer" },
	{
		label: "Message",
		value: "I'm on the growth team and need the funnel reports.",
	},
])}
${button("{{{review_url}}}", "Review request")}
${text("Approving adds one seat to your plan. Requests expire after 14 days.", { marginBottom: 24 })}
${fallback("{{{review_url}}}")}
${footer()}`,
	});
}

function seatAddedHtml(origin: string): string {
	return acmeEmail({
		title: "A seat was added to your Acme plan",
		preview:
			"Your workspace now has one more seat. Here's how it affects billing.",
		body: `${logo(origin)}
${heading("A seat was added to your plan")}
${lead(`${v("member_name")} joined ${v("workspace_name")}, so we added a seat to your Pro plan. The change is prorated for the rest of this billing period.`)}
${text("6 of 6 seats in use", { color: acme.ink, marginBottom: 20 })}
${details([
	{ label: "Seat price", value: "$12.00 / month" },
	{
		label: "Prorated charge today",
		value: "$6.40",
		note: "For Oct 14 to Oct 31, 2026",
	},
	{ label: "Next invoice", value: "$120.00", strong: true },
])}
${button("{{{billing_url}}}", "Manage seats")}
${text("You can remove unused seats at any time from billing settings.", { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}

const workspace = {
	name: "workspace_name",
	type: "string",
	defaultValue: "Acme Studio",
} as const;
const firstName = {
	name: "first_name",
	type: "string",
	defaultValue: "there",
} as const;

export const teamTemplates: EmailTemplateExample[] = [
	{
		id: "acme-team-invite-reminder",
		name: "Invite reminder",
		slug: "acme-team-invite-reminder",
		category: "team",
		description:
			"Acme reminder that a workspace invitation is still pending, with its expiry date.",
		html: inviteReminderHtml,
		variables: [
			{ name: "inviter_name", type: "string", defaultValue: "Maya" },
			workspace,
			{ name: "invite_expiry", type: "string", defaultValue: "Oct 18, 2026" },
			{ name: "invite_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-team-invite-expired",
		name: "Invite expired",
		slug: "acme-team-invite-expired",
		category: "team",
		description:
			"Acme notice that a workspace invitation expired, with a link to request a new one.",
		html: inviteExpiredHtml,
		variables: [
			firstName,
			workspace,
			{ name: "inviter_name", type: "string", defaultValue: "Maya" },
			{ name: "invite_expiry", type: "string", defaultValue: "Oct 11, 2026" },
			{ name: "request_access_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-team-role-changed",
		name: "Role changed",
		slug: "acme-team-role-changed",
		category: "team",
		description:
			"Acme notice that a member's workspace role changed, showing the old and new role.",
		html: roleChangedHtml,
		variables: [
			firstName,
			workspace,
			{ name: "changed_by", type: "string", defaultValue: "Maya" },
			{ name: "previous_role", type: "string", defaultValue: "Viewer" },
			{ name: "new_role", type: "string", defaultValue: "Admin" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-team-member-removed",
		name: "Member removed",
		slug: "acme-team-member-removed",
		category: "team",
		description:
			"Acme notice that a member was removed from a workspace and what they keep.",
		html: memberRemovedHtml,
		variables: [
			firstName,
			workspace,
			{ name: "removed_date", type: "string", defaultValue: "Oct 14, 2026" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-team-ownership-transferred",
		name: "Ownership transferred",
		slug: "acme-team-ownership-transferred",
		category: "team",
		description:
			"Acme notice to a new workspace owner explaining billing, team, and deletion rights.",
		html: ownershipTransferredHtml,
		variables: [
			firstName,
			workspace,
			{ name: "previous_owner", type: "string", defaultValue: "Maya" },
			{ name: "settings_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-team-access-request",
		name: "Access request",
		slug: "acme-team-access-request",
		category: "team",
		description:
			"Acme alert to admins that someone asked to join their workspace, with approve link.",
		html: accessRequestHtml,
		variables: [
			workspace,
			{ name: "requester_name", type: "string", defaultValue: "Jordan Lee" },
			{
				name: "requester_email",
				type: "string",
				defaultValue: "jordan@acme.example",
			},
			{ name: "review_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-team-seat-added",
		name: "Seat added",
		slug: "acme-team-seat-added",
		category: "team",
		description:
			"Acme billing notice that a new member added a seat, with the prorated charge.",
		html: seatAddedHtml,
		variables: [
			workspace,
			{ name: "member_name", type: "string", defaultValue: "Jordan Lee" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
];
