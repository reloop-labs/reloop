import {
	acme,
	acmeEmail,
	block,
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

/** Tinted quote panel for a comment or note someone left. */
function quote(html: string): string {
	return block(
		`<p style="margin:0;font-size:15px;line-height:24px;color:${acme.ink};font-family:${acme.font}">${html}</p>`,
		`padding:16px 18px;background-color:${acme.tint};border-radius:8px`,
		"margin:0 0 28px 0",
	);
}

/** Big centered number with a caption under it. */
function stat(value: string, caption: string): string {
	return block(
		`<p style="margin:0;font-size:44px;line-height:50px;font-weight:600;letter-spacing:-0.03em;color:${acme.ink};text-align:center;font-family:${acme.font}">${value}</p>
<p style="margin:6px 0 0 0;font-size:15px;line-height:24px;color:${acme.body};text-align:center;font-family:${acme.font}">${caption}</p>`,
		`padding:28px 24px;background-color:${acme.tint};border-radius:12px`,
		"margin:0 0 32px 0",
	);
}

function dailyDigestHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme daily digest",
		preview: "Yesterday's visitors, top page, and conversions at a glance.",
		body: `${logo(origin)}
${eyebrow(`Daily digest · ${v("digest_date")}`)}
${heading("Here's how yesterday went")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, a quick look at ${v("website_name")} for the last 24 hours.`)}
${details([
	{ label: "Visitors", value: "3,482", note: "Up 12% from the day before" },
	{ label: "Pageviews", value: "9,107" },
	{ label: "Top page", value: "/pricing" },
	{ label: "Signups", value: "41", strong: true },
])}
${button("{{{dashboard_url}}}", "Open dashboard")}
${text("You get this digest every morning at 8:00 AM. Change the time or switch to weekly in notification settings.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function commentReplyHtml(origin: string): string {
	return acmeEmail({
		title: "New reply to your comment on Acme",
		preview: "Someone replied to your comment on a dashboard.",
		body: `${logo(origin)}
${heading(`${v("replier_name")} replied to your comment`)}
${lead(`On the ${v("dashboard_name")} dashboard in ${v("workspace_name")}.`, 24)}
${text("You wrote", { marginBottom: 8, size: 13, color: acme.muted })}
${text("Why did signups dip on Tuesday? Traffic looks normal.", { marginBottom: 20 })}
${text(`${v("replier_name")} replied`, { marginBottom: 8, size: 13, color: acme.muted })}
${quote("The signup form was down for about two hours after the deploy. It's fixed now, and I've added an annotation to the chart.")}
${button("{{{comment_url}}}", "View conversation")}
${fallback("{{{comment_url}}}")}
${footer()}`,
	});
}

function reportAssignedHtml(origin: string): string {
	return acmeEmail({
		title: "A report was assigned to you on Acme",
		preview: "You've been asked to review a report before it's due.",
		body: `${logo(origin)}
${heading("A report was assigned to you")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, ${v("assigner_name")} asked you to review a report in ${v("workspace_name")}.`)}
${details([
	{ label: "Report", value: v("report_name") },
	{ label: "Assigned by", value: v("assigner_name") },
	{ label: "Due", value: v("due_date"), strong: true },
])}
${button("{{{report_url}}}", "Open report")}
${text("You'll get a reminder the day before it's due.", { marginBottom: 24 })}
${fallback("{{{report_url}}}")}
${footer()}`,
	});
}

function sharedWithYouHtml(origin: string): string {
	return acmeEmail({
		title: "A dashboard was shared with you on Acme",
		preview: "You now have access to a shared dashboard.",
		body: `${logo(origin)}
${heading(`${v("sharer_name")} shared a dashboard with you`)}
${lead(`You can now view ${v("dashboard_name")} in ${v("workspace_name")}.`, 24)}
${quote(`"Here's the campaign dashboard we talked about. The UTM breakdown is at the bottom." · ${v("sharer_name")}`)}
${button("{{{dashboard_url}}}", "Open dashboard")}
${text("You have view access. Ask the owner if you need to edit it.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer()}`,
	});
}

function scheduledReportHtml(origin: string): string {
	return acmeEmail({
		title: "Your scheduled Acme report is ready",
		preview: "Your scheduled report has finished and is ready to view.",
		body: `${logo(origin)}
${heading("Your scheduled report is ready")}
${lead(`${v("report_name")} for ${v("report_period")} has finished running. Open it in Acme or download the CSV.`)}
${details([
	{ label: "Report", value: v("report_name") },
	{ label: "Period", value: v("report_period") },
	{ label: "Rows", value: "1,248" },
	{ label: "Format", value: "CSV · 186 KB" },
])}
${button("{{{report_url}}}", "View report")}
${text(`This report runs every Monday at 9:00 AM. Edit the schedule from the report's settings.`, { marginBottom: 24 })}
${fallback("{{{report_url}}}")}
${footer()}`,
	});
}

function goalReachedHtml(origin: string): string {
	return acmeEmail({
		title: "You hit your goal on Acme",
		preview: "Your website reached its monthly goal ahead of schedule.",
		body: `${logo(origin)}
${eyebrow("Goal reached")}
${heading(`${v("website_name")} hit its goal`)}
${lead(`Nice work, <span data-variable="first_name">{{{first_name}}}</span>. ${v("goal_name")} reached its target 9 days before the end of the month.`)}
${stat("1,000", "signups this month, against a target of 1,000")}
${button("{{{goal_url}}}", "See what drove it")}
${text("Want to keep going? Raise the target for next month from the goal's settings.", { marginBottom: 24 })}
${fallback("{{{goal_url}}}")}
${footer()}`,
	});
}

function trafficDropHtml(origin: string): string {
	return acmeEmail({
		title: "Unusual drop in traffic on Acme",
		preview: "Visitors are well below what we'd expect for this time of day.",
		body: `${logo(origin)}
${heading("Traffic dropped unexpectedly")}
${lead(`${v("website_name")} had 62% fewer visitors than expected in the last 3 hours. This often means the tracking script was removed or a page is down.`)}
${details([
	{ label: "Expected visitors", value: "about 1,450" },
	{ label: "Actual visitors", value: "551", strong: true },
	{ label: "Detected", value: v("detected_at") },
])}
${text("Worth checking", { color: acme.ink, marginBottom: 16 })}
${step(1, "Is the script still installed?", "Open your site and confirm the Acme script loads in the page source.")}
${step(2, "Did anything ship recently?", "A deploy or tag manager change can remove tracking by accident.")}
${button("{{{alert_url}}}", "Investigate")}
${fallback("{{{alert_url}}}")}
${footer()}`,
	});
}

function monthlySummaryHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme monthly summary",
		preview: "Last month's visitors, top sources, and conversions.",
		body: `${logo(origin)}
${eyebrow(v("summary_month"))}
${heading("Your month in review")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, here's how ${v("website_name")} did last month compared with the month before.`)}
${details([
	{ label: "Visitors", value: "84,310", note: "Up 18%" },
	{ label: "Avg. visit duration", value: "2m 41s", note: "Up 9s" },
	{ label: "Top source", value: "Google", note: "38% of visitors" },
	{ label: "Conversions", value: "2,064", note: "Up 11%", strong: true },
])}
${button("{{{dashboard_url}}}", "See full summary")}
${text("Your best day was Sep 8, when a newsletter feature sent 6,120 visitors.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

export const notificationsTemplates: EmailTemplateExample[] = [
	{
		id: "acme-notify-daily-digest",
		name: "Daily digest",
		slug: "acme-notify-daily-digest",
		category: "notifications",
		description:
			"Acme morning digest with yesterday's visitors, top page, and signups.",
		html: dailyDigestHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "website_name", type: "string", defaultValue: "acme.example" },
			{ name: "digest_date", type: "string", defaultValue: "Oct 13, 2026" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-notify-comment-reply",
		name: "Comment reply",
		slug: "acme-notify-comment-reply",
		category: "notifications",
		description:
			"Acme notice that someone replied to your dashboard comment, quoting both.",
		html: commentReplyHtml,
		variables: [
			{ name: "replier_name", type: "string", defaultValue: "Maya" },
			{ name: "dashboard_name", type: "string", defaultValue: "Signups" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "comment_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-notify-report-assigned",
		name: "Report assigned",
		slug: "acme-notify-report-assigned",
		category: "notifications",
		description:
			"Acme notice that a teammate assigned you a report to review, with a due date.",
		html: reportAssignedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "assigner_name", type: "string", defaultValue: "Maya" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "report_name", type: "string", defaultValue: "Q3 funnel review" },
			{ name: "due_date", type: "string", defaultValue: "Oct 18, 2026" },
			{ name: "report_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-notify-shared-with-you",
		name: "Shared with you",
		slug: "acme-notify-shared-with-you",
		category: "notifications",
		description:
			"Acme notice that a teammate shared a dashboard with you, with their note.",
		html: sharedWithYouHtml,
		variables: [
			{ name: "sharer_name", type: "string", defaultValue: "Maya" },
			{
				name: "dashboard_name",
				type: "string",
				defaultValue: "Fall campaign",
			},
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-notify-scheduled-report",
		name: "Scheduled report ready",
		slug: "acme-notify-scheduled-report",
		category: "notifications",
		description:
			"Acme notice that a scheduled report finished running, with its size and period.",
		html: scheduledReportHtml,
		variables: [
			{ name: "report_name", type: "string", defaultValue: "Weekly sources" },
			{
				name: "report_period",
				type: "string",
				defaultValue: "Oct 5 to Oct 11, 2026",
			},
			{ name: "report_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-notify-goal-reached",
		name: "Goal reached",
		slug: "acme-notify-goal-reached",
		category: "notifications",
		description:
			"Acme celebration email when a website hits its monthly goal early.",
		html: goalReachedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "website_name", type: "string", defaultValue: "acme.example" },
			{ name: "goal_name", type: "string", defaultValue: "Monthly signups" },
			{ name: "goal_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-notify-traffic-drop",
		name: "Traffic drop alert",
		slug: "acme-notify-traffic-drop",
		category: "notifications",
		description:
			"Acme anomaly alert for an unexpected traffic drop, with things to check.",
		html: trafficDropHtml,
		variables: [
			{ name: "website_name", type: "string", defaultValue: "acme.example" },
			{
				name: "detected_at",
				type: "string",
				defaultValue: "Oct 14, 2026, 2:15 PM UTC",
			},
			{ name: "alert_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-notify-monthly-summary",
		name: "Monthly summary",
		slug: "acme-notify-monthly-summary",
		category: "notifications",
		description:
			"Acme month-in-review email comparing visitors, sources, and conversions.",
		html: monthlySummaryHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "website_name", type: "string", defaultValue: "acme.example" },
			{ name: "summary_month", type: "string", defaultValue: "September 2026" },
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
];
