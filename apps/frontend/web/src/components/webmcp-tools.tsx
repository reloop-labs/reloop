"use client";

import { publicWebMcpTools } from "@reloop/web/lib/webmcp/public-tools";
import { useEffect } from "react";

type WebMcpExecute = (typeof publicWebMcpTools)[number]["execute"];

declare global {
	interface Window {
		__reloopWebMcpReady?: (impl: Record<string, WebMcpExecute>) => void;
	}
}

/**
 * Hands the tool implementations to the tools <WebMcpRegistration /> already
 * registered in <head>. No-op where WebMCP is unsupported.
 */
export function WebMcpTools() {
	useEffect(() => {
		window.__reloopWebMcpReady?.(
			Object.fromEntries(
				publicWebMcpTools.map((tool) => [tool.name, tool.execute]),
			),
		);
	}, []);

	return null;
}
