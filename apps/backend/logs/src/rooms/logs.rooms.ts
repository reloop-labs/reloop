/**
 * In-memory WebSocket rooms for live email-log updates on the dashboard.
 * Connections are grouped by organizationId.
 */

export type LogsWsClient = {
	id: string;
	readyState: number;
	send: (data: string) => void;
	userId?: string;
	organizationId?: string;
};

const orgRooms = new Map<string, Set<LogsWsClient>>();

export function joinOrgRoom(organizationId: string, client: LogsWsClient) {
	let room = orgRooms.get(organizationId);
	if (!room) {
		room = new Set();
		orgRooms.set(organizationId, room);
	}
	room.add(client);
	client.organizationId = organizationId;
}

export function leaveOrgRoom(organizationId: string, client: LogsWsClient) {
	const room = orgRooms.get(organizationId);
	if (room) {
		room.delete(client);
		if (room.size === 0) orgRooms.delete(organizationId);
	}
	if (client.organizationId === organizationId) {
		client.organizationId = undefined;
	}
}

export function removeClient(client: LogsWsClient) {
	if (client.organizationId) {
		leaveOrgRoom(client.organizationId, client);
	}
}

function safeSend(client: LogsWsClient, payload: unknown) {
	if (client.readyState !== 1) return;
	try {
		client.send(JSON.stringify(payload));
	} catch {
		// ignore closed/broken sockets
	}
}

export function sendToClient(client: LogsWsClient, payload: unknown) {
	safeSend(client, payload);
}

export function broadcastToOrg(organizationId: string, payload: unknown) {
	const room = orgRooms.get(organizationId);
	if (!room) return;

	for (const client of room) {
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
