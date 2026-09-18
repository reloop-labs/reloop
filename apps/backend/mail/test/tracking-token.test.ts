import { describe, expect, test } from "bun:test";
import {
	type ClickTrackingPayload,
	decodeTrackingToken,
	encodeTrackingToken,
} from "../src/lib/crypto";

const secret = "test_tracking_secret";

describe("tracking tokens", () => {
	test("round-trips tracked and redirect-only links", () => {
		const tracked = encodeTrackingToken(
			{ id: "log_1", url: "https://example.com/a?x=1" },
			secret,
		);
		expect(decodeTrackingToken<ClickTrackingPayload>(tracked, secret)).toEqual({
			id: "log_1",
			url: "https://example.com/a?x=1",
		});

		const untracked = encodeTrackingToken(
			{ id: "log_1", url: "https://example.com/a?x=1", nt: 1 },
			secret,
		);
		expect(
			decodeTrackingToken<ClickTrackingPayload>(untracked, secret),
		).toEqual({ id: "log_1", url: "https://example.com/a?x=1", nt: 1 });
	});

	test("rejects unsigned and tampered tokens", () => {
		const unsigned = Buffer.from(
			JSON.stringify({ url: "https://evil.example/phish" }),
		).toString("base64url");
		expect(decodeTrackingToken(unsigned, secret)).toBeNull();

		const tracked = encodeTrackingToken(
			{ id: "log_1", url: "https://example.com/a" },
			secret,
		);
		const parsed = JSON.parse(Buffer.from(tracked, "base64url").toString());
		const flipped = Buffer.from(JSON.stringify({ ...parsed, nt: 1 })).toString(
			"base64url",
		);
		expect(decodeTrackingToken(flipped, secret)).toBeNull();
		const retargeted = Buffer.from(
			JSON.stringify({ ...parsed, url: "https://evil.example/" }),
		).toString("base64url");
		expect(decodeTrackingToken(retargeted, secret)).toBeNull();

		const untracked = encodeTrackingToken(
			{ id: "log_1", url: "https://example.com/a", nt: 1 },
			secret,
		);
		const { nt: _nt, ...rest } = JSON.parse(
			Buffer.from(untracked, "base64url").toString(),
		);
		const promoted = Buffer.from(
			JSON.stringify({ ...rest, url: "https://example.com/a:nt" }),
		).toString("base64url");
		expect(decodeTrackingToken(promoted, secret)).toBeNull();
		const prefixed = Buffer.from(
			JSON.stringify({ ...rest, url: "nt:log_1:https://example.com/a" }),
		).toString("base64url");
		expect(decodeTrackingToken(prefixed, secret)).toBeNull();
	});
});
