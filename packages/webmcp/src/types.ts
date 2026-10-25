/**
 * Minimal typings for the WebMCP browser API (W3C WebML CG draft).
 * https://webmachinelearning.github.io/webmcp/
 */

export interface WebMcpToolAnnotations {
	/** Tool only reads data and never changes state. */
	readOnlyHint?: boolean;
	/** Output contains data from outside the site's trust boundary. */
	untrustedContentHint?: boolean;
	/** Tool performs a real-world action that cannot be undone. */
	consequentialHint?: boolean;
}

export interface WebMcpTool<Input = Record<string, unknown>> {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
	annotations?: WebMcpToolAnnotations;
	execute: (input: Input, context: { signal?: AbortSignal }) => Promise<string>;
}

/** Tool metadata without its implementation, safe to serialize into HTML. */
export type WebMcpToolSpec = Omit<WebMcpTool, "execute">;

export interface ModelContext {
	registerTool: (
		tool: WebMcpTool,
		options?: { signal?: AbortSignal },
	) => unknown;
	/** Older drafts unregister by name instead of an abort signal. */
	unregisterTool?: (name: string) => unknown;
}
