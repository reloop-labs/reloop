import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { contactsConfig } from "@be/contacts/contacts.config";
import { s3Client } from "@be/contacts/lib/s3";

const EXPORT_PREFIX = "exports";

export function exportFileKey(
	organizationId: string,
	exportId: string,
): string {
	return `${EXPORT_PREFIX}/${organizationId}/${exportId}.csv`;
}

export async function uploadExportCsv(key: string, csv: string): Promise<void> {
	await s3Client.send(
		new PutObjectCommand({
			Bucket: contactsConfig.S3.BUCKET,
			Key: key,
			Body: csv,
			ContentType: "text/csv; charset=utf-8",
		}),
	);
}

export async function downloadExportCsv(key: string): Promise<Uint8Array> {
	const result = await s3Client.send(
		new GetObjectCommand({
			Bucket: contactsConfig.S3.BUCKET,
			Key: key,
		}),
	);
	const bytes = await result.Body?.transformToByteArray();
	if (!bytes) {
		throw new Error(`Empty object for key ${key}`);
	}
	return bytes;
}
