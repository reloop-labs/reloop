import { Icon } from "@reloop/ui/icon";
import { mcpCapabilities } from "@reloop/web/lib/landing/ai-tools/mcp";

const cardClassName =
	"flex flex-col border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 sm:border-t sm:border-l lg:border-t lg:border-l lg:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] sm:[&:nth-child(-n+2)]:border-t-0 lg:[&:nth-child(-n+3)]:border-t-0 sm:[&:nth-child(2n+1)]:border-l-0 lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+2)]:border-l";

export default function Capabilities() {
	return (
		<section id="capabilities">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Everything the dashboard does
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						If you can do it in the Reloop dashboard, your agent can do it
						through MCP, on the same workspace and with the same data.
					</p>
				</div>

				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
					{mcpCapabilities.map((capability) => (
						<div key={capability.title} className={cardClassName}>
							<div className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10">
								<Icon
									name={capability.icon}
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
							</div>
							<h3 className="mb-3 font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
								{capability.title}
							</h3>
							<p className="text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								{capability.body}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
