export const mailConfig = {
	port: Number(process.env.PORT || "8015"),
	PG_URL: process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	KUMOMTA_HTTP_URL: process.env.KUMOMTA_HTTP_URL || "http://localhost:8020",
	NODE_ENV: process.env.NODE_ENV || "development",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
};


