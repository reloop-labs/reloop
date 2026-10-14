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
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample, TemplateVariable } from "../index";

/** Small rounded status label with a colored dot, e.g. "Investigating". */
function statusPill(label: string, dot: string): string {
	return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px 0">
<tbody>
<tr>
<td style="padding:6px 12px;background-color:${acme.tint};border-radius:999px"><p style="margin:0;font-size:13px;line-height:18px;font-weight:500;color:${acme.ink};font-family:${acme.font}"><span style="color:${dot}">&#9679;</span>&nbsp; ${label}</p></td>
</tr>
</tbody>
</table>`;
}

const red = "#d93025";
const amber = "#e8a317";
const green = "#1e8e3e";
const gray = "#7e7e7e";

function incidentInvestigatingHtml(origin: string): string {
	return acmeEmail({
		title: "Investigating: delayed dashboard loading",
		preview: "We're looking into slow dashboard loading for some workspaces.",
		body: `${logo(origin)}
${statusPill("Investigating", red)}
${heading("We're investigating an issue")}
${lead("Some workspaces are seeing dashboards load slowly or time out. Event collection is not affected, and no data has been lost.")}
${details([
	{
		label: "Affected",
		value: `<span data-variable="affected_component">{{{affected_component}}}</span>`,
	},
	{
		label: "Started",
		value: `<span data-variable="incident_start">{{{incident_start}}}</span>`,
	},
	{ label: "Status", value: "Investigating" },
])}
${button("{{{status_url}}}", "Follow updates")}
${text("We'll send another update within 30 minutes or as soon as we know more.", { marginBottom: 24 })}
${fallback("{{{status_url}}}")}
${footer()}`,
	});
}

function incidentIdentifiedHtml(origin: string): string {
	return acmeEmail({
		title: "Identified: delayed dashboard loading",
		preview: "We found the cause and are rolling out a fix.",
		body: `${logo(origin)}
${statusPill("Identified", amber)}
${heading("We found the cause")}
${lead(`The slow dashboards were caused by an overloaded query node in our reporting cluster. We're moving traffic to healthy nodes now.`)}
${step(1, "Cause identified", "A query node ran out of memory during a routine rebalance.")}
${step(2, "Fix in progress", "Traffic is moving to healthy nodes. Dashboards should speed up over the next 15 minutes.")}
${step(3, "Monitoring", "We'll watch load times closely before marking this resolved.")}
${button("{{{status_url}}}", "View incident")}
${text("Event collection kept running the whole time. Your data is complete.", { marginBottom: 24 })}
${fallback("{{{status_url}}}")}
${footer()}`,
	});
}

function incidentResolvedHtml(origin: string): string {
	return acmeEmail({
		title: "Resolved: delayed dashboard loading",
		preview: "Dashboards are loading normally again.",
		body: `${logo(origin)}
${statusPill("Resolved", green)}
${heading("This incident is resolved")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, dashboards are loading normally again. Thanks for your patience while we worked on it.`)}
${details([
	{
		label: "Started",
		value: `<span data-variable="incident_start">{{{incident_start}}}</span>`,
	},
	{
		label: "Resolved",
		value: `<span data-variable="incident_end">{{{incident_end}}}</span>`,
	},
	{ label: "Duration", value: "1 hr 12 min" },
	{ label: "Data loss", value: "None", strong: true },
])}
${button("{{{status_url}}}", "View incident")}
${text("We'll publish a short write-up of what happened and what we're changing in the next few days.", { marginBottom: 24 })}
${fallback("{{{status_url}}}")}
${footer()}`,
	});
}

function degradedPerformanceHtml(origin: string): string {
	return acmeEmail({
		title: "Degraded performance on the Acme API",
		preview:
			"API responses are slower than usual. Requests are still succeeding.",
		body: `${logo(origin)}
${eyebrow("Status update")}
${heading("Slower API responses")}
${lead("The Acme API is responding more slowly than usual. Requests are still succeeding, but some may take a few seconds longer.")}
${details([
	{ label: "Component", value: "Reporting API" },
	{ label: "Typical response", value: "Under 300 ms" },
	{ label: "Current response", value: "1.5 to 3 s" },
	{
		label: "Since",
		value: `<span data-variable="incident_start">{{{incident_start}}}</span>`,
	},
])}
${text("If you call the API from scripts or CI, a longer timeout will help until this clears. Retries with backoff work as usual.", { marginBottom: 28 })}
${button("{{{status_url}}}", "Check status")}
${fallback("{{{status_url}}}")}
${footer()}`,
	});
}

