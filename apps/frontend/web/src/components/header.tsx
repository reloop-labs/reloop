"use client";

import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const navItems = [
	{
		title: "Features",
		href: "/features",
		hasDropdown: true,
		mega: {
			categories: [
				{
					title: "Core Features",
					links: [
						{ title: "Campaigns", href: "/features/campaigns" },
						{ title: "Deliverability", href: "/features/deliverability" },
						{ title: "Email Analytics", href: "/features/email-analytics" },
						{ title: "Templates", href: "/features/email-templates" },
					],
				},
				{
					title: "Infrastructure",
					links: [
						{ title: "SMTP", href: "/features/smtp" },
						{ title: "Languages", href: "/features/languages" },
						{ title: "Validation", href: "/features/email-validation" },
						{ title: "Transaction", href: "/features/transaction-emails" },
					],
				},
				{
					title: "Featured",
					links: [
						{ title: "Agent Inbox", href: "/features/ai-agents" },
						{ title: "Transaction Email", href: "/features/transaction-emails" },
						{ title: "Marketing Email", href: "/features/campaigns" },
					],
				},
			],
		},
	},
	{
		title: "Company",
		href: "/company",
		hasDropdown: true,
		mega: {
			categories: [
				{
					title: "Company",
					links: [
						{ title: "About Us", href: "/company/about-us" },
						{ title: "Blog", href: "/company/blog" },
						{ title: "Careers", href: "/company/careers" },
						{ title: "Customers", href: "/company/customers" },
						{ title: "Humans", href: "/company/humans" },
					],
				},
				{
					title: "Culture",
					links: [
						{ title: "Handbook", href: "/company/handbook" },
						{ title: "Philosophy", href: "/philosophy/why-reloop" },
					],
				},
			],
		},
	},
	{
		title: "Resources",
		href: "/resources",
		hasDropdown: true,
		mega: {
			categories: [
				{
					title: "Resources",
					links: [
						{ title: "Changelog", href: "/resources/changelog" },
						{ title: "Compare", href: "/compare" },
						{ title: "Community", href: "/resources/community" },
						{ title: "Glossary", href: "/resources/glossary" },
					],
				},
				{
					title: "Developers",
					links: [
						{ title: "Self Hosting", href: "/resources/self-hosting-guide" },
						{ title: "Status", href: "/resources/status" },
						{ title: "Tools", href: "/resources/tools" },
					],
				},
			],
		},
	},
	{
		title: "Help",
		href: "/help",
		hasDropdown: true,
		mega: {
			categories: [
				{
					title: "Support",
					links: [
						{ title: "Contact Us", href: "/company/contact-us" },
						{ title: "Support", href: "/help/support" },
						{ title: "FAQ", href: "/help/faq" },
						{ title: "Community", href: "/resources/community" },
					],
				},
				{
					title: "Featured",
					links: [
						{ title: "Contact Us", href: "/company/contact-us" },
						{ title: "Support", href: "/help/support" },
					],
				},
			],
		},
	},
	{
		title: "Docs",
		href: "/docs",
		hasDropdown: true,
		mega: {
			categories: [
				{
					title: "Getting Started",
					links: [
						{ title: "Getting Started", href: "/features/getting-started" },
						{ title: "API Reference", href: "/features/api-reference" },
						{ title: "SDKs", href: "/features/SDKs" },
						{ title: "Webhooks", href: "/features/webhooks" },
						{ title: "Integration", href: "/features/integration" },
					],
				},
				{
					title: "Docs & References",
					links: [
						{ title: "Documentation", href: "/features/getting-started" },
						{ title: "API Reference", href: "/features/api-reference" },
					],
				},
			],
		},
	},
	{
		title: "AI",
		href: "/ai",
		hasDropdown: true,
		mega: {
			categories: [
				{
					title: "AI Services",
					links: [
						{ title: "AI Inbox", href: "/ai/inbox" },
						{ title: "Agent Integration", href: "/ai/agents" },
						{ title: "LLM Tools", href: "/ai/tools" },
						{ title: "Webhooks", href: "/features/webhooks" },
					],
				},
				{
					title: "AI Development",
					links: [
						{ title: "AI-Native Inbox", href: "/ai/inbox" },
						{ title: "Agent SDK", href: "/ai/agents" },
					],
				},
			],
		},
	},
	{ title: "Pricing", href: "/pricing" },
];

