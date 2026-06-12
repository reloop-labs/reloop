#!/usr/bin/env node
/**
 * OpenAPI → MDX Doc Page Generator
 *
 * Fetches OpenAPI specs from running backend services and generates
 * MDX doc pages for each endpoint with embedded parameters, responses,
 * and code samples sourced directly from the backend OpenAPI spec.
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
	properties?: ParameterInfo[];
}

interface CodeSample {
	id: string;
	lang: string;
	label: string;
	source: string;
}

interface GeneratedPage {
	slug: string;
	tag: string;
	folderSlug: string;
	order: number;
}

interface ServiceStructure {
	useFolders: boolean;
	pages: string[];
	folders: Map<string, { title: string; pages: string[] }>;
}

const SERVICES: ServiceConfig[] = [
	{
		name: "domain",
		prefix: "/api/domain",
		port: 8011,
		specUrl: "http://localhost:8011/api/domain/openapi/json",
		prodUrl: "https://reloop.sh/api/domain/openapi/json",
	},
	{
		name: "api-key",
		prefix: "/api/api-key",
		port: 8012,
		specUrl: "http://localhost:8012/api/api-key/openapi/json",
		prodUrl: "https://reloop.sh/api/api-key/openapi/json",
	},
	{
		name: "webhook",
		prefix: "/api/webhook",
		port: 8013,
		specUrl: "http://localhost:8013/api/webhook/openapi/json",
		prodUrl: "https://reloop.sh/api/webhook/openapi/json",
	},
	{
		name: "contacts",
		prefix: "/api/contacts",
		port: 8014,
		specUrl: "http://localhost:8014/api/contacts/openapi/json",
		prodUrl: "https://reloop.sh/api/contacts/openapi/json",
	},
	{
		name: "mail",
		prefix: "/api/mail",
		port: 8015,
		specUrl: "http://localhost:8015/api/mail/openapi/json",
		prodUrl: "https://reloop.sh/api/mail/openapi/json",
	},
	{
		name: "logs",
		prefix: "/api/logs",
		port: 8016,
		specUrl: "http://localhost:8016/api/logs/openapi/json",
		prodUrl: "https://reloop.sh/api/logs/openapi/json",
	},
	{
		name: "upload",
		prefix: "/api/upload",
		port: 8018,
		specUrl: "http://localhost:8018/api/upload/openapi/json",
		prodUrl: "https://reloop.sh/api/upload/openapi/json",
	},
	{
		name: "template",
		prefix: "/api/template",
		port: 8019,
		specUrl: "http://localhost:8019/api/template/openapi/json",
		prodUrl: "https://reloop.sh/api/template/openapi/json",
	},
];

function sanitizeOperationId(
	method: string,
	routePath: string,
	prefix: string,
	operation: any,
): string {
	if (operation.operationId) {
		return operation.operationId
			.replace(/([a-z])([A-Z])/g, "$1-$2")
			.toLowerCase();
	}

	// Fallback to path-based slug
	const cleanPath = routePath.startsWith(prefix)
		? routePath.slice(prefix.length)
		: routePath;
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
		return {
			...schema,
			anyOf: schema.anyOf.map((s: any) => resolveSchema(s, spec, depth + 1)),
		};
	}
	if (schema.oneOf) {
		return {
			...schema,
			oneOf: schema.oneOf.map((s: any) => resolveSchema(s, spec, depth + 1)),
		};
	}
	return schema;
}

function getTypeString(schema: any): string {
	if (!schema) return "any";

	if (schema.enum) {
		return schema.enum
			.map((v: any) => (typeof v === "string" ? `"${v}"` : v))
			.join(" | ");
	}

	if (schema.const !== undefined) {
		return typeof schema.const === "string"
			? `"${schema.const}"`
			: String(schema.const);
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

function getEnumValues(schema: any, spec: any): string[] | undefined {
	const resolved = resolveSchema(schema, spec);

	if (resolved.enum) {
		return resolved.enum;
	}

	if (resolved.anyOf || resolved.oneOf) {
		const variants = resolved.anyOf || resolved.oneOf;
		const constValues = variants
			.map((variant: any) => resolveSchema(variant, spec))
			.filter((variant: any) => variant.const !== undefined)
			.map((variant: any) => String(variant.const));

		if (constValues.length > 0) {
			return constValues;
		}
	}

	return undefined;
}

function parseParameter(
	name: string,
	propSchema: any,
	required: boolean,
	location: string,
	spec: any,
): ParameterInfo {
	const prop = resolveSchema(propSchema, spec);

	let subProperties: ParameterInfo[] | undefined;
	if (prop.type === "object" && prop.properties) {
		subProperties = [];
		const subRequired = prop.required || [];
		for (const [subName, subPropSchema] of Object.entries(prop.properties)) {
			subProperties.push(
				parseParameter(
					subName,
					subPropSchema,
					subRequired.includes(subName),
					location,
					spec,
				),
			);
		}
	} else if (prop.type === "array" && prop.items) {
		const itemsSchema = resolveSchema(prop.items, spec);
		if (itemsSchema.type === "object" && itemsSchema.properties) {
			subProperties = [];
			const subRequired = itemsSchema.required || [];
			for (const [subName, subPropSchema] of Object.entries(
				itemsSchema.properties,
			)) {
				subProperties.push(
					parseParameter(
						subName,
						subPropSchema,
						subRequired.includes(subName),
						location,
						spec,
					),
				);
			}
		}
	}

	return {
		name,
		type: getTypeString(prop),
		required,
		description: prop.description || prop.title || "",
		location,
		defaultValue: prop.default,
		minimum: prop.minimum,
		maximum: prop.maximum,
		minLength: prop.minLength,
		maxLength: prop.maxLength,
		enumValues: getEnumValues(prop, spec),
		pattern: prop.pattern,
		example: prop.example || prop.examples?.[0],
		properties: subProperties,
	};
}

function extractParameters(operation: any, spec: any): ParameterInfo[] {
	const params: ParameterInfo[] = [];

	// 1. Header, Query, Path Parameters
	if (operation.parameters) {
		for (const param of operation.parameters) {
			const resolved = param.$ref ? resolveSchemaRef(param.$ref, spec) : param;
			const schema = resolved.schema
				? resolveSchema(resolved.schema, spec)
				: {};
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
				enumValues: getEnumValues(schema, spec),
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
					params.push(
						parseParameter(
							name,
							propSchema,
							required.includes(name),
							"body",
							spec,
						),
					);
				}
			} else if (schema.type === "array" && schema.items) {
				const itemsSchema = resolveSchema(schema.items, spec);
				params.push({
					name: "body",
					type: `${getTypeString(itemsSchema)}[]`,
					required: true,
					description: schema.description || "Array of items",
					location: "body",
					properties: itemsSchema.properties
						? Object.entries(itemsSchema.properties).map(
								([subName, subPropSchema]) =>
									parseParameter(
										subName,
										subPropSchema,
										(itemsSchema.required || []).includes(subName),
										"body",
										spec,
									),
							)
						: undefined,
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

function exampleStringForField(
	fieldName: string,
	schema: any,
	path: string[],
): string {
	const name = fieldName.toLowerCase();
	const parent = path.length >= 2 ? path[path.length - 2].toLowerCase() : "";

	if (
		schema.format === "date-time" ||
		name.endsWith("at") ||
		name.endsWith("_at")
	) {
		return "2026-03-23T10:00:00.000Z";
	}

	if (name === "id") {
		if (parent === "groups") return "grp_123456789";
		if (parent === "channels") return "channel_123456789";
		if (parent === "properties") return "prop_123456789";
		return "con_123456789";
	}

	const examples: Record<string, string> = {
		email: "john.doe@example.com",
		firstname: "John",
		lastname: "Doe",
		name:
			parent === "groups"
				? "Beta Testers"
				: parent === "channels"
					? "Newsletter"
					: "Newsletter",
		event: "evt_123456789",
		message: "Contact already exists",
		why: "A contact with this email already exists in your organization.",
		fix: "Use a different email address or update the existing contact instead.",
		link: "https://reloop.sh/docs/api/contacts",
		domain: "send.example.com",
		subject: "Welcome to Reloop",
		endpointurl: "https://example.com/webhooks/reloop",
		propertyname: "company",
	};

	return examples[name] || `example_${fieldName}`;
}

function buildResponseExample(
	schema: any,
	spec: any,
	depth = 0,
	path: string[] = [],
): any {
	if (!schema || depth > 6) return null;

	const resolved = schema.$ref ? resolveSchema(schema, spec) : schema;

	if (resolved.examples?.length > 0) {
		return resolved.examples[0];
	}
	if (resolved.example !== undefined) {
		return resolved.example;
	}
	if (resolved.const !== undefined) {
		return resolved.const;
	}

	if (resolved.anyOf || resolved.oneOf) {
		const variants = resolved.anyOf || resolved.oneOf;
		const fieldName = path[path.length - 1]?.toLowerCase() || "";
		const flatVariants = variants.flatMap((v: any) =>
			v.anyOf ? v.anyOf : [v],
		);
		const nullableFields = new Set([
			"suppressionreason",
			"suppressedat",
			"defaultvalue",
			"deletedat",
		]);

		if (
			flatVariants.some((v: any) => v.type === "null") &&
			nullableFields.has(fieldName)
		) {
			return null;
		}

		const dateVariant = flatVariants.find(
			(v: any) =>
				v.format === "date-time" ||
				v.type === "Date" ||
				(fieldName.endsWith("at") && !nullableFields.has(fieldName)),
		);
		if (dateVariant) {
			return "2026-03-23T10:00:00.000Z";
		}

		const preferred = flatVariants.find(
			(v: any) =>
				v.type &&
				v.type !== "null" &&
				v.type !== "undefined" &&
				v.type !== "Date",
		);
		if (preferred) {
			return buildResponseExample(preferred, spec, depth, path);
		}

		if (flatVariants.some((v: any) => v.type === "Date")) {
			return "2026-03-23T10:00:00.000Z";
		}

		return null;
	}

	if (resolved.type === "object") {
		if (resolved.properties) {
			const obj: Record<string, any> = {};
			for (const [key, propSchema] of Object.entries(resolved.properties)) {
				const val = buildResponseExample(
					propSchema as any,
					spec,
					depth + 1,
					[...path, key],
				);
				if (val !== undefined) obj[key] = val;
			}
			return obj;
		}

		if (resolved.patternProperties) {
			return {
				company: "Reloop",
				role: "Developer",
			};
		}

		if (resolved.additionalProperties) {
			return {
				company: "Reloop",
				role: "Developer",
			};
		}

		return {};
	}

	if (resolved.type === "array" && resolved.items) {
		const itemExample = buildResponseExample(
			resolved.items,
			spec,
			depth + 1,
			path,
		);
		return itemExample !== null ? [itemExample] : [];
	}

	if (resolved.enum) return resolved.enum[0];
	if (resolved.default !== undefined) return resolved.default;

	switch (resolved.type) {
		case "string":
			return exampleStringForField(
				path[path.length - 1] || "value",
				resolved,
				path,
			);
		case "number":
		case "integer":
			return path[path.length - 1] === "total" ? 1 : 0;
		case "boolean":
			return true;
		case "null":
			return null;
		default:
			return null;
	}
}

function extractResponses(operation: any, spec: any): Record<string, any> {
	const responses: Record<string, any> = {};

	if (operation.responses) {
		for (const [status, responseObj] of Object.entries(
			operation.responses as Record<string, any>,
		)) {
			const resolved = responseObj.$ref
				? resolveSchemaRef(responseObj.$ref, spec)
				: responseObj;
			const content = resolved.content?.["application/json"];
			let exampleData = null;

			if (content?.example !== undefined) {
				exampleData = content.example;
			} else if (content?.examples) {
				const firstExample = Object.values(content.examples)[0] as any;
				exampleData = firstExample?.value ?? firstExample;
			} else if (content?.schema) {
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
	const description = operation.description || title;

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
  operationData: ${JSON.stringify([{ path: routePath, method }])}
  parameterList: ${JSON.stringify(params)}
  responseMap: ${JSON.stringify(responses)}
  codeSamples: ${JSON.stringify(codeSamples)}
---

{/* This file was generated by the OpenAPI doc generator. Do not edit this file directly. Run \`bun run generate:api-docs\` to regenerate. */}

