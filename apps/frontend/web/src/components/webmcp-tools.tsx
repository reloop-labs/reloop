"use client";

import { getModelContext } from "@reloop/web/lib/webmcp/model-context";
import { publicWebMcpTools } from "@reloop/web/lib/webmcp/public-tools";
import { useEffect } from "react";

/**
 * Registers Reloop's free tools with the browser's WebMCP model context so
 * in-browser agents can call them on any page. No-op where unsupported.
 */
export function WebMcpTools() {
	useEffect(() => {
		const modelContext = getModelContext();
		if (!modelContext) return;

		const controller = new AbortController();
		for (const tool of publicWebMcpTools) {
			Promise.resolve(
				modelContext.registerTool(
					{
						...tool,
						// Chrome 149 calls execute(input) without a context argument.
						execute: (input, context) =>
							tool.execute(input, { signal: context?.signal }),
					},
					{ signal: controller.signal },
				),
			).catch(() => {
				// Duplicate names (e.g. Fast Refresh) or an aborted registration.
			});
		}
		return () => controller.abort();
	}, []);

	return null;
}
