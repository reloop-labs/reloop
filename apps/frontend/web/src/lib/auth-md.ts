export function buildAuthMdContent(hostHeader?: string | null): string {
	const audience =
		hostHeader?.trim() || process.env.RELOOP_DOMAIN?.trim() || "reloop.sh";

	return `# Reloop API

This service accepts AgentOnboard identity. Verified agent requests are authorized against the
Reloop account the verified email maps to.

## Audience

\`${audience}\`

    get_token(domain: "${audience}")

Send the token on every request as \`Authorization: Bearer <token>\` (or \`x-agentonboard-token: <token>\`).

## Progressive Disclosure & On-Demand Schemas

To keep context windows lean and token-efficient, the complete platform consists of 40+ domain-prefixed endpoints under \`/api/agents/v1/<domain>/*\`.

- **Inspect single endpoint schema**: Make an \`OPTIONS\` request to any endpoint (e.g. \`OPTIONS /api/agents/v1/domain/create\`).
- **Inspect domain schemas**: Query \`GET /api/agents/v1/<domain>/schema\` (e.g. \`GET /api/agents/v1/inbox/schema\`, \`/domain/schema\`, \`/email/schema\`, \`/contact/schema\`, \`/template/schema\`, \`/automation/schema\`, \`/intelligence/schema\`).

## Endpoints

### \`POST /api/agents/v1/auth/signup\`

Create the calling account and default workspace. This is the one endpoint that may mint an account: an agent that
got \`403 ACCOUNT_REQUIRED\` elsewhere calls this with the same token, then retries its original
request. Calling it for an email that already has an account signs in instead — no duplicate.

- Request: optional \`{ "organizationName"?: string, "organizationSlug"?: string }\`
- Success: \`201\` (new) or \`200\` (existing) with \`{ "user": string, "organization": string, "created": boolean, "status": string, "message": string }\`
- Required header: \`Authorization: Bearer <token>\`

### \`GET /api/agents/v1/auth/me\`

Get current agent identity, active workspace ID, and platform context.

- Request: no body
- Success: \`200\` with \`{ "userId": string, "email": string, "organizationId": string, "platformRole": string }\`
- Required header: \`Authorization: Bearer <token>\`

### \`POST /api/agents/v1/email/send\`

Send transactional email with deliverability warnings and structured tracking ID.

- Request: \`{ "to": string | string[], "subject": string, "text"?: string, "html"?: string, "from"?: string, "replyTo"?: string }\`
- Success: \`200\` with \`{ "success": true, "data": { "id": string }, "warnings": string[] }\`
- Required header: \`Authorization: Bearer <token>\`

### Complete Endpoint Catalog

#### Email (\`/api/agents/v1/email/*\`)
- \`POST /api/agents/v1/email/send\` — Send transactional email
- \`GET /api/agents/v1/email/:id\` — Query delivery status and events for an email
- \`GET /api/agents/v1/email/list\` — List recently sent emails
- \`POST /api/agents/v1/email/:id/resend\` — Resend a previously sent email
- \`GET /api/agents/v1/email/stats\` — Aggregate delivery, open, and bounce statistics

#### Inbox & Messaging (\`/api/agents/v1/inbox/*\`)
- \`GET /api/agents/v1/inbox/mailboxes\` — List incoming mailboxes
- \`GET /api/agents/v1/inbox/threads\` — List email conversation threads
- \`GET /api/agents/v1/inbox/threads/:id\` — Get full thread conversation history
- \`PATCH /api/agents/v1/inbox/threads/:id\` — Update thread state (read, archived, starred)
- \`DELETE /api/agents/v1/inbox/threads/:id\` — Delete a thread
- \`GET /api/agents/v1/inbox/messages\` — List incoming messages
- \`GET /api/agents/v1/inbox/messages/:id\` — Get parsed message body and attachments
- \`POST /api/agents/v1/inbox/messages/send\` — Send message from an inbox address
- \`POST /api/agents/v1/inbox/messages/:id/reply\` — Reply to a message in thread context
- \`POST /api/agents/v1/inbox/messages/:id/forward\` — Forward message to new recipients
- \`DELETE /api/agents/v1/inbox/messages/:id\` — Delete an individual message
- \`DELETE /api/agents/v1/inbox/pending/:id\` — Cancel a pending or scheduled message

#### Sending Domains (\`/api/agents/v1/domain/*\`)
- \`GET /api/agents/v1/domain/list\` — List sending domains and DNS verification status
- \`POST /api/agents/v1/domain/create\` — Register sending domain and get SPF/DKIM/DMARC records
- \`GET /api/agents/v1/domain/:id\` — Get domain details and DNS records
- \`POST /api/agents/v1/domain/:id/verify\` — Trigger immediate DNS verification check
- \`PATCH /api/agents/v1/domain/:id\` — Update domain settings
- \`DELETE /api/agents/v1/domain/:id\` — Delete sending domain

#### Intelligence & Deliverability (\`/api/agents/v1/intelligence/*\`)
- \`POST /api/agents/v1/intelligence/check-temp-email\` — Detect disposable/temp email addresses
- \`POST /api/agents/v1/intelligence/check-bimi\` — Validate BIMI record, SVG logo, and DMARC enforcement
- \`POST /api/agents/v1/intelligence/check-domain-age\` — Assess registration age of a domain
- \`POST /api/agents/v1/intelligence/check-domain-reputation\` — Inspect domain spam scores and risk factors

#### Contacts & Audiences (\`/api/agents/v1/contact/*\`)
- \`GET /api/agents/v1/contact/list\` — List contacts with search and pagination
- \`POST /api/agents/v1/contact/create\` — Create a new contact
- \`GET /api/agents/v1/contact/:id\` — Get contact details and attributes
- \`PATCH /api/agents/v1/contact/:id\` — Update contact attributes
- \`DELETE /api/agents/v1/contact/:id\` — Delete a contact
- \`GET /api/agents/v1/contact/groups\` — List contact groups / segments
- \`POST /api/agents/v1/contact/groups\` — Create an audience group
- \`POST /api/agents/v1/contact/groups/:id/contacts\` — Add contact to a group
- \`DELETE /api/agents/v1/contact/groups/:id/contacts\` — Remove contact from a group

#### Templates (\`/api/agents/v1/template/*\`)
- \`GET /api/agents/v1/template/list\` — List email templates
- \`POST /api/agents/v1/template/create\` — Create template with HTML content and variables
- \`GET /api/agents/v1/template/:id\` — Get template content and version
- \`POST /api/agents/v1/template/:id/send-test\` — Render and send test email

#### Automations (\`/api/agents/v1/automation/*\`)
- \`GET /api/agents/v1/automation/list\` — List automated sequences
- \`POST /api/agents/v1/automation/create\` — Create automated email workflow
- \`GET /api/agents/v1/automation/:id\` — Get automation triggers and steps
- \`POST /api/agents/v1/automation/:id/activate\` — Activate paused automation
- \`POST /api/agents/v1/automation/:id/pause\` — Pause active automation
- \`POST /api/agents/v1/automation/:id/enroll\` — Enroll contact into automation sequence

## When a request is rejected

| Status | \`code\` | What to do |
|---|---|---|
| 401 | any | The token was rejected. Call \`get_token\` tool for \`${audience}\` again and retry **once**. If it fails again, stop and tell the human — do not retry in a loop. |
| 403 | \`ACCOUNT_REQUIRED\` | The identity is genuine but has no Reloop account. Create one at \`POST /api/agents/v1/auth/signup\` with the same token, then retry the original request **once**. **Retrying the original without that will never work.** |
| 403 | \`ORGANIZATION_ACCESS_DENIED\` | The verified account is not a member of the requested workspace. Omit the \`x-organization-id\` header to fall back to your default workspace. |
| 422 | \`VALIDATION_ERROR\` | Request body is missing required fields or has invalid types. Read the \`expectedSchema\` in the error response and retry with corrected payload. |
| 500 | \`RESOLVER_ERROR\` or \`CONFIG_ERROR\` | Our account lookup failed, or our configuration is wrong. Retry after a short delay. Do not re-authenticate; the token is fine. |
`;
}
