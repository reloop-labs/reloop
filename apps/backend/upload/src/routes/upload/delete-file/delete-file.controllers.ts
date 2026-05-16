import { log } from "evlog";
import { storage } from "@be/upload/lib/storage";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteFile(params: {
	fileId: string;
}): Promise<{ message: string }> {
	const { fileId } = params;
	try {
		// Get file metadata from database
		const fileRecord = await db
			.select()
			.from(schema.upload)
			.where(and(eq(schema.upload.id, fileId), isNull(schema.upload.deletedAt)))
			.limit(1);

		if (fileRecord.length === 0 || !fileRecord[0]) {
			log.warn({ ...({ fileId }), message: "File not found" });
			throw new Error("File not found");
		}

		const upload = fileRecord[0];

		// Delete from S3 storage
		await storage.delete(upload.path);

		// Soft delete in database
		await db
			.update(schema.upload)
			.set({
				deletedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.upload.id, fileId));

		log.info({ ...({
				fileId,
				path: upload.path,
			}), message: "File deleted successfully" });

		return { message: "File deleted successfully" };
	} catch (error) {
		log.error({
				fileId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting file",
		);
		if (error instanceof Error && error.message.includes("File not found")) {
			throw status(404, { message: "File not found" });
		}
		throw error;
	}
}

export async function deleteFileHandler(params: {
	fileId: string;
}): Promise<{ message: string }> {
	const { fileId } = params;
	const result = await deleteFile({
		fileId,
	});
	return result;
}
