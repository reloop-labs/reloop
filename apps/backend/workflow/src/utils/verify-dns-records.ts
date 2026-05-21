import { resolveCname, resolveMx, resolveTxt } from "node:dns";
import { promisify } from "node:util";

function isLocal(name: string): boolean {
	if (process.env.NODE_ENV === "production") {
		return false;
	}
	const clean = name.toLowerCase();
	return (
		clean.endsWith(".local") ||
		clean.includes("local.reloop.sh") ||
		clean.includes(".local.") ||
		clean === "local"
	);
}

export async function verifyMxRecord(
	name: string,
	value: string,
	priority: number,
): Promise<boolean> {
	if (isLocal(name)) return true;
	try {
		const resolveMxPromise = promisify(resolveMx);

		const records = await Promise.race([
			resolveMxPromise(name),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("DNS query timeout")), 10000),
			),
		]);

		return records.some((mx) => {
			const exchange = mx.exchange.toLowerCase().replace(/\.$/, "");
			const expected = value.toLowerCase().replace(/\.$/, "");
			return (
				(exchange === expected || exchange.endsWith(`.${expected}`)) &&
				mx.priority === priority
			);
		});
	} catch (e) {
		console.error(`Error verifying MX record for ${name}:`, e);
		return false;
	}
}

export async function verifySpfRecord(
	name: string,
	value: string,
): Promise<boolean> {
	if (isLocal(name)) return true;
	try {
		const resolveTxtPromise = promisify(resolveTxt);

		const records = await Promise.race([
			resolveTxtPromise(name),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("DNS query timeout")), 10000),
			),
		]);
		const flattenedRecords = records.flat();
		return flattenedRecords.some((record) => {
			const normalizedRecord = record.trim().replace(/\s+/g, " ");
			const normalizedValue = value.trim().replace(/\s+/g, " ");
			return (
				normalizedRecord === normalizedValue ||
				normalizedRecord.includes(normalizedValue)
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
	if (isLocal(name)) return true;
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
	if (isLocal(name)) return true;
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
						.startsWith(expectedTag.toLowerCase().split("=")[0] + "="),
			);
		});
	} catch (e) {
		console.error(`Error verifying DMARC record for ${name}:`, e);
		return false;
	}
}

export async function verifyCnameRecord(
	name: string,
	value: string,
): Promise<boolean> {
	if (isLocal(name)) return true;
	try {
		const resolveCnamePromise = promisify(resolveCname);

		const records = await Promise.race([
			resolveCnamePromise(name),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("DNS query timeout")), 10000),
			),
		]);

		return records.some((cname) => {
			const actual = cname.toLowerCase().replace(/\.$/, "");
			const expected = value.toLowerCase().replace(/\.$/, "");
			return actual === expected;
		});
	} catch (e) {
		console.error(`Error verifying CNAME record for ${name}:`, e);
		return false;
	}
}
