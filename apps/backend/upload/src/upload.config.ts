if (!process.env.PG_URL)
	process.env.PG_URL = "postgresql://reloop:reloop123@localhost:5432/reloop";
if (!process.env.REDIS_URL)
	process.env.REDIS_URL = "redis://:reloop123@localhost:6379";
if (!process.env.BASE_URL) process.env.BASE_URL = "https://local.reloop.sh";

if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED)
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const uploadConfig = {
	port: Number(process.env.PORT || 8018),
	PG_URL: process.env.PG_URL,
	REDIS_URL: process.env.REDIS_URL,
	BASE_URL: process.env.BASE_URL,
	NODE_ENV: process.env.NODE_ENV || "development",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,

	S3: {
		ENDPOINT: process.env.S3_ENDPOINT || "http://localhost:9010",
		ACCESS_KEY: process.env.S3_ACCESS_KEY || "reloop",
		SECRET_KEY: process.env.S3_SECRET_KEY || "reloop123",
		BUCKET: process.env.S3_BUCKET || "reloop-uploads",
		REGION: process.env.S3_REGION || "us-east-1",
		FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE || "true",
	},

	constants: {
		maxFileSize: 10 * 1024 * 1024, // 10MB
		allowedMimeTypes: [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/svg+xml",
		],
	},
};
