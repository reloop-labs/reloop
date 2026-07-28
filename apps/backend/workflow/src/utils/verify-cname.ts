import { isLocal } from "./is-local";
import { resolver } from "./dns-resolver";

export async function verifyCnameRecord(
	name: string,
	value: string,
): Promise<boolean> {
	if (isLocal(name)) return true;

	const expected = value.toLowerCase().replace(/\.$/, "");
	const cleanName = name.toLowerCase().replace(/\.$/, "");

	// 1. Try resolving CNAME records directly (following the chain if needed)
	try {
		let currentName = cleanName;
		const visited = new Set<string>();

		while (true) {
			const currentCleanName = currentName.toLowerCase().replace(/\.$/, "");
			if (visited.has(currentCleanName)) {
				break;
			}
			visited.add(currentCleanName);

			const records = await Promise.race([
				resolver.resolveCname(currentCleanName),
				new Promise<string[]>((_, reject) =>
					setTimeout(() => reject(new Error("DNS query timeout")), 10000),
				),
			]);

			if (!records || records.length === 0) {
				break;
			}

			let matched = false;
			let nextName: string | null = null;

			for (const cname of records) {
				const actual = cname.toLowerCase().replace(/\.$/, "");
				if (actual === expected) {
					matched = true;
					break;
				}
				nextName = cname;
			}

			if (matched) {
				return true;
			}

			if (nextName) {
				currentName = nextName;
			} else {
				break;
			}
		}
	} catch (e) {
		console.warn(
			`Direct CNAME resolution failed or not matched for ${name}:`,
			e,
		);
	}

	// 2. Fallback: Compare resolved IP addresses (handles CNAME flattening, e.g. Cloudflare)
	try {
		const resolveIps = async (hostname: string): Promise<string[]> => {
			const ips: string[] = [];
			try {
				const ipv4s = await Promise.race([
					resolver.resolve4(hostname),
					new Promise<string[]>((_, reject) =>
						setTimeout(() => reject(new Error("DNS query timeout")), 5000),
					),
				]);
				ips.push(...ipv4s);
			} catch (_e) {
				// Ignore
			}
			try {
				const ipv6s = await Promise.race([
					resolver.resolve6(hostname),
					new Promise<string[]>((_, reject) =>
						setTimeout(() => reject(new Error("DNS query timeout")), 5000),
					),
				]);
				ips.push(...ipv6s);
			} catch (_e) {
				// Ignore
			}
			return ips;
		};

		const [nameIps, valueIps] = await Promise.all([
			resolveIps(cleanName),
			resolveIps(expected),
		]);

		if (nameIps.length > 0 && valueIps.length > 0) {
			const hasCommonIp = nameIps.some((ip) => valueIps.includes(ip));
			if (hasCommonIp) {
				return true;
			}
		}
	} catch (e) {
		console.error(`Error during IP fallback verification for ${name}:`, e);
	}

	return false;
}
