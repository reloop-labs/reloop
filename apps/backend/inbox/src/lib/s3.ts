import { S3Client } from "@aws-sdk/client-s3";
import { inboxConfig } from "@reloop/be-inbox/inbox.config";

export const s3Client = new S3Client({
	region: inboxConfig.S3_REGION,
	endpoint: inboxConfig.S3_ENDPOINT,
	credentials: {
		accessKeyId: inboxConfig.S3_ACCESS_KEY || "",
		secretAccessKey: inboxConfig.S3_SECRET_KEY || "",
	},
	forcePathStyle: true,
});
