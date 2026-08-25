import { authMiddleware } from "@be/upload/middleware/auth";
import { deleteFileRoute } from "@be/upload/routes/upload/delete-file/delete-file.route";
import { getFileContentRoute } from "@be/upload/routes/upload/get-file-content/get-file-content.route";
import { uploadFileRoute } from "@be/upload/routes/upload/upload-file/upload-file.route";
import { Elysia } from "elysia";

export const uploadRoutes = new Elysia({ prefix: "/v1", name: "UploadRoutes" })
	.use(authMiddleware)
	.use(uploadFileRoute)
	.use(getFileContentRoute)
	.use(deleteFileRoute);
