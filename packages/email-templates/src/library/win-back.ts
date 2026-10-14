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
	link,
	logo,
	offer,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

/** Merge-tag span the editor recognizes as a variable. */
function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

const hi = `Hi <span data-variable="first_name">{{{first_name}}}</span>`;

function weMissYouHtml(origin: string): string {
	return acmeEmail({
		title: "We miss you at Acme",
		preview: "Your dashboards are right where you left them.",
		body: `${logo(origin)}
${heading("It's been a while")}
${lead(`${hi}, we haven't seen you in Acme for a few weeks. Your dashboards, goals, and reports for ${v("website_name")} are right where you left them.`)}
${text("Acme has kept collecting data the whole time, so there's plenty to catch up on.", { marginBottom: 28 })}
${button("{{{dashboard_url}}}", "Open my dashboard")}
${text("If Acme isn't a fit anymore, we'd love to know why. Just reply to this email.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function inactiveCheckInHtml(origin: string): string {
	return acmeEmail({
		title: "Here's what you missed in the last 30 days",
		preview: "Your site kept getting visitors while you were away.",
		body: `${logo(origin)}
${heading("Here's what you missed")}
${lead(`${hi}, it's been 30 days since you last signed in. ${v("website_name")} kept getting visitors in the meantime.`)}
${details([
	{ label: "Visitors", value: "18,940" },
	{ label: "New top source", value: "LinkedIn", note: "Up from fourth place" },
	{ label: "Busiest day", value: "Sep 29, 2026" },
	{ label: "Conversions", value: "412", strong: true },
])}
${button("{{{dashboard_url}}}", "See the full picture")}
${text("Prefer a summary by email instead? Turn on the weekly report in notification settings.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function canceledFeedbackHtml(origin: string): string {
	return acmeEmail({
		title: "Can we ask why you left Acme?",
		preview: "Two minutes of feedback, and 20% off if you'd like to return.",
		body: `${logo(origin)}
${heading("Can we ask why you left?")}
${lead(`${hi}, your Acme subscription ended on ${v("canceled_date")}. We'd really like to know what we could have done better.`)}
${text(`It takes about two minutes, and every answer is read by our product team. ${link("{{{feedback_url}}}", "Share feedback")}.`, { marginBottom: 28 })}
${text("And if you'd like to give us another go, here's something to make it easier.", { marginBottom: 20 })}
${offer({
	amount: "20% off",
	label: "for 6 months when you come back",
	code: v("coupon_code"),
	expires: `Offer ends ${v("offer_expiry")}`,
})}
${button("{{{reactivate_url}}}", "Restart my subscription")}
${fallback("{{{reactivate_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function pauseInsteadHtml(origin: string): string {
	return acmeEmail({
		title: "Pause Acme instead of canceling",
		preview: "Take a break for up to 3 months without losing your data.",
		body: `${logo(origin)}
${heading("Need a break? Pause instead")}
${lead(`${hi}, we noticed you started canceling ${v("workspace_name")}. If you just need some time off, you can pause your plan instead.`)}
${details([
	{ label: "Pause length", value: "1, 2, or 3 months" },
	{ label: "Cost while paused", value: "$0.00" },
	{ label: "Your data", value: "Kept in full", strong: true },
])}
${button("{{{pause_url}}}", "Pause my plan")}
${text(`Tracking stops while you're paused and resumes automatically on the date you pick. Still want to cancel? ${link("{{{cancel_url}}}", "Finish canceling")}.`, { marginBottom: 24 })}
${fallback("{{{pause_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function changelogHtml(origin: string): string {
	return acmeEmail({
		title: "What's new at Acme since you left",
		preview: "Funnels, a faster dashboard, and Slack alerts.",
		body: `${logo(origin)}
${eyebrow(`New since ${v("last_active_date")}`)}
${heading("A few things you might like")}
${lead(`${hi}, we've shipped a lot since you last used Acme. Here are the updates people ask about most.`, 32)}
${step(1, "Funnels", "See where visitors drop off between any two pages or events.")}
${step(2, "Dashboards load 3x faster", "Even workspaces with millions of events a month now load in under a second.")}
${step(3, "Slack alerts", "Get traffic spikes, drops, and goal updates in the channel of your choice.")}
${step(4, "Shared links", "Send a read-only dashboard to clients without adding them as members.")}
${button("{{{reactivate_url}}}", "Take a look")}
${text(`Your workspace is still on the Free plan, so you can try most of this right away. ${link("#", "Read the full changelog")}.`, { marginBottom: 24 })}
${fallback("{{{reactivate_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function dataExpiringHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme data will be deleted in 30 days",
		preview: "Reactivate or export your data before it's removed.",
		body: `${logo(origin)}
${heading("Your data will be deleted in 30 days")}
${lead(`${hi}, ${v("workspace_name")} has been inactive for 11 months. To keep things tidy, we remove data from inactive workspaces after 12 months.`)}
${details([
	{ label: "Workspace", value: v("workspace_name") },
	{ label: "Data stored", value: "2.3 million events" },
	{ label: "Deletion date", value: v("deletion_date"), strong: true },
])}
${button("{{{reactivate_url}}}", "Keep my data")}
${text(`Signing in once is enough to keep everything. Prefer to take it with you? ${link("{{{export_url}}}", "Export your data")} as CSV.`, { marginBottom: 24 })}
${fallback("{{{reactivate_url}}}")}
${footer()}`,
	});
}

function lastChanceHtml(origin: string): string {
	return acmeEmail({
		title: "Last chance to keep your Acme data",
		preview: "Your workspace data will be permanently deleted in 3 days.",
		body: `${logo(origin)}
${eyebrow("Final notice")}
${heading("Your data will be deleted in 3 days")}
${lead(`${hi}, this is our last reminder. On ${v("deletion_date")}, all data in ${v("workspace_name")} will be permanently deleted. This can't be undone.`)}
${text("That includes every event, dashboard, goal, and saved report.", { color: acme.ink, marginBottom: 28 })}
${button("{{{reactivate_url}}}", "Keep my workspace")}
${text(`Just want a copy? ${link("{{{export_url}}}", "Download an export")} before the deletion date. If you're happy to let it go, there's nothing you need to do.`, { marginBottom: 24 })}
${fallback("{{{reactivate_url}}}")}
${footer()}`,
	});
}

function freeMonthHtml(origin: string): string {
	return acmeEmail({
		title: "Your next month of Acme is on us",
		preview: "Reactivate Acme Pro and your first month back is free.",
		body: `${logo(origin)}
${heading("Come back, the first month is on us")}
${lead(`${hi}, we'd love to have ${v("workspace_name")} back. Reactivate Acme Pro and we'll cover your first month.`)}
${offer({
	amount: "Free",
	label: "first month of Acme Pro",
	code: v("coupon_code"),
	expires: `Reactivate by ${v("offer_expiry")}`,
})}
${button("{{{reactivate_url}}}", "Reactivate for free")}
${text("Your settings and history are still here. Cancel anytime before the month ends and you won't be charged.", { marginBottom: 24 })}
${fallback("{{{reactivate_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function stillInterestedHtml(origin: string): string {
	return acmeEmail({
		title: "Still interested in Acme?",
		preview: "One click to tell us whether to keep emailing you.",
		body: `${logo(origin)}
${heading("Still interested in Acme?")}
${lead(`${hi}, we haven't heard from you in a while and don't want to fill your inbox with emails you don't read.`)}
${text("Let us know with one click:", { color: acme.ink, marginBottom: 20 })}
${button("{{{stay_subscribed_url}}}", "Yes, keep me updated")}
${text(`Not anymore? ${link("{{{opt_out_url}}}", "Stop these emails")}. If we don't hear back, we'll stop sending product updates after ${v("cutoff_date")}. Your account stays open either way.`, { marginBottom: 24 })}
${fallback("{{{stay_subscribed_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

export const winBackTemplates: EmailTemplateExample[] = [
	{
		id: "acme-winback-we-miss-you",
		name: "We miss you",
		slug: "acme-winback-we-miss-you",
		category: "win-back",
		description:
			"Acme gentle nudge for a user who hasn't signed in lately, with no discount.",
		html: weMissYouHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "website_name", type: "string", defaultValue: "acme.example" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-winback-inactive-30-days",
		name: "30-day check-in",
		slug: "acme-winback-inactive-30-days",
		category: "win-back",
		description:
			"Acme check-in after 30 days away, summarizing traffic the user missed.",
		html: inactiveCheckInHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "website_name", type: "string", defaultValue: "acme.example" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-winback-cancel-feedback",
		name: "Cancellation feedback",
		slug: "acme-winback-cancel-feedback",
		category: "win-back",
		description:
			"Acme request for feedback after a cancellation, with a comeback coupon.",
		html: canceledFeedbackHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "canceled_date", type: "string", defaultValue: "Oct 1, 2026" },
			{ name: "coupon_code", type: "string", defaultValue: "RETURN20" },
			{ name: "offer_expiry", type: "string", defaultValue: "Oct 31, 2026" },
			{ name: "feedback_url", type: "string", defaultValue: null },
			{ name: "reactivate_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-winback-pause-instead",
		name: "Pause instead of cancel",
		slug: "acme-winback-pause-instead",
		category: "win-back",
		description:
			"Acme offer to pause a plan for up to three months instead of canceling.",
		html: pauseInsteadHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "pause_url", type: "string", defaultValue: null },
			{ name: "cancel_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-winback-whats-new",
		name: "What's new since you left",
		slug: "acme-winback-whats-new",
		category: "win-back",
		description:
			"Acme changelog roundup for lapsed users, listing features shipped since they left.",
		html: changelogHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{
				name: "last_active_date",
				type: "string",
				defaultValue: "May 2026",
			},
			{ name: "reactivate_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-winback-data-expiring",
		name: "Data expiring",
		slug: "acme-winback-data-expiring",
		category: "win-back",
		description:
			"Acme 30-day warning that an inactive workspace's data will be deleted.",
		html: dataExpiringHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "deletion_date", type: "string", defaultValue: "Nov 13, 2026" },
			{ name: "reactivate_url", type: "string", defaultValue: null },
			{ name: "export_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-winback-last-chance",
		name: "Last chance before deletion",
		slug: "acme-winback-last-chance",
		category: "win-back",
		description:
			"Acme final notice three days before an inactive workspace is permanently deleted.",
		html: lastChanceHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "deletion_date", type: "string", defaultValue: "Oct 17, 2026" },
			{ name: "reactivate_url", type: "string", defaultValue: null },
			{ name: "export_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-winback-free-month",
		name: "Free month back",
		slug: "acme-winback-free-month",
		category: "win-back",
		description:
			"Acme reactivation offer with the first month back free and a coupon code.",
		html: freeMonthHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "coupon_code", type: "string", defaultValue: "FREEMONTH" },
			{ name: "offer_expiry", type: "string", defaultValue: "Oct 31, 2026" },
			{ name: "reactivate_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-winback-still-interested",
		name: "Still interested?",
		slug: "acme-winback-still-interested",
		category: "win-back",
		description:
			"Acme one-click re-engagement check asking whether to keep sending emails.",
		html: stillInterestedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "cutoff_date", type: "string", defaultValue: "Oct 28, 2026" },
			{ name: "stay_subscribed_url", type: "string", defaultValue: null },
			{ name: "opt_out_url", type: "string", defaultValue: null },
		],
	},
];
