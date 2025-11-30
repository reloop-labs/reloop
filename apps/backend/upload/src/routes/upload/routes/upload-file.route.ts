import { uploadErrorResponse } from "@be/upload/error/upload.error-code";
import { authMiddleware } from "@be/upload/middleware/auth";
import { UploadModel } from "@be/upload/model/upload.model";
import { uploadFileHandler } from "@be/upload/routes/upload/controllers/upload-file";
import { Elysia } from "elysia";

export const uploadFileRoute = new Elysia().use(authMiddleware).post(
	"/upload",
	async ({ request, user }) => {
		const { id: userId } = user;
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			uploadErrorResponse("No file provided");
		}

		try {
			return await uploadFileHandler({
				userId,
				file: file as File,
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
		response: {
			200: UploadModel.uploadResponse,
			400: UploadModel.validationError,
			403: UploadModel.unauthorized,
		},
		detail: {
			tags: ["Upload"],
			summary: "Upload an image file",
			description: "Uploads an image file and returns file metadata with URL",
		},
	},
);
