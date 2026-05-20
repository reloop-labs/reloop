export const emailConfig = {
	port: Number(process.env.EMAIL_PORT || "8022"),
	NODE_ENV: process.env.NODE_ENV || "development",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
	RELOOP_API_KEY: process.env.RELOOP_API_KEY || "",
	RELOOP_SENDER_DOMAIN: process.env.RELOOP_SENDER_DOMAIN || "",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
};
