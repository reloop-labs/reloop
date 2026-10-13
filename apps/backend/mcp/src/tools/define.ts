import type { McpServer } from "@modelcontextprotocol/server";
import type * as z from "zod";
import { toReloopError } from "../errors/reloop-error";
import type { Logger } from "../observability/log";
import type { ReloopApi } from "../reloop/api";
import { errorResult, okResult } from "./result";

export type ToolAnnotationSet = {
	readOnlyHint: boolean;
	destructiveHint: boolean;
	idempotentHint: boolean;
	openWorldHint: boolean;
};

export type ToolDefinition<
	Input extends z.ZodObject,
	Output extends z.ZodObject,
> = {
	name: string;
	title: string;
	description: string;
	annotations: ToolAnnotationSet;
	input: Input;
	output: Output;
	run(args: z.output<Input>, api: ReloopApi): Promise<z.output<Output>>;
};

export function defineTool<
	Input extends z.ZodObject,
	Output extends z.ZodObject,
>(definition: ToolDefinition<Input, Output>): ToolDefinition<Input, Output> {
	return definition;
}

export type AnyToolDefinition = ToolDefinition<z.ZodObject, z.ZodObject>;

export function registerTools(
	server: McpServer,
	api: ReloopApi,
	tools: readonly AnyToolDefinition[],
	logger?: Logger,
): void {
	for (const tool of tools) {
		server.registerTool(
			tool.name,
			{
				title: tool.title,
				description: tool.description,
				inputSchema: tool.input,
				outputSchema: tool.output,
				annotations: tool.annotations,
			},
			async (args) => {
				const startedAt = Date.now();
				try {
					const result = okResult(await tool.run(args, api));
					logger?.info("tool call", {
						tool: tool.name,
						ok: true,
						durationMs: Date.now() - startedAt,
					});
					return result;
				} catch (cause) {
					const error = toReloopError(cause);
					logger?.warn("tool call", {
						tool: tool.name,
						ok: false,
						durationMs: Date.now() - startedAt,
						errorCode: error.code,
						errorStatus: error.status,
						errorMessage: error.message,
					});
					return errorResult(error);
				}
			},
		);
	}
}
