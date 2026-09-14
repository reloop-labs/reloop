export type EmailTransport =
	| { kind: "reloop"; apiKey: string }
	| {
			kind: "smtp";
			host: string;
			port: number;
			secure: boolean;
			user?: string;
			pass?: string;
	  }
	| { kind: "mailpit"; host: string; port: number };

export type EmailTransportConfig = {
	NODE_ENV: string;
	RELOOP_API_KEY: string;
	SMTP_HOST: string;
	SMTP_PORT: number;
	SMTP_USER: string;
	SMTP_PASSWORD: string;
	SMTP_SECURE: boolean;
	MAILPIT_HOST: string;
	MAILPIT_PORT: number;
};

export const SYSTEM_EMAIL_UNCONFIGURED_MESSAGE =
	"No system email transport is configured. Set RELOOP_API_KEY to send through Reloop, " +
	"or SMTP_HOST (with SMTP_PORT, SMTP_USER, SMTP_PASSWORD) to relay through your own SMTP server. " +
	"Mailpit is a development-only fallback and is never used when NODE_ENV=production.";

export function isDevelopmentEnv(nodeEnv: string): boolean {
	const normalized = nodeEnv.trim().toLowerCase();
	return normalized !== "production";
}

export function resolveEmailTransport(
	config: EmailTransportConfig,
	apiKeyOverride?: string,
): EmailTransport {
	const apiKey = apiKeyOverride?.trim() || config.RELOOP_API_KEY.trim();
	if (apiKey) {
		return { kind: "reloop", apiKey };
	}

	const host = config.SMTP_HOST.trim();
	if (host) {
		const user = config.SMTP_USER.trim();
		const pass = config.SMTP_PASSWORD.trim();
		return {
			kind: "smtp",
			host,
			port: config.SMTP_PORT,
			secure: config.SMTP_SECURE,
			user: user || undefined,
			pass: pass || undefined,
		};
	}

	if (!isDevelopmentEnv(config.NODE_ENV)) {
		throw new Error(SYSTEM_EMAIL_UNCONFIGURED_MESSAGE);
	}

	return {
		kind: "mailpit",
		host: config.MAILPIT_HOST,
		port: config.MAILPIT_PORT,
	};
}

export function describeEmailTransport(transport: EmailTransport): string {
	switch (transport.kind) {
		case "reloop":
			return "Reloop API";
		case "smtp":
			return `SMTP ${transport.host}:${transport.port}${
				transport.user ? " (authenticated)" : " (no auth)"
			}`;
		case "mailpit":
			return `Mailpit ${transport.host}:${transport.port} (development only)`;
	}
}
