import { createId } from "@paralleldrive/cuid2";
import { bus } from "@reloop/bus";
import { WebhookErrors } from "@reloop/webhook/error/webhook.error-response";
import { log } from "evlog";
import {
	getListenSession,
	LISTEN_HEARTBEAT_MS,
	type ListenEventMessage,
	type ListenResultMessage,
	type ListenSession,
	listenEventSubject,
	listenResultSubject,
	removeListenSession,
	saveListenSession,
} from "./listen.store";

const encoder = new TextEncoder();

const sseEvent = (event: string, data: unknown) =>
	`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

/**
 * Open the SSE stream a `reloop webhooks listen` session reads from. The
 * session lives exactly as long as the stream: closing it unsubscribes from
 * NATS and removes presence.
 */
export function openListenStream({
	organizationId,
	userId,
	forwardTo,
	client,
	signal,
}: {
	organizationId: string;
	userId: string;
	forwardTo: string | null;
	client: string | null;
	signal: AbortSignal;
}): Response {
	const session: ListenSession = {
		sessionId: `wls_${createId()}`,
		organizationId,
		userId,
		forwardTo,
		client,
		connectedAt: new Date().toISOString(),
	};

	let closed = false;
	let heartbeat: ReturnType<typeof setInterval> | undefined;
	let unsubscribe: (() => void) | undefined;

	const close = () => {
		if (closed) return;
		closed = true;
		clearInterval(heartbeat);
		unsubscribe?.();
		void removeListenSession(session);
		log.info({
			message: "Webhook listener disconnected",
			sessionId: session.sessionId,
			organizationId,
		});
	};

	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			const send = (chunk: string) => {
				if (closed) return;
				try {
					controller.enqueue(encoder.encode(chunk));
				} catch {
					close();
				}
			};

			await saveListenSession(session);
			const sub = bus.subscribeSubject<ListenEventMessage>(
				listenEventSubject(session.sessionId),
				(message) => send(sseEvent("webhook", message)),
			);
			unsubscribe = () => sub.unsubscribe();

			send(
				sseEvent("ready", {
					sessionId: session.sessionId,
					heartbeatMs: LISTEN_HEARTBEAT_MS,
				}),
			);

			heartbeat = setInterval(() => {
				send(": ping\n\n");
				void saveListenSession(session);
			}, LISTEN_HEARTBEAT_MS);

			signal.addEventListener("abort", close, { once: true });
			log.info({
				message: "Webhook listener connected",
				sessionId: session.sessionId,
				organizationId,
			});
		},
		cancel: close,
	});

	return new Response(stream, {
		headers: {
			"content-type": "text/event-stream; charset=utf-8",
			"cache-control": "no-cache, no-transform",
			connection: "keep-alive",
			"x-accel-buffering": "no",
		},
	});
}

export async function reportListenResult({
	sessionId,
	organizationId,
	result,
}: {
	sessionId: string;
	organizationId: string;
	result: ListenResultMessage;
}) {
	const session = await getListenSession(sessionId, organizationId);
	if (!session) {
		throw WebhookErrors.listenerOffline(sessionId);
	}
	bus.publishSubject(listenResultSubject(sessionId, result.deliveryId), result);
	return { received: true };
}
