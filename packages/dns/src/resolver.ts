import { Resolver } from "node:dns/promises";

export const DEFAULT_DNS_RESOLVERS = ["8.8.8.8", "8.8.4.4"];

export function parseResolvers(value: string | undefined): string[] {
	const servers = (value ?? "")
		.split(",")
		.map((server) => server.trim())
		.filter((server) => server.length > 0);

	return servers.length > 0 ? servers : DEFAULT_DNS_RESOLVERS;
}

export function createResolver(value = process.env.DNS_RESOLVERS): Resolver {
	const resolver = new Resolver();
	const servers = parseResolvers(value);

	try {
		resolver.setServers(servers);
	} catch (error) {
		console.error(
			`Invalid DNS_RESOLVERS (${servers.join(", ")}), falling back to ${DEFAULT_DNS_RESOLVERS.join(", ")}:`,
			error,
		);
		resolver.setServers(DEFAULT_DNS_RESOLVERS);
	}

	return resolver;
}

export const resolver = createResolver();
