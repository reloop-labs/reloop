import { describe, expect, test } from "bun:test";
import type { ApiKeyScope } from "@reloop/db/api-key-scope";
import {
	checkPendingSendAuthorization,
	type PendingKeyState,
	pendingSendBlockReason,
} from "../src/lib/pending-send-authorization";
import {
	broadcastToOrg,
	clientMayReceive,
	type InboxWsClient,
	joinOrgRoom,
	removeClient,
} from "../src/rooms/inbox.rooms";

const NOW = new Date("2026-10-26T12:00:00Z");

const unrestricted: ApiKeyScope = { restricted: false, entries: [] };
const agentsOnly: ApiKeyScope = {
	restricted: true,
	entries: [{ domain: "agents.acme.com", email: null, domainDeleted: false }],
};

const activeKey: NonNullable<PendingKeyState> = {
	enabled: true,
	deletedAt: null,
	expiresAt: null,
	organizationId: "org_1",
};

function reason(
	key: PendingKeyState,
	keyScope: ApiKeyScope = unrestricted,
	fromAddress: string | null = "bot@agents.acme.com",
): string | null {
	return pendingSendBlockReason({
		organizationId: "org_1",
		fromAddress,
		key,
		keyScope,
		now: NOW,
	});
}

describe("pendingSendBlockReason", () => {
	test("allows an active key that still covers the address", () => {
		expect(reason(activeKey)).toBeNull();
		expect(reason(activeKey, agentsOnly)).toBeNull();
	});

	test("blocks a deleted key", () => {
		expect(reason(null)).toContain("deleted");
		expect(reason({ ...activeKey, deletedAt: NOW })).toContain("deleted");
	});

	test("blocks a disabled key", () => {
		expect(reason({ ...activeKey, enabled: false })).toContain("disabled");
	});

	test("blocks an expired key", () => {
		expect(
			reason({ ...activeKey, expiresAt: new Date("2026-10-26T11:59:59Z") }),
		).toContain("expired");
	});

	test("allows a key that expires later", () => {
		expect(
			reason({ ...activeKey, expiresAt: new Date("2026-10-27T00:00:00Z") }),
		).toBeNull();
	});

	test("blocks a key from another organization", () => {
		expect(reason({ ...activeKey, organizationId: "org_2" })).toContain(
			"organization",
		);
	});

	test("blocks when the key was restricted away from the address", () => {
		expect(reason(activeKey, agentsOnly, "support@acme.com")).toContain(
			"support@acme.com",
		);
	});

	test("blocks when the mailbox is gone", () => {
		expect(reason(activeKey, unrestricted, null)).toContain("mailbox");
	});
});

describe("checkPendingSendAuthorization", () => {
	test("sends queued from a session are never blocked", async () => {
		expect(
			await checkPendingSendAuthorization({
				organizationId: "org_1",
				mailboxId: "mbx_1",
			}),
		).toBeNull();
	});
});

function makeClient(id: string, inbox: string[]): InboxWsClient {
	return {
		id,
		readyState: 1,
		send: (msg) => inbox.push(msg),
		subscribedMailboxes: new Set(),
	};
}

describe("WebSocket mailbox scope", () => {
	test("clientMayReceive", () => {
		const open = makeClient("open", []);
		const scoped = makeClient("scoped", []);
		scoped.allowedMailboxes = new Set(["mbx_agent"]);

		expect(clientMayReceive(open, "mbx_support")).toBe(true);
		expect(clientMayReceive(open, null)).toBe(true);
		expect(clientMayReceive(scoped, "mbx_agent")).toBe(true);
		expect(clientMayReceive(scoped, "mbx_support")).toBe(false);
		expect(clientMayReceive(scoped, null)).toBe(false);
		expect(clientMayReceive(scoped, undefined)).toBe(false);
	});

	test("restricted sockets in the org room only hear about allowed mailboxes", () => {
		const openMsgs: string[] = [];
		const scopedMsgs: string[] = [];
		const open = makeClient("open", openMsgs);
		const scoped = makeClient("scoped", scopedMsgs);
		scoped.allowedMailboxes = new Set(["mbx_agent"]);

		joinOrgRoom("org_scope", open);
		joinOrgRoom("org_scope", scoped);

		broadcastToOrg("org_scope", { type: "agent" }, "mbx_agent");
		broadcastToOrg("org_scope", { type: "support" }, "mbx_support");
		broadcastToOrg("org_scope", { type: "no_mailbox" });

		expect(openMsgs.map((m) => JSON.parse(m).type)).toEqual([
			"agent",
			"support",
			"no_mailbox",
		]);
		expect(scopedMsgs.map((m) => JSON.parse(m).type)).toEqual(["agent"]);

		removeClient(open);
		removeClient(scoped);
	});
});
