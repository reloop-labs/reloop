import { describe, expect, test } from "bun:test";
import {
	extractRequestApiKey,
	isOAuthBearer,
	isPlausibleApiKey,
	maskApiKey,
} from "../src/auth/api-key";
import { API_KEY } from "./helpers";

describe("isPlausibleApiKey", () => {
	test("accepts a Reloop key", () => {
		expect(isPlausibleApiKey(API_KEY)).toBe(true);
	});

	test("rejects a short key", () => {
		expect(isPlausibleApiKey("rl_prod_short")).toBe(false);
	});

	test("rejects keys with spaces or punctuation", () => {
		expect(isPlausibleApiKey("rl_prod_testkey 1234567890abcdefg")).toBe(false);
		expect(isPlausibleApiKey("rl_prod_testkey!1234567890abcdefg")).toBe(false);
	});

	test("rejects a key without an underscore", () => {
		expect(isPlausibleApiKey("abcdefghijklmnopqrstuvwxyz")).toBe(false);
	});
});

describe("maskApiKey", () => {
	test("keeps only the first twelve characters", () => {
		expect(maskApiKey(API_KEY)).toBe("rl_prod_test…");
	});

	test("fully masks a short value", () => {
		expect(maskApiKey("rl_prod_")).toBe("********");
	});
});

describe("extractRequestApiKey", () => {
	test("reads a Bearer token", () => {
		const request = new Request("http://localhost/mcp", {
			headers: { authorization: `Bearer ${API_KEY}` },
		});
		expect(extractRequestApiKey(request)).toBe(API_KEY);
	});

	test("accepts a lowercase bearer scheme", () => {
		const request = new Request("http://localhost/mcp", {
			headers: { authorization: `bearer ${API_KEY}` },
		});
		expect(extractRequestApiKey(request)).toBe(API_KEY);
	});

	test("reads the x-api-key header", () => {
		const request = new Request("http://localhost/mcp", {
			headers: { "x-api-key": API_KEY },
		});
		expect(extractRequestApiKey(request)).toBe(API_KEY);
	});

	test("returns undefined without credentials", () => {
		expect(
			extractRequestApiKey(new Request("http://localhost/mcp")),
		).toBeUndefined();
	});

	test("ignores a non-Bearer scheme", () => {
		const request = new Request("http://localhost/mcp", {
			headers: { authorization: "Basic xyz" },
		});
		expect(extractRequestApiKey(request)).toBeUndefined();
	});
});

describe("isOAuthBearer", () => {
	const jwt = "eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiJ1c2VyLTEifQ.c2lnbmF0dXJl";

	test("accepts a JWT-shaped token", () => {
		expect(isOAuthBearer(jwt)).toBe(true);
	});

	test("rejects API keys and malformed tokens", () => {
		expect(isOAuthBearer(API_KEY)).toBe(false);
		expect(isOAuthBearer("nope")).toBe(false);
		expect(isOAuthBearer("a.b")).toBe(false);
		expect(isOAuthBearer("a..c")).toBe(false);
		expect(isOAuthBearer("a.b.c.d")).toBe(false);
	});
});
