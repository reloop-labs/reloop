import { toolsConfig } from "@be/tools/tools.config";
import { createError } from "evlog";

export type ParsedBatchEmails = {
	emails: string[];
	totalUploaded: number;
	totalUnique: number;
	duplicatesRemoved: number;
};

const EMAIL_HEADER_REGEX =
	/^(?:e[-_]?mail(?:[-_]?address)?|mail|contact|recipient)$/i;

function cleanCell(raw: string): string {
	return raw
		.trim()
		.replace(/^["']|["']$/g, "")
		.trim();
}

export function parseCsvOrTextContent(content: string): ParsedBatchEmails {
	const sanitized = content.replace(/^\uFEFF/, "").trim();
	if (!sanitized) {
		throw createError({
			status: 400,
			message: "Empty file",
			why: "The uploaded file contains no content or email addresses.",
			fix: "Upload a valid CSV or TXT file containing at least one email address.",
		});
	}

	const rawLines = sanitized
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l.length > 0);

	if (rawLines.length === 0) {
		throw createError({
			status: 400,
			message: "Empty file",
			why: "The uploaded file contains no valid rows.",
			fix: "Upload a file with email addresses.",
		});
	}

	// Detect delimiter and email column from first line
	const firstLine = rawLines[0]!;
	const delimiter = firstLine.includes(",")
		? ","
		: firstLine.includes(";")
			? ";"
			: firstLine.includes("\t")
				? "\t"
				: null;

	let targetColIndex = 0;
	let startRowIndex = 0;

	if (delimiter) {
		const headerCells = firstLine.split(delimiter).map(cleanCell);
		const foundIndex = headerCells.findIndex((cell) =>
			EMAIL_HEADER_REGEX.test(cell),
		);
		if (foundIndex !== -1) {
			targetColIndex = foundIndex;
			startRowIndex = 1; // Skip header row
		}
	} else if (EMAIL_HEADER_REGEX.test(cleanCell(firstLine))) {
		startRowIndex = 1; // Skip single-column header
	}

	const rawExtracted: string[] = [];

	for (let i = startRowIndex; i < rawLines.length; i++) {
		const line = rawLines[i]!;
		if (!line) continue;

		let cellValue = line;
		if (delimiter) {
			const cells = line.split(delimiter);
			cellValue = cells[targetColIndex] ?? cells[0] ?? "";
		}

		const cleaned = cleanCell(cellValue);
		if (cleaned.length > 0) {
			rawExtracted.push(cleaned);
		}
	}

	if (rawExtracted.length === 0) {
		throw createError({
			status: 400,
			message: "No email addresses found",
			why: "Could not extract any email addresses from the uploaded file.",
			fix: "Ensure the file contains email addresses in the first column or under an 'email' header.",
		});
	}

	// Deduplicate while preserving first appearance
	const seen = new Set<string>();
	const uniqueEmails: string[] = [];

	for (const raw of rawExtracted) {
		const normalized = raw.toLowerCase();
		if (!seen.has(normalized)) {
			seen.add(normalized);
			uniqueEmails.push(raw);
		}
	}

	const totalUploaded = rawExtracted.length;
	const totalUnique = uniqueEmails.length;
	const duplicatesRemoved = totalUploaded - totalUnique;

	if (totalUnique > toolsConfig.constants.maxBatchAddresses) {
		throw createError({
			status: 400,
			message: "Too many email addresses",
			why: `Batch limit is ${toolsConfig.constants.maxBatchAddresses} unique email addresses. File has ${totalUnique} unique addresses (${totalUploaded} total rows).`,
			fix: `Trim the file to ${toolsConfig.constants.maxBatchAddresses} addresses or fewer.`,
		});
	}

	return {
		emails: uniqueEmails,
		totalUploaded,
		totalUnique,
		duplicatesRemoved,
	};
}

export function parseJsonEmailArray(rawArray: unknown[]): ParsedBatchEmails {
	if (!Array.isArray(rawArray) || rawArray.length === 0) {
		throw createError({
			status: 400,
			message: "Invalid email list",
			why: "The request body must include a non-empty array of email strings.",
			fix: "Provide an array of email addresses in the 'emails' field.",
		});
	}

	const rawExtracted: string[] = [];

	for (const item of rawArray) {
		if (typeof item === "string" && item.trim().length > 0) {
			rawExtracted.push(item.trim());
		}
	}

	if (rawExtracted.length === 0) {
		throw createError({
			status: 400,
			message: "No valid email addresses provided",
			why: "All elements in the 'emails' array were empty or non-string.",
			fix: "Provide at least one non-empty email address string.",
		});
	}

	const seen = new Set<string>();
	const uniqueEmails: string[] = [];

	for (const raw of rawExtracted) {
		const normalized = raw.toLowerCase();
		if (!seen.has(normalized)) {
			seen.add(normalized);
			uniqueEmails.push(raw);
		}
	}

	const totalUploaded = rawExtracted.length;
	const totalUnique = uniqueEmails.length;
	const duplicatesRemoved = totalUploaded - totalUnique;

	if (totalUnique > toolsConfig.constants.maxBatchAddresses) {
		throw createError({
			status: 400,
			message: "Too many email addresses",
			why: `Batch limit is ${toolsConfig.constants.maxBatchAddresses} unique email addresses. Received ${totalUnique} unique addresses (${totalUploaded} total).`,
			fix: `Reduce the array to ${toolsConfig.constants.maxBatchAddresses} addresses or fewer.`,
		});
	}

	return {
		emails: uniqueEmails,
		totalUploaded,
		totalUnique,
		duplicatesRemoved,
	};
}
