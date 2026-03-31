const pino = require("pino");

const baseLogger = pino({
	level: process.env.LOG_LEVEL || "info",
	...(process.env.NODE_ENV === "development" && {
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "hh:mm:ss",
				ignore: "pid,hostname",
				messageFormat: true,
				hideObject: false,
			},
		},
	}),
});

export type Logger = typeof logger;
export const logger = Object.assign(baseLogger, {
	/**
	 * Log an HTTP request with method and endpoint
	 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)
	 * @param endpoint - The URL endpoint being accessed
	 * @param additionalData - Optional additional data to log
	 */
	request: (
		method: string,
		endpoint: string,
		additionalData?: Record<string, unknown>,
	) => {
		const upperMethod = method.toUpperCase();
		baseLogger.info(
			{
				method: upperMethod,
				endpoint,
				...additionalData,
			},
			`${upperMethod} ${endpoint}`,
		);
	},

	/**
	 * Log an HTTP response with method, endpoint, and status code
	 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)
	 * @param endpoint - The URL endpoint that was accessed
	 * @param statusCode - HTTP status code of the response
	 * @param additionalData - Optional additional data to log
	 */
	response: (
		method: string,
		endpoint: string,
		statusCode: number,
		additionalData?: Record<string, unknown>,
	) => {
		const upperMethod = method.toUpperCase();
		const logLevel =
			statusCode >= 400 ? "error" : statusCode >= 300 ? "warn" : "info";

		baseLogger[logLevel](
			{
				method: upperMethod,
				endpoint,
				statusCode,
				...additionalData,
			},
			`${upperMethod} ${endpoint} → ${statusCode}`,
		);
	},
});

/**
 * Create a structured log in the remote log service
 * @param body - The log entry details
 */
export async function createLog(body: {
	event: string;
	level?: "debug" | "info" | "warn" | "error" | "fatal";
	message?: string;
	organization_id?: string;
	user_id?: string;
	properties?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
	service?: string;
	source?: string;
}) {
	const baseUrl =
		process.env.BASE_URL?.replace("local.reloop.sh", "localhost") ||
		"http://localhost:8016";
	const url = `${baseUrl}/api/logs/v1/create`;

	try {
		await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": process.env.LOGS_API_KEY || "reloop-log-api-key",
			},
			body: JSON.stringify({
				level: "info",
				...body,
			}),
		});
	} catch (error) {
		baseLogger.error({ error, url }, "Error calling logs service");
	}
}

export default logger;
