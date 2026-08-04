/**
 * Visually-hidden agent discovery block (AFDocs llms-txt-directive-html).
 * Must be server-rendered near the top of <main>, outside <nav>.
 */
export function AgentDirective({
	markdownPath,
}: {
	/** Absolute docs path for this page's markdown twin, e.g. /docs/learn/api-keys.md */
	markdownPath?: string;
}) {
	const mdHref = markdownPath ?? undefined;

	return (
		<div
			data-agent-directive="llms-txt"
			// Clip-rect hide: survives HTML→text conversion; sr-only alone can be dropped by some converters
			style={{
				position: "absolute",
				width: "1px",
				height: "1px",
				padding: 0,
				margin: "-1px",
				overflow: "hidden",
				clip: "rect(0, 0, 0, 0)",
				whiteSpace: "nowrap",
				border: 0,
			}}
		>
			<p>
				For the complete documentation index, see{" "}
				<a href="/llms-docs.txt">llms-docs.txt</a> or the site index{" "}
				<a href="/llms.txt">llms.txt</a>. Full docs corpus:{" "}
				<a href="/llms-full-docs.txt">llms-full-docs.txt</a>. Prefer the
				markdown version of this page
				{mdHref ? (
					<>
						{" "}
						at <a href={mdHref}>{mdHref}</a>
					</>
				) : (
					<> by appending .md to the URL</>
				)}
				. Product capabilities: <a href="/skill.md">skill.md</a>. Docs MCP:{" "}
				<a href="/docs/mcp">/docs/mcp</a>. Site MCP: <a href="/mcp">/mcp</a>.
			</p>
		</div>
	);
}
