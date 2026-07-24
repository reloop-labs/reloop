export interface ParsedContact {
	email: string;
	firstName?: string;
	lastName?: string;
	properties?: Record<string, string | number>;
}

export type ColumnTarget =
	| "email"
	| "firstName"
	| "lastName"
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
export function detectInitialMappings(
	headers: string[],
	sampleRow?: string[],
): ColumnMapping[] {
	let emailFound = false;
	let firstNameFound = false;
	let lastNameFound = false;

	const mappings: ColumnMapping[] = headers.map((header, idx) => {
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

		return { csvHeader: header, target: `property:${header}` };
	});

	// If no email header matched, check if sample row cell has email format
	if (!emailFound && sampleRow) {
		const sampleIdx = sampleRow.findIndex((cell) =>
			EMAIL_REGEX.test(cell.replace(/^["']|["']$/g, "").trim()),
		);
		if (sampleIdx !== -1 && sampleIdx < mappings.length) {
			mappings[sampleIdx].target = "email";
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
		return { idx: i, target: mapItem ? mapItem.target : "skip" };
	});

	const emailMapping = headerMap.find((m) => m.target === "email");
	const firstNameMapping = headerMap.find((m) => m.target === "firstName");
	const lastNameMapping = headerMap.find((m) => m.target === "lastName");
	const propertyMappings = headerMap.filter((m) =>
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
		const rawEmail = cells[emailMapping.idx]
			? cells[emailMapping.idx].trim()
			: "";
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

		const firstName =
			firstNameMapping && cells[firstNameMapping.idx]
				? cells[firstNameMapping.idx].trim()
				: undefined;

		const lastName =
			lastNameMapping && cells[lastNameMapping.idx]
				? cells[lastNameMapping.idx].trim()
				: undefined;

		const properties: Record<string, string | number> = {};
		propertyMappings.forEach((m) => {
			const cellVal = cells[m.idx] ? cells[m.idx].trim() : "";
			if (cellVal.length > 0) {
				const propKey = m.target.replace("property:", "");
				if (/^-?\d+(\.\d+)?$/.test(cellVal) && cellVal.length < 16) {
					properties[propKey] = Number(cellVal);
				} else {
					properties[propKey] = cellVal;
				}
			}
		});

		contacts.push({
			email,
			...(firstName ? { firstName } : {}),
			...(lastName ? { lastName } : {}),
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

	const delimiter = detectDelimiter(rows[0]);
	const headers = parseCsvLine(rows[0], delimiter).map((h) =>
		h.replace(/^["']|["']$/g, "").trim(),
	);

	const rawRows: string[][] = [];
	for (let i = 1; i < rows.length; i++) {
		const cells = parseCsvLine(rows[i], delimiter).map((cell) =>
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
