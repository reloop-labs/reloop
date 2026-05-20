"use client";

import { navigationTabs } from "@reloop/fe-docs/lib/navigation";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar({
	onMobileMenuClick,
}: {
	onMobileMenuClick: () => void;
}) {
	const pathname = usePathname();
	const tabs = navigationTabs;

	return (
		<div className="flex h-full w-full items-center justify-between pr-3">
			{/* Mobile Menu Placeholder / Logo on Mobile */}
			<div className="flex items-center gap-4 lg:hidden">
				<button
					type="button"
					onClick={onMobileMenuClick}
					className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
				>
					<Icon name="menu-2" className="h-5 w-5" />
				</button>
				<Link href="/" className="flex items-center lg:hidden">
					<Logo theme="light" className="w-10" />
				</Link>
			</div>

			{/* Nav tabs */}
			<div className="flex flex-1 items-center">
				<nav className="hidden h-full items-center gap-1 lg:flex">
					{tabs.map((tab) => {
						const active =
							tab.url === "/" ? pathname === "/" : pathname.startsWith(tab.url);

						return (
							<Link
								key={tab.title}
								href={tab.url}
								className={cn(
									"flex h-9 items-center gap-1 whitespace-nowrap rounded-lg px-2 font-medium text-[13px] transition-all md:px-4",
									active
										? "text-[#171717] dark:text-white"
										: "text-text-sub-600 hover:text-[#171717] dark:hover:text-white",
								)}
							>
								<Icon
									name={tab.iconName}
									className={cn(
										"h-4 w-4 shrink-0 transition-opacity",
										active ? "opacity-100" : "opacity-60",
									)}
								/>
								{tab.title}
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<div className="flex items-center gap-3">
					<Link
						href="https://dashboard.reloop.sh/login"
						className="hidden font-medium text-sm text-text-sub-600 transition-colors hover:text-[#171717] sm:block dark:hover:text-white"
					>
						Sign In
					</Link>
					<Link
						href="https://dashboard.reloop.sh/signup"
						className="inline-flex h-9 items-center justify-center rounded-full bg-[#171717] px-5 font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] dark:bg-white dark:text-black"
					>
						{/* Shorten text on very small screens */}
						<span className="xs:inline hidden">Get Started</span>
						<span className="xs:hidden">Start</span>
					</Link>
				</div>
			</div>
		</div>
	);
}
