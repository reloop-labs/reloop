import { describe, expect, it } from "bun:test";
import {
	broadcastToOrg,
	getConnectedClientCount,
	joinOrgRoom,
	type LogsWsClient,
	leaveOrgRoom,
	removeClient,
} from "../src/rooms/logs.rooms";

describe("Logs WebSocket rooms", () => {
	it("registers clients in organization rooms and broadcasts", () => {
		const messages1: string[] = [];
		const messages2: string[] = [];
		const otherOrg: string[] = [];

		const client1: LogsWsClient = {
			id: "c1",
			readyState: 1,
			send: (msg) => messages1.push(msg),
		};
		const client2: LogsWsClient = {
			id: "c2",
			readyState: 1,
			send: (msg) => messages2.push(msg),
		};
		const client3: LogsWsClient = {
			id: "c3",
			readyState: 1,
			send: (msg) => otherOrg.push(msg),
		};

		joinOrgRoom("org_123", client1);
		joinOrgRoom("org_123", client2);
		joinOrgRoom("org_other", client3);

		expect(getConnectedClientCount("org_123")).toBe(2);
		expect(getConnectedClientCount()).toBe(3);

		broadcastToOrg("org_123", {
			type: "email_log_updated",
			data: { id: "em_1", status: "delivered" },
		});

		expect(messages1.length).toBe(1);
		expect(JSON.parse(messages1[0] ?? "")).toEqual({
			type: "email_log_updated",
			data: { id: "em_1", status: "delivered" },
		});
		expect(messages2.length).toBe(1);
		expect(otherOrg.length).toBe(0);

		leaveOrgRoom("org_123", client1);
		removeClient(client2);
		removeClient(client3);

		expect(getConnectedClientCount("org_123")).toBe(0);
		expect(getConnectedClientCount()).toBe(0);
	});

	it("skips clients that are not open", () => {
		const messages: string[] = [];
		const client: LogsWsClient = {
			id: "closed",
			readyState: 3,
			send: (msg) => messages.push(msg),
		};
		joinOrgRoom("org_closed", client);
		broadcastToOrg("org_closed", { type: "email_log_updated" });
		expect(messages.length).toBe(0);
		removeClient(client);
	});
});
