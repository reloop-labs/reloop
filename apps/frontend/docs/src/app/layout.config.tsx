import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Link from "next/link";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
function DocTabs() {
	const tabs = [
		{
			title: "Documentation",
			url: "/sdk",
			icon: "file-text",
		},
		{
			title: "API Reference",
			url: "/api",
			icon: "code",
		},
		{
			title: "Build with AI",
			url: "/integrations",
			icon: "bulb",
		},
		{
			title: "Knowledge Base",
			url: "/deploy",
			icon: "swatch-book",
		},
		{
			title: "Webhooks",
			url: "/setup",
			icon: "webhook",
		},
		{
			title: "Self-Hosted",
			url: "/setup",
			icon: "server",
		},
		{
			title: "Local Setup",
			url: "/setup",
			icon: "terminal",
		},
	];

	return (
		<div className="sticky top-0 z-20 flex flex-row items-center gap-1 border-fd-border border-b bg-fd-background px-4 py-2">
			{tabs.map((tab) => (
				<Link
					key={tab.title}
					href={tab.url}
					className="flex items-center gap-2 rounded-md px-2 py-1.5 font-medium text-fd-muted-foreground text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
				>
					<Icon name={tab.icon} className="h-4 w-4" />
					{tab.title}
				</Link>
			))}
		</div>
	);
}
export const baseOptions: BaseLayoutProps = {
	nav: {
		title: <Logo className="h-10 w-10" />,
		component: <DocTabs />,
	},
	// see https://fumadocs.dev/docs/ui/navigation/links
};
