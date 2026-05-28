import { resolveMx } from "node:dns";
import { promisify } from "node:util";
import { isLocal } from "./is-local";

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
