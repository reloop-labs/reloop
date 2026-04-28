#!/usr/bin/env node
/**
 * OpenAPI → MDX Doc Page Generator
 *
 * Fetches OpenAPI specs from running backend services and generates
 * MDX doc pages for each endpoint with embedded parameters, responses,
 * code samples, and rich metadata matching Resend's documentation quality.
 *
 * Usage:
 *   bun run generate:api-docs
 */

import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.resolve(__dirname, "../content/docs/api");

interface ServiceConfig {
	name: string;
	prefix: string;
	port: number;
	specUrl: string;
	prodUrl: string;
}

interface ParameterInfo {
	name: string;
	type: string;
	required: boolean;
	description: string;
	location: string;
	defaultValue?: any;
	minimum?: number;
	maximum?: number;
	minLength?: number;
	maxLength?: number;
	enumValues?: string[];
	pattern?: string;
	example?: any;
}

interface CodeSample {
	id: string;
	lang: string;
	label: string;
	source: string;
}

const SERVICES: ServiceConfig[] = [
	{ name: "domain", prefix: "/api/domain", port: 8011, specUrl: "http://localhost:8011/api/domain/openapi/json", prodUrl: "https://reloop.sh/api/domain/openapi/json" },
	{ name: "api-key", prefix: "/api/api-key", port: 8012, specUrl: "http://localhost:8012/api/api-key/openapi/json", prodUrl: "https://reloop.sh/api/api-key/openapi/json" },
	{ name: "webhook", prefix: "/api/webhook", port: 8013, specUrl: "http://localhost:8013/api/webhook/openapi/json", prodUrl: "https://reloop.sh/api/webhook/openapi/json" },
	{ name: "contacts", prefix: "/api/contacts", port: 8014, specUrl: "http://localhost:8014/api/contacts/openapi/json", prodUrl: "https://reloop.sh/api/contacts/openapi/json" },
	{ name: "mail", prefix: "/api/mail", port: 8015, specUrl: "http://localhost:8015/api/mail/openapi/json", prodUrl: "https://reloop.sh/api/mail/openapi/json" },
	{ name: "logs", prefix: "/api/logs", port: 8016, specUrl: "http://localhost:8016/api/logs/openapi/json", prodUrl: "https://reloop.sh/api/logs/openapi/json" },
	{ name: "upload", prefix: "/api/upload", port: 8018, specUrl: "http://localhost:8018/api/upload/openapi/json", prodUrl: "https://reloop.sh/api/upload/openapi/json" },
	{ name: "template", prefix: "/api/template", port: 8019, specUrl: "http://localhost:8019/api/template/openapi/json", prodUrl: "https://reloop.sh/api/template/openapi/json" },
	{ name: "kumomta", prefix: "/api/kumomta", port: 8021, specUrl: "http://localhost:8021/api/kumomta/openapi/json", prodUrl: "https://reloop.sh/api/kumomta/openapi/json" },
	{ name: "auth", prefix: "/api/auth", port: 8000, specUrl: "http://localhost:8000/api/auth/openapi/json", prodUrl: "https://reloop.sh/api/auth/openapi/json" },
];

function sanitizeOperationId(method: string, routePath: string, prefix: string, operation: any): string {
	if (operation.operationId) {
		return operation.operationId.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
	}

	// Fallback to path-based slug
	const cleanPath = routePath.startsWith(prefix) ? routePath.slice(prefix.length) : routePath;
	return cleanPath
		.replace(/[{}]/g, "")
		.split("/")
		.filter(Boolean)
		.join("-")
		.toLowerCase();
}

function resolveSchemaRef(ref: string, spec: any): any {
	if (!ref || !ref.startsWith("#/")) return {};
	const parts = ref.replace("#/", "").split("/");
	let current = spec;
	for (const part of parts) {
		current = current?.[part];
		if (!current) return {};
	}
	return current;
}

