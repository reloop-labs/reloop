import { redis } from "@reloop/webhook/utils/loader";

/**
 * Relay for `reloop webhooks listen`.
 *
 * The CLI holds an SSE stream open on one webhook replica. Whichever replica
 * handles "send test event" publishes to the session's NATS subject; the
 * replica holding the stream pushes it down. The CLI forwards the request to
 * its local URL and POSTs the result back (to any replica), which publishes
 * it on the per-delivery result subject the sender is waiting on.
 *
 * Redis only tracks which sessions are online, so the dashboard can list them.
 */

/** Presence TTL; refreshed by the stream heartbeat. */
export const LISTEN_SESSION_TTL_SECONDS = 45;
export const LISTEN_HEARTBEAT_MS = 15_000;
/** How long the sender waits for the CLI's result (CLI forward timeout is 10s). */
export const LISTEN_RESULT_TIMEOUT_MS = 15_000;

export type ListenSession = {
	sessionId: string;
	organizationId: string;
	userId: string;
	forwardTo: string | null;
	client: string | null;
	connectedAt: string;
};

/** Pushed to the CLI as an SSE `webhook` event. */
export type ListenEventMessage = {
	deliveryId: string;
	eventId: string;
	eventType: string;
	headers: Record<string, string>;
	rawBody: string;
};

/** Reported back by the CLI after forwarding. */
export type ListenResultMessage = {
	deliveryId: string;
	status: number | null;
	body: string | null;
	durationMs: number;
	error: string | null;
};

export const listenEventSubject = (sessionId: string) =>
	`webhook.listen.${sessionId}.event`;

export const listenResultSubject = (sessionId: string, deliveryId: string) =>
	`webhook.listen.${sessionId}.result.${deliveryId}`;

const sessionKey = (sessionId: string) => `listen:session:${sessionId}`;
const orgSessionKey = (organizationId: string, sessionId: string) =>
	`listen:org:${organizationId}:${sessionId}`;

export async function saveListenSession(session: ListenSession) {
	await Promise.all([
		redis.set(
			sessionKey(session.sessionId),
			session,
			LISTEN_SESSION_TTL_SECONDS,
		),
		redis.set(
			orgSessionKey(session.organizationId, session.sessionId),
			session,
			LISTEN_SESSION_TTL_SECONDS,
		),
	]);
}

export async function removeListenSession(session: ListenSession) {
	await redis.deleteMany([
		sessionKey(session.sessionId),
		orgSessionKey(session.organizationId, session.sessionId),
	]);
}

/** The session, only if it is online and belongs to the organization. */
export async function getListenSession(
	sessionId: string,
	organizationId: string,
): Promise<ListenSession | null> {
	const session = await redis.get<ListenSession>(sessionKey(sessionId));
	if (!session || session.organizationId !== organizationId) return null;
	return session;
}

export async function listListenSessions(
	organizationId: string,
): Promise<ListenSession[]> {
	const keys = await redis.keys(`listen:org:${organizationId}:*`);
	const sessions = await Promise.all(
		keys.map((key) => redis.get<ListenSession>(key)),
	);
	return sessions
		.filter((s): s is ListenSession => Boolean(s))
		.sort((a, b) => b.connectedAt.localeCompare(a.connectedAt));
}
