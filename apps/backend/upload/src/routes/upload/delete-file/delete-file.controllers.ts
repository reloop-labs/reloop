import {
	AuthErrors,
	UploadErrors,
} from "@be/upload/error/upload.error-response";
import { storage } from "@be/upload/lib/storage";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function deleteFile(params: {
	fileId: string;
	userId: string;
}): Promise<{ message: string }> {
	const { fileId, userId } = params;
	const log = useLogger();
	try {
		// Get file metadata from database
		const fileRecord = await db
			.select()
			.from(schema.upload)
			.where(and(eq(schema.upload.id, fileId), isNull(schema.upload.deletedAt)))
			.limit(1);

		if (fileRecord.length === 0 || !fileRecord[0]) {
			log.warn("File not found", { fileId });
			throw UploadErrors.fileNotFound(fileId);
		}

		const upload = fileRecord[0];

		// Check file ownership
		if (upload.userId !== userId) {
			log.warn("Unauthorized file delete attempt", {
				fileId,
				userId,
				fileOwnerId: upload.userId,
			});
			throw AuthErrors.forbidden(
				"You do not have permission to delete this file",
			);
		}

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

		log.info("File deleted successfully", {
			fileId,
			path: upload.path,
		});

		return { message: "File deleted successfully" };
	} catch (error) {
		log.error("Error deleting file", {
			fileId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		if (
			error &&
			typeof error === "object" &&
			"status" in error &&
			typeof (error as { status: unknown }).status === "number" &&
			(error as { status: number }).status < 500
		) {
			throw error;
		}
		throw UploadErrors.deleteFailed(
			fileId,
			error instanceof Error ? error.message : String(error),
		);
	}
}

export async function deleteFileHandler(params: {
	fileId: string;
	userId: string;
}): Promise<{ message: string }> {
	const { fileId, userId } = params;
	const result = await deleteFile({
		fileId,
		userId,
	});
	return result;
}
