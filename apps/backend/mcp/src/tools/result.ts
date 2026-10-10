import type { CallToolResult } from "@modelcontextprotocol/server";
import type { ReloopError } from "../errors/reloop-error";

export function okResult(data: Record<string, unknown>): CallToolResult {
	return {
		content: [{ type: "text", text: JSON.stringify(data) }],
		structuredContent: data,
	};
}

export function errorResult(error: ReloopError): CallToolResult {
	return {
		content: [
			{ type: "text", text: JSON.stringify({ error: error.toJSON() }) },
		],
		isError: true,
	};
}
