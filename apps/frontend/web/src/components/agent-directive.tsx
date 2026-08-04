/**
 * Visually-hidden agent discovery block for marketing pages
 * (AFDocs llms-txt-directive-html). Server-rendered at the top of <main>.
 */
export function AgentDirective({
	markdownPath,
}: {
	/** Absolute path for this page's markdown twin when available */
	markdownPath?: string;
}) {
	return (
		<div
			data-agent-directive="llms-txt"
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
				For the complete site index, see <a href="/llms.txt">llms.txt</a>. Full
				corpus: <a href="/llms-full.txt">llms-full.txt</a>. Product
				documentation: <a href="/docs/llms.txt">docs/llms.txt</a>
				{markdownPath ? (
					<>
						. Markdown for this page:{" "}
						<a href={markdownPath}>{markdownPath}</a>
					</>
				) : (
					<>
						. Prefer markdown URLs where available (append <code>.md</code>
						).
					</>
				)}
				. Product skill: <a href="/skill.md">skill.md</a>. Pricing:{" "}
				<a href="/pricing.md">pricing.md</a>. Docs MCP:{" "}
				<a href="/docs/mcp">/docs/mcp</a>. Site MCP: <a href="/mcp">/mcp</a>.
			</p>
		</div>
	);
}