function maintenanceScheduledHtml(origin: string): string {
	return acmeEmail({
		title: "Scheduled maintenance on Oct 21",
		preview:
			"A short maintenance window is planned. Event collection won't stop.",
		body: `${logo(origin)}
${heading("Scheduled maintenance")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we're upgrading our reporting database. During the window, dashboards may be read-only for a few minutes.`)}
${details([
	{
		label: "Date",
		value: `<span data-variable="maintenance_date">{{{maintenance_date}}}</span>`,
	},
	{
		label: "Window",
		value: `<span data-variable="maintenance_window">{{{maintenance_window}}}</span>`,
	},
	{ label: "Expected impact", value: "Read-only dashboards" },
	{ label: "Event collection", value: "Not affected", strong: true },
])}
${button("{{{status_url}}}", "View maintenance details")}
${text("No action is needed. We'll email you when the work starts and again when it's done.", { marginBottom: 24 })}
${fallback("{{{status_url}}}")}
${footer()}`,
	});
}

function maintenanceStartedHtml(origin: string): string {
	return acmeEmail({
		title: "Maintenance is starting now",
		preview: "Dashboards may be read-only for the next hour.",
		body: `${logo(origin)}
${statusPill("In progress", amber)}
${heading("Maintenance is starting now")}
${lead(`The scheduled database upgrade has begun. For up to an hour, you can view dashboards but can't save changes to reports or settings.`)}
${text("What still works:", { marginBottom: 12, color: acme.ink })}
${text("Event collection, the tracking script, and read-only dashboards all keep running. Events sent during the window will appear once maintenance ends.", { marginBottom: 28 })}
${button("{{{status_url}}}", "Follow progress")}
${fallback("{{{status_url}}}")}
${footer()}`,
	});
}

function maintenanceCompleteHtml(origin: string): string {
	return acmeEmail({
		title: "Maintenance complete",
		preview: "The upgrade is finished and everything is back to normal.",
		body: `${logo(origin)}
${statusPill("Completed", green)}
${heading("Maintenance is complete")}
${lead("The database upgrade finished ahead of schedule. Dashboards, reports, and settings are fully available again.")}
${details([
	{ label: "Started", value: "Oct 21, 2026, 06:00 UTC" },
	{ label: "Finished", value: "Oct 21, 2026, 06:38 UTC" },
	{ label: "Events delayed", value: "Backfilled", strong: true },
])}
${button("{{{dashboard_url}}}", "Open dashboard")}
${text("Reports may run a little faster now. That's the point of the upgrade.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer()}`,
	});
}

