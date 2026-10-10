import {
	type StdioServerHandle,
	serveStdio,
} from "@modelcontextprotocol/server/stdio";
import { maskApiKey } from "../auth/api-key";
import { type Config, ConfigError } from "../config/env";
import type { Logger } from "../observability/log";
import { createReloopApi } from "../reloop/api";
import type { FetchLike } from "../reloop/client";
import { createReloopServer } from "../server/create-server";
import { VERSION } from "../version";

export type StartStdioOptions = {
	config: Config;
	logger: Logger;
	fetch?: FetchLike;
};

export function startStdio(options: StartStdioOptions): StdioServerHandle {
	const { config, logger } = options;
	const apiKey = config.apiKey;
	if (apiKey === undefined) {
		throw new ConfigError(
			"RELOOP_API_KEY is required for the stdio transport",
			"Set RELOOP_API_KEY to a Reloop API key created in the dashboard under API keys.",
		);
	}
	const api = createReloopApi({
		baseUrl: config.baseUrl,
		apiKey,
		timeoutMs: config.timeoutMs,
		fetch: options.fetch,
		logger,
	});
	const handle = serveStdio(() => createReloopServer({ api }));
	logger.info("reloop mcp listening on stdio", {
		baseUrl: config.baseUrl,
		apiKey: maskApiKey(apiKey),
		version: VERSION,
	});
	return handle;
}
