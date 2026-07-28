import { resolveMx, resolveTxt } from "node:dns";
import { promisify } from "node:util";

function normalizeMxLookupName(name: string): string {
	const trimmed = name.trim().replace(/\.$/, "");
	if (trimmed.startsWith("@.")) return trimmed.slice(2);
	return trimmed;
}

export async function verifyMxRecord(
	name: string,
	value: string,
	priority: number,
): Promise<boolean> {
	const lookupName = normalizeMxLookupName(name);
	if (!lookupName || lookupName === "@") {
		console.error(`Invalid MX lookup name: ${name}`);
		return false;
	}
	try {
		const resolveMxPromise = promisify(resolveMx);

		const records = await Promise.race([
			resolveMxPromise(lookupName),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("DNS query timeout")), 10000),
			),
		]);

		const expected = value.toLowerCase().replace(/\.$/, "");
		const expectedPriority = Number(priority);

		return records.some((mx) => {
			const exchange = mx.exchange.toLowerCase().replace(/\.$/, "");
			return (
				exchange === expected && Number(mx.priority) === expectedPriority
			);
		});
	} catch (e) {
		console.error(`Error verifying MX record for ${lookupName}:`, e);
		return false;
	}
}

export async function verifySpfRecord(
	name: string,
	value: string,
): Promise<boolean> {
	try {
		const resolveTxtPromise = promisify(resolveTxt);

		const records = await Promise.race([
			resolveTxtPromise(name),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("DNS query timeout")), 10000),
			),
		]);
		const flattenedRecords = records.flat();

		// Extract the required include directives from the expected value
		// e.g. "v=spf1 include:reloop.sh -all" → ["include:reloop.sh"]
		const requiredIncludes = value
			.trim()
			.split(/\s+/)
			.filter((part) => part.startsWith("include:"));

		return flattenedRecords.some((record) => {
			const normalizedRecord = record.trim().replace(/\s+/g, " ");

			// Must be an SPF record
			if (!normalizedRecord.startsWith("v=spf1")) return false;

			// Check that every required include is present in the actual record
			return requiredIncludes.every((inc) =>
				normalizedRecord.includes(inc),
			);
		});
	} catch (e) {
		console.error(`Error verifying SPF record for ${name}:`, e);
		return false;
	}
}

export async function verifyDkimRecord(
	name: string,
	value: string,
): Promise<boolean> {
	try {
		const resolveTxtPromise = promisify(resolveTxt);
		const records = await Promise.race([
			resolveTxtPromise(name),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("DNS query timeout")), 10000),
			),
		]);
		const flattenedRecords = records.flat();
		const combinedRecord = flattenedRecords.join("");

		const expectedPublicKeyMatch = value.match(/p=([^;]+)/);
		if (!expectedPublicKeyMatch || !expectedPublicKeyMatch[1]) {
			return combinedRecord.includes(value.trim());
		}

		const expectedPublicKey = expectedPublicKeyMatch[1].trim();
		const actualPublicKeyMatch = combinedRecord.match(/p=([^;]+)/);

		if (!actualPublicKeyMatch || !actualPublicKeyMatch[1]) {
			return false;
		}

		const actualPublicKey = actualPublicKeyMatch[1].trim();

		return actualPublicKey === expectedPublicKey;
	} catch (e) {
		console.error(`Error verifying DKIM record for ${name}:`, e);
		return false;
	}
}

export async function verifyDmarcRecord(
	name: string,
	value: string,
): Promise<boolean> {
	try {
		const resolveTxtPromise = promisify(resolveTxt);

		const records = await Promise.race([
			resolveTxtPromise(name),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("DNS query timeout")), 10000),
			),
		]);

		const flattenedRecords = records.flat();
		const combinedRecord = flattenedRecords.join("");

		const normalizedRecord = combinedRecord.replace(/\s+/g, " ").trim();
		const normalizedValue = value.replace(/\s+/g, " ").trim();

		const expectedTags = normalizedValue.split(";").map((tag) => tag.trim());
		const actualTags = normalizedRecord.split(";").map((tag) => tag.trim());

		return expectedTags.every((expectedTag) => {
			if (!expectedTag) return true;
			return actualTags.some(
				(actualTag) =>
					actualTag.toLowerCase() === expectedTag.toLowerCase() ||
					actualTag
						.toLowerCase()
						.startsWith(`${expectedTag.toLowerCase().split("=")[0]}=`),
			);
		});
	} catch (e) {
		console.error(`Error verifying DMARC record for ${name}:`, e);
		return false;
	}
}
