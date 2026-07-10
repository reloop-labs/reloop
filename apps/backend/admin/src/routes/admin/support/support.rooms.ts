/** In-memory WebSocket rooms for live support chat. */

export type SupportWsClient = {
	id: string;
	readyState: number;
	send: (data: string) => void;
	userId?: string;
	isPlatformAdmin?: boolean;
	joinedConversations: Set<string>;
	inLobby: boolean;
};

const conversationRooms = new Map<string, Set<SupportWsClient>>();
const lobby = new Set<SupportWsClient>();

export function joinConversationRoom(
	conversationId: string,
	client: SupportWsClient,
) {
	let room = conversationRooms.get(conversationId);
	if (!room) {
		room = new Set();
		conversationRooms.set(conversationId, room);
	}
	room.add(client);
	client.joinedConversations.add(conversationId);
}

export function leaveConversationRoom(
	conversationId: string,
	client: SupportWsClient,
) {
	const room = conversationRooms.get(conversationId);
	if (room) {
		room.delete(client);
		if (room.size === 0) conversationRooms.delete(conversationId);
	}
	client.joinedConversations.delete(conversationId);
}

export function joinLobby(client: SupportWsClient) {
	lobby.add(client);
	client.inLobby = true;
}

export function leaveLobby(client: SupportWsClient) {
	lobby.delete(client);
	client.inLobby = false;
}

export function removeClient(client: SupportWsClient) {
	for (const conversationId of [...client.joinedConversations]) {
		leaveConversationRoom(conversationId, client);
	}
	leaveLobby(client);
}

function safeSend(client: SupportWsClient, payload: unknown) {
	if (client.readyState !== 1) return;
	try {
		client.send(JSON.stringify(payload));
	} catch {
		// ignore closed sockets
	}
}

export function broadcastToConversation(
	conversationId: string,
	payload: unknown,
) {
	const room = conversationRooms.get(conversationId);
	if (!room) return;
	for (const client of room) {
		safeSend(client, payload);
	}
}

export function broadcastToLobby(payload: unknown) {
	for (const client of lobby) {
		safeSend(client, payload);
	}
}

export function sendToClient(client: SupportWsClient, payload: unknown) {
	safeSend(client, payload);
}