const containerVariants: Variants = {
	hidden: { opacity: 0, height: 0, scale: 0.98 },
	visible: {
		opacity: 1,
		height: "auto",
		scale: 1,
		transition: {
			duration: 0.25,
			ease: [0.23, 1, 0.32, 1] as const,
			staggerChildren: 0.04,
			delayChildren: 0.02,
		},
	},
	exit: {
		opacity: 0,
		height: 0,
		scale: 0.98,
		transition: {
			duration: 0.2,
			ease: [0.23, 1, 0.32, 1] as const,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, translateY: 4 },
	visible: {
		opacity: 1,
		translateY: 0,
		transition: {
			duration: 0.2,
			ease: [0.23, 1, 0.32, 1] as const,
		},
	},
};

const slideVariants: Variants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 100 : direction < 0 ? -100 : 0,
		opacity: 0,
		filter: "blur(4px)",
	}),
	center: {
		x: 0,
		opacity: 1,
		filter: "blur(0px)",
		transition: {
			duration: 0.4,
			ease: [0.23, 1, 0.32, 1] as const,
		},
	},
	exit: (direction: number) => ({
		x: direction > 0 ? -100 : direction < 0 ? 100 : 0,
		opacity: 0,
		filter: "blur(4px)",
		transition: {
			duration: 0.3,
			ease: [0.23, 1, 0.32, 1] as const,
		},
	}),
};

