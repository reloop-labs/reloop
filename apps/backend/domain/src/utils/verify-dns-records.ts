import { resolveMx, resolveTxt } from "node:dns";
import { promisify } from "node:util";
import logger from "@reloop/logger";

export async function verifyMxRecord(
	name: string,
	value: string,
	priority: number,
): Promise<boolean> {
	try {
		const resolveMxPromise = promisify(resolveMx);

		const records = await Promise.race([
			resolveMxPromise(name),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("DNS query timeout")), 10000),
			),
		]);

		return records.some(
			(mx) =>
				(mx.exchange.toLowerCase() === value.toLowerCase() ||
					mx.exchange.toLowerCase().endsWith(`.${value.toLowerCase()}`)) &&
				mx.priority === priority,
		);
	} catch {
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
		return flattenedRecords.some((record) => {
			const normalizedRecord = record.trim();
			const normalizedValue = value.trim();
			return (
				normalizedRecord === normalizedValue ||
				normalizedRecord.includes(normalizedValue)
			);
		});
	} catch {
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
	} catch {
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
						.startsWith(expectedTag.toLowerCase().split("=")[0] + "="),
			);
		});
	} catch {
		return false;
	}
}
