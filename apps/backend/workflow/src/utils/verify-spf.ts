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
