"use client";

import { publicWebMcpTools } from "@reloop/web/lib/webmcp/public-tools";
import { useWebMcpTools } from "@reloop/webmcp/client";

/** Hands the public tool implementations to the <head> registration. */
export function WebMcpTools() {
	useWebMcpTools(publicWebMcpTools);
	return null;
}
