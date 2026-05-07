import "dotenv/config";

export const creditsConfig = {
	port: Number(process.env.CREDITS_PORT) || 8023,
	nodeEnv: process.env.NODE_ENV || "development",
	initialCredits: Number(process.env.INITIAL_CREDITS) || 100,
};
