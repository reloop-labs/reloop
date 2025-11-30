import { uploadErrorResponse } from "@be/upload/error/upload.error-code";
import { authMiddleware } from "@be/upload/middleware/auth";
import { UploadModel } from "@be/upload/model/upload.model";
import { deleteFileHandler } from "@be/upload/routes/upload/controllers/delete-file";
import { Elysia, t } from "elysia";

export const deleteFileRoute = new Elysia().use(authMiddleware).delete(
	"/files/:fileId",
	async ({ params }) => {
		const { fileId } = params;
		try {
			return await deleteFileHandler({
				fileId,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			uploadErrorResponse(errorMessage);
			throw error; // This will never execute but satisfies TypeScript
		}
	},
	{
		auth: true,
		params: t.Object({
			fileId: UploadModel.fileIdParam,
		}),
		response: {
			200: t.Object({ message: t.String() }),
			404: UploadModel.fileNotFound,
			403: UploadModel.unauthorized,
		},
		detail: {
			tags: ["Upload"],
			summary: "Delete an uploaded file",
			description: "Deletes an uploaded file (soft delete)",
		},
	},
);
