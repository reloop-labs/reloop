import { beforeEach, describe, expect, mock, test } from "bun:test";

describe("useResendEmail API contract", () => {
	beforeEach(() => {
		mock.restore();
	});

	test("calls POST /api/mail/v1/resend/:id with credentials", async () => {
		const fetchMock = mock((url: string, init?: RequestInit) => {
			expect(url).toBe("/api/mail/v1/resend/em_test123");
			expect(init?.method).toBe("POST");
			expect(init?.credentials).toBe("include");
			return Promise.resolve(
				new Response(
					JSON.stringify({
						success: true,
						id: "em_test123_new",
						messageId: "msg_123",
						status: "pending",
						timestamp: "2026-08-21T12:00:00.000Z",
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } },
				),
			);
		});

		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const res = await fetch("/api/mail/v1/resend/em_test123", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		});
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.id).toBe("em_test123_new");
	});

	test("extracts why and fix on error response", async () => {
		const fetchMock = mock((_url: string, _init?: RequestInit) => {
			return Promise.resolve(
				new Response(
					JSON.stringify({
						message: "Email quota exceeded",
						why: "Your monthly limit of 3000 credits was reached.",
						fix: "Upgrade your billing plan to send more emails.",
					}),
					{ status: 402, headers: { "Content-Type": "application/json" } },
				),
			);
		});

		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const res = await fetch("/api/mail/v1/resend/em_failed", {
			method: "POST",
			credentials: "include",
		});
		const payload = await res.json();

		expect(res.status).toBe(402);
		expect(payload.message).toBe("Email quota exceeded");
		expect(payload.why).toContain("monthly limit");
		expect(payload.fix).toContain("Upgrade your billing plan");
	});
});
