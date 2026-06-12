#!/usr/bin/env bun
/**
 * Updates .NET x-codeSamples from existing Python SDK samples.
 */

import fs from "node:fs";
import path from "node:path";
import {
	SERVICE_DIRS,
	buildCSharpDictionaryArgument,
	convertPythonValueToCSharp,
	extractSampleSource,
	findSampleFiles,
	parseKwargs,
	parsePythonCall,
	snakeToPascal,
	splitTopLevel,
	upsertSample,
	REPO_ROOT,
} from "./lib/python-sample-utils";
import { RELOOP_EMAIL } from "./lib/reloop-email-branding";

const TARGETS = process.argv.slice(2);

function wrapCSharpSample(lines: string[], needsModels = false): string {
	const imports: string[] = [...RELOOP_EMAIL.dotnet.imports];
	if (needsModels) {
		imports.push("using Reloop.Email.Models;");
	}
	if (lines.some((line) => line.includes("Dictionary"))) {
		imports.push("using System.Collections.Generic;");
	}

	return [...imports, "", ...lines].join("\n");
}

function convertPythonToDotnet(python: string): string {
	const { apiKey, call } = parsePythonCall(python);
	const lines = [RELOOP_EMAIL.dotnet.client(apiKey), ""];

	const apiKeysMatch = call.match(/^reloop\.api_keys\.(\w+)\(([\s\S]*)\)$/);
	if (apiKeysMatch) {
		const [, method, argsRaw] = apiKeysMatch;
		const args = argsRaw!.trim();

		if (method === "create") {
			const fields = parseKwargs(args)
				.map(({ key, value }) => {
					const field = snakeToPascal(key);
					const rendered = convertPythonValueToCSharp(value);
					return `${field} = ${rendered}`;
				})
				.join(",\n    ");

			lines.push("await reloop.ApiKeys.CreateAsync(new CreateApiKeyParams");
			lines.push("{");
			lines.push(`    ${fields},`);
			lines.push("});");
			return wrapCSharpSample(lines, true);
		}

		if (method === "list") {
			const fields = parseKwargs(args)
				.map(({ key, value }) => `${snakeToPascal(key)} = ${convertPythonValueToCSharp(value)}`)
				.join(",\n    ");

			lines.push("await reloop.ApiKeys.ListAsync(new ApiKeyListParams");
			lines.push("{");
			lines.push(`    ${fields},`);
			lines.push("});");
			return wrapCSharpSample(lines, true);
		}

		if (method === "update") {
			const parts = splitTopLevel(args, ",");
			const id = parts[0]?.trim().replace(/^"|"$/g, "") ?? "";
			const fields = parseKwargs(parts.slice(1).join(","))
				.map(({ key, value }) => `${snakeToPascal(key)} = ${convertPythonValueToCSharp(value)}`)
				.join(",\n    ");

			lines.push(`await reloop.ApiKeys.UpdateAsync("${id}", new UpdateApiKeyParams`);
			lines.push("{");
			lines.push(`    ${fields},`);
			lines.push("});");
			return wrapCSharpSample(lines, true);
		}

		const id = args.replace(/^"|"$/g, "");
		lines.push(`await reloop.ApiKeys.${method!.charAt(0).toUpperCase()}${method!.slice(1)}Async("${id}");`);
		return wrapCSharpSample(lines, true);
	}

	const methodPatterns: Array<{ pattern: RegExp; build: (match: string[]) => string[] }> = [
		{
			pattern: /^reloop\.contacts\.create\(([\s\S]*)\)$/,
			build: ([, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.CreateAsync(${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.get\("([^"]+)"\)$/,
			build: ([, id]) => [`await reloop.Contacts.GetAsync("${id}");`],
		},
		{
			pattern: /^reloop\.contacts\.delete\("([^"]+)"\)$/,
			build: ([, id]) => [`await reloop.Contacts.DeleteAsync("${id}");`],
		},
		{
			pattern: /^reloop\.contacts\.list\(([\s\S]*)\)$/,
			build: ([, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.ListAsync(${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.update\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.UpdateAsync("${id}", ${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.create_group\(([\s\S]*)\)$/,
			build: ([, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.CreateGroupAsync(${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.list_groups\(([\s\S]*)\)$/,
			build: ([, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.ListGroupsAsync(${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.get_group\("([^"]+)"\)$/,
			build: ([, id]) => [`await reloop.Contacts.GetGroupAsync("${id}");`],
		},
		{
			pattern: /^reloop\.contacts\.delete_group\("([^"]+)"\)$/,
			build: ([, id]) => [`await reloop.Contacts.DeleteGroupAsync("${id}");`],
		},
		{
			pattern: /^reloop\.contacts\.update_group\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.UpdateGroupAsync("${id}", ${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.create_property\(([\s\S]*)\)$/,
			build: ([, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.CreatePropertyAsync(${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.list_properties\(([\s\S]*)\)$/,
			build: ([, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.ListPropertiesAsync(${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.update_property\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.UpdatePropertyAsync("${id}", ${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.delete_property\("([^"]+)"\)$/,
			build: ([, id]) => [`await reloop.Contacts.DeletePropertyAsync("${id}");`],
		},
		{
			pattern: /^reloop\.contacts\.groups\.add_contact\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.Groups.AddContactAsync("${id}", ${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.groups\.remove_contact\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.Groups.RemoveContactAsync("${id}", ${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.groups\.list_contacts\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.Groups.ListContactsAsync("${id}", ${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.channels\.create\(([\s\S]*)\)$/,
			build: ([, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.Channels.CreateAsync(${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.channels\.list\(([\s\S]*)\)$/,
			build: ([, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.Channels.ListAsync(${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.channels\.get\("([^"]+)"\)$/,
			build: ([, id]) => [`await reloop.Contacts.Channels.GetAsync("${id}");`],
		},
		{
			pattern: /^reloop\.contacts\.channels\.delete\("([^"]+)"\)$/,
			build: ([, id]) => [`await reloop.Contacts.Channels.DeleteAsync("${id}");`],
		},
		{
			pattern: /^reloop\.contacts\.channels\.update\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.Channels.UpdateAsync("${id}", ${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.channels\.add_contact\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [...map.setupLines, `await reloop.Contacts.Channels.AddContactAsync("${id}", ${map.expression});`];
			},
		},
		{
			pattern: /^reloop\.contacts\.channels\.update_subscription\(\s*"([^"]+)",\s*([\s\S]*)\)$/,
			build: ([, id, kwargs]) => {
				const map = buildCSharpDictionaryArgument(kwargs);
				return [
					...map.setupLines,
					`await reloop.Contacts.Channels.UpdateSubscriptionAsync("${id}", ${map.expression});`,
				];
			},
		},
	];

	for (const { pattern, build } of methodPatterns) {
		const match = call.match(pattern);
		if (match) {
			const body = build(match);
			lines.push(...body);
			return wrapCSharpSample(lines, false);
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
			const dotnetSource = convertPythonToDotnet(python);
			const nextContent = upsertSample(content, "dotnet", "csharp", ".NET", dotnetSource);
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
