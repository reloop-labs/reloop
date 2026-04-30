"use client";

import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
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

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header className="fixed top-0 right-0 left-0 z-50 flex justify-center p-4 transition-all duration-500">
			<div
				onMouseLeave={() => setActiveMega(null)}
				className={`flex items-center justify-between rounded-[20px] pr-3 transition-all duration-500 ease-in-out ${
					scrolled
						? "h-15 w-full max-w-[1000px] border border-white/10 bg-black"
						: "h-16 w-full max-w-[1100px] border-transparent bg-transparent shadow-none"
				}`}
			>
				<Link href="/" className="flex items-center pl-2">
					<Logo
						theme="dark"
						className={`transition-all duration-500 ${
							scrolled ? "w-12" : "w-14"
						}`}
					/>
				</Link>

				<nav className="hidden items-center gap-0 lg:flex">
					{navItems.map((item) => (
						<div
							key={item.title}
							className="relative flex h-full items-center"
							onMouseEnter={() => item.mega && setActiveMega(item.title)}
						>
							<Link
								href={item.href}
								className="flex items-center gap-1 px-2 py-2 font-semibold text-[13px] text-white/70 transition-colors hover:text-white"
							>
								{item.title}
								{item.hasDropdown && (
									<Icon
										name="chevron-down"
										className={`size-3 transition-transform duration-300 ${
											activeMega === item.title ? "rotate-180" : "opacity-50"
										}`}
									/>
								)}
							</Link>

							<AnimatePresence>
								{activeMega === item.title && item.mega && (
									<motion.div
										initial={{ opacity: 0, y: 10, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 10, scale: 0.95 }}
										transition={{ duration: 0.2, ease: "easeOut" }}
										className="-translate-x-1/2 absolute top-full left-1/2 pt-2"
									>
										<div className="flex w-[500px] overflow-hidden rounded-[24px] border border-white/10 bg-black/90 p-2 shadow-2xl backdrop-blur-xl">
											<div className="flex w-1/3 flex-col gap-1 p-4">
												{item.mega.links.map((link) => (
													<Link
														key={link.title}
														href={link.href}
														className="rounded-lg px-3 py-2 font-semibold text-[14px] text-white/50 transition-colors hover:bg-white/5 hover:text-white"
													>
														{link.title}
													</Link>
												))}
											</div>
											<div className="flex flex-1 flex-col gap-2 p-2">
												{item.mega.featured.map((feat) => (
													<Link
														key={feat.title}
														href={feat.href}
														className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.06]"
													>
														<div className="flex size-12 items-center justify-center rounded-lg bg-black shadow-inner">
															<Icon
																name={feat.icon as any}
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
												))}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					))}
				</nav>

				<div className="flex items-center gap-2.5 sm:gap-3">
					<a
						href="https://github.com/reloop-labs/reloop"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/10 bg-white/5 px-4 py-2 font-semibold text-[13px] text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
					>
						<Icon name="social-github" className="size-3.5" />
						<span className="hidden sm:inline">GitHub</span>
					</a>
					<a
						href={session ? "/dashboard" : "/dashboard/login"}
						className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-white px-4 py-2 font-semibold text-[#0a0d12] text-[13px] transition-all hover:scale-[1.02] active:scale-[0.98]"
					>
						{session ? "Dashboard" : "Login"}
					</a>
				</div>
			</div>
		</header>
	);
};
