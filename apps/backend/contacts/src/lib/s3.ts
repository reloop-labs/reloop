import { S3Client } from "@aws-sdk/client-s3";
import { contactsConfig } from "@be/contacts/contacts.config";

export const s3Client = new S3Client({
	region: contactsConfig.S3.REGION,
	endpoint: contactsConfig.S3.ENDPOINT,
	credentials: {
		accessKeyId: contactsConfig.S3.ACCESS_KEY || "",
		secretAccessKey: contactsConfig.S3.SECRET_KEY || "",
	},
	forcePathStyle: contactsConfig.S3.FORCE_PATH_STYLE === "true",
});
