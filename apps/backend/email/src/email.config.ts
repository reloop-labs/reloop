import "dotenv/config";

export const emailConfig = {
	port: Number(process.env.EMAIL_PORT) || 8017,
	nodeEnv: process.env.NODE_ENV || "development",
};
