import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { templateConfig } from "@be/template/template.config";

export const s3Client = new S3Client({
	region: templateConfig.S3.REGION,
	endpoint: templateConfig.S3.ENDPOINT,
	credentials: {
		accessKeyId: templateConfig.S3.ACCESS_KEY || "",
		secretAccessKey: templateConfig.S3.SECRET_KEY || "",
	},
	forcePathStyle: templateConfig.S3.FORCE_PATH_STYLE === "true",
});

export function publicObjectUrl(filePath: string): string {
	let endpoint = templateConfig.S3.ENDPOINT.replace(/\/$/, "");
	if (!/^https?:\/\//i.test(endpoint)) {
		endpoint = `https://${endpoint}`;
	}
	return `${endpoint}/${templateConfig.S3.BUCKET}/${filePath}`;
}

export async function uploadPng(filePath: string, bytes: Uint8Array) {
	const upload = new Upload({
		client: s3Client,
		params: {
			Bucket: templateConfig.S3.BUCKET,
			Key: filePath,
			Body: bytes,
			ContentType: "image/png",
			CacheControl: "public, max-age=31536000",
		},
	});
	await upload.done();
	return publicObjectUrl(filePath);
}
