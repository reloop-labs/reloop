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
	offer,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

/** Simple horizontal meter: filled share in ink on a tinted track. */
function meter(percent: number): string {
	return `<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px 0">
<tbody>
<tr>
<td width="${percent}%" style="height:8px;background-color:${acme.ink};border-radius:999px 0 0 999px;font-size:0;line-height:0">&nbsp;</td>
<td width="${100 - percent}%" style="height:8px;background-color:${acme.line};border-radius:0 999px 999px 0;font-size:0;line-height:0">&nbsp;</td>
</tr>
</tbody>
</table>`;
}

function halfwayHtml(origin: string): string {
	return acmeEmail({
		title: "You've used half of this month's events",
		preview: "Your workspace is at 50% of its monthly event allowance.",
		body: `${logo(origin)}
${heading("You're halfway through this month's events")}
${lead(`${v("workspace_name")} has used 50% of its monthly event allowance with ${v("days_left")} days left in the period. At this pace, you'll stay within your plan.`, 20)}
${text("50,000 of 100,000 events used", { color: acme.ink, marginBottom: 12 })}
${meter(50)}
${button("{{{usage_url}}}", "View usage")}
${text(`We'll email you again at 80%. You can change these alerts in ${link("{{{settings_url}}}", "notification settings")}.`, { marginBottom: 24 })}
${fallback("{{{usage_url}}}")}
${footer()}`,
	});
}

function overageHtml(origin: string): string {
	return acmeEmail({
		title: "Overage charges on your Acme plan",
		preview: "Your workspace went over its event allowance this month.",
		body: `${logo(origin)}
${heading("You've gone over your event allowance")}
${lead(`Hi ${v("first_name")}, ${v("workspace_name")} passed its monthly allowance, so we kept collecting events and added overage to your next invoice. Nothing was dropped.`)}
${details([
	{ label: "Included in Pro", value: "100,000 events" },
	{ label: "Used so far", value: "124,300 events" },
	{ label: "Overage", note: "$1.00 per 10,000 events", value: "24,300 events" },
	{
		label: "Estimated overage charge",
		value: v("overage_amount"),
		strong: true,
	},
])}
${button("{{{billing_url}}}", "Compare plans")}
${text("If you go over most months, a larger plan is usually cheaper than paying overage. You can also set a hard cap in billing settings.", { marginBottom: 24 })}
${fallback("{{{billing_url}}}")}
${footer()}`,
	});
}

function spikeHtml(origin: string): string {
	return acmeEmail({
		title: "Unusual traffic spike on your site",
		preview: "Events are coming in 6x faster than usual.",
		body: `${logo(origin)}
${eyebrow("Usage spike")}
${heading("Traffic is 6x higher than usual")}
${lead(`Hi ${v("first_name")}, ${v("website_name")} sent far more events in the last hour than it normally does. If this keeps up, you'll reach your monthly limit early.`)}
${details([
	{ label: "Last hour", value: "18,400 events" },
	{ label: "Typical hour", value: "3,100 events" },
	{ label: "Top page", value: v("top_page") },
	{ label: "Top source", value: v("top_source") },
])}
${button("{{{realtime_url}}}", "Open real-time view")}
${text("A launch or press mention? Enjoy it. If it looks like bots, turn on bot filtering in your site settings to stop counting that traffic.", { marginBottom: 24 })}
${fallback("{{{realtime_url}}}")}
${footer()}`,
	});
}

function seatsAlmostFullHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme workspace is almost out of seats",
		preview: "Only 1 seat left on your plan.",
		body: `${logo(origin)}
${heading("You have 1 seat left")}
${lead(`${v("workspace_name")} is using 9 of the 10 seats on your Team plan. Once they're full, new invites will wait until a seat opens up.`)}
${offer({ amount: "9 / 10", label: "seats in use" })}
${button("{{{members_url}}}", "Manage seats")}
${text("Extra seats are $8 per member each month. You can also remove people who no longer need access to free up a seat.", { marginBottom: 24 })}
${fallback("{{{members_url}}}")}
${footer()}`,
	});
}

function recordingsNearlyFullHtml(origin: string): string {
	return acmeEmail({
		title: "Session recording storage is nearly full",
		preview: "You've used 92% of your session recording storage.",
		body: `${logo(origin)}
${heading("Recording storage is nearly full")}
${lead(`Hi ${v("first_name")}, ${v("workspace_name")} has used 92% of its session recording storage. When it's full, new recordings stop until you free up space.`, 20)}
${text("4.6 GB of 5 GB used", { color: acme.ink, marginBottom: 12 })}
${meter(92)}
${step(1, "Shorten retention", "Keep recordings for 30 days instead of 90 to clear older sessions automatically.")}
${step(2, "Sample fewer sessions", "Record a share of visits, like 25%, instead of every one.")}
${step(3, "Add storage", "Add 10 GB for $10 a month from billing.")}
${button("{{{storage_url}}}", "Manage storage")}
${fallback("{{{storage_url}}}")}
${footer()}`,
	});
}

function rateLimitHtml(origin: string): string {
	return acmeEmail({
		title: "Your API key hit its rate limit",
		preview: "Some requests from your API key were rejected with 429.",
		body: `${logo(origin)}
${heading("Your API key hit its rate limit")}
${lead(`Requests from the key ${v("api_key_name")} went over the limit of 600 requests per minute. Some requests were rejected with a 429 status.`)}
${details([
	{ label: "Key", value: v("api_key_name") },
	{ label: "Rejected requests", value: "1,284" },
	{ label: "Window", value: v("limit_window") },
])}
${text("Responses include headers that tell you when to retry:", { marginBottom: 12 })}
${code(["HTTP/1.1 429 Too Many Requests", "Retry-After: 12", "X-RateLimit-Limit: 600", "X-RateLimit-Remaining: 0"])}
${button("{{{api_keys_url}}}", "View API usage")}
${text(`Back off and retry after the time in Retry-After. Need a higher limit? ${link("{{{support_url}}}", "Contact support")}.`, { marginBottom: 24 })}
${fallback("{{{api_keys_url}}}")}
${footer()}`,
	});
}

function limitResetHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme event allowance has reset",
		preview: "Collection has resumed with a fresh monthly allowance.",
		body: `${logo(origin)}
${heading("Your allowance has reset")}
${lead(`Good news, ${v("first_name")}. A new billing period started for ${v("workspace_name")}, so collection has resumed and you have a full allowance again.`)}
${details([
	{ label: "New period", value: v("period_range") },
	{ label: "Events available", value: "100,000" },
	{ label: "Collection", value: "Resumed", strong: true },
])}
${button("{{{usage_url}}}", "View usage")}
${text("Events sent while you were over the limit weren't collected. To avoid another gap, consider a larger plan or turning on overage in billing.", { marginBottom: 24 })}
${fallback("{{{usage_url}}}")}
${footer()}`,
	});
}

function monthlySummaryHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme usage for September",
		preview: "73,200 events across 3 websites, 73% of your allowance.",
		body: `${logo(origin)}
${eyebrow(`Usage summary · ${v("period_name")}`)}
${heading("Here's how you used Acme last month")}
${lead(`Hi ${v("first_name")}, here's a look at ${v("workspace_name")} for ${v("period_name")}.`)}
${details([
	{ label: "acmestudio.com", value: "48,900 events" },
	{ label: "docs.acmestudio.com", value: "19,700 events" },
	{ label: "shop.acmestudio.com", value: "4,600 events" },
	{
		label: "Total",
		note: "73% of 100,000 included",
		value: "73,200 events",
		strong: true,
	},
])}
${text("That's 12% more than August. Your busiest day was Sep 17, with 4,820 events.", { marginBottom: 28 })}
${button("{{{usage_url}}}", "See full breakdown")}
${fallback("{{{usage_url}}}")}
${footer()}`,
	});
}

export const usageTemplates: EmailTemplateExample[] = [
	{
		id: "acme-usage-halfway",
		name: "Usage at 50%",
		slug: "acme-usage-halfway",
		category: "usage",
		description:
			"Acme heads-up when a workspace reaches half of its monthly event allowance.",
		html: halfwayHtml,
		variables: [
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "days_left", type: "string", defaultValue: "17" },
			{ name: "usage_url", type: "string", defaultValue: null },
			{ name: "settings_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-usage-overage",
		name: "Overage charges",
		slug: "acme-usage-overage",
		category: "usage",
		description:
			"Acme notice that a workspace exceeded its allowance and overage will be billed.",
		html: overageHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "overage_amount", type: "string", defaultValue: "$3.00" },
			{ name: "billing_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-usage-spike",
		name: "Usage spike",
		slug: "acme-usage-spike",
		category: "usage",
		description:
			"Acme alert when a site's event volume jumps well above its normal rate.",
		html: spikeHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "website_name", type: "string", defaultValue: "acmestudio.com" },
			{ name: "top_page", type: "string", defaultValue: "/blog/launch" },
			{
				name: "top_source",
				type: "string",
				defaultValue: "news.ycombinator.com",
			},
			{ name: "realtime_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-seats-almost-full",
		name: "Seats almost full",
		slug: "acme-seats-almost-full",
		category: "usage",
		description:
			"Acme heads-up when a workspace has one seat left on its plan.",
		html: seatsAlmostFullHtml,
		variables: [
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "members_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-recording-storage-nearly-full",
		name: "Storage nearly full",
		slug: "acme-recording-storage-nearly-full",
		category: "usage",
		description:
			"Acme warning that session recording storage is almost used up, with ways to free space.",
		html: recordingsNearlyFullHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "storage_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-api-rate-limit",
		name: "API rate limit hit",
		slug: "acme-api-rate-limit",
		category: "usage",
		description:
			"Acme developer alert when an API key is throttled for exceeding its rate limit.",
		html: rateLimitHtml,
		variables: [
			{
				name: "api_key_name",
				type: "string",
				defaultValue: "Production server",
			},
			{
				name: "limit_window",
				type: "string",
				defaultValue: "Oct 14, 2026, 3:10 to 3:24 PM UTC",
			},
			{ name: "api_keys_url", type: "string", defaultValue: null },
			{ name: "support_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-usage-limit-reset",
		name: "Limit reset",
		slug: "acme-usage-limit-reset",
		category: "usage",
		description:
			"Acme notice that a new billing period started and collection has resumed.",
		html: limitResetHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{
				name: "period_range",
				type: "string",
				defaultValue: "Nov 1 to Nov 30, 2026",
			},
			{ name: "usage_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-usage-monthly-summary",
		name: "Monthly usage summary",
		slug: "acme-usage-monthly-summary",
		category: "usage",
		description:
			"Acme recap of last month's events per website against the plan allowance.",
		html: monthlySummaryHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "period_name", type: "string", defaultValue: "September 2026" },
			{ name: "usage_url", type: "string", defaultValue: null },
		],
	},
];
