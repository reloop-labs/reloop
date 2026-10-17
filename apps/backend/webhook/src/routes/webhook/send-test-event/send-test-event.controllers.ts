import { createId } from "@paralleldrive/cuid2";
import { bus } from "@reloop/bus";
import { WebhookErrors } from "@reloop/webhook/error/webhook.error-response";
import {
	getListenSession,
	LISTEN_RESULT_TIMEOUT_MS,
	type ListenEventMessage,
	type ListenResultMessage,
	listenEventSubject,
	listenResultSubject,
} from "@reloop/webhook/routes/webhook/listen/listen.store";
import { signTestEventController } from "@reloop/webhook/routes/webhook/sign-test-event/sign-test-event.controllers";
import {
	postWebhook,
	WEBHOOK_RESPONSE_BODY_MAX_CHARS,
	type WebhookHttpError,
} from "@reloop/webhook-delivery";
import { log } from "evlog";
import { webhookConfig } from "../../../webhook.config";
import type { WebhookTypes } from "../webhook.type";

type Delivery = Pick<
	WebhookTypes.SendTestEventResponse,
	"ok" | "responseStatus" | "responseBody" | "durationMs" | "error"
>;

const truncate = (body: string | null) =>
	body === null ? null : body.slice(0, WEBHOOK_RESPONSE_BODY_MAX_CHARS);

/**
 * Sign a test event and deliver it from the server — to the webhook URL, or
 * through the relay to a `reloop webhooks listen` session. Server-side delivery
 * means the endpoint never needs CORS. Like sign-test-event, nothing is stored.
 */
export async function sendTestEventController({
	webhookId,
	event,
	payload,
	listenerSessionId,
	organizationId,
}: {
	webhookId: string;
	event: string;
	payload: Record<string, unknown>;
	listenerSessionId?: string;
	organizationId: string;
}): Promise<WebhookTypes.SendTestEventResponse> {
	const signed = await signTestEventController({
		webhookId,
		event,
		payload,
		organizationId,
	});

	if (listenerSessionId) {
		const session = await getListenSession(listenerSessionId, organizationId);
		if (!session) {
			throw WebhookErrors.listenerOffline(listenerSessionId);
		}
		const delivery = await deliverToListener(listenerSessionId, {
			deliveryId: `wltd_${createId()}`,
			eventId: String(signed.body.id ?? ""),
			eventType: event,
			headers: signed.headers,
			rawBody: signed.rawBody,
		});
		return {
			target: "listener",
			url: session.forwardTo ?? "reloop webhooks listen",
			headers: signed.headers,
			body: signed.body,
			...delivery,
		};
	}

	const delivery = await deliverToEndpoint(signed);
	return {
		target: "endpoint",
		url: signed.url,
		headers: signed.headers,
		body: signed.body,
		...delivery,
	};
}

async function deliverToEndpoint(signed: {
	url: string;
	headers: Record<string, string>;
	rawBody: string;
}): Promise<Delivery> {
	const isDevelopment = webhookConfig.NODE_ENV === "development";
	try {
		const response = await postWebhook({
			url: signed.url,
			headers: signed.headers,
			body: signed.rawBody,
			allowHttp: isDevelopment,
			allowPrivate: isDevelopment,
		});
		const ok = response.status >= 200 && response.status < 300;
		return {
			ok,
			responseStatus: response.status,
			responseBody: truncate(response.body),
			durationMs: response.durationMs,
			error: ok ? null : `Endpoint returned HTTP ${response.status}`,
		};
	} catch (err) {
		const e = err as Error & Partial<WebhookHttpError>;
		log.warn({
			message: "Test webhook delivery failed",
			kind: e.kind,
			error: e.message,
		});
		return {
			ok: false,
			responseStatus: null,
			responseBody: null,
			durationMs: e.durationMs ?? null,
			error:
				e.kind === "ssrf"
					? `${e.message}. To test a local endpoint, use \`reloop webhooks listen\`.`
					: e.message,
		};
	}
}

function deliverToListener(
	sessionId: string,
	message: ListenEventMessage,
): Promise<Delivery> {
	return new Promise((resolve) => {
		const timer = setTimeout(() => {
			sub.unsubscribe();
			resolve({
				ok: false,
				responseStatus: null,
				responseBody: null,
				durationMs: null,
				error: `The listener did not report a result within ${LISTEN_RESULT_TIMEOUT_MS / 1000}s.`,
			});
		}, LISTEN_RESULT_TIMEOUT_MS);

		// Subscribe before publishing so a fast result can't be missed.
		const sub = bus.subscribeSubject<ListenResultMessage>(
			listenResultSubject(sessionId, message.deliveryId),
			(result) => {
				clearTimeout(timer);
				sub.unsubscribe();
				const ok =
					result.status !== null && result.status >= 200 && result.status < 300;
				resolve({
					ok,
					responseStatus: result.status,
					responseBody: truncate(result.body),
					durationMs: result.durationMs,
					error:
						result.error ??
						(ok ? null : `Local endpoint returned HTTP ${result.status}`),
				});
			},
			{ max: 1 },
		);

		bus.publishSubject(listenEventSubject(sessionId), message);
	});
}
