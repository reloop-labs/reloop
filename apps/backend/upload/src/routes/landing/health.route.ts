import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { redis } from "@be/upload/lib/redis";
import { s3Client } from "@be/upload/lib/s3";
import { uploadConfig } from "@be/upload/upload.config";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const healthRoute = new Elysia().get(
	"/health",
	async () => {
		try {
			const startTime = Date.now();
			await redis.healthCheck();
			await db.execute("SELECT 1 as test");
			await s3Client.send(
				new HeadBucketCommand({
					Bucket: uploadConfig.S3.BUCKET,
				}),
			);
			const responseTime = Date.now() - startTime;

			return {
				status: "CONNECTED",
				success: true,
				responseTime: `${responseTime}ms`,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			return {
				status: "DISCONNECTED",
				success: false,
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString(),
			};
		}
	},
	{ detail: { hide: true } },
);
