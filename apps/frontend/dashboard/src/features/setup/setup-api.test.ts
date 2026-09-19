import { afterEach, describe, expect, test, vi } from "vitest";
import {
	completeSetup,
	fetchSetupStatus,
	SetupRequestError,
} from "./setup-api";

function mockFetch(response: Response) {
	const fetchMock = vi.fn().mockResolvedValue(response);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("fetchSetupStatus", () => {
	test("treats 404 as not required so cloud never shows the wizard", async () => {
		mockFetch(new Response(null, { status: 404 }));

		await expect(fetchSetupStatus()).resolves.toEqual({
			required: false,
			reason: "not_required",
		});
	});

	test("returns required when the instance still needs setup", async () => {
		mockFetch(jsonResponse({ required: true, reason: "ready" }));

		await expect(fetchSetupStatus()).resolves.toEqual({
			required: true,
			reason: "ready",
		});
	});

	test("keeps transient HTTP failures as errors so the client can retry", async () => {
		mockFetch(new Response(null, { status: 503 }));

		await expect(fetchSetupStatus()).rejects.toMatchObject({
			name: "SetupRequestError",
			status: 503,
		});
	});

	test("rejects a malformed success body instead of hiding setup", async () => {
		mockFetch(new Response("not json", { status: 200 }));

		await expect(fetchSetupStatus()).rejects.toMatchObject({
			name: "SetupRequestError",
			status: 200,
		});
	});
});

describe("completeSetup", () => {
	test("omits empty optional fields and keeps the signup flag", async () => {
		const fetchMock = mockFetch(jsonResponse({ user: { id: "user_1" } }));

		await completeSetup({
			adminKey: " key ",
			name: " Steve Jobs ",
			email: " steve@apple.com ",
			password: "correct horse battery",
			disableSignup: true,
			organizationName: "   ",
			appName: "",
		});

		const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
		expect(body).toEqual({
			adminKey: "key",
			name: "Steve Jobs",
			email: "steve@apple.com",
			password: "correct horse battery",
			disableSignup: true,
		});
	});

	test("sends optional fields when provided", async () => {
		const fetchMock = mockFetch(jsonResponse({ user: { id: "user_1" } }));

		await completeSetup({
			adminKey: "key",
			name: "Steve Jobs",
			email: "steve@apple.com",
			password: "correct horse battery",
			disableSignup: false,
			organizationName: " Apple ",
			appName: " Apple Mail ",
		});

		const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
		expect(body.organizationName).toBe("Apple");
		expect(body.appName).toBe("Apple Mail");
		expect(body.disableSignup).toBe(false);
	});

	test("surfaces an invalid setup key as a 403 error", async () => {
		mockFetch(jsonResponse({ message: "Invalid setup key" }, 403));

		await expect(
			completeSetup({
				adminKey: "wrong",
				name: "Steve Jobs",
				email: "steve@apple.com",
				password: "correct horse battery",
				disableSignup: true,
			}),
		).rejects.toMatchObject({
			name: "SetupRequestError",
			status: 403,
			message: "Invalid setup key",
		});
	});

	test("reports an already-completed instance on 404", async () => {
		mockFetch(new Response(null, { status: 404 }));

		const error = await completeSetup({
			adminKey: "key",
			name: "Steve Jobs",
			email: "steve@apple.com",
			password: "correct horse battery",
			disableSignup: true,
		}).catch((caught: unknown) => caught);

		expect(error).toBeInstanceOf(SetupRequestError);
		expect((error as SetupRequestError).status).toBe(404);
	});
});
