"use client";

import { useEffect } from "react";
import type { ModelContext, WebMcpTool } from "./types";

type WebMcpExecute = WebMcpTool["execute"];

declare global {
	interface Window {
		__reloopWebMcpReady?: (impl: Record<string, WebMcpExecute>) => void;
	}
}

function getModelContext(): ModelContext | undefined {
	type WithModelContext = { modelContext?: ModelContext };
	const mc =
		(document as WithModelContext).modelContext ??
		(navigator as WithModelContext).modelContext;
	return typeof mc?.registerTool === "function" ? mc : undefined;
}

/**
 * Hands the implementations to the tools `<WebMcpRegistration />` already
 * registered in <head>. No-op where WebMCP is unsupported.
 */
export function useWebMcpTools(tools: readonly WebMcpTool[]): void {
	useEffect(() => {
		window.__reloopWebMcpReady?.(
			Object.fromEntries(tools.map((tool) => [tool.name, tool.execute])),
		);
	}, [tools]);
}

/**
 * Registers tools for as long as the calling component is mounted, for
 * page-scoped tools that close over page state. No-op where WebMCP is
 * unsupported.
 */
export function usePageWebMcpTools(tools: readonly WebMcpTool[]): void {
	useEffect(() => {
		const mc = getModelContext();
		if (!mc) return;
		const controller = new AbortController();
		for (const tool of tools) {
			try {
				Promise.resolve(
					mc.registerTool(tool, { signal: controller.signal }),
				).catch(() => {});
			} catch {}
		}
		return () => {
			controller.abort();
			for (const tool of tools) {
				try {
					Promise.resolve(mc.unregisterTool?.(tool.name)).catch(() => {});
				} catch {}
			}
		};
	}, [tools]);
}
