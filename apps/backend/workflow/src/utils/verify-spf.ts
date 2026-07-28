import { isLocal } from "./is-local";
import { resolver } from "./dns-resolver";

export async function verifySpfRecord(
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