export const Header = () => {
	const { useSession } = authClient;
	const { data: session } = useSession();
	const [activeMega, setActiveMega] = useState<string | null>(null);
	const [direction, setDirection] = useState(0);
	const pathname = usePathname();
	const [mounted, setMounted] = useState(false);
	const [stars, setStars] = useState<string>("GitHub");

	useEffect(() => {
		setMounted(true);

		// Fetch GitHub star count dynamically
		fetch("https://api.github.com/repos/reloop-labs/reloop")
			.then((res) => res.json())
			.then((data) => {
				if (data && typeof data.stargazers_count === "number") {
					const count = data.stargazers_count;
					if (count >= 1000) {
						setStars(`${(count / 1000).toFixed(1)}k stars`);
					} else {
						setStars(`${count} stars`);
					}
				}
			})
			.catch(() => {});
	}, []);

	const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	const contentRef = useCallback((node: HTMLDivElement | null) => {
		if (resizeObserverRef.current) {
			resizeObserverRef.current.disconnect();
			resizeObserverRef.current = null;
		}

		if (node) {
			const observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setContentHeight(entry.contentRect.height);
				}
			});
			observer.observe(node);
			resizeObserverRef.current = observer;
		}
	}, []);

	const handleMouseEnter = (title: string) => {
		if (activeMega === title) return;

		const currentIndex = navItems.findIndex((i) => i.title === title);
		const prevIndex = navItems.findIndex((i) => i.title === activeMega);

		if (prevIndex !== -1 && currentIndex !== -1) {
			setDirection(currentIndex > prevIndex ? 1 : -1);
		} else {
			setDirection(0);
		}

		setActiveMega(title);
	};

	const activeItem = navItems.find((item) => item.title === activeMega);

	return (
		<header
			className="gpu-promote fixed top-0 right-0 left-0 z-50 flex justify-center p-4"
			style={{ contain: "layout style" }}
		>
			<motion.div
				onMouseLeave={() => setActiveMega(null)}
				className="flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[24px] border border-[#0a0d12]/10 bg-white transition-[border-color,box-shadow,background-color] duration-300 ease-out dark:border-white/10 dark:bg-[#0a0a0a]/95"
			>
				<div className="flex h-15 w-full items-center justify-between pr-3 transition-all duration-500">
					<div className="flex items-center gap-6">
						<Link href="/" className="flex items-center pl-2">
							<Logo className="w-12 transition-all duration-500" />
						</Link>

						<nav className="hidden items-center gap-0 lg:flex">
							{navItems.map((item) => (
								<motion.div
									key={item.title}
									className="relative flex h-full items-center"
									onMouseEnter={() => item.mega && handleMouseEnter(item.title)}
								>
									<Link
										href={item.href}
										className={
											"flex items-center gap-1 px-2 py-2 font-semibold text-[#0a0d12]/60 text-[13px] transition-colors hover:text-[#0a0d12] dark:text-white/70 dark:hover:text-white"
										}
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
								</motion.div>
							))}
						</nav>
					</div>

					<div className="flex items-center gap-2.5 sm:gap-3">
						<motion.a
							href="https://github.com/reloop-labs/reloop"
							target="_blank"
							rel="noreferrer"
							whileTap={{ scale: 0.97 }}
							className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#0a0d12]/10 bg-[#0a0d12]/4 px-4 py-2 font-semibold text-[#0a0d12] text-[13px] transition-all hover:border-[#0a0d12]/20 hover:bg-[#0a0d12]/8 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/15"
						>
							<Icon name="social-github" className="size-3.5" />
							<span className="hidden sm:inline">{stars}</span>
						</motion.a>
						<motion.a
							href={mounted && session ? "/dashboard" : "/dashboard/login"}
							whileTap={{ scale: 0.97 }}
							className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#0a0d12] px-4 py-2 font-semibold text-[13px] text-white transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-[#0a0d12]"
						>
							{mounted && session ? "Dashboard" : "Login"}
						</motion.a>
					</div>
				</div>

				<AnimatePresence mode="wait">
					{activeMega && activeItem?.mega && (
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							style={{ transformOrigin: "top" }}
							className="w-full"
						>
							<div className="flex w-full border-[#0a0d12]/5 border-t p-4 pt-0 dark:border-white/5">
								<motion.div
									animate={{ height: contentHeight }}
									transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
									className="relative w-full overflow-hidden"
								>
									<div ref={contentRef}>
										<AnimatePresence custom={direction} mode="popLayout">
											<motion.div
												key={activeMega}
												custom={direction}
												variants={slideVariants}
												initial="enter"
												animate="center"
												exit="exit"
												className="w-full"
											>
												<div className="flex w-full gap-20 pt-6 pb-8 px-8">
													{activeItem?.mega?.categories?.map((category) => (
														<div key={category.title} className="flex min-w-[160px] flex-col gap-3">
															<span className="text-[11px] font-bold tracking-wider text-[#0a0d12]/40 dark:text-white/40 uppercase mb-1">
																{category.title}
															</span>
															<div className="flex flex-col gap-2">
																{category.links.map((link: any) => (
																	<motion.div
																		key={link.title}
																		variants={itemVariants}
																	>
																		<Link
																			href={link.href}
																			target={link.isExternal ? "_blank" : undefined}
																			rel={link.isExternal ? "noopener noreferrer" : undefined}
																			className="group inline-flex items-center gap-0.5 font-semibold text-[#0a0d12]/60 text-[14px] transition-colors hover:text-[#0a0d12] dark:text-white/60 dark:hover:text-white"
																		>
																			{link.title}
																			{link.hasArrow && (
																				<span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[10px] text-[#0a0d12]/40 dark:text-white/40 ml-0.5">
																					↗
																				</span>
																			)}
																		</Link>
																	</motion.div>
																))}
															</div>
														</div>
													))}
												</div>
											</motion.div>
										</AnimatePresence>
									</div>
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</header>
	);
};
