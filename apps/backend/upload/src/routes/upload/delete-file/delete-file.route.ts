import { authMiddleware } from "@be/upload/middleware/auth";
import { UploadModel } from "@be/upload/model/upload.model";
import { deleteFileHandler } from "@be/upload/routes/upload/delete-file/delete-file.controllers";
import { Elysia, t } from "elysia";

export const deleteFileRoute = new Elysia().use(authMiddleware).delete(
	"/files/:fileId",
	async ({ params }) => {
		const { fileId } = params;
		return await deleteFileHandler({
			fileId,
		});
	},
	{
		// Guard only — handler does not need org (authNoOrg).
		authNoOrg: true,
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