function resolveSchema(schema: any, spec: any, depth = 0): any {
	if (!schema || depth > 5) return schema;
	if (schema.$ref) {
		return resolveSchema(resolveSchemaRef(schema.$ref, spec), spec, depth + 1);
	}
	if (schema.properties) {
		const resolved: any = { ...schema, properties: {} };
		for (const [key, value] of Object.entries(schema.properties)) {
			resolved.properties[key] = resolveSchema(value as any, spec, depth + 1);
		}
		return resolved;
	}
	if (schema.items) {
		return { ...schema, items: resolveSchema(schema.items, spec, depth + 1) };
	}
	if (schema.anyOf) {
		return { ...schema, anyOf: schema.anyOf.map((s: any) => resolveSchema(s, spec, depth + 1)) };
	}
	if (schema.oneOf) {
		return { ...schema, oneOf: schema.oneOf.map((s: any) => resolveSchema(s, spec, depth + 1)) };
	}
	return schema;
}

function getTypeString(schema: any): string {
	if (!schema) return "any";

	if (schema.enum) {
		return schema.enum.map((v: any) => (typeof v === "string" ? `"${v}"` : v)).join(" | ");
	}

	if (schema.const !== undefined) {
		return typeof schema.const === "string" ? `"${schema.const}"` : String(schema.const);
	}

	if (schema.type === "array" && schema.items) {
		return `${getTypeString(schema.items)}[]`;
	}

	if (schema.anyOf || schema.oneOf) {
		const variants = schema.anyOf || schema.oneOf;
		return variants
			.filter((v: any) => v.type !== "undefined")
			.map((v: any) => getTypeString(v))
			.join(" | ");
	}

	return schema.type || "any";
}

function extractParameters(operation: any, spec: any): ParameterInfo[] {
	const params: ParameterInfo[] = [];

	// 1. Header, Query, Path Parameters
	if (operation.parameters) {
		for (const param of operation.parameters) {
			const resolved = param.$ref ? resolveSchemaRef(param.$ref, spec) : param;
			const schema = resolved.schema ? resolveSchema(resolved.schema, spec) : {};
			params.push({
				name: resolved.name || "unknown",
				type: getTypeString(schema),
				required: resolved.required ?? false,
				description: resolved.description || schema.description || "",
				location: resolved.in || "query",
				defaultValue: schema.default,
				minimum: schema.minimum,
				maximum: schema.maximum,
				minLength: schema.minLength,
				maxLength: schema.maxLength,
				enumValues: schema.enum,
				pattern: schema.pattern,
				example: schema.example || schema.examples?.[0],
			});
		}
	}

	// 2. Request Body Parameters (JSON)
	if (operation.requestBody) {
		const content = operation.requestBody.content;
		const jsonContent = content?.["application/json"];
		if (jsonContent?.schema) {
			const schema = resolveSchema(jsonContent.schema, spec);

			if (schema.properties) {
				const required = schema.required || [];
				for (const [name, propSchema] of Object.entries(schema.properties)) {
					const prop = resolveSchema(propSchema as any, spec);
					params.push({
						name,
						type: getTypeString(prop),
						required: required.includes(name),
						description: (prop as any).description || (prop as any).title || "",
						location: "body",
						defaultValue: (prop as any).default,
						minimum: (prop as any).minimum,
						maximum: (prop as any).maximum,
						minLength: (prop as any).minLength,
						maxLength: (prop as any).maxLength,
						enumValues: (prop as any).enum,
						pattern: (prop as any).pattern,
						example: (prop as any).example || (prop as any).examples?.[0],
					});
				}
			} else if (schema.type === "array" && schema.items) {
				params.push({
					name: "body",
					type: `${getTypeString(schema.items)}[]`,
					required: true,
					description: schema.description || "Array of items",
					location: "body",
				});
			}
		}
	}

	return params;
}

function extractCodeSamples(operation: any): CodeSample[] {
	return (operation["x-codeSamples"] || []).map((sample: any) => ({
		id: sample.id || sample.lang,
		lang: sample.lang,
		label: sample.label || sample.lang,
		source: sample.source,
	}));
}

