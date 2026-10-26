import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useMemo } from "react";
import {
	BackLink,
	BrandMark,
	PageIntro,
	ServerUrlField,
} from "./ai-integration-ui";
import { mcpClients, resolveBaseUrl } from "./mcp-clients";

function WebParityBanner() {
	return (
		<section
			className={cn(
				"relative overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 px-6 py-7 sm:px-8",
				"dark:border-stroke-soft-100/40 dark:bg-white/[0.02]",
			)}
		>
			{/* Soft brand glow + dot grid, fading toward the copy */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_100%_0%,var(--color-primary-alpha-10),transparent_70%)]"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] text-stroke-soft-200 [background-size:16px_16px] [mask-image:linear-gradient(to_left,black,transparent_60%)] dark:text-white/10"
			/>

			<div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				<div className="max-w-xl">
					<span className="inline-flex items-center gap-1.5 rounded-full bg-primary-alpha-10 px-2.5 py-1 font-medium text-[11px] text-primary-base">
						<Icon name="magic-wand" className="h-3 w-3" />
						Full dashboard access
					</span>
					<h2 className="mt-3 font-semibold text-text-strong-950 text-title-h5 tracking-tight">
						Everything you can do on the web, your agent can do too.
					</h2>
					<p className="mt-2 text-paragraph-sm text-text-sub-600">
						Send email, manage contacts, build campaigns and templates, run
						automations, and check domains and metrics. Just ask in plain
						language.
					</p>
				</div>

				<div className="hidden w-full max-w-sm shrink-0 space-y-2 lg:block">
					<div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-text-strong-950 px-3.5 py-2 text-[13px] text-bg-white-0 dark:bg-white dark:text-black">
						Draft a launch campaign for Friday at 9am
					</div>
					<div className="flex w-fit max-w-[90%] items-start gap-2 rounded-2xl rounded-bl-md border border-stroke-soft-100 bg-bg-white-0 px-3.5 py-2 text-[13px] text-text-strong-950 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-stroke-soft-100/40 dark:bg-white/[0.04]">
						<Icon
							name="check-circle"
							className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-base"
						/>
						Scheduled “Launch” for Fri 9:00 AM to 2,431 contacts.
					</div>
				</div>
			</div>
		</section>
	);
}

export function McpPage() {
	const mcpUrl = useMemo(() => `${resolveBaseUrl()}/mcp`, []);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 p-6 pb-12 lg:p-8">
			<BackLink href="/integrations" label="Integrations" />

			<PageIntro
				icon={<BrandMark simpleIconKey="siModelcontextprotocol" size="lg" />}
				title="MCP server"
				description="Give any MCP client access to this workspace. Pick the app you use and follow its setup; you'll sign in with Reloop, no API key needed."
			/>

			<div className="max-w-xl">
				<ServerUrlField url={mcpUrl} />
			</div>

			<section className="space-y-3">
				<div>
					<h2 className="font-semibold text-label-md text-text-strong-950">
						Choose your client
					</h2>
					<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
						Step-by-step setup for each app.
					</p>
				</div>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{mcpClients.map((client) => (
						<Link
							key={client.id}
							href={`/integrations/mcp/${client.id}`}
							className={cn(
								"group flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 transition-colors",
								"dark:border-stroke-soft-100/40 dark:bg-white/[0.02]",
								"hover:border-stroke-soft-200 dark:hover:border-stroke-soft-100/60",
							)}
						>
							<BrandMark
								customIcon={client.customIcon}
								simpleIconKey={client.simpleIconKey}
								fallbackIcon={client.fallbackIcon}
							/>
							<div className="min-w-0 flex-1">
								<p className="font-semibold text-label-sm text-text-strong-950">
									{client.name}
								</p>
								<p className="mt-0.5 truncate text-paragraph-xs text-text-sub-600">
									{client.tagline}
								</p>
							</div>
							<Icon
								name="chevron-right"
								className="h-4 w-4 shrink-0 text-text-soft-400 transition-transform group-hover:translate-x-0.5 group-hover:text-text-strong-950"
							/>
						</Link>
					))}
				</div>
			</section>

			<WebParityBanner />
		</div>
	);
}
