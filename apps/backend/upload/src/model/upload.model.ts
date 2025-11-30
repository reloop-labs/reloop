import { t } from "elysia";

export namespace UploadModel {
	export const fileIdParam = t.String({
		minLength: 1,
		description: "File ID",
	});

	export const uploadResponse = t.Object({
		id: t.String({ description: "Unique file identifier" }),
		filename: t.String({ description: "Stored filename" }),
		originalName: t.String({ description: "Original filename" }),
		mimeType: t.String({ description: "MIME type" }),
		size: t.Number({ description: "File size in bytes" }),
		path: t.String({ description: "File path" }),
		url: t.String({ description: "File URL for access" }),
		userId: t.String({ description: "User ID" }),
		createdAt: t.String({ description: "Creation timestamp" }),
		updatedAt: t.String({ description: "Last update timestamp" }),
	});

	export type UploadResponse = typeof uploadResponse.static;

	export const uploadListResponse = t.Object({
		files: t.Array(uploadResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export type UploadListResponse = typeof uploadListResponse.static;

	export const uploadQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		userId: t.Optional(t.String()),
	});

	export type UploadQuery = typeof uploadQuery.static;

	// Error responses
	export const fileNotFound = t.Object({
		message: t.Literal("File not found"),
	});
	export type FileNotFound = typeof fileNotFound.static;

	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
	});
	export type Unauthorized = typeof unauthorized.static;

	export const validationError = t.Object({
		message: t.String(),
		errors: t.Array(t.String()),
	});
	export type ValidationError = typeof validationError.static;

	export const fileTooLarge = t.Object({
		message: t.Literal("File size exceeds maximum allowed size"),
	});
	export type FileTooLarge = typeof fileTooLarge.static;

	export const invalidFileType = t.Object({
		message: t.Literal("Invalid file type. Only images are allowed"),
	});
	export type InvalidFileType = typeof invalidFileType.static;
}
