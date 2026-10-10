import { type Config, ConfigError, type Env, readConfig } from "./config/env";
import { createLogger, redact } from "./observability/log";
import { startHttp } from "./transports/http";
import { startStdio } from "./transports/stdio";
import { PACKAGE_NAME, VERSION } from "./version";

type Transport = "stdio" | "http";

type ParsedArgs = {
	transport: Transport;
	help: boolean;
	version: boolean;
	overrides: Env;
};

const USAGE = `${PACKAGE_NAME} ${VERSION}

Usage: ${PACKAGE_NAME} [options]

Options:
  --transport <stdio|http>  Transport to serve (default: stdio)
  --host <hostname>         HTTP bind hostname (default: 127.0.0.1)
  --port <number>           HTTP bind port (default: 3000)
  --base-url <url>          Reloop instance origin (default: https://reloop.sh)
  --version                 Print the version and exit
  --help                    Print this help and exit

Environment:
  RELOOP_API_KEY       Reloop API key (required for the stdio transport)
  RELOOP_BASE_URL      Reloop instance origin
  RELOOP_TIMEOUT_MS    Request timeout in milliseconds (default: 30000)
  HOST, PORT           HTTP bind address
  MCP_ALLOWED_HOSTS    Comma separated Host header allowlist
  MCP_ALLOWED_ORIGINS  Comma separated Origin header allowlist
  LOG_LEVEL            debug | info | warn | error | silent`;

class UsageError extends Error {}

function requireValue(flag: string, value: string | undefined): string {
	if (value === undefined) {
		throw new UsageError(`${flag} requires a value`);
	}
	return value;
}

function parseArgs(argv: readonly string[]): ParsedArgs {
	const parsed: ParsedArgs = {
		transport: "stdio",
		help: false,
		version: false,
		overrides: {},
	};
	for (let index = 0; index < argv.length; index += 1) {
		const flag = argv[index];
		switch (flag) {
			case "--help":
				parsed.help = true;
				break;
			case "--version":
				parsed.version = true;
				break;
			case "--transport": {
				index += 1;
				const value = requireValue("--transport", argv[index]);
				if (value !== "stdio" && value !== "http") {
					throw new UsageError(
						`--transport must be stdio or http, got ${value}`,
					);
				}
				parsed.transport = value;
				break;
			}
			case "--host":
				index += 1;
				parsed.overrides.HOST = requireValue("--host", argv[index]);
				break;
			case "--port":
				index += 1;
				parsed.overrides.PORT = requireValue("--port", argv[index]);
				break;
			case "--base-url":
				index += 1;
				parsed.overrides.RELOOP_BASE_URL = requireValue(
					"--base-url",
					argv[index],
				);
				break;
			default:
				throw new UsageError(`unknown option ${flag}`);
		}
	}
	return parsed;
}

function start(args: ParsedArgs, config: Config): () => Promise<void> {
	const logger = createLogger({ level: config.logLevel });
	if (args.transport === "stdio") {
		const handle = startStdio({ config, logger });
		return () => handle.close();
	}
	const server = startHttp({ config, logger });
	return () => server.stop();
}

function main(argv: readonly string[], env: Env): void {
	let args: ParsedArgs;
	try {
		args = parseArgs(argv);
	} catch (cause) {
		process.stderr.write(
			`${cause instanceof Error ? cause.message : String(cause)}\n\n${USAGE}\n`,
		);
		process.exitCode = 2;
		return;
	}

	if (args.help) {
		process.stdout.write(`${USAGE}\n`);
		return;
	}
	if (args.version) {
		process.stdout.write(`${VERSION}\n`);
		return;
	}

	let stop: () => Promise<void>;
	try {
		stop = start(args, readConfig({ ...env, ...args.overrides }));
	} catch (cause) {
		if (cause instanceof ConfigError) {
			process.stderr.write(`error: ${cause.message}\n`);
			if (cause.fix !== undefined) {
				process.stderr.write(`fix: ${cause.fix}\n`);
			}
			process.exitCode = 2;
			return;
		}
		process.stderr.write(
			`error: ${redact(cause instanceof Error ? cause.message : String(cause))}\n`,
		);
		process.exitCode = 1;
		return;
	}

	const shutdown = (): void => {
		void stop().then(() => {
			process.exit(0);
		});
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

main(process.argv.slice(2), process.env);
