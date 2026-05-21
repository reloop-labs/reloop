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
	}: {
		response: unknown;
		set: { status?: number | string };
		request: Request;
		organizationId?: string;
		userId?: string;
		traceId?: string;
		body?: unknown;
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

		// Try to parse resourceId from URL parameter if not in response body
		if (!resourceId) {
			const idMatch = request.url.match(
				/\/(cont|prop|grp|channel)_[a-zA-Z0-9]+/,
			);
			if (idMatch) {
				resourceId = idMatch[0].replace("/", "");
			}
		}

		bus
			.publish(BusEvent.LOG_CREATED, {
				event,
				level,
				trace_id: traceId,
				actor_type: "user",
				actor_id: userId,
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

