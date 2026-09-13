export interface ParsedContact {
	email: string;
	firstName?: string;
	lastName?: string;
	status?: "subscribed" | "unsubscribed";
	properties?: Record<string, string | number>;
}

export type ColumnTarget =
	| "email"
	| "firstName"
	| "lastName"
	| "status"
	| "skip"
	| `property:${string}`;

export interface ColumnMapping {
	csvHeader: string;
	target: ColumnTarget;
}

export interface ParsedCsvResult {
	headers: string[];
	rawRows: string[][];
	contacts: ParsedContact[];
	mappings: ColumnMapping[];
	totalRows: number;
	validCount: number;
	invalidCount: number;
	duplicateCount: number;
	errors: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Parses a raw CSV string into tokens supporting quotes and escaped quotes.
 */
export function parseCsvLine(line: string, delimiter = ","): string[] {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === delimiter && !inQuotes) {
			result.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}

	result.push(current.trim());
	return result;
}

/**
 * Splits a full CSV text into logical rows, preserving multi-line strings enclosed in quotes.
 */
export function splitCsvRows(text: string): string[] {
	const rows: string[] = [];
	let currentRow = "";
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (char === '"') {
			inQuotes = !inQuotes;
			currentRow += char;
		} else if ((char === "\n" || char === "\r") && !inQuotes) {
			if (char === "\r" && text[i + 1] === "\n") {
				i++;
			}
			if (currentRow.trim().length > 0) {
				rows.push(currentRow);
			}
			currentRow = "";
		} else {
			currentRow += char;
		}
	}

	if (currentRow.trim().length > 0) {
		rows.push(currentRow);
	}

	return rows;
}

/**
 * Detects the probable CSV delimiter (, or ; or \t) from the header line.
 */
export function detectDelimiter(headerLine: string): string {
	const commaCount = (headerLine.match(/,/g) || []).length;
	const semiCount = (headerLine.match(/;/g) || []).length;
	const tabCount = (headerLine.match(/\t/g) || []).length;

	if (semiCount > commaCount && semiCount > tabCount) return ";";
	if (tabCount > commaCount && tabCount > semiCount) return "\t";
	return ",";
}

/**
 * Generates initial automatic column mappings for a set of CSV headers.
 */
export function normalizeCsvHeader(value: string): string {
	return value.toLowerCase().replace(/[-_ ]/g, "");
}

/** Export-only columns (e.g. Resend `id`, `created_at`) — never become properties. */
const SKIP_HEADERS = new Set([
	"id",
	"contactid",
	"contact_id",
	"createdat",
	"created_at",
	"updatedat",
	"updated_at",
	"createddate",
]);

/** Explicit status columns (`subscribed` / `unsubscribed` values). */
const STATUS_HEADERS = new Set([
	"status",
	"subscriptionstatus",
	"subscription",
	"subscriberstatus",
	"subscriptionstate",
]);

/** Boolean unsubscribe columns (Resend `unsubscribed=true/false`). */
const UNSUBSCRIBED_HEADERS = new Set([
	"unsubscribed",
	"unsub",
	"isunsubscribed",
	"hasunsubscribed",
	"optedout",
	"optout",
]);

export function isUnsubscribedBooleanHeader(header: string): boolean {
	return UNSUBSCRIBED_HEADERS.has(normalizeCsvHeader(header));
}

export function isStatusHeader(header: string): boolean {
	const normalized = normalizeCsvHeader(header);
	return STATUS_HEADERS.has(normalized) || UNSUBSCRIBED_HEADERS.has(normalized);
}

export function isSkippedHeader(header: string): boolean {
	return SKIP_HEADERS.has(normalizeCsvHeader(header));
}

/**
 * Parses a raw status cell into subscribed/unsubscribed.
 * `isUnsubscribedBoolean` = true for Resend-style `unsubscribed` columns where
 * `true` means unsubscribed (inverted vs `status` columns).
 * Returns null for empty/invalid (caller defaults to subscribed).
 */
