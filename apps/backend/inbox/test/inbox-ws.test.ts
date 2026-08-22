import { describe, expect, it } from "bun:test";
import {
	broadcastToOrg,
	getConnectedClientCount,
	joinOrgRoom,
	leaveOrgRoom,
	removeClient,
	subscribeMailbox,
	unsubscribeMailbox,
	type InboxWsClient,
} from "../src/rooms/inbox.rooms";

describe("Inbox WebSocket Rooms", () => {
	it("correctly registers clients in organization rooms and broadcasts", () => {
		const messages1: string[] = [];
		const messages2: string[] = [];

		const client1: InboxWsClient = {
			id: "c1",
			readyState: 1,
			send: (msg) => messages1.push(msg),
			organizationId: undefined,
			subscribedMailboxes: new Set(),
		};

		const client2: InboxWsClient = {
			id: "c2",
			readyState: 1,
			send: (msg) => messages2.push(msg),
			organizationId: undefined,
			subscribedMailboxes: new Set(),
		};

		joinOrgRoom("org_123", client1);
		joinOrgRoom("org_123", client2);

		expect(getConnectedClientCount("org_123")).toBe(2);

		broadcastToOrg("org_123", { type: "test", hello: "world" });

		expect(messages1.length).toBe(1);
		expect(JSON.parse(messages1[0])).toEqual({ type: "test", hello: "world" });
		expect(messages2.length).toBe(1);

		// Mailbox specific filtering
		subscribeMailbox(client1, "mb_1");
		subscribeMailbox(client2, "mb_2");

		broadcastToOrg("org_123", { type: "mb_1_event" }, "mb_1");
		expect(messages1.length).toBe(2);
		expect(messages2.length).toBe(1); // client2 didn't receive mb_1 event

		unsubscribeMailbox(client1, "mb_1");
		removeClient(client1);
		removeClient(client2);

		expect(getConnectedClientCount("org_123")).toBe(0);
	});
});
