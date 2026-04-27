#!/usr/bin/env node
/**
 * OpenAPI → MDX Doc Page Generator
 *
 * Fetches OpenAPI specs from running backend services and generates
 * MDX doc pages for each endpoint with embedded parameters and responses.
 *
 * Usage:
 *   bun run generate:api-docs
 *   bun run generate:api-docs --service=domain
 *
 * Prerequisites: Backend services must be running locally.
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

function sanitizeOperationId(method: string, routePath: string, prefix: string): string {
	// Remove the service prefix to get cleaner names
	const cleanPath = routePath.startsWith(prefix) ? routePath.slice(prefix.length) : routePath;
	const parts = cleanPath
		.split("/")
		.filter(Boolean)
		.map((p) => {
			if (p.startsWith("{") && p.endsWith("}")) {
				return `By${p.slice(1, -1).split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("_")}`;
			}
			return p.charAt(0).toUpperCase() + p.slice(1);
		});

	const prefix2 = routePath
		.replace(/[{}]/g, "")
		.replace(/\//g, "_")
		.replace(/^_/, "")
		.replace(/_$/, "");
	return `${method}${prefix2.charAt(0).toUpperCase()}${prefix2.slice(1)}`;
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
	if (!schema || depth > 3) return schema;
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
	return schema;
}

function getTypeString(schema: any): string {
	if (!schema) return "any";
	if (schema.type === "array") {
		return `${getTypeString(schema.items)}[]`;
	}
	if (schema.type === "object" && schema.properties) {
		return "object";
	}
	if (schema.enum) {
		return schema.enum.map((v: string) => `"${v}"`).join(" | ");
	}
	if (schema.anyOf || schema.oneOf) {
		const variants = schema.anyOf || schema.oneOf;
		return variants.map((v: any) => getTypeString(v)).join(" | ");
	}
	if (schema.allOf) {
		return "object";
	}
	return schema.type || "any";
}

function extractParameters(
	operation: any,
	spec: any,
): ParameterInfo[] {
	const params: ParameterInfo[] = [];

	// Path/Query/Header parameters
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
			});
		}
	}

	// Request body
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
						description: (prop as any).description || "",
						location: "body",
					});
				}
			}
		}
	}

	return params;
}

function extractResponses(
	operation: any,
	spec: any,
): Record<string, any> {
	const responses: Record<string, any> = {};

	if (operation.responses) {
		for (const [status, responseObj] of Object.entries(operation.responses as Record<string, any>)) {
			const resolved = responseObj.$ref
				? resolveSchemaRef(responseObj.$ref, spec)
				: responseObj;
			const content = resolved.content?.["application/json"];
			let schema = null;
			if (content?.schema) {
				schema = resolveSchema(content.schema, spec);
				// Simplify schema for display - just keep type and properties names
				schema = simplifySchema(schema);
			}
			responses[status] = {
				description: resolved.description || "",
				schema,
			};
		}
	}

	return responses;
}

function simplifySchema(schema: any, depth = 0): any {
	if (!schema || depth > 2) return null;
	if (schema.type === "object" && schema.properties) {
		const simplified: Record<string, string> = {};
		for (const [key, value] of Object.entries(schema.properties)) {
			simplified[key] = getTypeString(value as any);
		}
		return simplified;
	}
	if (schema.type === "array" && schema.items) {
		return { _type: "array", items: simplifySchema(schema.items, depth + 1) };
	}
	return { _type: schema.type || "any" };
}

function escapeForMDX(str: string): string {
	return str.replace(/"/g, '\\"').replace(/\n/g, " ");
}

function generateMDX(
	service: ServiceConfig,
	routePath: string,
	method: string,
	operation: any,
	params: ParameterInfo[],
	responses: Record<string, any>,
): string {
	const title = operation.summary || `${method.toUpperCase()} ${routePath}`;
	const description = operation.description || title;

	const paramsJSON = JSON.stringify(params);
	const responsesJSON = JSON.stringify(responses);

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
---

{/* This file was generated by the OpenAPI doc generator. Do not edit this file directly. Run \`bun run generate:api-docs\` to regenerate. */}

