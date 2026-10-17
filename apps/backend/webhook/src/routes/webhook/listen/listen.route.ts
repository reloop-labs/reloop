import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, t } from "elysia";
import { openListenStream, reportListenResult } from "./listen.controllers";
import { listListenSessions } from "./listen.store";

/** Relay endpoints used by `reloop webhooks listen` and the dashboard tester. */
export const listenRoute = new Elysia({ prefix: "/listen" })
	.use(authMiddleware)
	.get(
		"/stream",
		({ query, request, server, organizationId, userId }) => {
			// Bun closes idle connections after 10s by default; the stream
			// heartbeat is slower than that, so lift the limit for this request.
			server?.timeout(request, 0);
			return openListenStream({
				organizationId,
				userId,
				forwardTo: query.forwardTo?.trim() || null,
				client: request.headers.get("user-agent"),
				signal: request.signal,
			});
		},
		{
			auth: true,
			query: WebhookModel.listenStreamQuery,
			detail: { hide: true },
		},
	)
	.post(
		"/sessions/:sessionId/results",
		async ({ params, body, organizationId }) =>
			reportListenResult({
				sessionId: params.sessionId,
				organizationId,
				result: body,
			}),
		{
			auth: true,
			params: t.Object({ sessionId: t.String() }),
			body: WebhookModel.listenResultBody,
			detail: { hide: true },
		},
	)
	.get(
		"/sessions",
		async ({ organizationId }) => {
			const sessions = await listListenSessions(organizationId);
			return {
				sessions: sessions.map(
					({ sessionId, forwardTo, client, connectedAt }) => ({
						sessionId,
						forwardTo,
						client,
						connectedAt,
					}),
				),
			};
		},
		{
			auth: true,
			response: { 200: WebhookModel.listenSessionListResponse },
			detail: { hide: true },
		},
	);
