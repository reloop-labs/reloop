import "dotenv/config";

export const billingConfig = {
	port: Number(process.env.BILLING_PORT) || 8023,
	nodeEnv: process.env.NODE_ENV || "development",
	initialCredits: Number(process.env.INITIAL_CREDITS) || 100,
};
