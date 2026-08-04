import { getAuditChanges } from "@be/contacts/utils/contact-field-changes";
import { BusEvent, bus } from "@reloop/bus";

interface AuditLogHookOptions {
	resourceType: "contact" | "property" | "channel" | "group" | "preference";
	action: string;
	successStatus?: number;
}

export function auditLogHook(opts: AuditLogHookOptions) {
	const successStatus = opts.successStatus ?? 200;
	const action = opts.action;
	const resourceType = opts.resourceType;

	return async ({
		response,
		set,
		request,
		organizationId,
		userId,
		traceId,
		body,
		apiKeyId,
		authType,
	}: {
		response: unknown;
		set: { status?: number | string };
		request: Request;
		organizationId?: string;
		userId?: string;
		traceId?: string;
		body?: unknown;
		apiKeyId?: string;
		authType?: string;
	}) => {
		const status = set.status ?? 200;
		const userAgent = request.headers.get("user-agent") ?? undefined;
		const ipAddress =
			request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			request.headers.get("x-real-ip") ||
			undefined;

		// Capture request body
		let requestBody: Record<string, unknown> | null = null;
		try {
			if (body && typeof body === "object") {
				requestBody = body as Record<string, unknown>;
			}
		} catch {
			// Silently ignore body capture failures
		}

		let level: "info" | "warn" | "error" = "info";
		let event = `${resourceType}.${action}`;
		let metadata: Record<string, unknown> = {};
		let resourceId: string | undefined;

		const isSuccess =
			status === successStatus ||
			(Number(status) >= 200 && Number(status) < 300);

		if (isSuccess) {
			level = "info";
			const result = response as
				| { id?: string; name?: string; contact?: { id?: string } }
				| undefined;
			if (result && typeof result === "object" && result !== null) {
				if ("id" in result) {
					resourceId = result.id;
				} else if (result.contact && "id" in result.contact) {
					resourceId = result.contact.id;
				}
				metadata = {
					...result,
				};
				// Field-level changes attached by controllers via WeakMap
				const changes = getAuditChanges(result);
				if (changes) {
					metadata.changes = changes;
				}
			} else {
				metadata = {
					status,
				};
			}
		} else if (status === 429) {
			level = "warn";
			event = `${resourceType}.${action}_rate_limited`;
			metadata = {
				message: `Rate limit exceeded during ${resourceType} ${action}`,
			};
		} else {
			level = "error";
			event = `${resourceType}.${action}_failed`;
			const errResponse = response as { message?: string } | null | undefined;
			metadata = {
				error:
					errResponse &&
					typeof errResponse === "object" &&
					"message" in errResponse
						? errResponse.message
						: String(response),
			};
		}

		// Try to parse resourceId from URL if not in response body.
		// Contact IDs use con_; properties prop_; groups grp_; channels channel_.
		if (!resourceId) {
			const idMatch = request.url.match(
				/\/(con|cont|prop|grp|channel)_[a-zA-Z0-9]+/,
			);
			if (idMatch) {
				resourceId = idMatch[0].replace("/", "");
			}
		}

		const isApiKey =
			authType === "apiKey" || authType === "apikey" || !!apiKeyId;
		const actorType = isApiKey ? "api_key" : "user";
		const actorId = isApiKey ? apiKeyId : userId;

		bus
			.publish(BusEvent.LOG_CREATED, {
				event,
				level,
				trace_id: traceId,
				actor_type: actorType,
				actor_id: actorId,
				organization_id: organizationId,
				user_id: userId,
				resource_type: resourceType,
				resource_id: resourceId,
				service: "contacts",
				action,
				ip_address: ipAddress,
				user_agent: userAgent,
				environment:
					process.env.NODE_ENV === "production" ? "production" : "development",
				metadata,
				requestDetails: {
					endpoint: request.url,
					method: request.method,
					userAgent,
					ipAddress,
					statusCode: Number(status),
					requestBody,
				},
			})
			.catch(console.error);
	};
}
