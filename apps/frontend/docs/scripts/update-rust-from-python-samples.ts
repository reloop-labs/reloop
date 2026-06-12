#!/usr/bin/env bun
/**
 * Updates Rust x-codeSamples from existing Python SDK samples.
 */

import fs from "node:fs";
import path from "node:path";
import {
	extractSampleSource,
	findSampleFiles,
	parseKwargs,
	parsePythonCall,
	pythonKwargsToJsonMacro,
	REPO_ROOT,
	SERVICE_DIRS,
	snakeToPascal,
	splitTopLevel,
	upsertSample,
} from "./lib/python-sample-utils";
import { RELOOP_EMAIL } from "./lib/reloop-email-branding";

const TARGETS = process.argv.slice(2);

function wrapRustSample(lines: string[], needsModels = false): string {
	const imports: string[] = [...RELOOP_EMAIL.rust.imports];
	if (needsModels) {
		imports.push(
			"use reloop_email::{CreateApiKeyParams, UpdateApiKeyParams, ApiKeyListParams};",
		);
	}

	return [
		...imports,
		"",
		"#[tokio::main]",
		"async fn main() -> Result<(), Box<dyn std::error::Error>> {",
		...lines.map((line) => `    ${line}`),
		"",
		"    Ok(())",
		"}",
	].join("\n");
}

