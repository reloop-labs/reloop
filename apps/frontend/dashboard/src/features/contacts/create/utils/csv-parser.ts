export interface ParsedContact {
	email: string;
	firstName?: string;
	lastName?: string;
	properties?: Record<string, string | number>;
}

export interface ParsedCsvResult {
	contacts: ParsedContact[];
	totalRows: number;
	validCount: number;
	invalidCount: number;
	duplicateCount: number;
	emailHeader: string | null;
	firstNameHeader: string | null;
	lastNameHeader: string | null;
	customHeaders: string[];
	errors: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Parses a raw CSV string into tokens supporting quotes and escaped quotes.
 */
function parseCsvLine(line: string, delimiter = ","): string[] {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				// Escaped quote inside quoted field
				current += '"';
				i++;
			} else {
				// Toggle quote state
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
function splitCsvRows(text: string): string[] {
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
				i++; // Skip \n in \r\n sequence
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
function detectDelimiter(headerLine: string): string {
	const commaCount = (headerLine.match(/,/g) || []).length;
	const semiCount = (headerLine.match(/;/g) || []).length;
	const tabCount = (headerLine.match(/\t/g) || []).length;

	if (semiCount > commaCount && semiCount > tabCount) return ";";
	if (tabCount > commaCount && tabCount > semiCount) return "\t";
	return ",";
}

/**
 * Parses raw CSV content into structured contacts and summary stats.
 */
export function parseCsvContent(rawCsvText: string): ParsedCsvResult {
	const rows = splitCsvRows(rawCsvText);
	if (rows.length === 0) {
		return {
			contacts: [],
			totalRows: 0,
			validCount: 0,
			invalidCount: 0,
			duplicateCount: 0,
			emailHeader: null,
			firstNameHeader: null,
			lastNameHeader: null,
			customHeaders: [],
			errors: ["CSV file is empty"],
		};
	}

	const delimiter = detectDelimiter(rows[0]);
	const headers = parseCsvLine(rows[0], delimiter).map((h) =>
		h.replace(/^["']|["']$/g, "").trim(),
	);

	let emailColIdx = -1;
	let firstNameColIdx = -1;
	let lastNameColIdx = -1;

	// Detect column mappings by header name
	headers.forEach((header, idx) => {
		const cleanHeader = header.toLowerCase().replace(/[-_ ]/g, "");
		if (
			emailColIdx === -1 &&
			(cleanHeader === "email" ||
				cleanHeader === "emailaddress" ||
				cleanHeader === "e-mail" ||
				cleanHeader === "mail")
		) {
			emailColIdx = idx;
		} else if (
			firstNameColIdx === -1 &&
			(cleanHeader === "firstname" ||
				cleanHeader === "givenname" ||
				cleanHeader === "fname" ||
				cleanHeader === "first")
		) {
			firstNameColIdx = idx;
		} else if (
			lastNameColIdx === -1 &&
			(cleanHeader === "lastname" ||
				cleanHeader === "familyname" ||
				cleanHeader === "lname" ||
				cleanHeader === "last")
		) {
			lastNameColIdx = idx;
		}
	});

	// If no explicit header matched email, search first data row for email format
	if (emailColIdx === -1 && rows.length > 1) {
		const sampleCells = parseCsvLine(rows[1], delimiter);
		const foundIdx = sampleCells.findIndex((cell) =>
			EMAIL_REGEX.test(cell.replace(/^["']|["']$/g, "").trim()),
		);
		if (foundIdx !== -1) {
			emailColIdx = foundIdx;
		}
	}

	if (emailColIdx === -1) {
		return {
			contacts: [],
			totalRows: rows.length - 1,
			validCount: 0,
			invalidCount: rows.length - 1,
			duplicateCount: 0,
			emailHeader: null,
			firstNameHeader: firstNameColIdx !== -1 ? headers[firstNameColIdx] : null,
			lastNameHeader: lastNameColIdx !== -1 ? headers[lastNameColIdx] : null,
			customHeaders: [],
			errors: ["No 'email' header column could be found in the CSV file."],
		};
	}

	const emailHeader = headers[emailColIdx];
	const firstNameHeader =
		firstNameColIdx !== -1 ? headers[firstNameColIdx] : null;
	const lastNameHeader =
		lastNameColIdx !== -1 ? headers[lastNameColIdx] : null;

	const customHeaderIndices: { idx: number; name: string }[] = [];
	headers.forEach((header, idx) => {
		if (
			idx !== emailColIdx &&
			idx !== firstNameColIdx &&
			idx !== lastNameColIdx &&
			header.length > 0
		) {
			customHeaderIndices.push({ idx, name: header });
		}
	});

	const customHeaders = customHeaderIndices.map((item) => item.name);

	const contacts: ParsedContact[] = [];
	const seenEmails = new Set<string>();
	let invalidCount = 0;
	let duplicateCount = 0;

	for (let i = 1; i < rows.length; i++) {
		const cells = parseCsvLine(rows[i], delimiter).map((cell) =>
			cell.replace(/^["']|["']$/g, "").trim(),
		);

		const rawEmail = cells[emailColIdx] ? cells[emailColIdx].trim() : "";
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
			firstNameColIdx !== -1 && cells[firstNameColIdx]
				? cells[firstNameColIdx].trim()
				: undefined;
		const lastName =
			lastNameColIdx !== -1 && cells[lastNameColIdx]
				? cells[lastNameColIdx].trim()
				: undefined;

		const properties: Record<string, string | number> = {};
		customHeaderIndices.forEach(({ idx, name }) => {
			if (cells[idx] && cells[idx].trim().length > 0) {
				const val = cells[idx].trim();
				// Convert to number if numeric string
				if (/^-?\d+(\.\d+)?$/.test(val) && val.length < 16) {
					properties[name] = Number(val);
				} else {
					properties[name] = val;
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
		totalRows: rows.length - 1,
		validCount: contacts.length,
		invalidCount,
		duplicateCount,
		emailHeader,
		firstNameHeader,
		lastNameHeader,
		customHeaders,
		errors: [],
	};
}
