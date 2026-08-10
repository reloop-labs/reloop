import { describe, expect, test } from "bun:test";
import { getRateLimitInfo } from "./rate-limit-toast";

describe("getRateLimitInfo", () => {
	test("returns null for non-429 errors", () => {
		expect(getRateLimitInfo(new Error("nope"))).toBeNull();
		expect(
			getRateLimitInfo({
				response: { status: 400, data: { message: "Bad" } },
			}),
		).toBeNull();
	});

	test("reads retryAfter from response body", () => {
		expect(
			getRateLimitInfo({
				response: {
					status: 429,
					data: {
						message: "Too many requests",
						retryAfter: 17,
					},
				},
			}),
		).toEqual({
			retryAfter: 17,
			message: "Too many requests",
		});
	});

	test("falls back to Retry-After header", () => {
		expect(
			getRateLimitInfo({
				response: {
					status: 429,
					data: { message: "Too many requests" },
					headers: { "Retry-After": "9" },
				},
			}),
		).toEqual({
			retryAfter: 9,
			message: "Too many requests",
		});
	});

	test("defaults to 60s when 429 has no retry hint", () => {
		expect(
			getRateLimitInfo({
				status: 429,
				message: "Too many requests. Please try again later.",
			}),
		).toEqual({
			retryAfter: 60,
			message: "Too many requests. Please try again later.",
		});
	});
});
