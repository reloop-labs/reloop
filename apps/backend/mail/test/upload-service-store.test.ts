import { describe, expect, mock, test } from "bun:test";
import { createUploadServiceStore } from "../src/lib/resolve-attachments";

const KEY = "uploads/2026/08/ny98eiiwx0rri30is799mkxk.pdf";
const PDF_BYTES = Buffer.from("%PDF-1.4 via upload service");

describe("createUploadServiceStore", () => {
	test("loads attachment bytes from the upload service", async () => {
		const fetchMock = mock(
			async (input: RequestInfo | URL, init?: RequestInit) => {
				const url = String(input);
				expect(url).toContain(
					`/v1/files/content?path=${encodeURIComponent(KEY)}`,
				);
				const headers = new Headers(init?.headers);
				expect(headers.get("cookie")).toBe("reloop.session_token=abc");
				expect(headers.get("user-agent")).toBe("ReloopMail/1.0");
				expect(headers.get("x-internal-secret")).toBeNull();
				return new Response(PDF_BYTES, {
					status: 200,
					headers: { "content-type": "application/pdf" },
				});
			},
		);

		const store = createUploadServiceStore({
			cookie: "reloop.session_token=abc",
			baseUrl: "http://upload.internal/api/upload",
			fetchImpl: fetchMock,
		});

		await expect(store.get(KEY)).resolves.toEqual(PDF_BYTES);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	test("forwards the API key when there is no cookie", async () => {
		const fetchMock = mock(
			async (_input: RequestInfo | URL, init?: RequestInit) => {
				const headers = new Headers(init?.headers);
				expect(headers.get("x-api-key")).toBe("re_test");
				expect(headers.get("cookie")).toBeNull();
				return new Response(PDF_BYTES, { status: 200 });
			},
		);
		const store = createUploadServiceStore({
			apiKey: "re_test",
			baseUrl: "http://upload.internal/api/upload",
			fetchImpl: fetchMock,
		});
		await expect(store.get(KEY)).resolves.toEqual(PDF_BYTES);
	});

	test("surfaces upload-service failures", async () => {
		const store = createUploadServiceStore({
			cookie: "reloop.session_token=abc",
			baseUrl: "http://upload.internal/api/upload",
			fetchImpl: async () =>
				new Response(JSON.stringify({ message: "File not found" }), {
					status: 404,
				}),
		});

		await expect(store.get(KEY)).rejects.toThrow(/404/);
	});
});