function buildResponseExample(schema: any, spec: any, depth = 0): any {
	if (!schema || depth > 4) return null;

	const resolved = schema.$ref ? resolveSchema(schema, spec) : schema;

	// Use examples if available
	if (resolved.examples && resolved.examples.length > 0) {
		return resolved.examples[0];
	}
	if (resolved.example !== undefined) {
		return resolved.example;
	}

	if (resolved.const !== undefined) {
		return resolved.const;
	}

	if (resolved.type === "object" && resolved.properties) {
		const obj: Record<string, any> = {};
		for (const [key, propSchema] of Object.entries(resolved.properties)) {
			const val = buildResponseExample(propSchema as any, spec, depth + 1);
			if (val !== null) obj[key] = val;
		}
		return obj;
	}

	if (resolved.type === "array" && resolved.items) {
		const itemExample = buildResponseExample(resolved.items, spec, depth + 1);
		return itemExample !== null ? [itemExample] : [];
	}

	if (resolved.enum) return resolved.enum[0];
	if (resolved.default !== undefined) return resolved.default;

	// Generate sensible defaults
	switch (resolved.type) {
		case "string": return resolved.format === "date-time" ? "2024-01-01T00:00:00.000Z" : "string";
		case "number": case "integer": return 0;
		case "boolean": return true;
		default: return null;
	}
}

function extractResponses(operation: any, spec: any): Record<string, any> {
	const responses: Record<string, any> = {};

	if (operation.responses) {
		for (const [status, responseObj] of Object.entries(operation.responses as Record<string, any>)) {
			const resolved = responseObj.$ref ? resolveSchemaRef(responseObj.$ref, spec) : responseObj;
			const content = resolved.content?.["application/json"];
			let exampleData = null;

			if (content?.schema) {
				const schema = resolveSchema(content.schema, spec);
				exampleData = buildResponseExample(schema, spec);
			}

			responses[status] = {
				description: resolved.description || `Response for status ${status}`,
				schema: exampleData,
			};
		}
	}

	return responses;
}

