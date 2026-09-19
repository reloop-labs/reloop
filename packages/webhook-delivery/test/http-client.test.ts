import { describe, expect, test } from "bun:test";
import http from "node:http";
import { requestPinned } from "../src/http-client";

describe("requestPinned", () => {
	test("resolves bracketed IPv6 literal hosts without DNS", async () => {
		const server = http.createServer((_req, res) => {
			res.writeHead(200, { "Content-Type": "text/plain" });
			res.end("ok");
		});

		await new Promise<void>((resolve, reject) => {
			server.once("error", reject);
			server.listen(0, "::1", () => resolve());
		});

		const addr = server.address();
		if (!addr || typeof addr === "string") {
			server.close();
			throw new Error("expected TCP listen address");
		}

		try {
			const result = await requestPinned({
				url: `http://[::1]:${addr.port}/`,
				method: "GET",
				allowHttp: true,
				allowPrivate: true,
			});
			expect(result.status).toBe(200);
			expect(result.body).toBe("ok");
			expect(result.resolved.pinnedIp).toBe("::1");
			expect(result.resolved.family).toBe(6);
		} finally {
			await new Promise<void>((resolve, reject) => {
				server.close((err) => (err ? reject(err) : resolve()));
			});
		}
	});
});
