import {
	CardHeader,
	CliDiagram,
	McpDiagram,
} from "@reloop/web/app/(home)/components/agent-cards";
import { siModelcontextprotocol } from "simple-icons";

// The SVG terminal scales its text down to ~7px on phones; render real text there instead.
function MobileCliTerminal() {
	return (
		<div className="w-full overflow-hidden rounded-lg border border-stroke-soft-100 bg-zinc-50 sm:hidden dark:border-white/10 dark:bg-zinc-950">
			<div className="flex items-center gap-1.5 border-stroke-soft-100 border-b px-3 py-2 dark:border-white/10">
				<span className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
				<span className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
				<span className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
				<span className="ml-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
					developer@mac ~ reloop
				</span>
			</div>
			<pre className="overflow-x-auto px-3 py-3 font-mono text-[12.5px] text-zinc-600 leading-6 dark:text-zinc-400">
				<code>
					<span className="block text-zinc-950 dark:text-white">
						$ reloop emails send \
					</span>
					<span className="block">{"    "}--to user@example.com \</span>
					<span className="block">{"    "}--subject "Welcome to Reloop"</span>
					<span className="block text-zinc-950 dark:text-white">
						✓ queued → sent → delivered (78ms)
					</span>
				</code>
			</pre>
		</div>
	);
}

export function LandingAgentCards() {
	return (
		<section
			id="integrations"
			aria-label="Four ways to use Reloop"
			className="overflow-hidden bg-white text-zinc-950 dark:bg-black dark:text-zinc-50"
		>
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div className="grid w-full md:grid-cols-2">
					{/* MCP Server */}
					<div className="flex flex-col border-stroke-soft-100 border-t md:border-r dark:border-white/10">
						<div className="space-y-4 p-6 md:px-12 md:pt-12 md:pb-6">
							<CardHeader
								icon={
									<svg
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="text-zinc-400 dark:text-zinc-500"
										aria-hidden
									>
										<path d={siModelcontextprotocol.path} />
									</svg>
								}
								title="MCP Server"
								lede="Connect Reloop to your AI agent."
								description="Let Claude, Cursor, or Codex send and manage email."
							/>
						</div>
						<div className="flex min-h-[240px] flex-1 flex-col border-stroke-soft-100 border-t px-0 py-4 sm:min-h-[280px] sm:p-5 md:px-5 md:py-5 dark:border-white/10">
							<div className="flex min-h-0 flex-1 items-center justify-center [&>svg]:max-h-[240px] [&>svg]:w-full">
								<McpDiagram />
							</div>
						</div>
					</div>

					{/* Developer CLI */}
					<div className="flex flex-col border-stroke-soft-100 border-t dark:border-white/10">
						<div className="space-y-4 p-6 md:px-12 md:pt-12 md:pb-6">
							<CardHeader
								icon={
									<svg
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="none"
										stroke="#9ca3af"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden
									>
										<path d="M4 17 L9 12 L4 7" />
										<path d="M12 19 H20" />
									</svg>
								}
								title="Developer CLI"
								lede="Send email from your terminal."
								description="Test deliveries and fix configuration without a dashboard."
							/>
						</div>
						<div className="flex min-h-[280px] flex-1 flex-col border-stroke-soft-100 border-t p-4 sm:p-5 md:px-5 md:py-5 dark:border-white/10">
							<div className="hidden min-h-0 flex-1 items-center justify-center sm:flex [&>svg]:max-h-[220px] [&>svg]:w-full">
								<CliDiagram />
							</div>
							<MobileCliTerminal />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
