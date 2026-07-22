import { describe, expect, test } from "bun:test";
import {
	extractVariablesFromContent,
	normalizeVariableName,
} from "../src/utils/extract-variables";

describe("normalizeVariableName", () => {
	test("strips triple braces (supported)", () => {
		expect(normalizeVariableName("{{{first_name}}}")).toBe("first_name");
	});

	test("strips double braces (supported)", () => {
		expect(normalizeVariableName("{{first_name}}")).toBe("first_name");
	});

	test("repairs corrupted single-brace leftovers (not a supported syntax)", () => {
		expect(normalizeVariableName("{first_name}")).toBe("first_name");
		expect(normalizeVariableName("{ns_record}")).toBe("ns_record");
	});

	test("passes through bare names", () => {
		expect(normalizeVariableName("first_name")).toBe("first_name");
	});
});

describe("extractVariablesFromContent", () => {
	test("finds TipTap variable nodes by attrs.name", () => {
		const content = [
			{
				type: "paragraph",
				content: [
					{ type: "text", text: "Hello " },
					{ type: "variable", attrs: { name: "first_name" } },
					{ type: "text", text: "!" },
				],
			},
		];

		expect(extractVariablesFromContent(content)).toEqual([
			"{{{first_name}}}",
		]);
	});

	test("finds triple-brace placeholders in text", () => {
		const content = [
			{
				type: "paragraph",
				content: [
					{ type: "text", text: "Hi {{{user.name}}} from {{{company}}}" },
				],
			},
		];

		expect(extractVariablesFromContent(content)).toEqual([
			"{{{company}}}",
			"{{{user.name}}}",
		]);
	});

	test("finds double-brace placeholders in text", () => {
		const content = [
			{
				type: "paragraph",
				content: [{ type: "text", text: "Hi {{first_name}}, NS {{ns_record}}" }],
			},
		];

		expect(extractVariablesFromContent(content)).toEqual([
			"{{{first_name}}}",
			"{{{ns_record}}}",
		]);
	});

	test("ignores single-brace text (unsupported)", () => {
		const content = [
			{
				type: "paragraph",
				content: [{ type: "text", text: "Hi {first_name}, keep {literal}" }],
			},
		];

		expect(extractVariablesFromContent(content)).toEqual([]);
	});

	test("dedupes the same variable from node and text", () => {
		const content = [
			{
				type: "paragraph",
				content: [
					{ type: "text", text: "{{{email}}}" },
					{ type: "variable", attrs: { name: "email" } },
				],
			},
		];

		expect(extractVariablesFromContent(content)).toEqual(["{{{email}}}"]);
	});
});