export function parseStatusValue(
	raw: string | undefined,
	isUnsubscribedBoolean: boolean,
): "subscribed" | "unsubscribed" | null {
	if (!raw) return null;
	const value = raw.trim().toLowerCase();
	if (!value) return null;

	if (isUnsubscribedBoolean) {
		if (
			value === "true" ||
			value === "1" ||
			value === "yes" ||
			value === "y" ||
			value === "unsubscribed" ||
			value === "unsub" ||
			value === "opt_out" ||
			value === "optout" ||
			value === "opted_out" ||
			value === "optedout"
		)
			return "unsubscribed";
		if (
			value === "false" ||
			value === "0" ||
			value === "no" ||
			value === "n" ||
			value === "subscribed" ||
			value === "opt_in" ||
			value === "optin" ||
			value === "opted_in" ||
			value === "optedin"
		)
			return "subscribed";
		return null;
	}

	if (
		value === "subscribed" ||
		value === "subscribe" ||
		value === "opt_in" ||
		value === "optin" ||
		value === "opted_in" ||
		value === "optedin" ||
		value === "active" ||
		value === "yes" ||
		value === "true" ||
		value === "1"
	)
		return "subscribed";
	if (
		value === "unsubscribed" ||
		value === "unsubscribe" ||
		value === "unsub" ||
		value === "opt_out" ||
		value === "optout" ||
		value === "opted_out" ||
		value === "optedout" ||
		value === "inactive" ||
		value === "no" ||
		value === "false" ||
		value === "0"
	)
		return "unsubscribed";
	return null;
}

