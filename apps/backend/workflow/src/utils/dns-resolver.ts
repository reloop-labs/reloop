import { Resolver } from "node:dns/promises";

/**
 * Shared DNS resolver that uses Google Public DNS (8.8.8.8 / 8.8.4.4)
 * instead of the system's default resolver. This avoids stale cached
 * results on the server and ensures verification sees the latest records
 * the user has configured.
 */
const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "8.8.4.4"]);

export { resolver };
