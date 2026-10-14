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
	link,
	logo,
	step,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

/** Inline variable span, e.g. v("first_name") → {{{first_name}}}. */
function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

function apiKeyExpiringHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme API key expires in 7 days",
		preview: "Rotate the key before it expires to avoid failed requests.",
		body: `${logo(origin)}
${heading("Your API key expires in 7 days")}
${lead(`Hi ${v("first_name")}, the API key ${v("key_name")} in ${v("workspace_name")} expires on ${v("expiry_date")}. Requests that use it will start failing after that.`)}
${details([
	{ label: "Key name", value: v("key_name") },
	{ label: "Key prefix", value: "acme_live_7Hq2…" },
	{ label: "Last used", value: "2 hours ago" },
	{ label: "Expires", value: v("expiry_date"), strong: true },
])}
${button("{{{api_keys_url}}}", "Rotate API key")}
${text("Rotating creates a new key and keeps the old one working for 24 hours, so you can update your services without downtime.", { marginBottom: 24 })}
${fallback("{{{api_keys_url}}}")}
${footer()}`,
	});
}

function apiKeyRevokedHtml(origin: string): string {
	return acmeEmail({
		title: "An Acme API key was revoked",
		preview: "Requests using this key are now rejected.",
		body: `${logo(origin)}
${heading("An API key was revoked")}
${lead(`${v("revoker_name")} revoked the API key ${v("key_name")} in ${v("workspace_name")}. Any request that uses it now returns a 401 error.`)}
${details([
	{ label: "Key name", value: v("key_name") },
	{ label: "Revoked by", value: v("revoker_name") },
	{ label: "Revoked at", value: "Oct 14, 2026, 3:12 PM UTC" },
])}
${text("If a service still depends on this key, create a new one and update its environment:", { marginBottom: 12 })}
${code(["ACME_API_KEY=acme_live_your_new_key"])}
${button("{{{api_keys_url}}}", "Manage API keys")}
${text("Didn't expect this? Check your workspace audit log or reply to this email.", { marginBottom: 24 })}
${fallback("{{{api_keys_url}}}")}
${footer()}`,
	});
}

function webhookDisabledHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme webhook was disabled",
		preview: "We paused deliveries after repeated failures.",
		body: `${logo(origin)}
${heading("We disabled a failing webhook")}
${lead(`Hi ${v("first_name")}, your endpoint stopped responding, so after 3 days of failed deliveries we paused it. Events are still recorded and can be replayed once it's back.`)}
${details([
	{ label: "Endpoint", value: v("endpoint_url") },
	{ label: "Last response", value: "503 Service Unavailable" },
	{ label: "Failed deliveries", value: "1,284" },
	{ label: "Disabled", value: "Oct 14, 2026", strong: true },
])}
${text("After fixing the endpoint, send a test event to confirm it responds with a 2xx status:", { marginBottom: 12 })}
${code(["acme webhooks test wh_3kd92m", "acme webhooks enable wh_3kd92m --replay"])}
${button("{{{webhooks_url}}}", "Review webhook")}
${fallback("{{{webhooks_url}}}")}
${footer()}`,
	});
}

function apiDeprecationHtml(origin: string): string {
	return acmeEmail({
		title: "Acme API v1 is being retired",
		preview: "Move to API v2 before Jan 31, 2027.",
		body: `${logo(origin)}
${eyebrow("Action needed")}
${heading("API v1 is being retired")}
${lead(`Hi ${v("first_name")}, ${v("workspace_name")} sent 42,310 requests to API v1 in the last 30 days. v1 stops accepting requests on ${v("sunset_date")}.`)}
${step(1, "Update the base URL", "Point your requests at the v2 endpoint. Authentication stays the same.")}
${code(["- https://api.acme.example/v1/events", "+ https://api.acme.example/v2/events"], 20)}
${step(2, "Rename two fields", "<code>site</code> is now <code>site_id</code>, and timestamps use ISO 8601 instead of Unix seconds.")}
${step(3, "Watch the deprecation report", "Your dashboard lists every key and route still calling v1, so you'll know when you're done.")}
${button("{{{migration_url}}}", "Read the migration guide")}
${fallback("{{{migration_url}}}")}
${footer()}`,
	});
}

function domainVerificationFailedHtml(origin: string): string {
	return acmeEmail({
		title: "We couldn't verify your domain",
		preview: "Two DNS records are missing or don't match.",
		body: `${logo(origin)}
${heading(`We couldn't verify ${v("domain")}`)}
${lead(`Hi ${v("first_name")}, we checked your DNS records for 72 hours and couldn't find the ones below. Add them at your DNS provider and we'll keep checking automatically.`)}
${details([
	{ label: "TXT", note: "_acme-verify", value: "Not found" },
	{ label: "CNAME", note: "track", value: "Points elsewhere" },
	{ label: "Status", value: "Not verified", strong: true },
])}
${text("The records should look like this:", { marginBottom: 12 })}
${code([
	"_acme-verify  TXT    acme-verify=8f3c1a92e4",
	"track         CNAME  cname.acme.example",
])}
${button("{{{domain_url}}}", "Check again")}
${text("DNS changes can take up to 48 hours to spread. If you use Cloudflare, turn off the proxy for the CNAME record.", { marginBottom: 24 })}
${fallback("{{{domain_url}}}")}
${footer()}`,
	});
}

function cliReleaseHtml(origin: string): string {
	return acmeEmail({
		title: "Acme CLI 2.4 is out",
		preview: "Live tail, funnel reports, and faster installs.",
		body: `${logo(origin)}
