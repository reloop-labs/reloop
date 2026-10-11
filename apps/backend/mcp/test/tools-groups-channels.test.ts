import { describe, expect, test } from "bun:test";
import type { Channel, Group } from "../src/reloop/types";
import { createHttpHandler } from "../src/transports/http";
import {
	connectHttpClient,
	errorJson,
	mockReloop,
	type RecordedCall,
	type Route,
	readProperty,
	silentLogger,
	structuredContent,
	testConfig,
} from "./helpers";

function groupFixture(over: Partial<Group> = {}): Group {
	return {
		object: "contact_group",
		id: "grp_1",
		name: "Beta",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
		createdBy: {
			id: "usr_1",
			name: "Luna",
			email: "luna@example.com",
			image: null,
		},
		...over,
	};
}

function channelFixture(over: Partial<Channel> = {}): Channel {
	return {
		object: "channel",
		id: "chn_1",
		name: "Product",
		description: null,
		defaultSubscription: "opt_in",
		visibility: "public",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
		...over,
	};
}

function harness(routes: Route[]) {
	const mock = mockReloop(routes);
	const handler = createHttpHandler({
		config: testConfig(),
		logger: silentLogger(),
		fetch: mock.fetch,
	});
	return { calls: mock.calls, handler };
}

function onlyCall(calls: RecordedCall[]): RecordedCall {
	expect(calls).toHaveLength(1);
	const call = calls[0];
	if (call === undefined) {
		throw new Error("expected one upstream call");
	}
	return call;
}

async function call(routes: Route[], name: string, args: object) {
	const { calls, handler } = harness(routes);
	const { client, close } = await connectHttpClient(handler);
	const result = await client.callTool({ name, arguments: { ...args } });
	await close();
	await handler.close();
	return { calls, result };
}

describe("groups", () => {
	test("list_groups forwards search and maps creators", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: "/api/contacts/v1/groups/list",
					body: {
						object: "contact_group",
						groups: [groupFixture({ object: undefined, createdBy: undefined })],
						total: 1,
						page: 1,
						limit: 20,
						event: "group.listed",
					},
				},
			],
			"list_groups",
			{ search: "beta" },
		);
		expect(onlyCall(calls).query).toEqual({
			page: "1",
			limit: "20",
			search: "beta",
		});
		const groups = readProperty(structuredContent(result), "groups");
		expect(groups).toEqual([
			{
				id: "grp_1",
				name: "Beta",
				createdBy: null,
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-02T00:00:00.000Z",
			},
		]);
	});

	test("get_group maps 404 to group_not_found", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/contacts/v1/groups/grp_missing",
					status: 404,
					body: { message: "Group not found", why: "x", fix: "y" },
				},
			],
			"get_group",
			{ id: "grp_missing" },
		);
		expect(readProperty(errorJson(result), "code")).toBe("group_not_found");
	});

	test("create_group posts the name and maps 409", async () => {
		const created = await call(
			[
				{
					method: "POST",
					path: "/api/contacts/v1/groups/create",
					status: 201,
					body: groupFixture({ event: "group.created" }),
				},
			],
			"create_group",
			{ name: " Beta " },
		);
		expect(onlyCall(created.calls).body).toEqual({ name: "Beta" });
		const duplicate = await call(
			[
				{
					method: "POST",
					path: "/api/contacts/v1/groups/create",
					status: 409,
					body: { message: "Group already exists", why: "x", fix: "y" },
				},
			],
			"create_group",
			{ name: "Beta" },
		);
		expect(readProperty(errorJson(duplicate.result), "code")).toBe(
			"group_already_exists",
		);
	});

	test("create_group rejects names over 50 characters", async () => {
		const { calls, result } = await call([], "create_group", {
			name: "x".repeat(51),
		});
		expect(readProperty(result, "isError")).toBe(true);
		expect(calls).toHaveLength(0);
	});

	test("update_group and delete_group hit the group route", async () => {
		const renamed = await call(
			[
				{
					method: "PATCH",
					path: "/api/contacts/v1/groups/grp_1",
					body: groupFixture({ name: "Alpha" }),
				},
			],
			"update_group",
			{ id: "grp_1", name: "Alpha" },
		);
		expect(onlyCall(renamed.calls).body).toEqual({ name: "Alpha" });
		const deleted = await call(
			[
				{
					method: "DELETE",
					path: "/api/contacts/v1/groups/grp_1",
					body: {
						object: "contact_group",
						success: true,
						id: "grp_1",
						name: "Beta",
						event: "group.deleted",
					},
				},
			],
			"delete_group",
			{ id: "grp_1" },
		);
		expect(structuredContent(deleted.result)).toEqual({
			deleted: true,
			id: "grp_1",
		});
	});

	test("list_group_contacts flattens members and counts", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: "/api/contacts/v1/groups/grp_1/contacts",
					body: {
						object: "contact_group",
						group: {
							id: "grp_1",
							name: "Beta",
							createdAt: "2026-01-01T00:00:00.000Z",
							updatedAt: "2026-01-02T00:00:00.000Z",
							contacts: [
								{
									id: "con_1",
									email: "luna@example.com",
									firstName: null,
									lastName: null,
									status: "subscribed",
									properties: {},
									createdAt: "2026-01-01T00:00:00.000Z",
									updatedAt: "2026-01-01T00:00:00.000Z",
								},
							],
						},
						total: 41,
						subscribedContacts: 40,
						unsubscribedContacts: 1,
						page: 2,
						limit: 20,
						event: "group.contacts.listed",
					},
				},
			],
			"list_group_contacts",
			{ id: "grp_1", page: 2, status: "subscribed" },
		);
		expect(onlyCall(calls).query).toEqual({
			page: "2",
			limit: "20",
			status: "subscribed",
		});
		const data = structuredContent(result);
		expect(readProperty(data, "group")).toEqual({ id: "grp_1", name: "Beta" });
		expect(readProperty(data, "counts")).toEqual({
			subscribed: 40,
			unsubscribed: 1,
		});
		expect(readProperty(readProperty(data, "pagination"), "hasMore")).toBe(
			true,
		);
	});

	test("add_contact_to_group sends the contact id", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/contacts/group/grp_1",
					body: {
						success: true,
						object: "contact",
						id: "con_1",
						groupId: "grp_1",
						groupName: "Beta",
						event: "contact.update",
					},
				},
			],
			"add_contact_to_group",
			{ groupId: "grp_1", contactId: "con_1" },
		);
		expect(onlyCall(calls).body).toEqual({ contact_id: "con_1" });
		expect(structuredContent(result)).toEqual({
			contactId: "con_1",
			groupId: "grp_1",
			groupName: "Beta",
		});
	});

	test("remove_contact_from_group sends the email in a DELETE body", async () => {
		const { calls, result } = await call(
			[
				{
					method: "DELETE",
					path: "/api/contacts/group/grp_1",
					body: {
						success: true,
						object: "contact",
						id: "con_1",
						event: "contact.update",
					},
				},
			],
			"remove_contact_from_group",
			{ groupId: "grp_1", email: "luna@example.com" },
		);
		expect(onlyCall(calls).body).toEqual({ email: "luna@example.com" });
		expect(structuredContent(result)).toEqual({
			contactId: "con_1",
			groupId: "grp_1",
			groupName: null,
		});
	});

	test("membership tools require exactly one contact selector", async () => {
		const both = await call([], "add_contact_to_group", {
			groupId: "grp_1",
			contactId: "con_1",
			email: "luna@example.com",
		});
		expect(readProperty(both.result, "isError")).toBe(true);
		const neither = await call([], "remove_contact_from_group", {
			groupId: "grp_1",
		});
		expect(readProperty(neither.result, "isError")).toBe(true);
		expect([...both.calls, ...neither.calls]).toHaveLength(0);
	});
});

