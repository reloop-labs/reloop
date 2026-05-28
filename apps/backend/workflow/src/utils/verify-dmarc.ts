import { resolveTxt } from "node:dns";
import { promisify } from "node:util";
import { isLocal } from "./is-local";

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
						.startsWith(`${expectedTag.toLowerCase().split("=")[0]}=`),
			);
		});
	} catch (e) {
		console.error(`Error verifying DMARC record for ${name}:`, e);
		return false;
	}
}
