import {
	CreateBucketCommand,
	HeadBucketCommand,
	PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "@be/upload/lib/s3";
import { uploadConfig } from "@be/upload/upload.config";
import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { log } from "evlog";

const redis = new RedisCache("upload");

export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("Redis", "Connected");

		await db.execute("SELECT 1 as test");
		log.info("Postgres", "Connected");
		await bus.connect(uploadConfig.NATS_URL);
		log.info("NATS", "Connected");

		// Check S3 accessibility and create bucket if it doesn't exist
		try {
			await s3Client.send(
				new HeadBucketCommand({
					Bucket: uploadConfig.S3.BUCKET,
				}),
			);
		} catch {
			log.info({
				bucket: uploadConfig.S3.BUCKET,
				message: "Bucket not found, creating it...",
			});
			await s3Client.send(
				new CreateBucketCommand({
					Bucket: uploadConfig.S3.BUCKET,
				}),
			);
		}

		// Set public read policy
		const publicPolicy = {
			Version: "2012-10-17",
			Statement: [
				{
					Sid: "PublicRead",
					Effect: "Allow",
					Principal: "*",
					Action: ["s3:GetObject"],
					Resource: [`arn:aws:s3:::${uploadConfig.S3.BUCKET}/*`],
				},
			],
		};

		await s3Client.send(
			new PutBucketPolicyCommand({
				Bucket: uploadConfig.S3.BUCKET,
				Policy: JSON.stringify(publicPolicy),
			}),
		);

		log.info({
			...{ bucket: uploadConfig.S3.BUCKET },
			message: "S3 bucket connected and set to public read",
		});
	} catch (e) {
		log.error({
			message: "Error during service initialization",
			error: e instanceof Error ? e.message : String(e),
		});
	}
};