<APIPage />
`;
}

function tagToFolderSlug(tag: string): string {
	return tag
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function shouldFlattenTagToRoot(serviceName: string, tag: string): boolean {
	const tagSlug = tagToFolderSlug(tag);
	const serviceSlug = tagToFolderSlug(serviceName);

	if (tagSlug === serviceSlug) return true;
	if (`${tagSlug}s` === serviceSlug) return true;
	if (`${serviceSlug}s` === tagSlug) return true;
	if (tagSlug === serviceSlug.replace(/s$/, "")) return true;

	return false;
}

function cleanupStaleFolders(
	serviceDir: string,
	activeFolderSlugs: Set<string>,
): void {
	if (!fs.existsSync(serviceDir)) return;

	for (const entry of fs.readdirSync(serviceDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		if (activeFolderSlugs.has(entry.name)) continue;

		fs.rmSync(path.join(serviceDir, entry.name), {
			recursive: true,
			force: true,
		});
	}
}

function cleanupStaleMdxFiles(
	serviceDir: string,
	writtenFiles: Set<string>,
): void {
	if (!fs.existsSync(serviceDir)) return;

	for (const entry of fs.readdirSync(serviceDir, { withFileTypes: true })) {
		const fullPath = path.join(serviceDir, entry.name);

		if (entry.isDirectory()) {
			cleanupStaleMdxFiles(fullPath, writtenFiles);

			if (
				fs.readdirSync(fullPath).length === 0 &&
				!fullPath.endsWith(".git")
			) {
				fs.rmdirSync(fullPath);
			}
			continue;
		}

		if (entry.name.endsWith(".mdx") && !writtenFiles.has(fullPath)) {
			fs.unlinkSync(fullPath);
		}
	}
}

function buildServiceStructure(
	serviceName: string,
	entries: GeneratedPage[],
): ServiceStructure {
	const sorted = [...entries].sort((a, b) => a.order - b.order);
	const tagOrder: string[] = [];
	const pagesByTag = new Map<string, GeneratedPage[]>();

	for (const entry of sorted) {
		if (!pagesByTag.has(entry.tag)) {
			tagOrder.push(entry.tag);
			pagesByTag.set(entry.tag, []);
		}
		pagesByTag.get(entry.tag)?.push(entry);
	}

	if (tagOrder.length <= 1) {
		return {
			useFolders: false,
			pages: sorted.map((entry) => entry.slug),
			folders: new Map(),
		};
	}

	const folders = new Map<string, { title: string; pages: string[] }>();
	const rootPages: string[] = [];
	const folderSlugs: string[] = [];

	for (const tag of tagOrder) {
		const folderSlug = tagToFolderSlug(tag);
		const tagPages = pagesByTag.get(tag) || [];
		const slugs = tagPages.map((entry) => entry.slug);

		if (shouldFlattenTagToRoot(serviceName, tag)) {
			rootPages.push(...slugs);
			continue;
		}

		folders.set(folderSlug, {
			title: tag,
			pages: slugs,
		});
		folderSlugs.push(folderSlug);
	}

	return { useFolders: true, pages: [...rootPages, ...folderSlugs], folders };
}

async function generateForService(
	service: ServiceConfig,
): Promise<GeneratedPage[]> {
	console.log(`\n📡 Fetching spec from ${service.specUrl}...`);

	try {
		const response = await fetch(service.specUrl);
		if (!response.ok) return [];

		const spec = await response.json();
		const paths = spec.paths || {};
		const pendingOps: Array<{
			order: number;
			tag: string;
			operationId: string;
			routePath: string;
			method: string;
			operation: any;
			params: ParameterInfo[];
			responses: Record<string, any>;
			codeSamples: CodeSample[];
		}> = [];
		let order = 0;

		const serviceDir = path.join(DOCS_DIR, service.name);
		if (!fs.existsSync(serviceDir))
			fs.mkdirSync(serviceDir, { recursive: true });

		for (const [routePath, methods] of Object.entries(paths)) {
			for (const [method, operation] of Object.entries(
				methods as Record<string, any>,
			)) {
				if (!["get", "post", "put", "patch", "delete"].includes(method))
					continue;
				if (operation.hide === true) continue;

				pendingOps.push({
					order: order++,
					tag: operation.tags?.[0] || "Other",
					operationId: sanitizeOperationId(
						method,
						routePath,
						service.prefix,
						operation,
					),
					routePath,
					method,
					operation,
					params: extractParameters(operation, spec),
					responses: extractResponses(operation, spec),
					codeSamples: extractCodeSamples(operation),
				});
			}
		}

		const useFolders = new Set(pendingOps.map((op) => op.tag)).size > 1;
		const writtenFiles = new Set<string>();
		const activeFolderSlugs = new Set<string>();
		const generated: GeneratedPage[] = [];

		for (const op of pendingOps) {
			const folderSlug = tagToFolderSlug(op.tag);
			const flattenTag =
				useFolders && shouldFlattenTagToRoot(service.name, op.tag);
			const targetDir =
				useFolders && !flattenTag
					? path.join(serviceDir, folderSlug)
					: serviceDir;
			fs.mkdirSync(targetDir, { recursive: true });

			if (useFolders && !flattenTag) {
				activeFolderSlugs.add(folderSlug);
			}

			const filename = `${op.operationId}.mdx`;
			const filePath = path.join(targetDir, filename);
			const content = generateMDX(
				service,
				op.routePath,
				op.method,
				op.operation,
				op.params,
				op.responses,
				op.codeSamples,
			);

			fs.writeFileSync(filePath, content);
			writtenFiles.add(filePath);
			generated.push({
				slug: op.operationId,
				tag: op.tag,
				folderSlug: useFolders && !flattenTag ? folderSlug : "",
				order: op.order,
			});

			const location =
				useFolders && !flattenTag ? `${folderSlug}/${filename}` : filename;
			console.log(
				`  ✅ ${op.method.toUpperCase().padEnd(6)} ${op.routePath} → ${location}  (${op.codeSamples.length} code samples, ${op.params.length} params)`,
			);
		}

		cleanupStaleMdxFiles(serviceDir, writtenFiles);
		if (useFolders) {
			cleanupStaleFolders(serviceDir, activeFolderSlugs);
		}

		return generated;
	} catch (error) {
		console.error(`  ❌ Failed to connect: ${(error as Error).message}`);
		return [];
	}
}

function generateMetaJson(allGenerated: Record<string, GeneratedPage[]>) {
	const metaPath = path.join(DOCS_DIR, "meta.json");

	const sectionNames: Record<string, string> = {
		domain: "Domain",
		mail: "Mail",
		"api-key": "API Key",
		contacts: "Contacts",
		webhook: "Webhooks",
		template: "Templates",
		upload: "Upload",
		logs: "Logs",
	};

	// Generate subdirectory meta.json for each service
	for (const [service, entries] of Object.entries(allGenerated)) {
		const sectionName = sectionNames[service] || service;
		const serviceDir = path.join(DOCS_DIR, service);
		const serviceMetaPath = path.join(serviceDir, "meta.json");
		const structure = buildServiceStructure(service, entries);

		if (structure.useFolders) {
			for (const [folderSlug, folderMeta] of structure.folders) {
				const folderDir = path.join(serviceDir, folderSlug);
				fs.mkdirSync(folderDir, { recursive: true });
				fs.writeFileSync(
					path.join(folderDir, "meta.json"),
					JSON.stringify(
						{
							title: folderMeta.title,
							pages: folderMeta.pages,
						},
						null,
						"\t",
					) + "\n",
				);
			}
		}

		const serviceMeta = {
			title: sectionName,
			pages: structure.pages,
		};
		fs.writeFileSync(
			serviceMetaPath,
			JSON.stringify(serviceMeta, null, "\t") + "\n",
		);
		console.log(
			`  📂 ${service}/meta.json (${structure.useFolders ? `${structure.folders.size} folders` : `${structure.pages.length} pages`})`,
		);
	}

	// Generate parent meta.json with folder references
	const pages: string[] = [
		"---Overview---",
		"index",
		"pagination",
		"usage-limits",
		"errors",
		"---Actions---",
		...Object.keys(allGenerated),
	];

	const meta = {
		title: "API Reference",
		description: "Reloop API Reference Documentation",
		root: true,
		icon: "brackets",
		pages,
	};

	fs.writeFileSync(metaPath, JSON.stringify(meta, null, "\t") + "\n");
	console.log("\n📝 Updated meta.json");
}

async function main() {
	console.log("🔧 OpenAPI → MDX Doc Generator");

	const allGenerated: Record<string, GeneratedPage[]> = {};

	for (const service of SERVICES) {
		const generated = await generateForService(service);
		if (generated.length > 0) allGenerated[service.name] = generated;
	}

	if (Object.keys(allGenerated).length === 0) {
		console.warn(
			"\n⚠️  No services generated — skipping meta.json update to preserve existing sidebar.",
		);
	} else {
		generateMetaJson(allGenerated);
	}

	console.log("\n📊 Done!");
}

main();
