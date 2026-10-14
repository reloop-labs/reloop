import {
	acme,
	acmeEmail,
	button,
	code,
	details,
	eyebrow,
	fallback,
	footer,
	heading,
	lead,
	link,
	logo,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

function profileUpdatedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme profile was updated",
		preview: "Your name and time zone were changed.",
		body: `${logo(origin)}
${heading("Your profile was updated")}
${lead(`Hi ${v("first_name")}, a few details on your Acme profile just changed. Here's what's different.`)}
${details([
	{ label: "Name", note: "Was Alex Kim", value: "Alex Kim-Rivera" },
	{ label: "Time zone", note: "Was UTC", value: "Europe/Lisbon" },
	{ label: "Changed", value: v("changed_at") },
])}
${button("{{{profile_url}}}", "View profile")}
${text("Reports and scheduled emails now use your new time zone. If you didn't make these changes, review your profile and change your password.", { marginBottom: 24 })}
${fallback("{{{profile_url}}}")}
${footer()}`,
	});
}

function deletionScheduledHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme account will be deleted in 14 days",
		preview: "Changed your mind? You can cancel the deletion until then.",
		body: `${logo(origin)}
${heading("Your account will be deleted in 14 days")}
${lead(`Hi ${v("first_name")}, we received your request to delete your Acme account. It's scheduled for permanent deletion on ${v("deletion_date")}.`)}
${text("Until then, you can still sign in and cancel. After that date we'll remove:", { color: acme.ink, marginBottom: 8 })}
${text("Your profile and sign-in methods<br />Workspaces you own and their websites<br />All collected events, reports, and dashboards", { marginBottom: 28 })}
${button("{{{cancel_deletion_url}}}", "Keep my account")}
${text(`Want a copy of your data first? ${link("{{{export_url}}}", "Export it")} before the deletion date.`, { marginBottom: 24 })}
${fallback("{{{cancel_deletion_url}}}")}
${footer()}`,
	});
}

function reactivatedHtml(origin: string): string {
	return acmeEmail({
		title: "Welcome back to Acme",
		preview:
			"Your account is active again and your data is right where you left it.",
		body: `${logo(origin)}
${heading("Your account is active again")}
${lead(`Welcome back, ${v("first_name")}. Your Acme account has been reactivated, and everything is right where you left it.`)}
${details([
	{ label: "Workspaces", value: "2" },
	{ label: "Websites", value: "5" },
	{ label: "Dashboards", value: "11" },
	{ label: "Reactivated", value: v("reactivated_date"), strong: true },
])}
${button("{{{dashboard_url}}}", "Open dashboard")}
${text("Tracking resumes as soon as visitors arrive. Data from the time your account was inactive wasn't collected.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer()}`,
	});
}

function suspendedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme account has been suspended",
		preview: "Data collection is paused. Here's how to restore access.",
		body: `${logo(origin)}
${eyebrow("Action required")}
${heading("Your account has been suspended")}
${lead(`Hi ${v("first_name")}, we've suspended ${v("workspace_name")} because of activity that goes against our terms of service. Data collection and dashboard access are paused.`)}
${details([
	{ label: "Reason", value: v("suspension_reason") },
	{ label: "Suspended", value: v("suspended_date") },
	{ label: "Case number", value: v("case_number") },
])}
${button("{{{appeal_url}}}", "Request a review")}
${text("Your existing data is kept safe while we review. Most reviews are completed within two business days.", { marginBottom: 24 })}
${fallback("{{{appeal_url}}}")}
${footer()}`,
	});
}

function notificationPreferencesHtml(origin: string): string {
	return acmeEmail({
		title: "Your notification settings changed",
		preview: "Here's what Acme will email you about from now on.",
		body: `${logo(origin)}
${heading("Your notification settings changed")}
${lead(`Hi ${v("first_name")}, you updated which emails you get from Acme. Here's your current setup.`)}
${details([
	{ label: "Weekly report", value: "On" },
	{ label: "Usage alerts", value: "On" },
	{ label: "Mentions and comments", value: "Daily digest" },
	{ label: "Product updates", value: "Off" },
])}
${button("{{{preferences_url}}}", "Edit preferences")}
${text("Security and billing emails are always sent, so you never miss something important about your account.", { marginBottom: 24 })}
${fallback("{{{preferences_url}}}")}
${footer()}`,
	});
}

function usernameChangedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme username changed",
		preview: "Your username and profile link have been updated.",
		body: `${logo(origin)}
${heading("Your username changed")}
${lead(`Hi ${v("first_name")}, your Acme username is now <span style="color:${acme.ink}">@${v("new_username")}</span>. Teammates will see it next to your comments and mentions.`)}
${text("Your public profile link is now:", { marginBottom: 12 })}
${code(["acme.example/u/{{{new_username}}}"])}
${text(`Old links to @${v("old_username")} redirect for 30 days. After that, the name may be claimed by someone else.`, { marginBottom: 28 })}
${button("{{{profile_url}}}", "View profile")}
${text("Didn't make this change? Change your password and contact support.", { marginBottom: 24 })}
${fallback("{{{profile_url}}}")}
${footer()}`,
	});
}

function connectedAppHtml(origin: string): string {
	return acmeEmail({
		title: "A new app can access your Acme account",
		preview: "You authorized an app to read your Acme data.",
		body: `${logo(origin)}