describe("channels", () => {
	test("list_channels maps subscriber counts", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/contacts/v1/channels/list",
					body: {
						object: "channel",
						channels: [
							channelFixture({ object: undefined, subscriberCount: 7 }),
						],
						total: 1,
						page: 1,
						limit: 20,
						event: "channel.listed",
					},
				},
			],
			"list_channels",
			{},
		);
		expect(readProperty(structuredContent(result), "channels")).toEqual([
			{
				id: "chn_1",
				name: "Product",
				description: null,
				defaultSubscription: "opt_in",
				visibility: "public",
				subscriberCount: 7,
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-02T00:00:00.000Z",
			},
		]);
	});

	test("get_channel reports a missing subscriber count as null", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/contacts/v1/channels/chn_1",
					body: channelFixture(),
				},
			],
			"get_channel",
			{ id: "chn_1" },
		);
		expect(
			readProperty(
				readProperty(structuredContent(result), "channel"),
				"subscriberCount",
			),
		).toBeNull();
	});

	test("create_channel forwards settings in camelCase", async () => {
		const { calls } = await call(
			[
				{
					method: "POST",
					path: "/api/contacts/v1/channels/create",
					status: 201,
					body: channelFixture({ event: "channel.created" }),
				},
			],
			"create_channel",
			{ name: "Product", defaultSubscription: "opt_out", visibility: "public" },
		);
		expect(onlyCall(calls).body).toEqual({
			name: "Product",
			defaultSubscription: "opt_out",
			visibility: "public",
		});
	});

	test("update_channel requires a field and maps 409", async () => {
		const empty = await call([], "update_channel", { id: "chn_1" });
		expect(readProperty(empty.result, "isError")).toBe(true);
		expect(empty.calls).toHaveLength(0);
		const duplicate = await call(
			[
				{
					method: "PATCH",
					path: "/api/contacts/v1/channels/chn_1",
					status: 409,
					body: {
						message: "Channel with this name already exists",
						why: "x",
						fix: "y",
					},
				},
			],
			"update_channel",
			{ id: "chn_1", name: "News" },
		);
		expect(readProperty(errorJson(duplicate.result), "code")).toBe(
			"channel_already_exists",
		);
	});

	test("delete_channel confirms the deleted id", async () => {
		const { result } = await call(
			[
				{
					method: "DELETE",
					path: "/api/contacts/v1/channels/chn_1",
					body: {
						object: "channel",
						success: true,
						id: "chn_1",
						name: "Product",
						event: "channel.deleted",
					},
				},
			],
			"delete_channel",
			{ id: "chn_1" },
		);
		expect(structuredContent(result)).toEqual({ deleted: true, id: "chn_1" });
	});

	test("set_channel_subscription patches the contact's subscription", async () => {
		const { calls, result } = await call(
			[
				{
					method: "PATCH",
					path: "/api/contacts/channel/chn_1",
					body: {
						success: true,
						id: "con_1",
						status: "unenrolled",
						channelId: "chn_1",
						channelName: "Product",
						subscription: "opt_out",
						event: "contact.update",
					},
				},
			],
			"set_channel_subscription",
			{
				channelId: "chn_1",
				email: "luna@example.com",
				subscription: "opt_out",
			},
		);
		expect(onlyCall(calls).body).toEqual({
			email: "luna@example.com",
			subscription: "opt_out",
		});
		expect(structuredContent(result)).toEqual({
			contactId: "con_1",
			channelId: "chn_1",
			channelName: "Product",
			subscription: "opt_out",
			status: "unenrolled",
		});
	});
});
