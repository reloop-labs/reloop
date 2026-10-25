"use client";

import { useWebMcpTools } from "@reloop/webmcp/client";
import { dashboardWebMcpTools } from "#/lib/webmcp/dashboard-tools";

/** Hands the dashboard tool implementations to the <head> registration. */
export function WebMcpTools() {
	useWebMcpTools(dashboardWebMcpTools);
	return null;
}
