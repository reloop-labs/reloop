import { dashboardURL } from "./runtime";

/**
 * Ensure the local stack is reachable before auth E2E runs.
 * Does not start services — see tests/browser/README.md.
 */
export default async function globalSetup() {
	const loginURL = dashboardURL("/login");
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10_000);

	// Local mkcert certs for https://local.reloop.sh
	const previousTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

	try {
		const response = await fetch(loginURL, {
			signal: controller.signal,
		});
		if (!response.ok && response.status >= 500) {
			throw new Error(
				`Dashboard login returned HTTP ${response.status} at ${loginURL}`,
			);
		}
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw new Error(
			[
				`Auth E2E could not reach the dashboard at ${loginURL}`,
				`(${reason}).`,
				"",
				"Start the local stack first:",
				"  1. local/bootstrap.sh  (Caddy, Postgres, Redis, …)",
				"  2. bun run be:auth:dev",
				"  3. bun run fe:dashboard:dev",
				"",
				"Then open https://local.reloop.sh/dashboard/login",
				"Override base URL with DASHBOARD_E2E_BASE_URL if needed.",
			].join("\n"),
		);
	} finally {
		clearTimeout(timeout);
		if (previousTls === undefined) {
			delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
		} else {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTls;
		}
	}
}
