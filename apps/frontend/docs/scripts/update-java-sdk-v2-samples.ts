#!/usr/bin/env bun
/**
 * Update all Java x-codeSamples to Reloop Java SDK v2 (Node-parity).
 *
 * Derives Java from the Node sample in each *.x-codeSamples.ts file.
 *
 * Usage (from reloop monorepo root):
 *   bun run apps/frontend/docs/scripts/update-java-sdk-v2-samples.ts
 *   # or: bun run --filter=fe-docs update:java-samples
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { upsertSample } from "./lib/python-sample-utils";

const REPO_ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../..",
);
const BACKEND_ROOT = path.join(REPO_ROOT, "packages/code-samples/src");

function findSampleFiles(dir: string): string[] {
	const files: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...findSampleFiles(fullPath));
			continue;
		}
		if (entry.name.endsWith(".ts") && !["index.ts","types.ts","helpers.ts","languages.ts"].includes(entry.name) && !entry.name.endsWith(".test.ts")) {
			const content = fs.readFileSync(fullPath, "utf8");
			if (content.includes("XCodeSamples") || content.includes("CodeSample[]")) files.push(fullPath);
		}
	}
	return files;
}

function splitTopLevel(input: string, delimiter: string): string[] {
	const parts: string[] = [];
	let current = "";
	let depth = 0;
	let quote: string | null = null;
	for (let i = 0; i < input.length; i++) {
		const char = input[i]!;
		if (quote) {
			current += char;
			if (char === quote && input[i - 1] !== "\\") quote = null;
			continue;
		}
		if (char === '"' || char === "'") {
			quote = char;
			current += char;
			continue;
		}
		if (char === "{" || char === "[" || char === "(") {
			depth++;
			current += char;
			continue;
		}
		if (char === "}" || char === "]" || char === ")") {
			depth--;
			current += char;
			continue;
		}
		if (char === delimiter && depth === 0) {
			if (current.trim()) parts.push(current.trim());
			current = "";
			continue;
		}
		current += char;
	}
	if (current.trim()) parts.push(current.trim());
	return parts;
}

function indexOfTopLevel(input: string, delimiter: string): number {
	let depth = 0;
	let quote: string | null = null;
	for (let i = 0; i < input.length; i++) {
		const char = input[i]!;
		if (quote) {
			if (char === quote && input[i - 1] !== "\\") quote = null;
			continue;
		}
		if (char === '"' || char === "'") {
			quote = char;
			continue;
		}
		if (char === "{" || char === "[" || char === "(") depth++;
		else if (char === "}" || char === "]" || char === ")") depth--;
		else if (char === delimiter && depth === 0) return i;
	}
	return -1;
}

function snakeToCamel(key: string): string {
	return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function convertScalar(value: string): string {
	const trimmed = value.trim();
	if (trimmed === "true" || trimmed === "false") return trimmed;
	if (trimmed === "null") return "null";
	if (/^".*"$/.test(trimmed) || /^'.*'$/.test(trimmed)) {
		return `"${trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/"/g, '\\"')}"`;
	}
	return trimmed;
}

function parseObjectEntries(literal: string): Array<{ key: string; value: string }> {
	const trimmed = literal.trim();
	if (!trimmed.startsWith("{")) return [];
	const inner = trimmed.slice(1, -1).trim();
	if (!inner) return [];
	return splitTopLevel(inner, ",").map((entry) => {
		const colon = indexOfTopLevel(entry, ":");
		const rawKey = entry.slice(0, colon).trim().replace(/^["']|["']$/g, "");
		const rawVal = entry.slice(colon + 1).trim();
		return { key: rawKey, value: rawVal };
	});
}

type ServiceMeta = {
	javaPath: string;
	models: string;
	paramPrefix: string;
};

function resolveService(callee: string): {
	meta: ServiceMeta;
	method: string;
} {
	const parts = callee.replace(/^reloop\./, "").split(".");
	const method = parts[parts.length - 1]!;
	const servicePath = parts.slice(0, -1).join(".");

	const table: Record<string, ServiceMeta> = {
		mail: { javaPath: "mail", models: "MailModels", paramPrefix: "Mail" },
		apiKey: { javaPath: "apiKey", models: "ApiKeyModels", paramPrefix: "ApiKey" },
		domain: { javaPath: "domain", models: "DomainModels", paramPrefix: "Domain" },
		contacts: { javaPath: "contacts", models: "ContactModels", paramPrefix: "Contact" },
		"contacts.properties": {
			javaPath: "contacts.properties",
			models: "ContactModels",
			paramPrefix: "Property",
		},
		"contacts.groups": {
			javaPath: "contacts.groups",
			models: "ContactModels",
			paramPrefix: "Group",
		},
		"contacts.channels": {
			javaPath: "contacts.channels",
			models: "ContactModels",
			paramPrefix: "Channel",
		},
		webhook: { javaPath: "webhook", models: "WebhookModels", paramPrefix: "Webhook" },
		"inbox.mailboxes": {
			javaPath: "inbox.mailboxes",
			models: "InboxModels",
			paramPrefix: "Mailbox",
		},
		"inbox.messages": {
			javaPath: "inbox.messages",
			models: "InboxModels",
			paramPrefix: "Message",
		},
		"inbox.threads": {
			javaPath: "inbox.threads",
			models: "InboxModels",
			paramPrefix: "Thread",
		},
	};

	const meta = table[servicePath];
	if (!meta) {
		throw new Error(`Unknown service path: ${servicePath}`);
	}
	return { meta, method };
}

function paramsClassName(method: string, paramPrefix: string): string | null {
	if (method === "send" && paramPrefix === "Mail") return "SendMailParams";
	if (method === "send" && paramPrefix === "Message") return "SendMessageParams";
	if (method === "create") return `Create${paramPrefix}Params`;
	if (method === "update") return `Update${paramPrefix}Params`;
	if (method === "list" || method === "listSent" || method === "listContacts" || method === "listDeliveries") {
		if (method === "listSent") return "ListSentMessagesParams";
		if (method === "listContacts") return "ListGroupContactsParams";
		if (method === "listDeliveries") return "ListWebhookDeliveriesParams";
		if (paramPrefix === "Domain") return "ListDomainsParams";
		if (paramPrefix === "ApiKey") return "ApiKeyListParams";
		if (paramPrefix === "Contact") return "ListContactsParams";
		if (paramPrefix === "Property") return "ListPropertiesParams";
		if (paramPrefix === "Group") return "ListGroupsParams";
		if (paramPrefix === "Channel") return "ListChannelsParams";
		if (paramPrefix === "Webhook") return "ListWebhooksParams";
		if (paramPrefix === "Mailbox") return null; // list() no params
		if (paramPrefix === "Message") return "ListMessagesParams";
		if (paramPrefix === "Thread") return "ListThreadsParams";
		return `List${paramPrefix}Params`;
	}
	if (method === "trigger") return "TriggerWebhookParams";
	if (method === "batch") return paramPrefix === "Thread" ? "BatchThreadsParams" : "BatchMessagesParams";
	if (method === "reply" || method === "replyAll") return "ReplyMessageParams";
	if (method === "forward") return "ForwardMessageParams";
	if (method === "setRead") return "SetReadParams";
	if (method === "setStar") return "SetStarParams";
	if (method === "addContact") return paramPrefix === "Channel" ? "AddChannelContactParams" : "AddGroupContactParams";
	if (method === "removeContact") return "RemoveGroupContactParams";
	if (method === "updateSubscription") return "UpdateChannelSubscriptionParams";
	return null;
}

function convertValueToJava(value: string, fieldHint?: string): string {
	const trimmed = value.trim();
	if (trimmed.startsWith("[")) {
		const inner = trimmed.slice(1, -1).trim();
		if (!inner) return "List.of()";
		const items = splitTopLevel(inner, ",");
		// tags: [{ name, value }]
		if (fieldHint === "tags" && items[0]?.trim().startsWith("{")) {
			const tagExprs = items.map((item) => {
				const entries = parseObjectEntries(item);
				const name = entries.find((e) => e.key === "name")?.value ?? '""';
				const val = entries.find((e) => e.key === "value")?.value ?? '""';
				return `new SendMailTag(${convertScalar(name)}, ${convertScalar(val)})`;
			});
			return `List.of(${tagExprs.join(", ")})`;
		}
		const rendered = items.map((i) => convertValueToJava(i.trim()));
		return `List.of(${rendered.join(", ")})`;
	}
	if (trimmed.startsWith("{")) {
		// Nested maps rarely needed in samples — stringify as Map.of entries when flat
		const entries = parseObjectEntries(trimmed);
		if (entries.length === 0) return "Map.of()";
		if (entries.length <= 5 && entries.every((e) => !e.value.trim().startsWith("{") && !e.value.trim().startsWith("["))) {
			const pairs = entries.flatMap((e) => [
				`"${e.key}"`,
				convertScalar(e.value),
			]);
			return `Map.of(${pairs.join(", ")})`;
		}
		return "Map.of()";
	}
	return convertScalar(trimmed);
}

function buildParamsAssignments(
	paramsClass: string,
	objectLiteral: string,
): { lines: string[]; imports: Set<string> } {
	const imports = new Set<string>();
	const lines: string[] = [`${paramsClass} params = new ${paramsClass}();`];
	for (const { key, value } of parseObjectEntries(objectLiteral)) {
		const field = snakeToCamel(key);
		const rendered = convertValueToJava(value, key);
		if (key === "tags") {
			imports.add("sh.reloop.models.MailModels.SendMailTag");
			imports.add("java.util.List");
		}
		if (rendered.startsWith("List.of")) imports.add("java.util.List");
		if (rendered.startsWith("Map.of")) imports.add("java.util.Map");
		lines.push(`params.${field} = ${rendered};`);
	}
	return { lines, imports };
}

function nodeToJava(nodeSource: string): string {
	const literalKey = nodeSource.match(/apiKey:\s*"([^"]+)"/)?.[1] ?? "rl_123456789";
	const envMatch = nodeSource.match(/apiKey:\s*process\.env\.(\w+)!?/);

	let body = nodeSource.replace(
		/^[\s\S]*?const reloop = new Reloop\(\{[\s\S]*?\}\);\s*/,
		"",
	);
	body = body.replace(/\bawait\s+/g, "");
	body = body.replace(/if\s*\((\w+)Error\)\s*throw\s+\1Error;?/g, "");

	const successNames: string[] = [];
	body = body.replace(
		/const\s*\{\s*([^}]+)\s*\}\s*=\s*/g,
		(_full, names: string) => {
			for (const part of names.split(",")) {
				const name = part.trim().split(":")[0]!.trim();
				if (name && !/Error$/.test(name)) successNames.push(name);
			}
			return "RESULT_ASSIGN = ";
		},
	);

	const callMatch =
		body.match(/RESULT_ASSIGN = (reloop(?:\.\w+)+\([\s\S]*?\));?/) ||
		body.match(/const\s+(\w+)\s*=\s*(reloop(?:\.\w+)+\([\s\S]*?\));?/) ||
		body.match(/(?:^|\n)(reloop(?:\.\w+)+\([\s\S]*?\));?/);

	if (!callMatch) {
		throw new Error(`No reloop call found:\n${body}`);
	}

	let callExpr = "";
	if (callMatch[0]!.includes("RESULT_ASSIGN")) {
		callExpr = callMatch[1]!.trim();
	} else if (callMatch[0]!.trimStart().startsWith("const")) {
		successNames.push(callMatch[1]!);
		callExpr = callMatch[2]!.trim();
	} else {
		callExpr = (callMatch[1] || callMatch[0] || "").replace(/^\n/, "").trim();
	}

	const parsed = callExpr.match(/^(reloop(?:\.\w+)+)\(([\s\S]*)\)$/);
	if (!parsed) throw new Error(`Bad call: ${callExpr}`);

	const callee = parsed[1]!;
	const argsRaw = parsed[2]!.trim();
	let meta: ServiceMeta;
	let method: string;
	try {
		({ meta, method } = resolveService(callee));
	} catch {
		throw new Error(`UNSUPPORTED:${callee}`);
	}
	const args = argsRaw ? splitTopLevel(argsRaw, ",") : [];

	const imports = new Set<string>(["sh.reloop.ReloopClient"]);
	const lines: string[] = [];

	const javaCallee = `reloop.${meta.javaPath}.${method}`;
	const paramsClass = paramsClassName(method, meta.paramPrefix);

	let callLine = "";
	if (args.length === 0) {
		callLine = `${javaCallee}();`;
	} else if (args.length === 1 && !args[0]!.trim().startsWith("{")) {
		callLine = `${javaCallee}(${convertScalar(args[0]!)});`;
	} else if (args.length === 1 && args[0]!.trim().startsWith("{")) {
		if (!paramsClass) throw new Error(`No params class for ${callee}`);
		imports.add(`sh.reloop.models.${meta.models}.${paramsClass}`);
		const built = buildParamsAssignments(paramsClass, args[0]!);
		for (const i of built.imports) imports.add(i);
		lines.push(...built.lines);
		callLine = `${javaCallee}(params);`;
	} else if (args.length >= 2) {
		const idArg = convertScalar(args[0]!);
		const rest = args.slice(1);
		if (rest.length === 1 && rest[0]!.trim().startsWith("{") && paramsClass) {
			imports.add(`sh.reloop.models.${meta.models}.${paramsClass}`);
			const built = buildParamsAssignments(paramsClass, rest[0]!);
			for (const i of built.imports) imports.add(i);
			lines.push(...built.lines);
			callLine = `${javaCallee}(${idArg}, params);`;
		} else if (rest.length === 1 && !rest[0]!.trim().startsWith("{")) {
			callLine = `${javaCallee}(${idArg}, ${convertScalar(rest[0]!)});`;
		} else {
			callLine = `${javaCallee}(${[idArg, ...rest.map((a) => (a.trim().startsWith("{") ? "params" : convertScalar(a)))].join(", ")});`;
			if (rest.some((a) => a.trim().startsWith("{")) && paramsClass) {
				imports.add(`sh.reloop.models.${meta.models}.${paramsClass}`);
				const obj = rest.find((a) => a.trim().startsWith("{"))!;
				const built = buildParamsAssignments(paramsClass, obj);
				for (const i of built.imports) imports.add(i);
				lines.push(...built.lines);
			}
		}
	}

	const primary = successNames[0];
	if (primary) {
		lines.push(`var ${primary} = ${callLine.replace(/;$/, "")};`);
	} else {
		lines.push(callLine.endsWith(";") ? callLine : `${callLine};`);
	}

	// Optional console.log → System.out.println
	const logMatch = body.match(/console\.log\(([\s\S]*?)\);?/);
	if (logMatch && primary) {
		const argsLog = logMatch[1]!;
		const printed = argsLog
			.replace(new RegExp(`\\b${primary}\\.(\\w+)\\b`, "g"), `${primary}.$1`)
			.replace(/,\s*/g, ' + " " + ');
		lines.push(`System.out.println(${printed});`);
	}

	const apiKeyExpr = envMatch
		? 'System.getenv("RELOOP_API_KEY")'
		: `"${literalKey}"`;

	return `${[...imports].map((i) => `import ${i};`).join("\n")}

ReloopClient reloop = new ReloopClient(${apiKeyExpr});

${lines.join("\n")}`;
}

function main() {
	const files = findSampleFiles(BACKEND_ROOT);
	let updated = 0;
	let skipped = 0;

	for (const file of files) {
		const content = fs.readFileSync(file, "utf8");
		const nodeMatch = content.match(
			/\{\s*id:\s*"node"[\s\S]*?source:\s*`([\s\S]*?)`\s*,?\s*\}/m,
		);
		if (!nodeMatch) {
			skipped++;
			continue;
		}
		const nodeSource = nodeMatch[1]!;
		if (!nodeSource.includes("new Reloop")) {
			skipped++;
			continue;
		}

		try {
			const java = nodeToJava(nodeSource);
			const next = upsertSample(content, "java", "java", "Java", java);
			fs.writeFileSync(file, next);
			updated++;
			console.log("updated", path.relative(REPO_ROOT, file));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			if (message.startsWith("UNSUPPORTED:")) {
				skipped++;
				console.log("skipped", path.relative(REPO_ROOT, file), message.slice(12));
				continue;
			}
			console.error("failed", path.relative(REPO_ROOT, file), error);
			process.exitCode = 1;
		}
	}

	console.log(`Done. updated=${updated} skipped=${skipped} total=${files.length}`);
}

main();