function postmortemPublishedHtml(origin: string): string {
	return acmeEmail({
		title: "What happened during the Oct 9 outage",
		preview: "Our write-up of the outage, its cause, and what we're changing.",
		body: `${logo(origin)}
${eyebrow("Incident review")}
${heading("What happened on Oct 9")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we've published a full review of last week's outage. Here's the short version.`)}
${step(1, "What happened", "Dashboards were unavailable for 47 minutes after a configuration change reached every region at once.")}
${step(2, "Impact", "No events were lost. Reports showed stale numbers until the backlog cleared.")}
${step(3, "What we're changing", "Config changes now roll out one region at a time, with automatic rollback on errors.")}
${button("{{{postmortem_url}}}", "Read the full review")}
${text("We're sorry for the disruption. If it affected you in a way the review doesn't cover, just reply to this email.", { marginBottom: 24 })}
${fallback("{{{postmortem_url}}}")}
${footer()}`,
	});
}

function dataProcessingDelayHtml(origin: string): string {
	return acmeEmail({
		title: "Event processing is running behind",
		preview: "New events are being collected but may take longer to show up.",
		body: `${logo(origin)}
${statusPill("Delayed", amber)}
${heading("Events are taking longer to appear")}
${lead(`We're collecting every event, but processing is behind. New activity in <span data-variable="workspace_name">{{{workspace_name}}}</span> may take a while to show in reports.`)}
${details([
	{ label: "Current delay", value: "About 25 minutes" },
	{ label: "Events collected", value: "All, none dropped" },
	{ label: "Expected catch-up", value: "Within 2 hours" },
])}
${button("{{{status_url}}}", "Check status")}
${text("Real-time views and alerts will lag by the same amount until we catch up.", { marginBottom: 24 })}
${fallback("{{{status_url}}}")}
${footer()}`,
	});
}

function regionalOutageHtml(origin: string): string {
	return acmeEmail({
		title: "Outage in one Acme region",
		preview: "Workspaces in one hosting region are currently unavailable.",
		body: `${logo(origin)}
${statusPill("Major outage", red)}
${heading(`Outage in the <span data-variable="region">{{{region}}}</span> region`)}
${lead(`Workspaces hosted in our <span data-variable="region">{{{region}}}</span> region can't load dashboards right now. Other regions are working normally.`)}
${details([
	{
		label: "Region",
		value: `<span data-variable="region">{{{region}}}</span>`,
	},
	{ label: "Dashboards", value: "Unavailable" },
	{ label: "Event collection", value: "Queued at the edge" },
	{
		label: "Started",
		value: `<span data-variable="incident_start">{{{incident_start}}}</span>`,
	},
])}
${button("{{{status_url}}}", "Follow updates")}
${text(`Events sent from your sites are held and will be processed once the region recovers. ${link("{{{status_url}}}", "Subscribe to updates")} to hear the moment it's fixed.`, { marginBottom: 24, color: gray })}
${fallback("{{{status_url}}}")}
${footer()}`,
	});
}

const firstName: TemplateVariable = {
	name: "first_name",
	type: "string",
	defaultValue: "there",
};
const statusUrl: TemplateVariable = {
	name: "status_url",
	type: "string",
	defaultValue: null,
};
const incidentStart: TemplateVariable = {
	name: "incident_start",
	type: "string",
	defaultValue: "Oct 14, 2026, 14:00 UTC",
};

export const statusTemplates: EmailTemplateExample[] = [
	{
		id: "acme-incident-investigating",
		name: "Incident investigating",
		slug: "acme-incident-investigating",
		category: "status",
		description:
			"Acme first notice that an incident is being investigated, with affected components.",
		html: incidentInvestigatingHtml,
		variables: [
			{
				name: "affected_component",
				type: "string",
				defaultValue: "Dashboards",
			},
			incidentStart,
			statusUrl,
		],
	},
	{
		id: "acme-incident-identified",
		name: "Incident identified",
		slug: "acme-incident-identified",
		category: "status",
		description:
			"Acme update that the cause of an incident is known and a fix is rolling out.",
		html: incidentIdentifiedHtml,
		variables: [statusUrl],
	},
	{
		id: "acme-incident-resolved",
		name: "Incident resolved",
		slug: "acme-incident-resolved",
		category: "status",
		description:
			"Acme notice that an incident is resolved, with its timeline and impact.",
		html: incidentResolvedHtml,
		variables: [
			firstName,
			incidentStart,
			{
				name: "incident_end",
				type: "string",
				defaultValue: "Oct 14, 2026, 15:12 UTC",
			},
			statusUrl,
		],
	},
	{
		id: "acme-degraded-performance",
		name: "Degraded performance",
		slug: "acme-degraded-performance",
		category: "status",
		description:
			"Acme heads-up that the API is slower than usual while requests still succeed.",
		html: degradedPerformanceHtml,
		variables: [incidentStart, statusUrl],
	},
	{
		id: "acme-maintenance-scheduled",
		name: "Scheduled maintenance",
		slug: "acme-maintenance-scheduled",
		category: "status",
		description:
			"Acme advance notice of a planned maintenance window and its expected impact.",
		html: maintenanceScheduledHtml,
		variables: [
			firstName,
			{
				name: "maintenance_date",
				type: "string",
				defaultValue: "Oct 21, 2026",
			},
			{
				name: "maintenance_window",
				type: "string",
				defaultValue: "06:00 to 07:00 UTC",
			},
			statusUrl,
		],
	},
	{
		id: "acme-maintenance-started",
		name: "Maintenance starting",
		slug: "acme-maintenance-started",
		category: "status",
		description:
			"Acme notice that scheduled maintenance has begun and what keeps working.",
		html: maintenanceStartedHtml,
		variables: [statusUrl],
	},
	{
		id: "acme-maintenance-complete",
		name: "Maintenance complete",
		slug: "acme-maintenance-complete",
		category: "status",
		description:
			"Acme confirmation that maintenance finished and everything is available again.",
		html: maintenanceCompleteHtml,
		variables: [{ name: "dashboard_url", type: "string", defaultValue: null }],
	},
	{
		id: "acme-postmortem-published",
		name: "Postmortem published",
		slug: "acme-postmortem-published",
		category: "status",
		description:
			"Acme summary of an outage review with a link to the full write-up.",
		html: postmortemPublishedHtml,
		variables: [
			firstName,
			{ name: "postmortem_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-event-processing-delay",
		name: "Event processing delay",
		slug: "acme-event-processing-delay",
		category: "status",
		description:
			"Acme notice that events are collected but processing is running behind.",
		html: dataProcessingDelayHtml,
		variables: [
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			statusUrl,
		],
	},
	{
		id: "acme-regional-outage",
		name: "Regional outage",
		slug: "acme-regional-outage",
		category: "status",
		description:
			"Acme alert that one hosting region is down while other regions work normally.",
		html: regionalOutageHtml,
		variables: [
			{ name: "region", type: "string", defaultValue: "EU (Frankfurt)" },
			incidentStart,
			statusUrl,
		],
	},
];
