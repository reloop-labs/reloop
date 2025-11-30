import type { UploadTypes } from "@be/upload/types/upload.type";
import { uploadConfig } from "@be/upload/upload.config";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import logger from "@reloop/logger";
import { status } from "elysia";

function sanitizeFilename(filename: string): string {
	// Remove path separators and dangerous characters
	return filename
		.replace(/[^a-zA-Z0-9._-]/g, "_")
		.replace(/^\.+/, "")
		.substring(0, 255);
}

function getFileExtension(mimeType: string): string {
	const mimeToExt: Record<string, string> = {
		"image/jpeg": "jpg",
		"image/jpg": "jpg",
		"image/png": "png",
		"image/gif": "gif",
		"image/webp": "webp",
		"image/svg+xml": "svg",
	};
	return mimeToExt[mimeType] || "jpg";
}

export async function uploadFile(params: {
	userId: string;
	file: File;
}): Promise<UploadTypes.UploadResponse> {
	const { userId, file } = params;
	try {
		// Validate file type
		if (!uploadConfig.constants.allowedMimeTypes.includes(file.type)) {
			logger.warn(
				{ mimeType: file.type, fileName: file.name },
				"Invalid file type",
			);
			throw new Error("Invalid file type. Only images are allowed");
		}

		// Validate file size
		if (file.size > uploadConfig.constants.maxFileSize) {
			logger.warn({ size: file.size, fileName: file.name }, "File too large");
			throw new Error("File size exceeds maximum allowed size");
		}

		// Generate unique filename
		const fileId = createId();
		const extension = getFileExtension(file.type);
		const sanitizedOriginalName = sanitizeFilename(file.name);
		const filename = `${fileId}.${extension}`;

		// Create directory structure: uploads/{year}/{month}/
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const uploadDir = `uploads/${year}/${month}`;
		const filePath = `${uploadDir}/${filename}`;

		// Ensure directory exists
		const fullPath = `${uploadConfig.UPLOAD_STORAGE_PATH}/${filePath}`;
		const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/"));

		// Create directory if it doesn't exist
		try {
			await Bun.write(fullPath, file);
		} catch {
			// If directory doesn't exist, create it using fs
			const fs = await import("fs/promises");
			await fs.mkdir(dirPath, { recursive: true });
			await Bun.write(fullPath, file);
		}

		// Save metadata to database
		const newUpload = await db
			.insert(schema.upload)
			.values({
				filename: filename,
				originalName: sanitizedOriginalName,
				mimeType: file.type,
				size: file.size,
				path: filePath,
				userId: userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newUpload[0]) {
			logger.error(
				{ fileName: file.name },
				"Failed to create upload record - no data returned",
			);
			throw new Error("Failed to save upload metadata");
		}

		const fileUrl = `${uploadConfig.BASE_URL}/api/upload/v1/files/${newUpload[0].id}`;

		logger.info(
			{
				id: newUpload[0].id,
				filename: filename,
				userId,
			},
			"File uploaded successfully",
		);

		return {
			id: newUpload[0].id,
			filename: newUpload[0].filename,
			originalName: newUpload[0].originalName,
			mimeType: newUpload[0].mimeType,
			size: newUpload[0].size,
			path: newUpload[0].path,
			url: fileUrl,
			userId: newUpload[0].userId,
			createdAt: newUpload[0].createdAt.toISOString(),
			updatedAt: newUpload[0].updatedAt.toISOString(),
		};
	} catch (error) {
		logger.error(
			{
				fileName: file.name,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error uploading file",
		);
		if (error instanceof Error && error.message.includes("Invalid file type")) {
			throw status(400, {
				message: "Invalid file type. Only images are allowed",
			});
		}
		if (error instanceof Error && error.message.includes("File size exceeds")) {
			throw status(400, { message: "File size exceeds maximum allowed size" });
		}
		throw error;
	}
}

export async function uploadFileHandler(params: {
	userId: string;
	file: File;
}): Promise<UploadTypes.UploadResponse> {
	const { userId, file } = params;
	const uploadDetails = await uploadFile({
		userId,
		file,
	});
	return uploadDetails;
}
