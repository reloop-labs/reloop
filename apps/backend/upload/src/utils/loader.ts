import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@be/upload/lib/s3";
import { uploadConfig } from "@be/upload/upload.config";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { logger } from "@reloop/logger";

const redis = new RedisCache("upload");

export const loader = async () => {
	try {
		await redis.healthCheck();
		logger.info("Redis connected");

		await db.execute("SELECT 1 as test");
		logger.info("Postgres connected");

		// Check S3 accessibility
		await s3Client.send(
			new HeadBucketCommand({
				Bucket: uploadConfig.S3.BUCKET,
			}),
		);
		logger.info(
			{ bucket: uploadConfig.S3.BUCKET },
			"S3 bucket connected and accessible",
		);
	} catch (e) {
		logger.error(
			{ error: e instanceof Error ? e.message : String(e) },
			"Error during service initialization",
		);
	}
};
