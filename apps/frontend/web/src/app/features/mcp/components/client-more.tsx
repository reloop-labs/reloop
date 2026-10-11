import { Icon } from "@reloop/ui/icon";
import {
	MCP_PAGE_PATH,
	type McpClientDefinition,
	mcpClientPath,
	mcpClients,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import Link from "next/link";
import { AlignedIconBand } from "../../../sdk/components/section-frame";
import { SectionTitle } from "../../../sdk/components/section-title";
import { McpClientIcon } from "./client-icons";

/** Links to the other client setup pages, same grid as "Other frameworks". */
export default function McpClientMore({
	current,
}: {
	current: McpClientDefinition;
}) {
	const others = mcpClients.filter((client) => client.slug !== current.slug);

	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-100 md:max-w-7xl xl:border-x dark:border-white/10">
				<SectionTitle
					title="Other MCP clients"
					icon="connector"
					action={
						<Link
							href={MCP_PAGE_PATH}
							className="hidden items-center gap-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 sm:inline-flex dark:text-white/50 dark:hover:text-white"
						>
							MCP overview
							<Icon name="arrow-right" className="size-3.5" aria-hidden />
						</Link>
					}
				/>

				{/* Hatched side gutters align icons with title padding */}
				<AlignedIconBand>
					<div className="grid grid-cols-2 gap-px bg-stroke-soft-200 sm:grid-cols-4 dark:bg-white/10">
						{others.map((client) => (
							<Link
								key={client.slug}
								href={mcpClientPath(client.slug)}
								className="group dark:hover:!bg-[#0A0A0A] flex flex-col items-start gap-2 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50 sm:p-5 dark:bg-black"
							>
								<div className="flex w-full items-start justify-between gap-2">
									<span className="inline-flex size-8 items-center justify-center rounded-[10px] border border-stroke-soft-200 dark:border-white/10">
										<McpClientIcon slug={client.slug} className="size-4" />
									</span>
									<Icon
										name="arrow-right"
										className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-text-strong-950 group-hover:opacity-100 dark:text-white/40 dark:group-hover:text-white"
										aria-hidden
									/>
								</div>
								<span className="pl-0.5 font-medium text-[13px] text-text-strong-950 dark:text-white">
									{client.name}
								</span>
								<span className="pl-0.5 text-[12px] text-text-sub-600 leading-snug dark:text-white/50">
									{client.tagline}
								</span>
							</Link>
						))}
					</div>
				</AlignedIconBand>
			</div>
		</section>
	);
}
