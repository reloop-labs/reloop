import { authMiddleware } from "@be/upload/middleware/auth";
import { deleteFileRoute } from "@be/upload/routes/upload/routes/delete-file.route";
import { getFileRoute } from "@be/upload/routes/upload/routes/get-file.route";
import { uploadFileRoute } from "@be/upload/routes/upload/routes/upload-file.route";
import { Elysia } from "elysia";

export const uploadRoutes = new Elysia({ prefix: "/v1", name: "UploadRoutes" })
    .use(authMiddleware)
    .use(uploadFileRoute)
    .use(getFileRoute)
    .use(deleteFileRoute);
