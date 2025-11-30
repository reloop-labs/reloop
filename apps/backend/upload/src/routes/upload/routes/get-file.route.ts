import { uploadErrorResponse } from "@be/upload/error/upload.error-code";
import { authMiddleware } from "@be/upload/middleware/auth";
import { UploadModel } from "@be/upload/model/upload.model";
import { getFileHandler } from "@be/upload/routes/upload/controllers/get-file";
import { Elysia, t } from "elysia";

export const getFileRoute = new Elysia().use(authMiddleware).get(
	"/files/:fileId",
	async ({ params, set }) => {
		const { fileId } = params;
		try {
			const { file, mimeType } = await getFileHandler({
				fileId,
			});

			// Set proper headers for file serving
			set.headers["Content-Type"] = mimeType;
			set.headers["Cache-Control"] = "public, max-age=31536000, immutable";

			return file;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			uploadErrorResponse(errorMessage);
		}
	},
	{
		auth: true,
		params: t.Object({
			fileId: UploadModel.fileIdParam,
		}),
		response: {
			200: t.Any(),
			404: UploadModel.fileNotFound,
			403: UploadModel.unauthorized,
		},
		detail: {
			tags: ["Upload"],
			summary: "Get an uploaded file",
			description: "Retrieves and serves an uploaded image file",
		},
	},
);
