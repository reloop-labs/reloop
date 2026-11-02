import { agentConfig } from "@be/agent/agent.config";
import {
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
} from "@reloop/auth/middleware";

export type ServiceName = keyof typeof agentConfig.services;

export type ForwardRequestOptions = {
	service: ServiceName;
	path: string;
	method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
	userId: string;
	organizationId?: string | null;
	body?: unknown;
	query?: Record<string, string | number | boolean | undefined>;
	headers?: Record<string, string>;
};

export class ServiceError extends Error {
	constructor(
		public status: number,
		public code: string,
		message: string,
		public why: string,
		public fix: string,
		public link?: string,
		public raw?: unknown,
	) {
		super(message);
		this.name = "ServiceError";
	}
}

export async function forwardToService<T = unknown>(
	opts: ForwardRequestOptions,
): Promise<T> {
	const baseUrl = agentConfig.services[opts.service];
	const url = new URL(opts.path, baseUrl);

	if (opts.query) {
		for (const [key, val] of Object.entries(opts.query)) {
			if (val !== undefined) {
				url.searchParams.set(key, String(val));
			}
		}
	}

	const reqHeaders: Record<string, string> = {
		[INTERNAL_SECRET_HEADER]: agentConfig.RELOOP_INTERNAL_SECRET,
		[INTERNAL_USER_ID_HEADER]: opts.userId,
		...(opts.organizationId
			? { [INTERNAL_ORG_ID_HEADER]: opts.organizationId }
			: {}),
		"Content-Type": "application/json",
		"User-Agent": "reloop-agent-gateway/1.0",
		...(opts.headers || {}),
	};

	let reqBody: string | undefined;
	if (opts.body !== undefined && opts.method !== "GET") {
		reqBody = JSON.stringify(opts.body);
	}

	const response = await fetch(url.toString(), {
		method: opts.method || "GET",
		headers: reqHeaders,
		body: reqBody,
	});

	const responseText = await response.text();
	let parsedBody: unknown;
	try {
		parsedBody = JSON.parse(responseText);
	} catch {
		parsedBody = responseText;
	}

	if (!response.ok) {
		const rec =
			typeof parsedBody === "object" && parsedBody !== null
				? (parsedBody as Record<string, unknown>)
				: undefined;
		const code =
			rec && typeof rec.code === "string"
				? rec.code
				: `HTTP_${response.status}`;
		const message =
			rec && typeof rec.message === "string"
				? rec.message
				: response.statusText || "Downstream service error";
		const why =
			rec && typeof rec.why === "string"
				? rec.why
				: `Downstream service '${opts.service}' failed.`;
		const fix =
			rec && typeof rec.fix === "string"
				? rec.fix
				: "Verify your request parameters and try again.";
		const link = rec && typeof rec.link === "string" ? rec.link : undefined;

		throw new ServiceError(
			response.status,
			code,
			message,
			why,
			fix,
			link,
			parsedBody,
		);
	}

	return parsedBody as T;
}
