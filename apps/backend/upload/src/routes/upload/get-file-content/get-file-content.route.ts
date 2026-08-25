import { authMiddleware } from "@be/upload/middleware/auth";
import { UploadModel } from "@be/upload/model/upload.model";
import { getFileContentHandler } from "@be/upload/routes/upload/get-file-content/get-file-content.controllers";
import { Elysia, t } from "elysia";

export const getFileContentRoute = new Elysia().use(authMiddleware).get(
	"/files/content",
	async ({ query, set, userId }) => {
		const { bytes, mimeType } = await getFileContentHandler(query.path, userId);
		set.headers["content-type"] = mimeType;
		set.headers["content-length"] = String(bytes.byteLength);
		set.headers["cache-control"] = "private, max-age=60";
		return bytes;
	},
	{
		authNoOrg: true,
		query: t.Object({
			path: t.String({
				minLength: 1,
				description: "Upload object key or public URL",
			}),
		}),
		response: {
			404: UploadModel.fileNotFound,
			401: UploadModel.unauthorized,
		},
		detail: {
			tags: ["Upload"],
			summary: "Get uploaded file content",
			description:
				"Return the raw bytes for an uploaded file by storage key. Callers must send the same session cookie or API key used to upload the file.",
		},
	},
);
