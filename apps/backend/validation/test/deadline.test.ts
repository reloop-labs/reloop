import { describe, expect, test } from "bun:test";
import { withDeadline } from "../src/utils/deadline";

describe("withDeadline", () => {
	test("passes through a value that arrives in time", async () => {
		await expect(
			withDeadline(Promise.resolve("ok"), 100, "test"),
		).resolves.toBe("ok");
	});

	test("propagates the original rejection", async () => {
		await expect(
			withDeadline(Promise.reject(new Error("boom")), 100, "test"),
		).rejects.toThrow("boom");
	});

	test("rejects when the operation never settles", async () => {
		const never = new Promise<never>(() => {});
		await expect(withDeadline(never, 50, "Redis")).rejects.toThrow(
			"Redis did not respond within 50ms",
		);
	});

	test("gives up close to the deadline rather than much later", async () => {
		const started = Date.now();
		await withDeadline(new Promise<never>(() => {}), 50, "Redis").catch(
			() => {},
		);
		expect(Date.now() - started).toBeLessThan(500);
	});
});
