// Set PORT environment variable if not already set
if (!process.env.PORT) process.env.PORT = "8017";

export const workflowConfig = {
	port: Number(process.env.PORT),
	LOGS_API_KEY: process.env.LOGS_API_KEY || "reloop-log-api-key",
	domainVerification: {
		maxAttempts: 10,
		retryIntervalHours: 1,
	},
};
