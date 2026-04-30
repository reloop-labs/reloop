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
			url: "/knowledge-base",
			icon: "swatch-book",
		},
		{
			title: "Webhooks",
			url: "/webhooks",
			icon: "webhook",
		},
		{
			title: "Self-Hosted",
			url: "/self-host",
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
				const active =
					tab.url === "/" ? pathname === "/" : pathname.includes(tab.url);

				return (
					<Link
						key={tab.title}
						href={tab.url}
						className={cn(
							"flex items-center gap-2 rounded-md px-2 py-1.5 font-semibold text-sm hover:text-fd-accent-foreground",
							active ? "text-fd-foreground" : "text-fd-muted-foreground",
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
