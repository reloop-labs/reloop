export const creditsConfig = {
	PORT: Number(process.env.PORT || "8023"),
	NODE_ENV: process.env.NODE_ENV || "development",
	INITIAL_CREDITS: Number(process.env.INITIAL_CREDITS || "3000"),
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
};
