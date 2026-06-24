import { UploadErrors } from "@be/upload/error/upload.error-response";
import { storage } from "@be/upload/lib/storage";
import type { UploadTypes } from "@be/upload/types/upload.type";
import { uploadConfig } from "@be/upload/upload.config";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { useLogger } from "evlog/elysia";

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
	const log = useLogger();
	try {
		// Validate file type
		if (!uploadConfig.constants.allowedMimeTypes.includes(file.type)) {
			log.warn("Invalid file type", {
				mimeType: file.type,
				fileName: file.name,
			});
			throw UploadErrors.invalidFileType(
				file.type,
				uploadConfig.constants.allowedMimeTypes,
			);
		}

		// Validate file size
		if (file.size > uploadConfig.constants.maxFileSize) {
			log.warn("File too large", { size: file.size, fileName: file.name });
			throw UploadErrors.fileTooLarge(
				file.size,
				uploadConfig.constants.maxFileSize,
			);
		}

		// Generate unique filename
		const fileId = createId();
		const originalParts = file.name.split(".");
		const extension =
			originalParts.length > 1
				? originalParts.pop()?.toLowerCase() || "bin"
				: "bin";
		const sanitizedOriginalName = sanitizeFilename(file.name);
		const filename = `${fileId}.${extension}`;

		// Create directory structure: uploads/{year}/{month}/
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const uploadDir = `uploads/${year}/${month}`;
		const filePath = `${uploadDir}/${filename}`;

		// Use storage abstraction
		await storage.upload(filePath, file);

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
			log.error("Failed to create upload record - no data returned", {
				fileName: file.name,
			});
			throw new Error("Failed to save upload metadata");
		}

		const fileUrl = `${uploadConfig.S3.ENDPOINT}/${uploadConfig.S3.BUCKET}/${filePath}`;

		log.info("File uploaded successfully", {
			id: newUpload[0].id,
			filename: filename,
			userId,
		});

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
		log.error("Error uploading file", {
			fileName: file.name,
			userId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		if (
			error &&
			typeof error === "object" &&
			"status" in error &&
			(error as { status: number }).status === 400
		) {
			throw error;
		}
		if (
			error instanceof Error &&
			error.message.includes("Failed to save upload metadata")
		) {
			throw UploadErrors.uploadFailed(error.message);
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
