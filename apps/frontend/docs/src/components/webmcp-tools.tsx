"use client";

import { docsWebMcpTools } from "@reloop/fe-docs/lib/webmcp/docs-tools";
import { useWebMcpTools } from "@reloop/webmcp/client";

/** Hands the docs tool implementations to the <head> registration. */
export function WebMcpTools() {
	useWebMcpTools(docsWebMcpTools);
	return null;
}
