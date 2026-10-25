import { publicWebMcpTools } from "@reloop/web/lib/webmcp/public-tools";

const specs = publicWebMcpTools.map(({ execute: _execute, ...spec }) => spec);

/**
 * Registers the WebMCP tools from an inline <head> script, before hydration,
 * so agents (and scanners that only read the HTML) see them immediately.
 * Each execute waits for <WebMcpTools /> to hand over the real implementations
 * via `window.__reloopWebMcpReady`. No-op where WebMCP is unsupported.
 *
 * The spec moved the entry point from `navigator.modelContext` to
 * `document.modelContext` in July 2026; read the new location first and fall
 * back to the old one for older Chrome builds and polyfills.
 */
const script = `(function(){var mc=document.modelContext||navigator.modelContext;if(!mc||typeof mc.registerTool!=="function")return;var run=new Promise(function(r){window.__reloopWebMcpReady=r});${JSON.stringify(
	specs,
).replace(
	/</g,
	"\\u003c",
)}.forEach(function(t){t.execute=function(input,ctx){return run.then(function(impl){return impl[t.name](input,{signal:ctx&&ctx.signal})})};try{Promise.resolve(mc.registerTool(t)).catch(function(){})}catch(e){}})})();`;

export function WebMcpRegistration() {
	// biome-ignore lint/security/noDangerouslySetInnerHtml: static, server-built tool metadata
	return (
		<script id="webmcp-tools" dangerouslySetInnerHTML={{ __html: script }} />
	);
}
