export type DashboardRouteContract = {
	/** TanStack-era canonical pattern, retained as the migration parity key. */
	pattern: string;
	/** Concrete, URL-safe path used for anonymous deep-link smoke coverage. */
	samplePath: string;
	authentication: "anonymous" | "required";
	shell:
		| "public"
		| "onboarding"
		| "dashboard"
		| "contact-create"
		| "inbox"
		| "template-editor";
};

/**
 * The 59 unique URL patterns from the final TanStack route tree, with index
 * routes and their parent layouts normalized to one canonical path.
 *
 * Keep this list as the merge-blocking contract until every route has a
 * corresponding Next App Router page or intentional redirect.
 */
export const dashboardRouteContracts = [
	{
		pattern: "/",
		samplePath: "/",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/agent-inbox",
		samplePath: "/agent-inbox",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/api-keys",
		samplePath: "/api-keys",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/api-keys/$apiKeyId",
		samplePath: "/api-keys/route-contract-api-key",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/api-keys/create",
		samplePath: "/api-keys/create",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/contacts",
		samplePath: "/contacts",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/contacts/channels",
		samplePath: "/contacts/channels",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/contacts/create",
		samplePath: "/contacts/create",
		authentication: "required",
		shell: "contact-create",
	},
	{
		pattern: "/contacts/detail",
		samplePath: "/contacts/detail",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/contacts/detail/$contactId",
		samplePath: "/contacts/detail/route-contract-contact",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/contacts/groups",
		samplePath: "/contacts/groups",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/contacts/groups/$groupId",
		samplePath: "/contacts/groups/route-contract-group",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/contacts/properties",
		samplePath: "/contacts/properties",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/domain",
		samplePath: "/domain",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/domain/$domainId",
		samplePath: "/domain/route-contract-domain",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/domain/add",
		samplePath: "/domain/add",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/domain/add/$domainId",
		samplePath: "/domain/add/route-contract-domain",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/emails",
		samplePath: "/emails",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/emails/$emailId",
		samplePath: "/emails/route-contract-email",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/emails/received",
		samplePath: "/emails/received",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/emails/sent",
		samplePath: "/emails/sent",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/inbox",
		samplePath: "/inbox",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId",
		samplePath: "/inbox/route-contract-mailbox",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId/agent",
		samplePath: "/inbox/route-contract-mailbox/agent",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId/archive",
		samplePath: "/inbox/route-contract-mailbox/archive",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId/drafts",
		samplePath: "/inbox/route-contract-mailbox/drafts",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId/label",
		samplePath: "/inbox/route-contract-mailbox/label",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId/label/$labelId",
		samplePath: "/inbox/route-contract-mailbox/label/route-contract-label",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId/needs_approval",
		samplePath: "/inbox/route-contract-mailbox/needs_approval",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId/sent",
		samplePath: "/inbox/route-contract-mailbox/sent",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId/spam",
		samplePath: "/inbox/route-contract-mailbox/spam",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId/trash",
		samplePath: "/inbox/route-contract-mailbox/trash",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/inbox/$mailboxId/you",
		samplePath: "/inbox/route-contract-mailbox/you",
		authentication: "required",
		shell: "inbox",
	},
	{
		pattern: "/integrations",
		samplePath: "/integrations",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/invite",
		samplePath: "/invite?id=route-contract-invite",
		authentication: "anonymous",
		shell: "public",
	},
	{
		pattern: "/login",
		samplePath: "/login?inviteId=route-contract-invite",
		authentication: "anonymous",
		shell: "public",
	},
	{
		pattern: "/logs",
		samplePath: "/logs",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/logs/$logId",
		samplePath: "/logs/route-contract-log",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/metrics",
		samplePath: "/metrics",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/onboarding",
		samplePath: "/onboarding",
		authentication: "required",
		shell: "onboarding",
	},
	{
		pattern: "/settings",
		samplePath: "/settings",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/settings/billing",
		samplePath: "/settings/billing",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/settings/billing/plans",
		samplePath: "/settings/billing/plans",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/settings/profile",
		samplePath: "/settings/profile",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/settings/security",
		samplePath: "/settings/security",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/settings/teams",
		samplePath: "/settings/teams",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/settings/theme",
		samplePath: "/settings/theme",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/settings/workspace",
		samplePath: "/settings/workspace",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/signup",
		samplePath: "/signup?inviteId=route-contract-invite",
		authentication: "anonymous",
		shell: "public",
	},
	{
		pattern: "/smtp",
		samplePath: "/smtp",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/templates",
		samplePath: "/templates",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/templates/$templateId",
		samplePath: "/templates/route-contract-template",
		authentication: "required",
		shell: "template-editor",
	},
	{
		pattern: "/verify",
		samplePath: "/verify?otpSent=route%40example.com&otp=001234",
		authentication: "anonymous",
		shell: "public",
	},
	{
		pattern: "/webhooks",
		samplePath: "/webhooks",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/webhooks/$webhookId",
		samplePath: "/webhooks/route-contract-webhook",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/webhooks/$webhookId/test",
		samplePath: "/webhooks/route-contract-webhook/test",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/webhooks/create",
		samplePath: "/webhooks/create",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/workflows",
		samplePath: "/workflows",
		authentication: "required",
		shell: "dashboard",
	},
	{
		pattern: "/workflows/$workflowId",
		samplePath: "/workflows/route-contract-workflow",
		authentication: "required",
		shell: "dashboard",
	},
] as const satisfies readonly DashboardRouteContract[];

export const compatibilityRouteContracts = [
	{
		path: "/accept-invitation?id=route-contract-invite",
		destination: "/invite?id=route-contract-invite",
	},
] as const;