function convertPythonToRust(python: string): string {
	const { apiKey, call } = parsePythonCall(python);
	const lines = [RELOOP_EMAIL.rust.client(apiKey), ""];

	const apiKeysMatch = call.match(/^reloop\.api_keys\.(\w+)\(([\s\S]*)\)$/);
	if (apiKeysMatch) {
		const [, method, argsRaw] = apiKeysMatch;
		const args = argsRaw!.trim();

		if (method === "create") {
			const fields = parseKwargs(args)
				.map(({ key, value }) => {
					if (value.startsWith('"')) {
						return `${key}: ${value}.to_string(),`;
					}
					if (value === "True" || value === "False") {
						return `${key}: Some(${value === "True" ? "true" : "false"}),`;
					}
					return `${key}: Some(${value}),`;
				})
				.join("\n        ");

			lines.push("reloop.api_keys().create(CreateApiKeyParams {");
			lines.push(`        ${fields}`);
			lines.push("    }).await?;");
			return wrapRustSample(lines, true);
		}

		if (method === "list") {
			const fields = parseKwargs(args)
				.map(({ key, value }) => `${key}: Some(${value}),`)
				.join("\n        ");

			lines.push("reloop.api_keys().list(Some(ApiKeyListParams {");
			lines.push(`        ${fields}`);
			lines.push("        ..Default::default()");
			lines.push("    })).await?;");
			return wrapRustSample(lines, true);
		}

		if (method === "update") {
			const parts = splitTopLevel(args, ",");
			const id = parts[0]?.trim().replace(/^"|"$/g, "") ?? "";
			const fields = parseKwargs(parts.slice(1).join(","))
				.map(({ key, value }) => {
					if (value.startsWith('"')) {
						return `${key}: Some(${value}.to_string()),`;
					}
					if (value === "True" || value === "False") {
						return `${key}: Some(${value === "True" ? "true" : "false"}),`;
					}
					return `${key}: Some(${value}),`;
				})
				.join("\n        ");

			lines.push(`reloop.api_keys().update("${id}", UpdateApiKeyParams {`);
			lines.push(`        ${fields}`);
			lines.push("    }).await?;");
			return wrapRustSample(lines, true);
		}

		const id = args.replace(/^"|"$/g, "");
		lines.push(`reloop.api_keys().${method}("${id}").await?;`);
		return wrapRustSample(lines);
	}

	const methodPatterns: Array<{
		pattern: RegExp;
		build: (match: string[]) => string[];
	}> = [
		{
			pattern: /^reloop\.contacts\.create\(([\s\S]*)\)$/,
			build: ([, kwargs]) => [
				`reloop.contacts().create(${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.get\("([^"]+)"\)$/,
			build: ([, id]) => [`reloop.contacts().get("${id}").await?;`],
		},
		{
			pattern: /^reloop\.contacts\.delete\("([^"]+)"\)$/,
			build: ([, id]) => [`reloop.contacts().delete("${id}").await?;`],
		},
		{
			pattern: /^reloop\.contacts\.list\(([\s\S]*)\)$/,
			build: ([, kwargs]) => [
				`reloop.contacts().list(${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.update\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => [
				`reloop.contacts().update("${id}", ${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.create_group\(([\s\S]*)\)$/,
			build: ([, kwargs]) => [
				`reloop.contacts().create_group(${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.list_groups\(([\s\S]*)\)$/,
			build: ([, kwargs]) => [
				`reloop.contacts().list_groups(${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.get_group\("([^"]+)"\)$/,
			build: ([, id]) => [`reloop.contacts().get_group("${id}").await?;`],
		},
		{
			pattern: /^reloop\.contacts\.delete_group\("([^"]+)"\)$/,
			build: ([, id]) => [`reloop.contacts().delete_group("${id}").await?;`],
		},
		{
			pattern: /^reloop\.contacts\.update_group\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => [
				`reloop.contacts().update_group("${id}", ${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.create_property\(([\s\S]*)\)$/,
			build: ([, kwargs]) => [
				`reloop.contacts().create_property(${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.list_properties\(([\s\S]*)\)$/,
			build: ([, kwargs]) => [
				`reloop.contacts().list_properties(${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern:
				/^reloop\.contacts\.update_property\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => [
				`reloop.contacts().update_property("${id}", ${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.delete_property\("([^"]+)"\)$/,
			build: ([, id]) => [`reloop.contacts().delete_property("${id}").await?;`],
		},
		{
			pattern:
				/^reloop\.contacts\.groups\.add_contact\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => [
				`reloop.contacts().groups().add_contact("${id}", ${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern:
				/^reloop\.contacts\.groups\.remove_contact\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => [
				`reloop.contacts().groups().remove_contact("${id}", ${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern:
				/^reloop\.contacts\.groups\.list_contacts\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => [
				`reloop.contacts().groups().list_contacts("${id}", ${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.channels\.create\(([\s\S]*)\)$/,
			build: ([, kwargs]) => [
				`reloop.contacts().channels().create(${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.channels\.list\(([\s\S]*)\)$/,
			build: ([, kwargs]) => [
				`reloop.contacts().channels().list(${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern: /^reloop\.contacts\.channels\.get\("([^"]+)"\)$/,
			build: ([, id]) => [`reloop.contacts().channels().get("${id}").await?;`],
		},
		{
			pattern: /^reloop\.contacts\.channels\.delete\("([^"]+)"\)$/,
			build: ([, id]) => [
				`reloop.contacts().channels().delete("${id}").await?;`,
			],
		},
		{
			pattern:
				/^reloop\.contacts\.channels\.update\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => [
				`reloop.contacts().channels().update("${id}", ${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern:
				/^reloop\.contacts\.channels\.add_contact\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => [
				`reloop.contacts().channels().add_contact("${id}", ${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
		{
			pattern:
				/^reloop\.contacts\.channels\.update_subscription\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => [
				`reloop.contacts().channels().update_subscription("${id}", ${pythonKwargsToJsonMacro(kwargs)}).await?;`,
			],
		},
	];

	for (const { pattern, build } of methodPatterns) {
		const match = call.match(pattern);
		if (match) {
			lines.push(...build(match));
			return wrapRustSample(lines);
		}
	}

	throw new Error(`Unsupported Python sample:\n${call}`);
}

let updated = 0;

for (const service of SERVICE_DIRS) {
	if (TARGETS.length > 0 && !TARGETS.includes(service.name)) {
		continue;
	}

	for (const filePath of findSampleFiles(service.dir)) {
		const content = fs.readFileSync(filePath, "utf8");
		const python = extractSampleSource(content, "python");
		if (!python) {
			continue;
		}

		try {
			const rustSource = convertPythonToRust(python);
			const nextContent = upsertSample(
				content,
				"rust",
				"rust",
				"Rust",
				rustSource,
			);
			if (nextContent !== content) {
				fs.writeFileSync(filePath, nextContent);
				updated++;
				console.log(`Updated ${path.relative(REPO_ROOT, filePath)}`);
			}
		} catch (error) {
			console.error(`Failed ${path.relative(REPO_ROOT, filePath)}:`, error);
		}
	}
}

console.log(`\nDone. Updated ${updated} file(s).`);
