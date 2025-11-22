// Set PORT environment variable if not already set
if (!process.env.PORT) process.env.PORT = "8017";

export const workflowConfig = {
	port: Number(process.env.PORT),
};
