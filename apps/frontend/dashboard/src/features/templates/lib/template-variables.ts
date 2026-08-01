/**
 * Template variables only support:
 * - `{{name}}`  (2 braces)
 * - `{{{name}}}` (3 braces)
 *
 * Single-brace `{name}` is not supported.
 */

/** Strip a supported placeholder — or repair a legacy corrupted stored key — to a bare name. */
export function normalizeTemplateVariableName(raw: string): string {
	const trimmed = raw.trim();

	const triple = trimmed.match(/^\{\{\{\s*([^{}]+?)\s*\}\}\}$/);
	const tripleName = triple?.[1];
	if (tripleName) return tripleName.trim();

	const double = trimmed.match(/^\{\{\s*([^{}]+?)\s*\}\}$/);
	const doubleName = double?.[1];
	if (doubleName) return doubleName.trim();

	// Legacy repair only — single-brace is not a supported syntax
	if (/[{}]/.test(trimmed)) {
		return trimmed.replace(/[{}]/g, "").trim();
	}

	return trimmed;
}

export function formatTemplateVariable(
	name: string,
	braces: 2 | 3 = 3,
): string {
	const key = normalizeTemplateVariableName(name);
	return braces === 2 ? `{{${key}}}` : `{{{${key}}}}`;
}

export function mapTemplateVariables(
	rawVars: unknown[] | null | undefined,
): Array<{
	name: string;
	type: "string" | "number";
	defaultValue: string | null;
}> {
	const seen = new Set<string>();
	const result: Array<{
		name: string;
		type: "string" | "number";
		defaultValue: string | null;
	}> = [];

	for (const v of rawVars ?? []) {
		if (typeof v === "string") {
			const name = normalizeTemplateVariableName(v);
			if (!name || seen.has(name)) continue;
			seen.add(name);
			result.push({ name, type: "string", defaultValue: null });
			continue;
		}

		if (v && typeof v === "object") {
			const obj = v as {
				name?: string;
				type?: string;
				defaultValue?: string | null;
			};
			const name = normalizeTemplateVariableName(obj.name ?? "");
			if (!name || seen.has(name)) continue;
			seen.add(name);
			result.push({
				name,
				type: obj.type === "number" ? "number" : "string",
				defaultValue: obj.defaultValue ?? null,
			});
		}
	}

	return result;
}
