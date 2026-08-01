import type { ColumnMapping, ColumnTarget } from "./csv-parser";

/** Right-side mapping target: identity fields or a custom Reloop property. */
export type MappingRowTarget =
	| "email"
	| "firstName"
	| "lastName"
	| `property:${string}`;

export type PropertyMappingRow = {
	id: string;
	csvHeader: string | null;
	target: MappingRowTarget | null;
};

export type OrgPropertyRef = {
	propertyName: string;
	propertyType?: string;
};

export const IDENTITY_TARGETS = [
	{
		value: "email" as const,
		label: "Email Address (Required)",
	},
	{
		value: "firstName" as const,
		label: "First Name",
	},
	{
		value: "lastName" as const,
		label: "Last Name",
	},
];

/** Normalize a label into a backend-safe property name. */
export function slugifyPropertyName(value: string): string {
	return value
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");
}

/**
 * Returns a validation error message, or empty string if valid / empty.
 * Empty is allowed while the user is still typing.
 * Call {@link slugifyPropertyName} before create so the name is backend-safe.
 */
export function validatePropertyName(name: string): string {
	if (!name) return "";
	if (!/^[a-zA-Z0-9_]*$/.test(name))
		return "Only letters, numbers, and underscores";
	if (!/^[a-zA-Z_]/.test(name)) return "Must start with a letter or underscore";
	return "";
}

export function isRowComplete(
	row: PropertyMappingRow,
): row is PropertyMappingRow & {
	csvHeader: string;
	target: MappingRowTarget;
} {
	return row.csvHeader !== null && row.target !== null;
}

export function createEmptyPropertyRow(): PropertyMappingRow {
	return {
		id: crypto.randomUUID(),
		csvHeader: null,
		target: null,
	};
}

export function isIdentityTarget(
	target: MappingRowTarget | null | undefined,
): target is "email" | "firstName" | "lastName" {
	return target === "email" || target === "firstName" || target === "lastName";
}

export function isPropertyTarget(
	target: MappingRowTarget | null | undefined,
): target is `property:${string}` {
	return typeof target === "string" && target.startsWith("property:");
}

export function propertyTargetName(target: `property:${string}`): string {
	return target.slice("property:".length);
}

export function toPropertyTarget(propertyName: string): `property:${string}` {
	return `property:${propertyName}`;
}

/** Headers not already used in another mapping row. */
export function getAvailableCsvHeaders(
	csvHeaders: string[],
	rows: PropertyMappingRow[],
	currentRowId?: string,
): string[] {
	const usedByOtherRows = new Set(
		rows
			.filter((r) => r.id !== currentRowId && r.csvHeader)
			.map((r) => r.csvHeader as string),
	);

	return csvHeaders.filter((h) => !usedByOtherRows.has(h));
}

/** Identity targets not already used on another row. */
export function getAvailableIdentityTargets(
	rows: PropertyMappingRow[],
	currentRowId?: string,
): Array<"email" | "firstName" | "lastName"> {
	const used = new Set(
		rows
			.filter((r) => r.id !== currentRowId && isIdentityTarget(r.target))
			.map((r) => r.target as string),
	);

	return (["email", "firstName", "lastName"] as const).filter(
		(t) => !used.has(t),
	);
}

/** Org properties not already assigned to another mapping row. */
export function getAvailableProperties(
	properties: OrgPropertyRef[],
	rows: PropertyMappingRow[],
	currentRowId?: string,
): OrgPropertyRef[] {
	const usedByOtherRows = new Set(
		rows
			.filter((r) => r.id !== currentRowId && isPropertyTarget(r.target))
			.map((r) => propertyTargetName(r.target as `property:${string}`)),
	);

	return properties.filter((p) => !usedByOtherRows.has(p.propertyName));
}

function normalizeForMatch(value: string): string {
	return value.toLowerCase().replace(/[-_ ]/g, "");
}

/**
 * Fuzzy-match a CSV header to an org property name.
 * Returns the property name on a confident match, otherwise null.
 */
export function fuzzyMatchHeaderToProperty(
	csvHeader: string,
	properties: OrgPropertyRef[],
): string | null {
	const normalizedHeader = normalizeForMatch(csvHeader);
	const slugHeader = slugifyPropertyName(csvHeader);

	const exact = properties.find(
		(p) => p.propertyName.toLowerCase() === slugHeader,
	);
	if (exact) return exact.propertyName;

	const fuzzy = properties.find(
		(p) => normalizeForMatch(p.propertyName) === normalizedHeader,
	);
	if (fuzzy) return fuzzy.propertyName;

	return null;
}

/**
 * Seed mapping rows from auto-detected CSV column mappings.
 * Keeps identity targets (email / first / last); drops raw property:header
 * invents so the user maps custom properties explicitly (or via suggest).
 */
export function seedRowsFromDetectedMappings(
	mappings: ColumnMapping[],
): PropertyMappingRow[] {
	const rows: PropertyMappingRow[] = [];

	for (const m of mappings) {
		if (
			m.target === "email" ||
			m.target === "firstName" ||
			m.target === "lastName"
		) {
			rows.push({
				id: crypto.randomUUID(),
				csvHeader: m.csvHeader,
				target: m.target,
			});
		}
	}

	return rows;
}

/**
 * Suggest additional rows for CSV headers that match existing org properties.
 * Skips headers already used and identity targets already claimed.
 */
export function suggestPropertyRows(
	csvHeaders: string[],
	existingRows: PropertyMappingRow[],
	properties: OrgPropertyRef[],
): PropertyMappingRow[] {
	const usedHeaders = new Set(
		existingRows.filter((r) => r.csvHeader).map((r) => r.csvHeader as string),
	);
	const usedTargets = new Set(
		existingRows.filter((r) => r.target).map((r) => r.target as string),
	);

	const rows: PropertyMappingRow[] = [];

	for (const header of csvHeaders) {
		if (usedHeaders.has(header)) continue;

		const match = fuzzyMatchHeaderToProperty(header, properties);
		if (!match) continue;

		const target = toPropertyTarget(match);
		if (usedTargets.has(target)) continue;

		usedHeaders.add(header);
		usedTargets.add(target);
		rows.push({
			id: crypto.randomUUID(),
			csvHeader: header,
			target,
		});
	}

	return rows;
}

/** Convert complete mapping rows into ColumnMapping[] for the CSV builder. */
export function rowsToColumnMappings(
	rows: PropertyMappingRow[],
): ColumnMapping[] {
	return rows.filter(isRowComplete).map((r) => ({
		csvHeader: r.csvHeader,
		target: r.target as ColumnTarget,
	}));
}

export function hasEmailMapping(rows: PropertyMappingRow[]): boolean {
	return rows.some((r) => isRowComplete(r) && r.target === "email");
}

/** Count complete rows that map to custom properties (not identity). */
export function countCustomPropertyMappings(
	rows: PropertyMappingRow[],
): number {
	return rows.filter((r) => isRowComplete(r) && isPropertyTarget(r.target))
		.length;
}
