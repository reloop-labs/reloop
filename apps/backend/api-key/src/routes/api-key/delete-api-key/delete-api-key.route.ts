import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, status, t } from "elysia";
import { deleteApiKeyHandler } from "./delete-api-key.controllers";
import { deleteApiKeyXCodeSamples } from "./delete-api-key.x-codeSamples";

export const deleteApiKeyRoute = new Elysia().use(authMiddleware).delete(
	"/:id",
	async ({ params: { id }, activeOrganizationId, userId }) => {
		if (!activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await deleteApiKeyHandler(id, activeOrganizationId!, userId!);
	},
	{
		auth: true,
		params: t.Object({
			id: ApiKeyModel.apiKeyIdParam,
		}),
		response: {
			200: t.Object({
				message: t.String(),
			}),
			404: ApiKeyModel.apiKeyNotFound,
			403: ApiKeyModel.unauthorized,
		},
		detail: {
			tags: ["API Keys"],
			summary: "Delete API key",
			description: "Deletes an API key",
			"x-codeSamples": deleteApiKeyXCodeSamples,
		},
	},
);
