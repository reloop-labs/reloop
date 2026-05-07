import "dotenv/config";

export const emailConfig = {
	port: Number(process.env.EMAIL_PORT) || 8010,
	nodeEnv: process.env.NODE_ENV || "development",
};