${description}

<APIPage document={"${service.prodUrl}"} operations={[{"path":"${routePath}","method":"${method}"}]} parameters={${paramsJSON}} responses={${responsesJSON}} />
`;
}

async function generateForService(service: ServiceConfig): Promise<string[]> {
	console.log(`\n📡 Fetching spec from ${service.specUrl}...`);

	try {
		const response = await fetch(service.specUrl);
		if (!response.ok) {
			console.error(`  ❌ Failed: HTTP ${response.status}`);
			return [];
		}

		const spec = await response.json();
		const paths = spec.paths || {};
		const generated: string[] = [];

		const serviceDir = path.join(DOCS_DIR, service.name);
		if (!fs.existsSync(serviceDir)) {
			fs.mkdirSync(serviceDir, { recursive: true });
		}

		for (const [routePath, methods] of Object.entries(paths)) {
			for (const [method, operation] of Object.entries(methods as Record<string, any>)) {
				if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
				if (operation.hide === true) continue;

				const params = extractParameters(operation, spec);
				const responses = extractResponses(operation, spec);

				const operationId = sanitizeOperationId(method, routePath, service.prefix);
				const filename = `${operationId}.mdx`;
				const filePath = path.join(serviceDir, filename);

				const content = generateMDX(service, routePath, method, operation, params, responses);
				fs.writeFileSync(filePath, content);
				generated.push(`${service.name}/${operationId}`);
				console.log(`  ✅ ${method.toUpperCase().padEnd(6)} ${routePath} → ${filename} (${params.length} params, ${Object.keys(responses).length} responses)`);
			}
		}

		// Generate meta entries for this service
		if (generated.length > 0) {
			console.log(`  📄 Generated ${generated.length} pages for ${service.name}`);
		}

		return generated;
	} catch (error) {
		console.error(`  ❌ Failed to connect: ${(error as Error).message}`);
		return [];
	}
}

function generateMetaJson(allGenerated: Record<string, string[]>) {
	const metaPath = path.join(DOCS_DIR, "meta.json");

	// Build the pages array
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
		pages.push(...entries);
	}

	const meta = {
		title: "API Reference",
		description: "Reloop API Reference Documentation",
		root: true,
		icon: "brackets",
		pages,
	};

	fs.writeFileSync(metaPath, JSON.stringify(meta, null, "\t") + "\n");
	console.log(`\n📝 Updated meta.json with ${pages.length} entries`);
}

async function main() {
	const args = process.argv.slice(2);
	const serviceFilter = args.find((a) => a.startsWith("--service="))?.split("=")[1];
	const autoMeta = !args.includes("--no-meta");

	const services = serviceFilter
		? SERVICES.filter((s) => s.name === serviceFilter)
		: SERVICES;

	if (services.length === 0) {
		console.error(`Unknown service: ${serviceFilter}`);
		process.exit(1);
	}

	console.log("🔧 OpenAPI → MDX Doc Generator");
	console.log(`   Generating docs for: ${services.map((s) => s.name).join(", ")}`);

	const allGenerated: Record<string, string[]> = {};

	for (const service of services) {
		const generated = await generateForService(service);
		if (generated.length > 0) {
			allGenerated[service.name] = generated;
		}
	}

	// Auto-update meta.json
	if (autoMeta && Object.keys(allGenerated).length > 0) {
		generateMetaJson(allGenerated);
	}

	// Print summary
	console.log("\n📊 Summary:");
	let total = 0;
	for (const [name, pages] of Object.entries(allGenerated)) {
		console.log(`   ${name}: ${pages.length} pages`);
		total += pages.length;
	}
	console.log(`   Total: ${total} pages generated`);
}

main();
