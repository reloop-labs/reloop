import { UploadErrors } from "@be/upload/error/upload.error-response";
import { authMiddleware } from "@be/upload/middleware/auth";
import { UploadModel } from "@be/upload/model/upload.model";
import { uploadFileHandler } from "@be/upload/routes/upload/upload-file/upload-file.controllers";
import { Elysia } from "elysia";

export const uploadFileRoute = new Elysia().use(authMiddleware).post(
	"/upload",
	async ({ request, user }) => {
		const { id: userId } = user;
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			throw UploadErrors.noFileProvided();
		}

		return await uploadFileHandler({
			userId,
			file,
		});
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
