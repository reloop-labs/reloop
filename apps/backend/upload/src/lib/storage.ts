import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { uploadConfig } from "@be/upload/upload.config";
import { s3Client } from "./s3";

export interface StorageProvider {
	upload(filePath: string, file: File): Promise<void>;
	download(filePath: string): Promise<Buffer>;
	delete(filePath: string): Promise<void>;
}

class S3StorageProvider implements StorageProvider {
	private bucket = uploadConfig.S3.BUCKET || "";

	async upload(filePath: string, file: File): Promise<void> {
		const parallelUploads3 = new Upload({
			client: s3Client,
			params: {
				Bucket: this.bucket,
				Key: filePath,
				Body: file.stream(),
				ContentType: file.type,
			},
		});

		await parallelUploads3.done();
	}

	async download(filePath: string): Promise<Buffer> {
		const result = await s3Client.send(
			new GetObjectCommand({
				Bucket: this.bucket,
				Key: filePath,
			}),
		);
		const bytes = await result.Body?.transformToByteArray();
		if (!bytes) {
			throw new Error(`Empty object for key ${filePath}`);
		}
		return Buffer.from(bytes);
	}

	async delete(filePath: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.bucket,
			Key: filePath,
		});
		await s3Client.send(command);
	}
}

export const storage = new S3StorageProvider();
