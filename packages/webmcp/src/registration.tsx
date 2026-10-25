import type { WebMcpTool, WebMcpToolSpec } from "./types";

/**
 * Chrome origin trial enabling WebMCP on reloop.sh and its subdomains
 * (dashboard, docs, link.reloop.sh). Expires 2027-03-30.
 */
export const WEBMCP_ORIGIN_TRIAL_TOKEN =
	"Aoq6kttLejAETbt/zdQat/n22+MCBi7IqW210U22jMnWNhNI3l0TXxxffASoX2QxpniI4EKDqSzzjliYkngPiQsAAABceyJvcmlnaW4iOiJodHRwczovL3JlbG9vcC5zaDo0NDMiLCJmZWF0dXJlIjoiV2ViTUNQIiwiZXhwaXJ5IjoxODA2MzY0ODAwLCJpc1N1YmRvbWFpbiI6dHJ1ZX0=";

export function WebMcpOriginTrial() {
	return <meta httpEquiv="origin-trial" content={WEBMCP_ORIGIN_TRIAL_TOKEN} />;
}

export const toWebMcpSpecs = (tools: readonly WebMcpTool[]): WebMcpToolSpec[] =>
	tools.map(({ execute: _execute, ...spec }) => spec);

/**
 * Inline script that registers the tools before hydration, so agents (and
 * scanners that only read the HTML) see them immediately. Each execute waits
 * for `useWebMcpTools` to hand over the real implementations via
 * `window.__reloopWebMcpReady`. No-op where WebMCP is unsupported.
 *
 * The spec moved the entry point from `navigator.modelContext` to
 * `document.modelContext` in July 2026; read the new location first and fall
 * back to the old one for older Chrome builds and polyfills.
 */
export const buildWebMcpRegistrationScript = (
	tools: readonly WebMcpTool[],
): string =>
	`(function(){var mc=document.modelContext||navigator.modelContext;if(!mc||typeof mc.registerTool!=="function")return;var run=new Promise(function(r){window.__reloopWebMcpReady=r});${JSON.stringify(
		toWebMcpSpecs(tools),
	).replace(
		/</g,
		"\\u003c",
	)}.forEach(function(t){t.execute=function(input,ctx){return run.then(function(impl){return impl[t.name](input,{signal:ctx&&ctx.signal})})};try{Promise.resolve(mc.registerTool(t)).catch(function(){})}catch(e){}})})();`;

/** Render in <head>; pair with a client component calling `useWebMcpTools`. */
export function WebMcpRegistration({
	tools,
}: {
	tools: readonly WebMcpTool[];
}) {
	return (
		<script
			id="webmcp-tools"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: static, server-built tool metadata
			dangerouslySetInnerHTML={{ __html: buildWebMcpRegistrationScript(tools) }}
		/>
	);
}
