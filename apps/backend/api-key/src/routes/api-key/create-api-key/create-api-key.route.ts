import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { rateLimitPlugin } from "@reloop/api-key/middleware/rate-limit";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { BusEvent, bus } from "@reloop/bus";
import { Elysia } from "elysia";
import { createApiKeyController } from "./create-api-key.controllers";
import { createApiKeyXCodeSamples } from "./create-api-key.x-codeSamples";

export const createApiKeyRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 10, windowSeconds: 60, namespace: "create" }))
	.post(
		"/",
		async ({ body: { name }, organizationId, userId, set }) => {
			set.status = 201;
			return await createApiKeyController({
				organizationId,
				userId,
				name,
			});
		},
		{
			auth: true,
			rateLimit: true,
			body: ApiKeyModel.createApiKeyBody,
			response: {
				201: ApiKeyModel.apiKeyWithKeyResponse,
				403: ApiKeyModel.unauthorized,
			},
			detail: {
				tags: ["API Keys"],
				summary: "Create API Key",
				description: "Creates a new API key",
				"x-codeSamples": createApiKeyXCodeSamples,
			},
			afterResponse: async ({
				responseValue,
				set,
				request,
				organizationId,
				userId,
				traceId,
			}) => {
				const status = set.status ?? 200;
				const userAgent = request.headers.get("user-agent") ?? undefined;
				const ipAddress =
					request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
					request.headers.get("x-real-ip") ||
					undefined;

				let level: "info" | "warn" | "error" = "info";
				let event = "api_key.created";
				let metadata: Record<string, unknown> = {};

				if (status === 201) {
					level = "info";
					const apiKeyResult = responseValue as
						| { id?: string; name?: string }
						| undefined;
					metadata = {
						keyId: apiKeyResult?.id,
						name: apiKeyResult?.name,
					};
				} else if (status === 429) {
					level = "warn";
					event = "api_key.create_rate_limited";
					metadata = {
						message: "Rate limit exceeded during API key creation",
					};
				} else {
					level = "error";
					event = "api_key.create_failed";
					const errResponse = responseValue as
						| { message?: string }
						| null
						| undefined;
					metadata = {
						error:
							errResponse &&
								typeof errResponse === "object" &&
								"message" in errResponse
								? errResponse.message
								: String(responseValue),
					};
				}

				await bus.publish(BusEvent.LOG_CREATED, {
					event,
					level,
					trace_id: traceId as string,
					actor_type: "user",
					actor_id: userId as string,
					organization_id: organizationId as string,
					user_id: userId as string,
					resource_type: "api_key",
					resource_id:
						status === 201 ? (responseValue as { id?: string })?.id : undefined,
					service: "api-key",
					action: "created",
					ip_address: ipAddress,
					user_agent: userAgent,
					environment:
						process.env.NODE_ENV === "production"
							? "production"
							: "development",
					metadata,
					requestDetails: {
						endpoint: request.url,
						method: request.method,
						userAgent,
						ipAddress,
						statusCode: Number(status),
					},
				});
			},
		},
	);
