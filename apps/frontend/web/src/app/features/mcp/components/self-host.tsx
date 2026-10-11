import { Icon } from "@reloop/ui/icon";
import { PageSection } from "@reloop/web/components/page-shell";
import {
	MCP_DOCS_HREF,
	mcpStdioConfig,
	SELF_HOST_BASE_URL,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import { socialProfiles } from "@reloop/web/lib/site";
import { SdkCodeBlock } from "../../../sdk/components/sdk-code-block";

const points = [
	{
		title: "Remote",
		body: `Any client with Streamable HTTP support can use the /mcp endpoint of your own install, for example ${SELF_HOST_BASE_URL}/mcp. It discovers your install's OAuth server and signs you in through the browser.`,
	},
	{
		title: "Local (stdio)",
		body: "For clients that only launch local servers, run reloop-mcp with npx. Set RELOOP_API_KEY to a key from the API keys page and RELOOP_BASE_URL to the public URL of your install.",
	},
];

export default function SelfHost() {
	return (
		<PageSection>
			<div id="self-host" className="grid scroll-mt-24 gap-10 lg:grid-cols-2">
				<div>
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] dark:text-white">
						Open source. Self-host it too.
					</h2>
					<p className="mt-4 max-w-xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						The MCP server is part of the Reloop codebase. Running your own
						install? Connect the same clients to it, remote or over stdio.
					</p>
					<ul className="mt-8 space-y-6">
						{points.map((point) => (
							<li key={point.title} className="flex items-start gap-3">
								<Icon
									name="check-circle"
									className="mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/35"
								/>
								<div>
									<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
										{point.title}
									</h3>
									<p className="mt-1 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
										{point.body}
									</p>
								</div>
							</li>
						))}
					</ul>
					<div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
						<a
							href={MCP_DOCS_HREF}
							className="font-medium text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-[3px] dark:text-white dark:decoration-white/20"
						>
							MCP server docs
						</a>
						<a
							href={socialProfiles.github}
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-[3px] dark:text-white dark:decoration-white/20"
						>
							Reloop on GitHub
						</a>
					</div>
				</div>
				<div className="min-w-0 self-center">
					<SdkCodeBlock code={mcpStdioConfig} lang="json" path="mcp.json" />
				</div>
			</div>
		</PageSection>
	);
}
