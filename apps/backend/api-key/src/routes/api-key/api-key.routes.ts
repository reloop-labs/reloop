import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { createApiKeyRoute } from "@reloop/api-key/routes/api-key/routes/create-api-key.route";
import { deleteApiKeyRoute } from "@reloop/api-key/routes/api-key/routes/delete-api-key.route";
import { getApiKeyRoute } from "@reloop/api-key/routes/api-key/routes/get-api-key.route";
import { listApiKeysRoute } from "@reloop/api-key/routes/api-key/routes/list-api-keys.route";
import { updateApiKeyRoute } from "@reloop/api-key/routes/api-key/routes/update-api-key.route";
import { Elysia } from "elysia";

export const apiKeyRoutes = new Elysia({
	prefix: "/v1",
	name: "ApiKeyRoutes",
})
	.use(authMiddleware)
	.use(createApiKeyRoute)
	.use(getApiKeyRoute)
	.use(listApiKeysRoute)
	.use(updateApiKeyRoute)
	.use(deleteApiKeyRoute);
