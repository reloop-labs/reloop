import { describe, expect, test } from "bun:test";
import { renderToolsMarkdown } from "../scripts/render-tools";
import { tools } from "../src/tools/index";

const README = await Bun.file(new URL("../README.md", import.meta.url)).text();

const ENV_NAMES = [
	"RELOOP_API_KEY",
	"RELOOP_BASE_URL",
	"RELOOP_TIMEOUT_MS",
	"HOST",
	"PORT",
	"MCP_ALLOWED_HOSTS",
	"MCP_ALLOWED_ORIGINS",
	"LOG_LEVEL",
];

function toolsSection(readme: string): string {
	const lines = readme.split("\n");
	const start = lines.indexOf("## Tools");
	if (start === -1) {
		throw new Error("README has no ## Tools section");
	}
	const rest = lines.slice(start + 1);
	const end = rest.findIndex((line) => line.startsWith("## "));
	return (end === -1 ? rest : rest.slice(0, end)).join("\n");
}

function jsonBlocks(readme: string): string[] {
	const blocks: string[] = [];
	const pattern = /```json\n([\s\S]*?)```/g;
	let match = pattern.exec(readme);
	while (match !== null) {
		if (match[1] !== undefined) {
			blocks.push(match[1]);
		}
		match = pattern.exec(readme);
	}
	return blocks;
}

describe("README", () => {
	test("the Tools section matches the tool definitions", () => {
		expect(toolsSection(README).trim()).toBe(renderToolsMarkdown().trim());
	});

	test("every json example parses", () => {
		const blocks = jsonBlocks(README);
		expect(blocks.length).toBeGreaterThan(0);
		for (const block of blocks) {
			expect(() => JSON.parse(block)).not.toThrow();
		}
	});

	test("documents every tool", () => {
		for (const tool of tools) {
			expect(README).toContain(tool.name);
		}
	});

	test("documents every environment variable", () => {
		for (const name of ENV_NAMES) {
			expect(README).toContain(name);
		}
	});
});
