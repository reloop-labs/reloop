import { Elysia } from "elysia";
import { createApiKeyRoute } from "./create-api-key/create-api-key.route";
import { deleteApiKeyRoute } from "./delete-api-key/delete-api-key.route";
import { disableApiKeyRoute } from "./disable-api-key/disable-api-key.route";
import { enableApiKeyRoute } from "./enable-api-key/enable-api-key.route";
import { getApiKeyRoute } from "./get-api-key/get-api-key.route";
import { listApiKeysRoute } from "./list-api-keys/list-api-keys.route";
import { rotateApiKeyRoute } from "./rotate-api-key/rotate-api-key.route";
import { updateApiKeyRoute } from "./update-api-key/update-api-key.route";

export const apiKeyRoutes = new Elysia({
	prefix: "/v1",
	name: "ApiKeyRoutes",
})
	.use(createApiKeyRoute)
	.use(getApiKeyRoute)
	.use(listApiKeysRoute)
	.use(updateApiKeyRoute)
	.use(deleteApiKeyRoute)
	.use(rotateApiKeyRoute)
	.use(enableApiKeyRoute)
	.use(disableApiKeyRoute);
