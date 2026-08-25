import { afterEach, describe, expect, mock, test } from "bun:test";
import {
	forwardToDeliverabilityTester,
	isDeliverabilityTesterRecipient,
	maybeForwardToDeliverabilityTester,
} from "../src/lib/deliverability-tester";

describe("isDeliverabilityTesterRecipient", () => {
	test("matches plus-tagged tester aliases on a real mailbox", () => {
		expect(
			isDeliverabilityTesterRecipient(
				"pluto+test-9862962d@mail-test.reloop.email",
			),
		).toBe(true);
	});

	test("matches a dedicated tester local-part", () => {
		expect(
			isDeliverabilityTesterRecipient("test-9862962d@mail-test.reloop.email"),
		).toBe(true);
	});

	test("ignores ordinary plus-aliases and unrelated addresses", () => {
		expect(
			isDeliverabilityTesterRecipient(
				"pluto+newsletter@mail-test.reloop.email",
			),
		).toBe(false);
		expect(
			isDeliverabilityTesterRecipient("pluto@mail-test.reloop.email"),
		).toBe(false);
		expect(isDeliverabilityTesterRecipient("send@support.reloop.sh")).toBe(
			false,
		);
	});
});

describe("maybeForwardToDeliverabilityTester", () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("posts raw MIME to the tools inject endpoint for tester recipients", async () => {
		const fetchMock = mock(async () => new Response("{}", { status: 200 }));
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const rawMime = `From: send@support.reloop.sh
To: pluto+test-9862962d@mail-test.reloop.email
Subject: Email six

Email six`;

		await maybeForwardToDeliverabilityTester(rawMime, [
			"pluto+test-9862962d@mail-test.reloop.email",
		]);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toContain("/api/tools/v1/deliverability-test/inject");
		expect(init.method).toBe("POST");
		const body = JSON.parse(String(init.body)) as { rawMime: string };
		expect(body.rawMime).toBe(rawMime);
	});

	test("does not call tools for ordinary inbound mail", async () => {
		const fetchMock = mock(async () => new Response("{}", { status: 200 }));
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await maybeForwardToDeliverabilityTester(
			"From: a@b.com\nTo: pluto@mail-test.reloop.email\n\nHi",
			["pluto@mail-test.reloop.email"],
		);

		expect(fetchMock).not.toHaveBeenCalled();
	});

	test("still forwards when To was rewritten but the plus-tag is in the MIME", async () => {
		const fetchMock = mock(async () => new Response("{}", { status: 200 }));
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const rawMime = `From: send@support.reloop.sh
To: pluto@mail-test.reloop.email
X-Original-To: pluto+test-9862962d@mail-test.reloop.email
Subject: Email six

Email six`;

		await maybeForwardToDeliverabilityTester(rawMime, [
			"pluto@mail-test.reloop.email",
		]);

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});

describe("forwardToDeliverabilityTester", () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("does not throw when tools is unreachable", async () => {
		globalThis.fetch = mock(async () => {
			throw new Error("connection refused");
		}) as unknown as typeof fetch;

		await expect(
			forwardToDeliverabilityTester("From: a@b.com\nTo: b@c.com\n\nHi"),
		).resolves.toBeUndefined();
	});
});
