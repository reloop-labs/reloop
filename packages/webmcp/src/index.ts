export type {
	ModelContext,
	WebMcpTool,
	WebMcpToolAnnotations,
	WebMcpToolSpec,
} from "./types";

/** Serializes a tool result for the agent. */
export const toWebMcpText = (value: unknown): string => JSON.stringify(value);
