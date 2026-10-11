import { describe, expect, test } from "bun:test";
import type { Domain } from "../src/reloop/types";
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

function domainFixture(over: Partial<Domain> = {}): Domain {
	return {
		object: "domain",
		id: "dom_123",
		domain: "send.example.com",
		status: "pending",
		isClickTrackingEnabled: true,
		isOpenTrackingEnabled: false,
		isSendingEmailEnabled: true,
		isReceivingEmailEnabled: false,
		tls: "opportunistic",
		verificationFailedReason: null,
		dailyCap: 500,
		sentToday: 12,
		dnsRecords: [
			{
				id: "dns_1",
				recordType: "TXT",
				recordTypeName: "DKIM",
				domain: "send.example.com",
				name: "reloop._domainkey.send",
				value: "p=MIGf",
				ttl: "Auto",
				priority: null,
				verificationError: null,
				purpose: "sending",
				status: "pending",
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-01T00:00:00.000Z",
			},
		],
		lastVerifiedAt: null,
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

describe("list_domains", () => {
	test("forwards filters and omits dns records", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: "/api/domain/v1/list",
					body: {
						object: "domain",
						domains: [
							domainFixture({ dailyCap: undefined, sentToday: undefined }),
						],
						total: 1,
						page: 1,
						limit: 20,
						event: "domain.listed",
					},
				},
			],
			"list_domains",
			{ search: "example", status: "pending" },
		);
		expect(onlyCall(calls).query).toEqual({
			page: "1",
			limit: "20",
			q: "example",
			status: "pending",
		});
		const data = structuredContent(result);
		const domains = readProperty(data, "domains");
		if (!Array.isArray(domains)) {
			throw new Error("expected domains");
		}
		expect(domains[0]).toEqual({
			id: "dom_123",
			domain: "send.example.com",
			status: "pending",
			sendingEmail: true,
			receivingEmail: false,
			clickTracking: true,
			openTracking: false,
			tls: "opportunistic",
			verificationFailedReason: null,
			dailyCap: null,
			sentToday: null,
			lastVerifiedAt: null,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-02T00:00:00.000Z",
		});
		expect(readProperty(readProperty(data, "pagination"), "hasMore")).toBe(
			false,
		);
	});
});

describe("get_domain", () => {
	test("returns the dns records to create", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/domain/v1/dom_123",
					body: domainFixture(),
				},
			],
			"get_domain",
			{ id: "dom_123" },
		);
		const domain = readProperty(structuredContent(result), "domain");
		expect(readProperty(domain, "dnsRecords")).toEqual([
			{
				type: "TXT",
				name: "reloop._domainkey.send",
				value: "p=MIGf",
				ttl: "Auto",
				priority: null,
				purpose: "sending",
				status: "pending",
				verificationError: null,
			},
		]);
	});

	test("maps 404 to domain_not_found", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/domain/v1/dom_missing",
					status: 404,
					body: { message: "Domain not found" },
				},
			],
			"get_domain",
			{ id: "dom_missing" },
		);
		expect(readProperty(errorJson(result), "code")).toBe("domain_not_found");
	});
});

describe("create_domain", () => {
	test("normalizes the name and maps settings to snake_case", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/domain/v1/create",
					status: 201,
					body: domainFixture(),
				},
			],
			"create_domain",
			{ domain: " Send.Example.com ", openTracking: false, tls: "enforced" },
		);
		expect(onlyCall(calls).body).toEqual({
			domain: "send.example.com",
			open_tracking: false,
			tls: "enforced",
		});
		expect(
			readProperty(readProperty(structuredContent(result), "domain"), "status"),
		).toBe("pending");
	});

	test("rejects a malformed domain without calling Reloop", async () => {
		const { calls, result } = await call([], "create_domain", {
			domain: "not a domain",
		});
		expect(readProperty(result, "isError")).toBe(true);
		expect(calls).toHaveLength(0);
	});

	test("maps 409 to domain_already_exists", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: "/api/domain/v1/create",
					status: 409,
					body: { message: "Domain already exists" },
				},
			],
			"create_domain",
			{ domain: "send.example.com" },
		);
		expect(readProperty(errorJson(result), "code")).toBe(
			"domain_already_exists",
		);
	});
});

describe("update_domain", () => {
	test("patches only the passed settings", async () => {
		const { calls } = await call(
			[
				{
					method: "PATCH",
					path: "/api/domain/v1/dom_123",
					body: domainFixture({ isReceivingEmailEnabled: true }),
				},
			],
			"update_domain",
			{ id: "dom_123", receivingEmail: true },
		);
		expect(onlyCall(calls).body).toEqual({ receiving_email: true });
	});

	test("requires at least one setting", async () => {
		const { calls, result } = await call([], "update_domain", {
			id: "dom_123",
		});
		expect(readProperty(result, "isError")).toBe(true);
		expect(calls).toHaveLength(0);
	});
});

describe("verify_domain", () => {
	test("reports verified when the domain becomes active", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/domain/v1/verify/dom_123",
					body: { id: "dom_123", status: "active", event: "domain.verified" },
				},
			],
			"verify_domain",
			{ id: "dom_123" },
		);
		expect(onlyCall(calls).method).toBe("POST");
		expect(structuredContent(result)).toEqual({
			id: "dom_123",
			status: "active",
			verified: true,
		});
	});

	test("reports not verified while dns is still propagating", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: "/api/domain/v1/verify/dom_123",
					body: { id: "dom_123", status: "verifying" },
				},
			],
			"verify_domain",
			{ id: "dom_123" },
		);
		expect(readProperty(structuredContent(result), "verified")).toBe(false);
	});
});

describe("delete_domain", () => {
	test("confirms the deleted id", async () => {
		const { calls, result } = await call(
			[
				{
					method: "DELETE",
					path: "/api/domain/v1/dom_123",
					body: domainFixture(),
				},
			],
			"delete_domain",
			{ id: "dom_123" },
		);
		expect(onlyCall(calls).method).toBe("DELETE");
		expect(structuredContent(result)).toEqual({ deleted: true, id: "dom_123" });
	});
});
