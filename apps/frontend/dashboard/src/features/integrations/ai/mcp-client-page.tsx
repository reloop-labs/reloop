import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useMemo } from "react";
import {
	BackLink,
	BrandMark,
	PageIntro,
	SetupSteps,
} from "./ai-integration-ui";
import {
	findMcpClient,
	type McpClient,
	mcpClients,
	resolveBaseUrl,
} from "./mcp-clients";
import { PromptGrid } from "./mcp-prompts";

export function McpClientPage({ clientId }: { clientId: string }) {
	// The route validates clientId before rendering.
	const client = findMcpClient(clientId) ?? (mcpClients[0] as McpClient);
	const ctx = useMemo(() => {
		const baseUrl = resolveBaseUrl();
		return { baseUrl, mcpUrl: `${baseUrl}/mcp` };
	}, []);
	const install = client.installLink?.(ctx);
	const others = mcpClients.filter((item) => item.id !== client.id);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 p-6 pb-12 lg:p-8">
			<BackLink href="/integrations/mcp" label="MCP server" />

			<div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
				<div className="min-w-0 space-y-8">
					<PageIntro
						icon={
							<BrandMark
								customIcon={client.customIcon}
								simpleIconKey={client.simpleIconKey}
								fallbackIcon={client.fallbackIcon}
								size="lg"
							/>
						}
						title={`Connect ${client.name}`}
						description={`${client.tagline} Connect it to Reloop and do anything you can do in the dashboard, from chat.`}
						action={
							install ? (
								<FancyButton.Root asChild variant="neutral" size="small">
									<a href={install.href}>
										{install.label}
										<FancyButton.Icon
											as={Icon}
											name="arrow-up-right"
											className="h-3.5 w-3.5"
										/>
									</a>
								</FancyButton.Root>
							) : null
						}
					/>

					<SetupSteps
						steps={[
							...client.steps(ctx),
							{
								title: "Try a prompt",
								body: `Once you're signed in, paste one of these into ${client.name}.`,
								content: <PromptGrid />,
							},
						]}
					/>
				</div>

				<aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
					<div className="space-y-2">
						<p className="font-medium text-label-xs text-text-sub-600">
							Other clients
						</p>
						<div className="flex flex-col gap-0.5">
							{others.map((item) => (
								<Link
									key={item.id}
									href={`/integrations/mcp/${item.id}`}
									className={cn(
										"flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-text-sub-600 transition-colors",
										"hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/[0.04]",
									)}
								>
									<BrandMark
										customIcon={item.customIcon}
										simpleIconKey={item.simpleIconKey}
										fallbackIcon={item.fallbackIcon}
										size="sm"
									/>
									{item.name}
									<Icon
										name="chevron-right"
										className="ml-auto h-3.5 w-3.5 text-text-soft-400"
									/>
								</Link>
							))}
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
