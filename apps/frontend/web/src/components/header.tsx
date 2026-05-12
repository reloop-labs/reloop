"use client";

import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
	{ title: "Features", href: "/product", hasDropdown: true },
	{
		title: "Company",
		href: "/company",
		hasDropdown: true,
		mega: {
			links: [
				{ title: "About", href: "/company/about-us" },
				{ title: "Blog", href: "/company/blog" },
				{ title: "Careers", href: "/company/careers" },
				{ title: "Customers", href: "/company/customers" },
				{ title: "Humans", href: "/company/humans" },
			],
			featured: [
				{
					title: "Handbook",
					description: "How we work",
					href: "/company/handbook",
					icon: "file-text",
				},
				{
					title: "Philosophy",
					description: "What we value",
					href: "/philosophy/why-reloop",
					icon: "bulb",
				},
			],
		},
	},
	{ title: "Resources", href: "/resources", hasDropdown: true },
	{ title: "Help", href: "/help", hasDropdown: true },
	{ title: "Docs", href: "/docs", hasDropdown: true },
	{ title: "AI", href: "/ai", hasDropdown: true },
	{ title: "Pricing", href: "/pricing" },
];

export const Header = () => {
	const { useSession } = authClient;
	const { data: session } = useSession();
	const [scrolled, setScrolled] = useState(false);
	const [activeMega, setActiveMega] = useState<string | null>(null);
	const pathname = usePathname();

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Light mode for pages with white top fold
	const isLight =
		pathname.startsWith("/company") || pathname.startsWith("/philosophy");

	const activeItem = navItems.find((item) => item.title === activeMega);

	return (
		<header className="fixed top-0 right-0 left-0 z-50 flex justify-center p-4 transition-all duration-500">
			<motion.div
				onMouseLeave={() => setActiveMega(null)}
				layout
				className={`flex flex-col overflow-hidden rounded-[24px] transition-all duration-500 ease-in-out ${
					scrolled || activeMega
						? isLight
							? "w-full max-w-[1000px] border border-[#0a0d12]/10 bg-white shadow-sm shadow-[#0a0d12]/5"
							: "w-full max-w-[1000px] border border-white/10 bg-black/90 backdrop-blur-xl"
						: "w-full max-w-[1100px] border-transparent bg-transparent shadow-none"
				}`}
			>
				<div
					className={`flex w-full items-center justify-between pr-3 transition-all duration-500 ${
						scrolled || activeMega ? "h-15" : "h-16"
					}`}
				>
					<Link href="/" className="flex items-center pl-2">
						<Logo
							theme={isLight ? "light" : "dark"}
							className={`transition-all duration-500 ${
								scrolled || activeMega ? "w-12" : "w-14"
							}`}
						/>
					</Link>

					<nav className="hidden items-center gap-0 lg:flex">
						{navItems.map((item) => (
							<div
								key={item.title}
								className="relative flex h-full items-center"
								onMouseEnter={() =>
									item.mega && setActiveMega(item.title)
								}
							>
								<Link
									href={item.href}
									className={`flex items-center gap-1 px-2 py-2 font-semibold text-[13px] transition-colors ${
										isLight
											? "text-[#0a0d12]/60 hover:text-[#0a0d12]"
											: "text-white/70 hover:text-white"
									}`}
								>
									{item.title}
									{item.hasDropdown && (
										<Icon
											name="chevron-down"
											className={`size-3 transition-transform duration-300 ${
												activeMega === item.title
													? "rotate-180"
													: "opacity-50"
											}`}
										/>
									)}
								</Link>
							</div>
						))}
					</nav>

					<div className="flex items-center gap-2.5 sm:gap-3">
						<a
							href="https://github.com/reloop-labs/reloop"
							target="_blank"
							rel="noreferrer"
							className={`inline-flex items-center justify-center gap-2 rounded-[12px] border px-4 py-2 font-semibold text-[13px] transition-all ${
								isLight
									? "border-[#0a0d12]/10 bg-[#0a0d12]/4 text-[#0a0d12] hover:border-[#0a0d12]/20 hover:bg-[#0a0d12]/8"
									: "border-white/10 bg-white/5 text-white backdrop-blur-sm hover:border-white/20 hover:bg-white/10"
							}`}
						>
							<Icon name="social-github" className="size-3.5" />
							<span className="hidden sm:inline">GitHub</span>
						</a>
						<a
							href={session ? "/dashboard" : "/dashboard/login"}
							className={`inline-flex items-center justify-center gap-2 rounded-[12px] px-4 py-2 font-semibold text-[13px] transition-all hover:scale-[1.02] active:scale-[0.98] ${
								isLight
									? "bg-[#0a0d12] text-white"
									: "bg-white text-[#0a0d12]"
							}`}
						>
							{session ? "Dashboard" : "Login"}
						</a>
					</div>
				</div>

				<AnimatePresence>
					{activeMega && activeItem?.mega && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{
								duration: 0.3,
								ease: [0.23, 1, 0.32, 1],
							}}
							className="w-full"
						>
							<div
								className={`flex w-full p-4 pt-0 ${
									isLight
										? "border-t border-[#0a0d12]/5"
										: "border-t border-white/5"
								}`}
							>
								{isLight ? (
									<div className="flex w-full gap-4 pt-4">
										<div className="flex w-1/4 flex-col gap-1 border-r border-[#0a0d12]/5 pr-4">
											{activeItem.mega.links.map(
												(link) => (
													<Link
														key={link.title}
														href={link.href}
														className="rounded-lg px-3 py-2 font-semibold text-[14px] text-[#0a0d12]/50 transition-colors hover:bg-[#0a0d12]/4 hover:text-[#0a0d12]"
													>
														{link.title}
													</Link>
												),
											)}
										</div>
										<div className="grid flex-1 grid-cols-2 gap-3">
											{activeItem.mega.featured.map(
												(feat) => (
													<Link
														key={feat.title}
														href={feat.href}
														className="group flex items-center gap-4 rounded-xl border border-[#0a0d12]/5 bg-[#0a0d12]/[0.02] p-4 transition-all hover:border-[#0a0d12]/10 hover:bg-[#0a0d12]/[0.04]"
													>
														<div className="flex size-12 items-center justify-center rounded-lg border border-[#0a0d12]/8 bg-[#0a0d12]/4">
															<Icon
																name={
																	feat.icon as any
																}
																className="size-6 text-[#0a0d12]/60 transition-transform group-hover:scale-110"
															/>
														</div>
														<div>
															<div className="font-semibold text-[14px] text-[#0a0d12]">
																{feat.title}
															</div>
															<div className="text-[12px] text-[#0a0d12]/40">
																{feat.description}
															</div>
														</div>
													</Link>
												),
											)}
										</div>
									</div>
								) : (
									<div className="flex w-full gap-4 pt-4">
										<div className="flex w-1/4 flex-col gap-1 border-r border-white/5 pr-4">
											{activeItem.mega.links.map(
												(link) => (
													<Link
														key={link.title}
														href={link.href}
														className="rounded-lg px-3 py-2 font-semibold text-[14px] text-white/50 transition-colors hover:bg-white/5 hover:text-white"
													>
														{link.title}
													</Link>
												),
											)}
										</div>
										<div className="grid flex-1 grid-cols-2 gap-3">
											{activeItem.mega.featured.map(
												(feat) => (
													<Link
														key={feat.title}
														href={feat.href}
														className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.06]"
													>
														<div className="flex size-12 items-center justify-center rounded-lg bg-black shadow-inner">
															<Icon
																name={
																	feat.icon as any
																}
																className="size-6 text-white/70 transition-transform group-hover:scale-110"
															/>
														</div>
														<div>
															<div className="font-semibold text-[14px] text-white">
																{feat.title}
															</div>
															<div className="text-[12px] text-white/40">
																{feat.description}
															</div>
														</div>
													</Link>
												),
											)}
										</div>
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</header>
	);
};
