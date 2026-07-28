import { isLocal } from "./is-local";
import { resolver } from "./dns-resolver";

export async function verifyDkimRecord(
	name: string,
	value: string,
): Promise<boolean> {
	if (isLocal(name)) return true;
	try {
		const records = await Promise.race([
			resolver.resolveTxt(name),
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
