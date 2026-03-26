"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DocTabs() {
	const pathname = usePathname();
	const tabs = [
		{
			title: "Documentation",
			url: "/",
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
			{tabs.map((tab) => {
				const fullUrl = `/docs${tab.url === "/" ? "" : tab.url}`;
				const active =
					pathname === fullUrl ||
					(tab.url !== "/" && pathname.startsWith(fullUrl));

				return (
					<Link
						key={tab.title}
						href={tab.url}
						className={cn(
							"flex items-center gap-2 rounded-md px-2 py-1.5 font-medium text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground",
							active
								? "bg-fd-accent text-fd-foreground"
								: "text-fd-muted-foreground",
						)}
					>
						<Icon name={tab.icon} className="h-4 w-4" />
						{tab.title}
					</Link>
				);
			})}
		</div>
	);
}
