import { S3Client } from "@aws-sdk/client-s3";
import { inboxConfig } from "@reloop/be-inbox/inbox.config";

export const s3Client = new S3Client({
	region: inboxConfig.S3.REGION,
	endpoint: inboxConfig.S3.ENDPOINT,
	credentials: {
		accessKeyId: inboxConfig.S3.ACCESS_KEY || "",
		secretAccessKey: inboxConfig.S3.SECRET_KEY || "",
	},
	forcePathStyle: inboxConfig.S3.FORCE_PATH_STYLE === "true",
});