${heading("A new app was connected")}
${lead(`Hi ${v("first_name")}, you gave ${v("app_name")} access to ${v("workspace_name")}. It can now use Acme on your behalf with the permissions below.`)}
${details([
	{ label: "App", value: v("app_name") },
	{
		label: "Permissions",
		note: "Websites, events, and reports",
		value: "Read only",
	},
	{ label: "Authorized", value: v("authorized_at") },
])}
${button("{{{connected_apps_url}}}", "Review connected apps")}
${text("You can revoke access at any time. If you don't recognize this app, revoke it now and change your password.", { marginBottom: 24 })}
${fallback("{{{connected_apps_url}}}")}
${footer()}`,
	});
}

function phoneAddedHtml(origin: string): string {
	return acmeEmail({
		title: "A phone number was added to your Acme account",
		preview: "You can now use it for sign-in codes and account recovery.",
		body: `${logo(origin)}
${heading("A phone number was added")}
${lead(`Hi ${v("first_name")}, the number ending in ${v("phone_last4")} is now linked to your Acme account. Here's what it's used for.`, 32)}
${step(1, "Sign-in codes", "We can text you a code when you sign in from a new device.")}
${step(2, "Account recovery", "If you lose access to your email, we'll verify it's you by text.")}
${step(3, "Critical alerts", "Optional texts when a workspace hits its limit or a payment fails.")}
${button("{{{security_url}}}", "Manage phone number")}
${text("Didn't add this number? Remove it from your security settings and change your password.", { marginBottom: 24 })}
${fallback("{{{security_url}}}")}
${footer()}`,
	});
}

export const accountTemplates: EmailTemplateExample[] = [
	{
		id: "acme-profile-updated",
		name: "Profile updated",
		slug: "acme-profile-updated",
		category: "account",
		description:
			"Acme confirmation listing which profile fields changed, with old and new values.",
		html: profileUpdatedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{
				name: "changed_at",
				type: "string",
				defaultValue: "Oct 14, 2026, 11:05 AM UTC",
			},
			{ name: "profile_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-account-deletion-scheduled",
		name: "Deletion scheduled",
		slug: "acme-account-deletion-scheduled",
		category: "account",
		description:
			"Acme notice that an account will be deleted after a 14-day grace period.",
		html: deletionScheduledHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "deletion_date", type: "string", defaultValue: "Oct 28, 2026" },
			{ name: "cancel_deletion_url", type: "string", defaultValue: null },
			{ name: "export_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-account-reactivated",
		name: "Account reactivated",
		slug: "acme-account-reactivated",
		category: "account",
		description:
			"Acme welcome back when a deactivated account is restored with its data.",
		html: reactivatedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{
				name: "reactivated_date",
				type: "string",
				defaultValue: "Oct 14, 2026",
			},
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-account-suspended",
		name: "Account suspended",
		slug: "acme-account-suspended",
		category: "account",
		description:
			"Acme notice that a workspace was suspended, with the reason and how to appeal.",
		html: suspendedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{
				name: "suspension_reason",
				type: "string",
				defaultValue: "Unusual traffic",
			},
			{ name: "suspended_date", type: "string", defaultValue: "Oct 14, 2026" },
			{ name: "case_number", type: "string", defaultValue: "CASE-20931" },
			{ name: "appeal_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-notification-preferences-updated",
		name: "Notification preferences",
		slug: "acme-notification-preferences-updated",
		category: "account",
		description:
			"Acme summary of a user's email notification settings after they change them.",
		html: notificationPreferencesHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "preferences_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-username-changed",
		name: "Username changed",
		slug: "acme-username-changed",
		category: "account",
		description:
			"Acme confirmation of a new username and profile link, with a redirect window.",
		html: usernameChangedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "new_username", type: "string", defaultValue: "alexkim" },
			{ name: "old_username", type: "string", defaultValue: "alex_k" },
			{ name: "profile_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-connected-app-authorized",
		name: "Connected app authorized",
		slug: "acme-connected-app-authorized",
		category: "account",
		description:
			"Acme alert that a third-party app was granted access to a workspace.",
		html: connectedAppHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "app_name", type: "string", defaultValue: "Looker Studio" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{
				name: "authorized_at",
				type: "string",
				defaultValue: "Oct 14, 2026, 4:30 PM UTC",
			},
			{ name: "connected_apps_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-phone-number-added",
		name: "Phone number added",
		slug: "acme-phone-number-added",
		category: "account",
		description:
			"Acme confirmation that a phone number was added for sign-in and recovery.",
		html: phoneAddedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "phone_last4", type: "string", defaultValue: "7319" },
			{ name: "security_url", type: "string", defaultValue: null },
		],
	},
];
