/**
 * Minimal typings for the WebMCP browser API (W3C WebML CG draft).
 * https://webmachinelearning.github.io/webmcp/
 *
 * The spec moved the entry point from `navigator.modelContext` to
 * `document.modelContext` in July 2026; read the new location first and fall
 * back to the old one for older Chrome builds and polyfills.
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

/** Shape the browser sees: implementations may omit the context argument. */
export type RegisteredWebMcpTool = Omit<WebMcpTool, "execute"> & {
	execute: (
		input: Record<string, unknown>,
		context?: { signal?: AbortSignal },
	) => Promise<string>;
};

export interface ModelContext {
	registerTool: (
		tool: RegisteredWebMcpTool,
		options?: { signal?: AbortSignal },
	) => Promise<void> | void;
}

export function getModelContext(): ModelContext | null {
	if (typeof window === "undefined") return null;
	const fromDocument = (document as Document & { modelContext?: ModelContext })
		.modelContext;
	const fromNavigator = (
		navigator as Navigator & { modelContext?: ModelContext }
	).modelContext;
	const context = fromDocument ?? fromNavigator;
	return context && typeof context.registerTool === "function" ? context : null;
}
