"use client";

import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/cn";

export function Navbar() {
	const pathname = usePathname();
	const tabs = [
		{ title: "Documentation", url: "/", iconName: "file-text" as const },
		{ title: "API Reference", url: "/api", iconName: "code" as const },
		{ title: "Build with AI", url: "/integrations", iconName: "bulb" as const },
		{
			title: "Knowledge Base",
			url: "/deploy",
			iconName: "swatch-book" as const,
		},
		{ title: "Webhooks", url: "/webhook", iconName: "webhook" as const },
	];

	return (
		<header className="z-50 w-full shrink-0 border-fd-border border-b bg-fd-background">
			<div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between pr-3">
				{/* Left side: Logo + Nav tabs */}
				<div className="flex flex-1 items-center">
					{/* Logo container matching Sidebar width (w-60 is 240px) */}
					<div className="flex w-60 shrink-0 items-center pl-4">
						<Link href="/" className="flex items-center">
							<Logo theme="light" className="w-12" />
						</Link>
					</div>

					<nav className="hidden h-full items-center gap-0.5 md:flex md:pl-6">
						{tabs.map((tab) => {
							const active =
								tab.url === "/"
									? pathname === "/"
									: pathname.startsWith(tab.url);

							return (
								<Link
									key={tab.title}
									href={tab.url}
									className={cn(
										"flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-medium text-sm transition-colors",
										active
											? "text-fd-foreground"
											: "text-fd-muted-foreground hover:bg-fd-foreground/5 hover:text-fd-foreground",
									)}
								>
									<Icon
										name={tab.iconName}
										className={cn(
											"h-4 w-4 shrink-0 transition-opacity",
											active ? "opacity-100" : "opacity-70",
										)}
									/>
									{tab.title}
								</Link>
							);
						})}
					</nav>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<div className="ml-2 hidden items-center gap-3 sm:flex">
						<Link
							href="https://dashboard.reloop.sh/login"
							className="font-medium text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground"
						>
							Sign In
						</Link>
						<Link
							href="https://dashboard.reloop.sh/signup"
							className="inline-flex h-8 items-center justify-center rounded-full bg-fd-foreground px-4 font-semibold text-sm text-fd-background transition-all hover:opacity-90 active:scale-[0.98]"
						>
							Get Started
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
