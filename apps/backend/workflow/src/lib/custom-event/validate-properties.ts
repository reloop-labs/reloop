import type * as schema from "@reloop/db/schema";

type PropertyDef = typeof schema.customEventProperty.$inferSelect;

export function validateTrackProperties(params: {
	defs: PropertyDef[];
	properties: Record<string, unknown> | undefined;
}): {
	ok: true;
	normalized: Record<string, unknown>;
} | {
	ok: false;
	error: string;
} {
	const input = params.properties ?? {};
	const normalized: Record<string, unknown> = { ...input };

	for (const def of params.defs) {
		let value = normalized[def.name];
		if (value === undefined || value === null || value === "") {
			if (def.defaultValue != null && def.defaultValue !== "") {
				value = coerceDefault(def.propertyType, def.defaultValue);
				normalized[def.name] = value;
			} else if (def.required) {
				return {
					ok: false,
					error: `Missing required property "${def.name}".`,
				};
			} else {
				continue;
			}
		}

		const typeCheck = checkType(def.propertyType, value);
		if (!typeCheck.ok) {
			return {
				ok: false,
				error: `Property "${def.name}" ${typeCheck.error}`,
			};
		}
		normalized[def.name] = typeCheck.value;
	}

	return { ok: true, normalized };
}

function coerceDefault(
	type: "string" | "number" | "boolean",
	raw: string,
): unknown {
	if (type === "number") {
		const n = Number(raw);
		return Number.isFinite(n) ? n : raw;
	}
	if (type === "boolean") {
		if (raw === "true" || raw === "1") return true;
		if (raw === "false" || raw === "0") return false;
		return raw;
	}
	return raw;
}

function checkType(
	type: "string" | "number" | "boolean",
	value: unknown,
): { ok: true; value: unknown } | { ok: false; error: string } {
	if (type === "string") {
		if (typeof value !== "string") {
			return { ok: false, error: "must be a string." };
		}
		return { ok: true, value };
	}
	if (type === "number") {
		if (typeof value === "number" && Number.isFinite(value)) {
			return { ok: true, value };
		}
		if (typeof value === "string" && value.trim() !== "") {
			const n = Number(value);
			if (Number.isFinite(n)) return { ok: true, value: n };
		}
		return { ok: false, error: "must be a number." };
	}
	// boolean
	if (typeof value === "boolean") return { ok: true, value };
	if (value === "true" || value === 1 || value === "1")
		return { ok: true, value: true };
	if (value === "false" || value === 0 || value === "0")
		return { ok: true, value: false };
	return { ok: false, error: "must be a boolean." };
}
