import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { inboxConfig } from "@reloop/be-inbox/inbox.config";
import { s3Client } from "@reloop/be-inbox/lib/s3";
import { redis } from "@reloop/be-inbox/utils/loader";
import { bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const healthRoute = new Elysia().get(
	"/health",
	async () => {
		try {
			const startTime = Date.now();
			await redis.healthCheck();
			await db.execute("SELECT 1 as test");
			await bus.healthCheck();
			await s3Client.send(
				new HeadBucketCommand({
					Bucket: inboxConfig.S3_BUCKET_NAME,
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
