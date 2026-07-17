import { resolveMx } from "node:dns";
import { promisify } from "node:util";
import { isLocal } from "./is-local";

/** Normalize stored FQDN / name for DNS lookup (apex may be stored as `@`). */
export function normalizeMxLookupName(name: string): string {
	const trimmed = name.trim().replace(/\.$/, "");
	if (trimmed === "@" || trimmed === "") {
		return trimmed;
	}
	// Legacy bug: apex FQDN was stored as "@.example.com"
	if (trimmed.startsWith("@.")) {
		return trimmed.slice(2);
	}
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
	if (isLocal(lookupName)) return true;
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

		// Exact exchange match only — `inbound.reloop.sh` must not satisfy expected
		// `reloop.sh` (and vice versa).
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
