/**
 * In-memory WebSocket rooms for live agent inbox notifications.
 * Manages connections grouped by organizationId and mailboxId.
 */

export type InboxWsClient = {
	id: string;
	readyState: number;
	send: (data: string) => void;
	userId?: string;
	organizationId?: string;
	subscribedMailboxes: Set<string>;
};

const orgRooms = new Map<string, Set<InboxWsClient>>();

export function joinOrgRoom(organizationId: string, client: InboxWsClient) {
	let room = orgRooms.get(organizationId);
	if (!room) {
		room = new Set();
		orgRooms.set(organizationId, room);
	}
	room.add(client);
	client.organizationId = organizationId;
}

export function leaveOrgRoom(organizationId: string, client: InboxWsClient) {
	const room = orgRooms.get(organizationId);
	if (room) {
		room.delete(client);
		if (room.size === 0) orgRooms.delete(organizationId);
	}
	if (client.organizationId === organizationId) {
		client.organizationId = undefined;
	}
}

export function subscribeMailbox(client: InboxWsClient, mailboxId: string) {
	client.subscribedMailboxes.add(mailboxId);
}

export function unsubscribeMailbox(client: InboxWsClient, mailboxId: string) {
	client.subscribedMailboxes.delete(mailboxId);
}

export function removeClient(client: InboxWsClient) {
	if (client.organizationId) {
		leaveOrgRoom(client.organizationId, client);
	}
	client.subscribedMailboxes.clear();
}

function safeSend(client: InboxWsClient, payload: unknown) {
	if (client.readyState !== 1) return;
	try {
		client.send(JSON.stringify(payload));
	} catch {
		// ignore closed/broken sockets
	}
}

export function sendToClient(client: InboxWsClient, payload: unknown) {
	safeSend(client, payload);
}

/**
 * Broadcasts an event to all connected clients belonging to an organization.
 * If mailboxId is provided, sends to clients who haven't filtered or who subscribed to this mailbox.
 */
export function broadcastToOrg(
	organizationId: string,
	payload: unknown,
	mailboxId?: string,
) {
	const room = orgRooms.get(organizationId);
	if (!room) return;

	for (const client of room) {
		// If client has subscribed to specific mailboxes, only send if matching
		if (
			mailboxId &&
			client.subscribedMailboxes.size > 0 &&
			!client.subscribedMailboxes.has(mailboxId)
		) {
			continue;
		}
		safeSend(client, payload);
	}
}

export function getConnectedClientCount(organizationId?: string): number {
	if (organizationId) {
		return orgRooms.get(organizationId)?.size ?? 0;
	}
	let total = 0;
	for (const set of orgRooms.values()) {
		total += set.size;
	}
	return total;
}
