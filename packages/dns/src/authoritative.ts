import { Resolver } from "node:dns/promises";
import { resolver as publicResolver } from "./resolver";

/**
 * Lookups against the zone's own nameservers instead of a public recursive
 * resolver. Public resolvers cache "record not found" for the zone's SOA
 * negative TTL (Cloudflare: 30 min), so a check that runs before the user
 * adds a record keeps missing long after it exists. Authoritative servers
 * answer with the live zone, so verification passes seconds after a save.
 */

const ZONE_CACHE_TTL_MS = 5 * 60_000;
const MAX_SERVERS = 4;
const QUERY_TIMEOUT_MS = 2_000;

const serversByZone = new Map<
	string,
	{ servers: string[]; expiresAt: number }
>();

/** Parent names to try as the zone, nearest first, excluding the bare TLD. */
export function candidateZones(name: string): string[] {
	const labels = name
		.trim()
		.toLowerCase()
		.replace(/\.$/, "")
		.split(".")
		.filter(Boolean);
	const zones: string[] = [];
	for (let i = 0; i < labels.length - 1; i++) {
		zones.push(labels.slice(i).join("."));
	}
	return zones;
}

async function zoneServers(name: string): Promise<string[]> {
	for (const zone of candidateZones(name)) {
		const cached = serversByZone.get(zone);
		if (cached && cached.expiresAt > Date.now()) return cached.servers;

		const hosts = await publicResolver
			.resolveNs(zone)
			.catch((): string[] => []);
		if (hosts.length === 0) continue;

		const addresses = await Promise.all(
			hosts.map((host) =>
				publicResolver.resolve4(host).catch((): string[] => []),
			),
		);
		const servers = [...new Set(addresses.flat())].slice(0, MAX_SERVERS);
		if (servers.length === 0) continue;

		serversByZone.set(zone, {
			servers,
			expiresAt: Date.now() + ZONE_CACHE_TTL_MS,
		});
		return servers;
	}
	throw Object.assign(new Error(`No authoritative nameservers for ${name}`), {
		code: "ENOAUTH",
	});
}

async function authoritativeResolver(name: string): Promise<Resolver> {
	const servers = await zoneServers(name);
	const resolver = new Resolver({ timeout: QUERY_TIMEOUT_MS, tries: 1 });
	resolver.setServers(servers);
	return resolver;
}

export async function resolveTxtAuthoritative(
	name: string,
): Promise<string[][]> {
	return (await authoritativeResolver(name)).resolveTxt(name);
}

export async function resolveMxAuthoritative(
	name: string,
): Promise<{ exchange: string; priority: number }[]> {
	return (await authoritativeResolver(name)).resolveMx(name);
}

export async function resolveCnameAuthoritative(
	name: string,
): Promise<string[]> {
	return (await authoritativeResolver(name)).resolveCname(name);
}