export function detectInitialMappings(
	headers: string[],
	sampleRow?: string[],
): ColumnMapping[] {
	let emailFound = false;
	let firstNameFound = false;
	let lastNameFound = false;
	let statusFound = false;

	const mappings: ColumnMapping[] = headers.map((header) => {
		const cleanHeader = header.toLowerCase().replace(/[-_ ]/g, "");

		if (
			!emailFound &&
			(cleanHeader === "email" ||
				cleanHeader === "emailaddress" ||
				cleanHeader === "e-mail" ||
				cleanHeader === "mail")
		) {
			emailFound = true;
			return { csvHeader: header, target: "email" };
		}

		if (
			!firstNameFound &&
			(cleanHeader === "firstname" ||
				cleanHeader === "givenname" ||
				cleanHeader === "fname" ||
				cleanHeader === "first")
		) {
			firstNameFound = true;
			return { csvHeader: header, target: "firstName" };
		}

		if (
			!lastNameFound &&
			(cleanHeader === "lastname" ||
				cleanHeader === "familyname" ||
				cleanHeader === "lname" ||
				cleanHeader === "last")
		) {
			lastNameFound = true;
			return { csvHeader: header, target: "lastName" };
		}

		if (!statusFound && isStatusHeader(header)) {
			statusFound = true;
			return { csvHeader: header, target: "status" };
		}

		if (isSkippedHeader(header)) {
			return { csvHeader: header, target: "skip" };
		}

		return { csvHeader: header, target: `property:${header}` };
	});

	// If no email header matched, check if sample row cell has email format
	if (!emailFound && sampleRow) {
		const sampleIdx = sampleRow.findIndex((cell) =>
			EMAIL_REGEX.test(cell.replace(/^["']|["']$/g, "").trim()),
		);
		if (sampleIdx !== -1 && sampleIdx < mappings.length) {
			const mapping = mappings[sampleIdx];
			if (mapping) {
				mapping.target = "email";
			}
		}
	}

	return mappings;
}

/**
 * Re-builds contact objects and metrics based on active column mappings.
 */
export function buildContactsFromMapping(
	headers: string[],
	rawRows: string[][],
	mappings: ColumnMapping[],
): {
	contacts: ParsedContact[];
	validCount: number;
	invalidCount: number;
	duplicateCount: number;
	totalRows: number;
} {
	const contacts: ParsedContact[] = [];
	const seenEmails = new Set<string>();
	let invalidCount = 0;
	let duplicateCount = 0;

	const headerMap = headers.map((h, i) => {
		const mapItem = mappings.find((m) => m.csvHeader === h);
		return {
			idx: i,
			csvHeader: h,
			target: mapItem ? mapItem.target : ("skip" as ColumnTarget),
		};
	});

	const emailMapping = headerMap.find((m) => m.target === "email");
	const firstNameMapping = headerMap.find((m) => m.target === "firstName");
	const lastNameMapping = headerMap.find((m) => m.target === "lastName");
	const statusMappings = headerMap.filter((m) => m.target === "status");
	// Explicit `status` columns win over Resend-style `unsubscribed` boolean columns.
	const explicitStatusMappings = statusMappings.filter(
		(m) => !isUnsubscribedBooleanHeader(m.csvHeader),
	);
	const booleanStatusMappings = statusMappings.filter((m) =>
		isUnsubscribedBooleanHeader(m.csvHeader),
	);
	const propertyMappings = headerMap.filter(
		(m): m is typeof m & { target: `property:${string}` } =>
			m.target.startsWith("property:"),
	);

	if (!emailMapping) {
		return {
			contacts: [],
			validCount: 0,
			invalidCount: rawRows.length,
			duplicateCount: 0,
			totalRows: rawRows.length,
		};
	}

	for (const cells of rawRows) {
		const rawEmail = cells[emailMapping.idx]?.trim() ?? "";
		const email = rawEmail.toLowerCase();

		if (!email || !EMAIL_REGEX.test(email)) {
			invalidCount++;
			continue;
		}

		if (seenEmails.has(email)) {
			duplicateCount++;
			continue;
		}

		seenEmails.add(email);

		const firstName = firstNameMapping
			? cells[firstNameMapping.idx]?.trim()
			: undefined;

		const lastName = lastNameMapping
			? cells[lastNameMapping.idx]?.trim()
			: undefined;

		const properties: Record<string, string | number> = {};
		propertyMappings.forEach((m) => {
			const cellVal = cells[m.idx]?.trim() ?? "";
			if (cellVal.length > 0) {
				const propKey = m.target.replace("property:", "");
				// Never leak reserved subscription fields into custom properties.
				if (
					isStatusHeader(propKey) ||
					normalizeCsvHeader(propKey) === "email" ||
					normalizeCsvHeader(propKey) === "firstname" ||
					normalizeCsvHeader(propKey) === "lastname"
				) {
					return;
				}
				if (/^-?\d+(\.\d+)?$/.test(cellVal) && cellVal.length < 16) {
					properties[propKey] = Number(cellVal);
				} else {
					properties[propKey] = cellVal;
				}
			}
		});

		// Resolve status: explicit `status` column first, then `unsubscribed` boolean.
		let status: "subscribed" | "unsubscribed" = "subscribed";
		for (const m of explicitStatusMappings) {
			const parsed = parseStatusValue(cells[m.idx], false);
			if (parsed) {
				status = parsed;
				break;
			}
		}
		if (
			status === "subscribed" &&
			explicitStatusMappings.length === 0 &&
			booleanStatusMappings.length > 0
		) {
			for (const m of booleanStatusMappings) {
				const parsed = parseStatusValue(cells[m.idx], true);
				if (parsed) {
					status = parsed;
					break;
				}
			}
		} else if (booleanStatusMappings.length > 0) {
			// Both present: explicit already won; only fall back to boolean if explicit was empty/invalid.
			const explicitEmpty = explicitStatusMappings.every(
				(m) => !cells[m.idx]?.trim(),
			);
			if (explicitEmpty) {
				for (const m of booleanStatusMappings) {
					const parsed = parseStatusValue(cells[m.idx], true);
					if (parsed) {
						status = parsed;
						break;
					}
				}
			}
		}

		contacts.push({
			email,
			...(firstName ? { firstName } : {}),
			...(lastName ? { lastName } : {}),
			status,
			...(Object.keys(properties).length > 0 ? { properties } : {}),
		});
	}

	return {
		contacts,
		validCount: contacts.length,
		invalidCount,
		duplicateCount,
		totalRows: rawRows.length,
	};
}

/**
 * Parses raw CSV content into structured contacts, raw rows, headers, and initial mappings.
 */
export function parseCsvContent(rawCsvText: string): ParsedCsvResult {
	const rows = splitCsvRows(rawCsvText);
	if (rows.length === 0) {
		return {
			headers: [],
			rawRows: [],
			contacts: [],
			mappings: [],
			totalRows: 0,
			validCount: 0,
			invalidCount: 0,
			duplicateCount: 0,
			errors: ["CSV file is empty"],
		};
	}

	const firstRow = rows[0];
	if (firstRow === undefined) {
		throw new Error("CSV row invariant violated");
	}

	const delimiter = detectDelimiter(firstRow);
	const headers = parseCsvLine(firstRow, delimiter).map((h) =>
		h.replace(/^["']|["']$/g, "").trim(),
	);

	const rawRows: string[][] = [];
	for (let i = 1; i < rows.length; i++) {
		const row = rows[i];
		if (row === undefined) continue;
		const cells = parseCsvLine(row, delimiter).map((cell) =>
			cell.replace(/^["']|["']$/g, "").trim(),
		);
		rawRows.push(cells);
	}

	const sampleRow = rawRows.length > 0 ? rawRows[0] : undefined;
	const mappings = detectInitialMappings(headers, sampleRow);

	const built = buildContactsFromMapping(headers, rawRows, mappings);

	const hasEmailMapping = mappings.some((m) => m.target === "email");
	const errors: string[] = [];
	if (!hasEmailMapping) {
		errors.push("No 'email' header column could be found in the CSV file.");
	}

	return {
		headers,
		rawRows,
		contacts: built.contacts,
		mappings,
		totalRows: built.totalRows,
		validCount: built.validCount,
		invalidCount: built.invalidCount,
		duplicateCount: built.duplicateCount,
		errors,
	};
}
