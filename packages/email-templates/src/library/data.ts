import {
	acmeEmail,
	button,
	code,
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
import type { EmailTemplateExample, TemplateVariable } from "../index";

function importCompletedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme import is complete",
		preview: "Your historical events have been imported.",
		body: `${logo(origin)}
${heading("Your import is complete")}
${lead(`We've finished importing <span data-variable="file_name">{{{file_name}}}</span> into <span data-variable="workspace_name">{{{workspace_name}}}</span>. The events now show up in your reports.`)}
${details([
	{ label: "Rows imported", value: "182,406" },
	{
		label: "Rows skipped",
		value: "214",
		note: "Duplicates of events already in Acme.",
	},
	{ label: "Date range", value: "Jan 1 to Sep 30, 2026" },
	{ label: "Status", value: "Complete", strong: true },
])}
${button("{{{dashboard_url}}}", "View your data")}
${text("Reports for the imported period may take a few minutes to refresh.", { marginBottom: 24 })}
${fallback("{{{dashboard_url}}}")}
${footer()}`,
	});
}

function importFailedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme import didn't finish",
		preview: "We couldn't import your file. Here's what went wrong.",
		body: `${logo(origin)}
${heading("Your import didn't finish")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, we couldn't import <span data-variable="file_name">{{{file_name}}}</span>. Nothing was added to your workspace, so you can fix the file and try again.`)}
${text("The first errors we found:", { marginBottom: 12 })}
${code([
	'Row 2: missing required column "timestamp"',
	'Row 418: invalid date "2026-13-04"',
	'Row 1,032: property "plan" is longer than 255 characters',
])}
${button("{{{import_url}}}", "Fix and retry")}
${text("The full error report is on the import page. Our import guide covers the expected columns and formats.", { marginBottom: 24 })}
${fallback("{{{import_url}}}")}
${footer()}`,
	});
}

function scheduledExportHtml(origin: string): string {
	return acmeEmail({
		title: "Your weekly Acme export",
		preview: "This week's scheduled export is ready to download.",
		body: `${logo(origin)}
${eyebrow("Scheduled export · Weekly")}
${heading("Your weekly export is ready")}
${lead(`Here's the scheduled export of <span data-variable="report_name">{{{report_name}}}</span> for the week of <span data-variable="period">{{{period}}}</span>.`)}
${details([
	{ label: "Format", value: "CSV" },
	{ label: "Rows", value: "12,840" },
	{ label: "Size", value: "2.1 MB" },
	{ label: "Link expires", value: "In 7 days" },
])}
${button("{{{download_url}}}", "Download CSV")}
${text("You get this every Monday. Change the schedule or recipients from the report's export settings.", { marginBottom: 24 })}
${fallback("{{{download_url}}}")}
${footer()}`,
	});
}

function backupCompletedHtml(origin: string): string {
	return acmeEmail({
		title: "Workspace backup completed",
		preview:
			"A full backup of your workspace was saved to your storage bucket.",
		body: `${logo(origin)}
${heading("Backup completed")}
${lead(`A full backup of <span data-variable="workspace_name">{{{workspace_name}}}</span> was written to your connected storage bucket.`)}
${details([
	{ label: "Destination", value: "s3://acme-studio-backups" },
	{ label: "Snapshot", value: "2026-10-14T02:00Z" },
	{ label: "Size", value: "1.4 GB" },
	{ label: "Next backup", value: "Oct 15, 2026, 02:00 UTC" },
])}
${button("{{{backups_url}}}", "View backups")}
${text("Backups older than 30 days are removed from the bucket automatically, based on your retention setting.", { marginBottom: 24 })}
${fallback("{{{backups_url}}}")}
${footer()}`,
	});
}

function reportCsvReadyHtml(origin: string): string {
	return acmeEmail({
		title: "Your report export is ready",
		preview: "The CSV you exported from Acme is ready.",
		body: `${logo(origin)}
${heading("Your report is ready")}
${lead(`Hi <span data-variable="first_name">{{{first_name}}}</span>, the CSV export of <span data-variable="report_name">{{{report_name}}}</span> finished. It was too large to download right away, so we prepared it in the background.`)}
${button("{{{download_url}}}", "Download CSV")}
${text("The file includes every row and column currently visible in the report, with your filters applied. The link works for 72 hours.", { marginBottom: 24 })}
${fallback("{{{download_url}}}")}
${footer()}`,
	});
}

function retentionDeletionHtml(origin: string): string {
	return acmeEmail({
		title: "Older events will be deleted soon",
		preview: "Events past your retention period are scheduled for deletion.",
		body: `${logo(origin)}
${heading("Older events will be deleted soon")}
${lead(`Your plan keeps raw events for 24 months. On <span data-variable="deletion_date">{{{deletion_date}}}</span>, events in <span data-variable="workspace_name">{{{workspace_name}}}</span> older than that will be permanently deleted.`)}
${details([
	{ label: "Events affected", value: "Before Oct 2024" },
	{ label: "Approximate count", value: "3.2 million" },
	{ label: "Aggregated reports", value: "Kept" },
	{
		label: "Deletion date",
		value: `<span data-variable="deletion_date">{{{deletion_date}}}</span>`,
		strong: true,
	},
])}
${text("Want to keep a copy? Export the raw events before the deletion date, or upgrade for longer retention.", { marginBottom: 28 })}
${button("{{{export_url}}}", "Export events")}
${fallback("{{{export_url}}}")}
${footer()}`,
	});
}

function exportLinkExpiringHtml(origin: string): string {
	return acmeEmail({
		title: "Your export link expires tomorrow",
		preview: "Download your export before the link expires.",
		body: `${logo(origin)}
${heading("Your export link expires tomorrow")}
${lead(`The export you requested for <span data-variable="workspace_name">{{{workspace_name}}}</span> hasn't been downloaded yet. The link expires on <span data-variable="expires_at">{{{expires_at}}}</span>.`)}
${button("{{{download_url}}}", "Download export")}
${text("After that, the file is deleted and you'd need to request a new export. That's quick, but large exports can take a while to prepare.", { marginBottom: 24 })}
${fallback("{{{download_url}}}")}
${footer()}`,
	});
}

function syncCompletedHtml(origin: string): string {
	return acmeEmail({
		title: "Your warehouse sync is live",
		preview:
			"The first sync finished. Acme will keep your warehouse up to date.",
		body: `${logo(origin)}
${heading("Your warehouse sync is live")}
${lead(`The first sync from <span data-variable="workspace_name">{{{workspace_name}}}</span> to <span data-variable="destination">{{{destination}}}</span> finished. Here's how it works from now on.`)}
${step(1, "Initial load done", "All 4.8 million events from the last 12 months were copied.")}
${step(2, "Hourly updates", "New events are added every hour, usually within 10 minutes of the hour.")}
${step(3, "Schema changes", "New event properties become new columns automatically.")}
${button("{{{integration_url}}}", "View sync settings")}
${text("We'll email you only if a sync fails, so no news is good news.", { marginBottom: 24 })}
${fallback("{{{integration_url}}}")}
${footer()}`,
	});
}

const firstName: TemplateVariable = {
	name: "first_name",
	type: "string",
	defaultValue: "there",
};
const workspaceName: TemplateVariable = {
	name: "workspace_name",
	type: "string",
	defaultValue: "Acme Studio",
};
const downloadUrl: TemplateVariable = {
	name: "download_url",
	type: "string",
	defaultValue: null,
};

export const dataTemplates: EmailTemplateExample[] = [
	{
		id: "acme-import-completed",
		name: "Import completed",
		slug: "acme-import-completed",
		category: "data",
		description:
			"Acme confirmation that a historical data import finished, with row counts.",
		html: importCompletedHtml,
		variables: [
			{ name: "file_name", type: "string", defaultValue: "events-2026.csv" },
			workspaceName,
			{ name: "dashboard_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-import-failed",
		name: "Import failed",
		slug: "acme-import-failed",
		category: "data",
		description:
			"Acme notice that a data import failed, listing the first errors to fix.",
		html: importFailedHtml,
		variables: [
			firstName,
			{ name: "file_name", type: "string", defaultValue: "events-2026.csv" },
			{ name: "import_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-scheduled-export",
		name: "Scheduled export",
		slug: "acme-scheduled-export",
		category: "data",
		description:
			"Acme recurring export of a saved report, delivered as a CSV download.",
		html: scheduledExportHtml,
		variables: [
			{
				name: "report_name",
				type: "string",
				defaultValue: "Signups by source",
			},
			{ name: "period", type: "string", defaultValue: "Oct 5, 2026" },
			downloadUrl,
		],
	},
	{
		id: "acme-backup-completed",
		name: "Backup completed",
		slug: "acme-backup-completed",
		category: "data",
		description:
			"Acme confirmation that a workspace backup was written to connected storage.",
		html: backupCompletedHtml,
		variables: [
			workspaceName,
			{ name: "backups_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-report-csv-ready",
		name: "Report CSV ready",
		slug: "acme-report-csv-ready",
		category: "data",
		description:
			"Acme notice that a large report CSV prepared in the background is ready.",
		html: reportCsvReadyHtml,
		variables: [
			firstName,
			{ name: "report_name", type: "string", defaultValue: "Top pages" },
			downloadUrl,
		],
	},
	{
		id: "acme-retention-deletion",
		name: "Retention deletion upcoming",
		slug: "acme-retention-deletion",
		category: "data",
		description:
			"Acme heads-up that events past the retention period will be deleted soon.",
		html: retentionDeletionHtml,
		variables: [
			workspaceName,
			{ name: "deletion_date", type: "string", defaultValue: "Nov 1, 2026" },
			{ name: "export_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-export-link-expiring",
		name: "Export link expiring",
		slug: "acme-export-link-expiring",
		category: "data",
		description: "Acme reminder to download an export before its link expires.",
		html: exportLinkExpiringHtml,
		variables: [
			workspaceName,
			{
				name: "expires_at",
				type: "string",
				defaultValue: "Oct 15, 2026, 14:00 UTC",
			},
			downloadUrl,
		],
	},
	{
		id: "acme-warehouse-sync-completed",
		name: "Warehouse sync completed",
		slug: "acme-warehouse-sync-completed",
		category: "data",
		description:
			"Acme confirmation that the first data warehouse sync finished and how updates work.",
		html: syncCompletedHtml,
		variables: [
			workspaceName,
			{ name: "destination", type: "string", defaultValue: "BigQuery" },
			{ name: "integration_url", type: "string", defaultValue: null },
		],
	},
];
