export const creditsConfig = {
	port: Number(process.env.CREDITS_PORT || process.env.BILLING_PORT || "8023"),
	nodeEnv: process.env.NODE_ENV || "development",
	initialCredits: Number(process.env.INITIAL_CREDITS || "100"),
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
};
