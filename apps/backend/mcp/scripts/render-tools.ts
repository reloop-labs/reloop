import * as z from "zod";
import type { AnyToolDefinition } from "../src/tools/define";
import { tools } from "../src/tools/index";

function readProperty(source: unknown, key: string): unknown {
	if (typeof source !== "object" || source === null) {
		return undefined;
	}
	return Reflect.get(source, key);
}

function readString(source: unknown, key: string): string | undefined {
	const value = readProperty(source, key);
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

function entriesOf(source: unknown): [string, unknown][] {
	if (typeof source !== "object" || source === null) {
		return [];
	}
	return Object.entries(source);
}

function typeName(node: unknown): string {
	const enumValues = readProperty(node, "enum");
	if (Array.isArray(enumValues)) {
		return enumValues.map((value) => String(value)).join(" \\| ");
	}
	const anyOf = readProperty(node, "anyOf");
	if (Array.isArray(anyOf)) {
		return anyOf.map(typeName).join(" or ");
	}
	const type = readString(node, "type");
	if (type === "array") {
		return `array of ${typeName(readProperty(node, "items"))}`;
	}
	return type ?? "object";
}

function inputTable(tool: AnyToolDefinition): string[] {
	const schema = z.toJSONSchema(tool.input, { io: "input" });
	const required = readProperty(schema, "required");
	const requiredNames = Array.isArray(required) ? required.map(String) : [];
	const rows = entriesOf(readProperty(schema, "properties")).map(
		([name, node]) =>
			`| \`${name}\` | ${typeName(node)} | ${
				requiredNames.includes(name) ? "yes" : "no"
			} | ${readString(node, "description") ?? ""} |`,
	);
	if (rows.length === 0) {
		return [];
	}
	return [
		"| Input | Type | Required | Description |",
		"|---|---|---|---|",
		...rows,
	];
}

function annotationLine(tool: AnyToolDefinition): string {
	const yesNo = (value: boolean): string => (value ? "yes" : "no");
	return [
		`Read-only: ${yesNo(tool.annotations.readOnlyHint)}`,
		`Destructive: ${yesNo(tool.annotations.destructiveHint)}`,
		`Idempotent: ${yesNo(tool.annotations.idempotentHint)}`,
		`Open world: ${yesNo(tool.annotations.openWorldHint)}`,
	].join(" · ");
}

function returnsLine(tool: AnyToolDefinition): string {
	const keys = entriesOf(
		readProperty(z.toJSONSchema(tool.output), "properties"),
	).map(([name]) => `\`${name}\``);
	return `Returns: ${keys.join(", ")}`;
}

function renderTool(tool: AnyToolDefinition): string {
	const table = inputTable(tool);
	return [
		`### \`${tool.name}\``,
		"",
		tool.description,
		"",
		annotationLine(tool),
		...(table.length > 0 ? ["", ...table] : []),
		"",
		returnsLine(tool),
	].join("\n");
}

export function renderToolsMarkdown(): string {
	return tools.map(renderTool).join("\n\n");
}

if (import.meta.main) {
	process.stdout.write(`${renderToolsMarkdown()}\n`);
}