${eyebrow("Release · v2.4.0")}
${heading("Acme CLI 2.4 is out")}
${lead(`Hi ${v("first_name")}, the latest CLI brings live event tailing, funnel reports from the terminal, and installs that are about twice as fast.`)}
${code(["npm install -g @acme/cli@latest", "", "# Stream events as they arrive", "acme events tail --site example.com", "", "# Signup funnel for the last 30 days", "acme funnels report signup --range 30d"])}
${text(`Upgrading from 1.x? <code>acme sites list</code> now prints a table by default. Add <code>--json</code> for the old output. See the ${link("{{{changelog_url}}}", "full changelog")}.`, { marginBottom: 28 })}
${button("{{{changelog_url}}}", "See what's new")}
${fallback("{{{changelog_url}}}")}
${footer({ unsubscribe: true })}`,
	});
}

function mcpServerConnectedHtml(origin: string): string {
	return acmeEmail({
		title: "An MCP client connected to Acme",
		preview: "An AI assistant can now read your workspace analytics.",
		body: `${logo(origin)}
${heading("An MCP client connected")}
${lead(`${v("client_name")} connected to the Acme MCP server for ${v("workspace_name")}. It can now answer questions using your analytics data.`)}
${details([
	{ label: "Client", value: v("client_name") },
	{ label: "Connected by", value: v("member_name") },
	{ label: "Access", value: "Read-only" },
	{ label: "Connected at", value: "Oct 14, 2026, 10:41 AM UTC" },
])}
${button("{{{connections_url}}}", "View connections")}
${text("If you don't recognize this connection, disconnect it from your workspace settings. Its access ends right away.", { marginBottom: 24 })}
${fallback("{{{connections_url}}}")}
${footer()}`,
	});
}

function oauthAppAuthorizedHtml(origin: string): string {
	return acmeEmail({
		title: "A new app has access to your Acme workspace",
		preview: "Review the permissions you granted.",
		body: `${logo(origin)}
${heading("A new app has access to your workspace")}
${lead(`Hi ${v("first_name")}, you authorized ${v("app_name")} to access ${v("workspace_name")}. Here's what it can do.`)}
${details([
	{
		label: "Read reports",
		note: "Traffic, events, and funnels",
		value: "Allowed",
	},
	{
		label: "Manage sites",
		note: "Add and edit tracked websites",
		value: "Allowed",
	},
	{ label: "Billing", value: "Not allowed" },
])}
${button("{{{apps_url}}}", "Review authorized apps")}
${text("You can revoke access at any time. The app will lose access the next time it makes a request.", { marginBottom: 24 })}
${fallback("{{{apps_url}}}")}
${footer()}`,
	});
}

export const developerTemplates: EmailTemplateExample[] = [
	{
		id: "acme-api-key-expiring",
		name: "API key expiring",
		slug: "acme-api-key-expiring",
		category: "developer",
		description: "Acme reminder to rotate an API key before it expires.",
		html: apiKeyExpiringHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "key_name", type: "string", defaultValue: "Production server" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "expiry_date", type: "string", defaultValue: "Oct 21, 2026" },
			{ name: "api_keys_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-api-key-revoked",
		name: "API key revoked",
		slug: "acme-api-key-revoked",
		category: "developer",
		description: "Acme security notice when an API key is revoked.",
		html: apiKeyRevokedHtml,
		variables: [
			{ name: "revoker_name", type: "string", defaultValue: "Maya" },
			{ name: "key_name", type: "string", defaultValue: "Staging worker" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "api_keys_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-webhook-disabled",
		name: "Webhook disabled",
		slug: "acme-webhook-disabled",
		category: "developer",
		description:
			"Acme notice that a failing webhook endpoint was paused, with steps to re-enable it.",
		html: webhookDisabledHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{
				name: "endpoint_url",
				type: "string",
				defaultValue: "api.example.com/hooks/acme",
			},
			{ name: "webhooks_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-api-version-deprecated",
		name: "API version deprecated",
		slug: "acme-api-version-deprecated",
		category: "developer",
		description:
			"Acme deprecation notice with a sunset date and migration steps.",
		html: apiDeprecationHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "sunset_date", type: "string", defaultValue: "Jan 31, 2027" },
			{ name: "migration_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-domain-verification-failed",
		name: "Domain verification failed",
		slug: "acme-domain-verification-failed",
		category: "developer",
		description:
			"Acme notice that a domain failed DNS verification, listing the missing records.",
		html: domainVerificationFailedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "domain", type: "string", defaultValue: "example.com" },
			{ name: "domain_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-cli-release",
		name: "CLI release",
		slug: "acme-cli-release",
		category: "developer",
		description:
			"Acme release announcement for a new CLI version with example commands.",
		html: cliReleaseHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "changelog_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-mcp-client-connected",
		name: "MCP client connected",
		slug: "acme-mcp-client-connected",
		category: "developer",
		description:
			"Acme security notice when an AI assistant connects to the MCP server.",
		html: mcpServerConnectedHtml,
		variables: [
			{ name: "client_name", type: "string", defaultValue: "Claude" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "member_name", type: "string", defaultValue: "Maya" },
			{ name: "connections_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-oauth-app-authorized",
		name: "OAuth app authorized",
		slug: "acme-oauth-app-authorized",
		category: "developer",
		description:
			"Acme notice that a third-party app was granted access, with its permissions.",
		html: oauthAppAuthorizedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "app_name", type: "string", defaultValue: "Northwind Reports" },
			{ name: "workspace_name", type: "string", defaultValue: "Acme Studio" },
			{ name: "apps_url", type: "string", defaultValue: null },
		],
	},
];