function escapeForMDX(str: string): string {
	return str.replace(/"/g, '\\"').replace(/\n/g, " ");
}

/* ─── Content Enrichment ──────────────────────────────────── */

const PARAM_DESCRIPTIONS: Record<string, Record<string, string>> = {
	// Common across all services
	_common: {
		page: "The page number to retrieve. Use this for paginating through large result sets. The first page is 1.",
		limit: "Number of items to return per page. If you do not provide a limit, all items will be returned in a single response.",
		q: "Search query to filter results by name or other searchable fields. The search is case-insensitive and supports partial matching.",
		status: "Filter results by their current status. Only items matching the specified status will be returned.",
		id: "The unique identifier of the resource.",
	},
	domain: {
		domain: "The name of the domain you want to register (e.g., send.example.com). This should be a valid domain name that you own and can configure DNS records for.",
		domain_id: "The unique identifier of the domain. You can find this in the domain list or in the response when creating a domain.",
		customReturnPath: "For advanced use cases, choose a subdomain for the Return-Path address. The custom return path is used for SPF authentication, DMARC alignment, and handling bounced emails. Defaults to 'inbound'. Avoid setting values that could undermine credibility (e.g., 'testing'), as they may be exposed to recipients.",
		clickTracking: "Track clicks within the body of each HTML email. When enabled, all links in your emails will be wrapped with tracking URLs. This setting is only applied if a tracking_subdomain is configured and verified.",
		openTracking: "Track the open rate of each email. When enabled, a transparent tracking pixel is inserted into each email. This setting is only applied if a tracking_subdomain is configured and verified.",
		tls: "The TLS security level for email delivery. 'opportunistic' attempts a secure connection but falls back to unencrypted if unavailable. 'enforced' requires TLS — if the receiving server does not support TLS, the email will not be sent.",
		sendingEmail: "Whether this domain is enabled for sending emails. When disabled, no emails can be sent from this domain.",
		receivingEmail: "Whether this domain is enabled for receiving emails. When enabled, you can receive inbound emails on this domain.",
		trackingDomain: "Whether this domain is used as a custom tracking subdomain for click and open tracking.",
	},
	contacts: {
		email: "The email address of the contact. Must be a valid email format (e.g., john@example.com). This is the primary identifier for the contact.",
		firstName: "The first name of the contact. Used for personalization in email templates.",
		lastName: "The last name of the contact. Used for personalization in email templates.",
		status: "The subscription status of the contact. 'subscribed' contacts will receive emails, 'unsubscribed' contacts have opted out, and 'blocked' contacts are prevented from receiving any emails.",
		properties: "Custom key-value properties to store additional metadata about the contact. These can be used for segmentation and personalization in email templates.",
		audienceId: "The unique identifier of the audience this contact belongs to.",
		contact_id: "The unique identifier of the contact.",
	},
	mail: {
		from: "The sender email address. Must be a verified domain in your account. Format: 'Name <email@domain.com>' or just 'email@domain.com'.",
		to: "The recipient email address or an array of email addresses. Each address can be in the format 'Name <email>' or just 'email'.",
		subject: "The subject line of the email. Keep it concise and descriptive for better open rates.",
		html: "The HTML content of the email body. Supports standard HTML and inline CSS for styling.",
		text: "The plain text version of the email body. This is shown to recipients whose email clients do not support HTML.",
		replyTo: "The email address that recipients should reply to. If not specified, replies will go to the 'from' address.",
		cc: "Carbon copy recipients. These addresses will be visible to all recipients.",
		bcc: "Blind carbon copy recipients. These addresses will be hidden from other recipients.",
		scheduledAt: "Schedule the email to be sent at a specific time in the future. Must be an ISO 8601 date string. The email will be queued and sent at the specified time.",
		tags: "Custom tags to categorize and track this email. Tags can be used for filtering in the dashboard and webhooks.",
		email_id: "The unique identifier of the email.",
	},
	webhook: {
		endpointUrl: "The URL where webhook events will be delivered via HTTP POST. Must be a publicly accessible HTTPS endpoint that returns a 2xx status code.",
		events: "The list of event types to subscribe to. Only events matching these types will be delivered to your endpoint.",
		webhook_id: "The unique identifier of the webhook endpoint.",
		name: "A human-readable name for the webhook endpoint, for your reference in the dashboard.",
		active: "Whether the webhook endpoint is currently active and receiving events.",
	},
	"api-key": {
		name: "A descriptive name for the API key, to help you identify it later (e.g., 'Production Server', 'CI/CD Pipeline').",
		permission: "The permission level for this API key. 'full_access' grants read and write access to all resources. 'sending_access' only allows sending emails.",
		key_id: "The unique identifier of the API key.",
	},
	template: {
		name: "The name of the email template, for your reference in the dashboard.",
		subject: "The default subject line for emails sent using this template. Can be overridden when sending.",
		html: "The HTML content of the template. Supports Handlebars-style variables for dynamic content (e.g., {{name}}).",
		id: "The unique identifier of the template.",
	},
	logs: {
		logId: "The unique identifier of the log entry.",
	},
	upload: {
		file: "The file to upload. Must be a valid file under the maximum size limit.",
	},
};

const ENDPOINT_DESCRIPTIONS: Record<string, Record<string, string>> = {
	domain: {
		create: "Create a new domain for sending and receiving emails through the Reloop Email API. After creating a domain, you'll need to configure DNS records and verify the domain before you can start sending emails.",
		list: "Retrieve a paginated list of domains registered in your account. Use the optional filters to narrow down results by status or search by domain name.",
		get: "Retrieve detailed information about a specific domain, including its current verification status, DNS records, and tracking configuration.",
		delete: "Permanently delete a domain from your account. This action cannot be undone. Any emails currently in transit for this domain will still be delivered.",
		update: "Update the configuration of an existing domain. You can modify tracking settings, TLS enforcement, and other domain properties.",
		verify: "Trigger the domain verification process. The domain will be temporarily marked as 'pending' regardless of its current status while the verification is in progress. This will trigger 'domain.updated' webhook events as the domain status changes during the verification process.",
		nameservers: "Retrieve the required DNS nameserver records for a domain. These records must be configured at your DNS provider to verify domain ownership.",
	},
	contacts: {
		create: "Add a new contact to your audience. The contact will be created with the specified email address and optional metadata. Duplicate emails within the same audience will return an error.",
		list: "Retrieve a paginated list of contacts in your audience. Use filters to search by email, name, or subscription status.",
		get: "Retrieve detailed information about a specific contact, including their subscription status, custom properties, and activity history.",
		delete: "Permanently remove a contact from your audience. This action cannot be undone and will delete all associated data.",
		update: "Update a contact's information, including their name, subscription status, and custom properties.",
	},
	mail: {
		send: "Send a single email to one or more recipients. The email will be queued for delivery immediately unless a scheduledAt time is specified.",
		batch: "Send multiple emails in a single API call. Each email in the batch can have different recipients, content, and settings. This is more efficient than making individual send requests.",
		get: "Retrieve the details of a previously sent email, including its delivery status, timestamps, and content.",
		list: "Retrieve a paginated list of sent emails. Use filters to narrow down results by recipient, status, or date range.",
		cancel: "Cancel a scheduled email that has not yet been sent. Only emails with a future scheduledAt time can be cancelled.",
		update: "Update a scheduled email that has not yet been sent. You can modify the content, recipients, and scheduled time.",
	},
	webhook: {
		create: "Create a new webhook endpoint to receive real-time notifications about email events. Your endpoint must be publicly accessible and respond with a 2xx status code.",
		list: "Retrieve a list of all webhook endpoints configured in your account.",
		get: "Retrieve detailed information about a specific webhook endpoint, including its event subscriptions and delivery history.",
		delete: "Permanently delete a webhook endpoint. Events will no longer be delivered to this URL.",
		update: "Update a webhook endpoint's configuration, including its URL, event subscriptions, and active status.",
		trigger: "Manually trigger a test event delivery to a webhook endpoint. Useful for testing your endpoint's implementation.",
	},
	"api-key": {
		create: "Create a new API key for authenticating API requests. The full API key value is only shown once upon creation — store it securely.",
		list: "Retrieve a list of all API keys in your account. For security, the full key values are not included in the response.",
		get: "Retrieve information about a specific API key, including its name, permissions, and creation date.",
		delete: "Permanently revoke an API key. Any requests using this key will immediately receive authentication errors.",
		update: "Update an API key's name or permissions.",
		rotate: "Generate a new secret for an existing API key. The old key will be immediately invalidated.",
		enable: "Re-enable a previously disabled API key.",
		disable: "Temporarily disable an API key without deleting it. The key can be re-enabled later.",
	},
	template: {
		create: "Create a new email template. Templates allow you to define reusable email layouts with dynamic variables.",
		list: "Retrieve a list of all email templates in your account.",
		get: "Retrieve the full content and metadata of a specific email template.",
		delete: "Permanently delete an email template. Emails referencing this template will no longer be sendable.",
		update: "Update an existing email template's content, subject line, or metadata.",
		duplicate: "Create a copy of an existing template with a new name. The duplicate will have all the same content and settings.",
	},
	logs: {
		get: "Retrieve a specific log entry with full details about the email event.",
		list: "Retrieve a paginated list of email activity logs. Logs include delivery attempts, bounces, opens, clicks, and other events.",
	},
};

function enrichDescription(service: string, paramName: string, existingDesc: string): string {
	if (existingDesc && existingDesc.length > 40) return existingDesc;
	const serviceDescs = PARAM_DESCRIPTIONS[service] || {};
	const commonDescs = PARAM_DESCRIPTIONS._common || {};
	return serviceDescs[paramName] || commonDescs[paramName] || existingDesc;
}

function getEndpointDescription(service: string, summary: string, existingDesc: string): string {
	if (existingDesc && existingDesc.length > 60) return existingDesc;
	const serviceDescs = ENDPOINT_DESCRIPTIONS[service] || {};
	const summaryLower = (summary || "").toLowerCase();
	for (const [key, desc] of Object.entries(serviceDescs)) {
		if (summaryLower.includes(key)) return desc;
	}
	return existingDesc || summary;
}

function generateMDX(
	service: ServiceConfig,
	routePath: string,
	method: string,
	operation: any,
	params: ParameterInfo[],
	responses: Record<string, any>,
	codeSamples: CodeSample[],
): string {
	const title = operation.summary || `${method.toUpperCase()} ${routePath}`;
	const rawDesc = operation.description || title;
	const description = getEndpointDescription(service.name, title, rawDesc);

	// Enrich parameter descriptions
	const enrichedParams = params.map(p => ({
		...p,
		description: enrichDescription(service.name, p.name, p.description),
	}));

	return `---
title: "${escapeForMDX(title)}"
full: true
_openapi:
  method: ${method.toUpperCase()}
  toc: []
  structuredData:
    headings: []
    contents:
      - content: "${escapeForMDX(description)}"
_apiData:
  document: "${service.prodUrl}"
  operationData: ${JSON.stringify([{path: routePath, method}])}
  parameterList: ${JSON.stringify(enrichedParams)}
  responseMap: ${JSON.stringify(responses)}
  codeSamples: ${JSON.stringify(codeSamples)}
---

{/* This file was generated by the OpenAPI doc generator. Do not edit this file directly. Run \`bun run generate:api-docs\` to regenerate. */}

${description}

<APIPage />
`;
}

async function generateForService(service: ServiceConfig): Promise<string[]> {
	console.log(`\n📡 Fetching spec from ${service.specUrl}...`);

	try {
		const response = await fetch(service.specUrl);
		if (!response.ok) return [];

		const spec = await response.json();
		const paths = spec.paths || {};
		const generated: string[] = [];

		const serviceDir = path.join(DOCS_DIR, service.name);
		if (!fs.existsSync(serviceDir)) fs.mkdirSync(serviceDir, { recursive: true });

		for (const [routePath, methods] of Object.entries(paths)) {
			for (const [method, operation] of Object.entries(methods as Record<string, any>)) {
				if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
				if (operation.hide === true) continue;

				const params = extractParameters(operation, spec);
				const responses = extractResponses(operation, spec);
				const codeSamples = extractCodeSamples(operation);

				const operationId = sanitizeOperationId(method, routePath, service.prefix, operation);
				const filename = `${operationId}.mdx`;
				const filePath = path.join(serviceDir, filename);

				const content = generateMDX(service, routePath, method, operation, params, responses, codeSamples);
				fs.writeFileSync(filePath, content);
				generated.push(`${service.name}/${operationId}`);
				console.log(`  ✅ ${method.toUpperCase().padEnd(6)} ${routePath} → ${filename}  (${codeSamples.length} code samples, ${params.length} params)`);
			}
		}

		return generated;
	} catch (error) {
		console.error(`  ❌ Failed to connect: ${(error as Error).message}`);
		return [];
	}
}

function generateMetaJson(allGenerated: Record<string, string[]>) {
	const metaPath = path.join(DOCS_DIR, "meta.json");

	const pages: string[] = [
		"---API Reference---",
		"index",
		"pagination",
		"usage-limits",
		"errors",
	];

	const sectionNames: Record<string, string> = {
		domain: "Domain",
		mail: "Mail",
		"api-key": "API Key",
		contacts: "Contacts",
		webhook: "Webhooks",
		template: "Templates",
		upload: "Upload",
		logs: "Logs",
		kumomta: "KumoMTA (Internal)",
		auth: "Auth",
	};

	for (const [service, entries] of Object.entries(allGenerated)) {
		const sectionName = sectionNames[service] || service;
		pages.push(`---${sectionName}---`);
		pages.push(...entries.sort());
	}

	const meta = {
		title: "API Reference",
		description: "Reloop API Reference Documentation",
		root: true,
		icon: "brackets",
		pages,
	};

	fs.writeFileSync(metaPath, JSON.stringify(meta, null, "\t") + "\n");
	console.log(`\n📝 Updated meta.json`);
}

async function main() {
	console.log("🔧 OpenAPI → MDX Doc Generator");

	const allGenerated: Record<string, string[]> = {};

	for (const service of SERVICES) {
		const generated = await generateForService(service);
		if (generated.length > 0) allGenerated[service.name] = generated;
	}

	generateMetaJson(allGenerated);
	console.log("\n📊 Done!");
}

main();
