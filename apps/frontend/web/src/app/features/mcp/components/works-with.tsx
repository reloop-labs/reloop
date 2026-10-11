import {
	mcpClientPath,
	mcpClients,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import Link from "next/link";
import { McpClientIcon } from "./client-icons";

/** Neutral glow for black marks (Cursor) so the bloom still reads. */
function glowColor(hex: string) {
	return hex === "000000" ? "#a1a1aa" : `#${hex}`;
}

export default function WorksWith() {
	return (
		<section id="works-with">
			<div className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
				<div className="text-center">
					<h2 className="text-balance font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.6rem] lg:text-[3.2rem] dark:text-white">
						Works with your AI tools.
					</h2>
					<p className="mx-auto mt-3 max-w-xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Setup guides for each client, plus any other client that speaks MCP.
					</p>
				</div>

				<div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-4 sm:mt-10 lg:gap-6">
					{mcpClients.map((client) => {
						const glow = glowColor(client.accentHex);
						return (
							<Link
								key={client.slug}
								href={mcpClientPath(client.slug)}
								aria-label={`Reloop MCP for ${client.name}`}
								className="group relative flex w-24 flex-col items-center gap-3 transition-transform duration-300 hover:scale-[1.04] sm:w-28"
							>
								<div
									aria-hidden
									className="pointer-events-none absolute inset-x-3 top-12 z-0 h-8 opacity-50 blur-lg transition-opacity duration-300 group-hover:opacity-75 sm:top-14 sm:h-10"
									style={{
										background: `radial-gradient(ellipse at center, color-mix(in srgb, ${glow} 55%, transparent) 0%, color-mix(in srgb, ${glow} 20%, transparent) 45%, transparent 75%)`,
									}}
								/>
								<div className="relative z-10 flex size-[4.5rem] items-center justify-center rounded-[18px] border border-stroke-soft-200/80 bg-transparent transition-colors duration-300 group-hover:border-stroke-soft-300 sm:size-20 lg:rounded-[22px] dark:border-white/[0.08] dark:group-hover:border-white/15">
									<McpClientIcon
										slug={client.slug}
										className="size-8 sm:size-9"
									/>
								</div>
								<span className="relative z-10 font-medium text-[13px] text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:text-white/55 dark:group-hover:text-white">
									{client.name}
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
