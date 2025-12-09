// Set environment variables if not already set
if (!process.env.PORT) process.env.PORT = "8018";
if (!process.env.PG_URL)
	process.env.PG_URL = "postgresql://reloop:reloop123@localhost:5432/reloop";
if (!process.env.REDIS_URL)
	process.env.REDIS_URL = "redis://:reloop123@localhost:6379";
if (!process.env.BASE_URL) process.env.BASE_URL = "https://local.reloop.sh";

if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED)
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
if (!process.env.UPLOAD_STORAGE_PATH)
	process.env.UPLOAD_STORAGE_PATH = "docker-data/uploads";
if (!process.env.MAX_FILE_SIZE) process.env.MAX_FILE_SIZE = "10485760"; // 10MB

export const uploadConfig = {
	port: Number(process.env.PORT),
	PG_URL: process.env.PG_URL,
	REDIS_URL: process.env.REDIS_URL,
	BASE_URL: process.env.BASE_URL,
	NODE_ENV: process.env.NODE_ENV || "development",
	NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
	UPLOAD_STORAGE_PATH: process.env.UPLOAD_STORAGE_PATH,
	MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE),

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
