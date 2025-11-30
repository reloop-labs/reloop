import { uploadConfig } from "@be/upload/upload.config";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import logger from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getFile(params: {
	fileId: string;
}): Promise<{ file: ReturnType<typeof Bun.file>; mimeType: string }> {
	const { fileId } = params;
	try {
		// Get file metadata from database
		const fileRecord = await db
			.select()
			.from(schema.upload)
			.where(and(eq(schema.upload.id, fileId), isNull(schema.upload.deletedAt)))
			.limit(1);

		if (fileRecord.length === 0 || !fileRecord[0]) {
			logger.warn({ fileId }, "File not found");
			throw new Error("File not found");
		}

		const upload = fileRecord[0];
		const fullPath = `${uploadConfig.UPLOAD_STORAGE_PATH}/${upload.path}`;

		// Check if file exists
		const file = Bun.file(fullPath);
		if (!(await file.exists())) {
			logger.warn({ fileId, path: fullPath }, "File not found on disk");
			throw new Error("File not found");
		}

		logger.info(
			{
				fileId,
				path: upload.path,
			},
			"File retrieved successfully",
		);

		return {
			file: file,
			mimeType: upload.mimeType,
		};
	} catch (error) {
		logger.error(
			{
				fileId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting file",
		);
		if (error instanceof Error && error.message.includes("File not found")) {
			throw status(404, { message: "File not found" });
		}
		throw error;
	}
}

export async function getFileHandler(params: {
	fileId: string;
}): Promise<{ file: ReturnType<typeof Bun.file>; mimeType: string }> {
	const { fileId } = params;
	const fileDetails = await getFile({
		fileId,
	});
	return fileDetails;
}
