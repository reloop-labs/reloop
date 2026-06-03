"use client";

import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

const navItems = [
	{
		title: "Features",
		href: "/features",
		hasDropdown: true,
		mega: {
			links: [
				{ title: "Campaigns", href: "/features/campaigns" },
				{ title: "Deliverability", href: "/features/deliverability" },
				{ title: "Email Analytics", href: "/features/email-analytics" },
				{ title: "Templates", href: "/features/email-templates" },
				{ title: "SMTP", href: "/features/smtp" },
				{ title: "Languages", href: "/features/languages" },
				{ title: "Validation", href: "/features/email-validation" },
				{ title: "Transaction", href: "/features/transaction-emails" },
			],
			featured: [
				{
					title: "Agent Inbox",
					description: "Manage all your emails in one place",
					href: "/features/ai-agents",
					icon: "inbox",
				},
				{
					title: "Transaction Email",
					description: "Reliable email delivery for your app",
					href: "/features/transaction-emails",
					icon: "send-2",
				},
				{
					title: "Marketing Email",
					description: "Design and send beautiful campaigns",
					href: "/features/campaigns",
					icon: "mega-phone",
				},
			],
		},
	},
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
	{
		title: "Resources",
		href: "/resources",
		hasDropdown: true,
		mega: {
			links: [
				{ title: "Changelog", href: "/resources/changelog" },
				{ title: "Community", href: "/resources/community" },
				{ title: "Glossary", href: "/resources/glossary" },
				{ title: "Self Hosting", href: "/resources/self-hosting-guide" },
				{ title: "Status", href: "/resources/status" },
				{ title: "Tools", href: "/resources/tools" },
			],
			featured: [
				{
					title: "Changelog",
					description: "Stay updated with latest releases",
					href: "/resources/changelog",
					icon: "refresh-cw",
				},
				{
					title: "Community",
					description: "Join our open-source community",
					href: "/resources/community",
					icon: "users",
				},
			],
		},
	},
	{
		title: "Help",
		href: "/help",
		hasDropdown: true,
		mega: {
			links: [
				{ title: "Contact Us", href: "/company/contact-us" },
				{ title: "Support", href: "/help/support" },
				{ title: "FAQ", href: "/help/faq" },
				{ title: "Community", href: "/resources/community" },
			],
			featured: [
				{
					title: "Contact Us",
					description: "Talk to our team of experts",
					href: "/company/contact-us",
					icon: "mega-phone",
				},
				{
					title: "Support",
					description: "Get help with your implementation",
					href: "/help/support",
					icon: "heart",
				},
			],
		},
	},
	{
		title: "Docs",
		href: "/docs",
		hasDropdown: true,
		mega: {
			links: [
				{ title: "Getting Started", href: "/features/getting-started" },
				{ title: "API Reference", href: "/features/api-reference" },
				{ title: "SDKs", href: "/features/SDKs" },
				{ title: "Webhooks", href: "/features/webhooks" },
				{ title: "Integration", href: "/features/integration" },
			],
			featured: [
				{
					title: "Documentation",
					description: "Everything you need to build",
					href: "/features/getting-started",
					icon: "file-text",
				},
				{
					title: "API Reference",
					description: "Complete API specification",
					href: "/features/api-reference",
					icon: "brackets",
				},
			],
		},
	},
	{
		title: "AI",
		href: "/ai",
		hasDropdown: true,
		mega: {
			links: [
				{ title: "AI Inbox", href: "/ai/inbox" },
				{ title: "Agent Integration", href: "/ai/agents" },
				{ title: "LLM Tools", href: "/ai/tools" },
				{ title: "Webhooks", href: "/features/webhooks" },
			],
			featured: [
				{
					title: "AI-Native Inbox",
					description: "Automate your email workflow",
					href: "/ai/inbox",
					icon: "sparkling",
				},
				{
					title: "Agent SDK",
					description: "Build smarter autonomous agents",
					href: "/ai/agents",
					icon: "modules",
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

	const { resolvedTheme } = useTheme();
	// Light mode based on theme toggle (with SSR page fallback)
	const isLight = mounted
		? resolvedTheme === "light"
		: pathname.startsWith("/company") || pathname.startsWith("/philosophy");

	const activeItem = navItems.find((item) => item.title === activeMega);

	return (
		<header
			className="gpu-promote fixed top-0 right-0 left-0 z-50 flex justify-center p-4"
			style={{ contain: "layout style" }}
		>
			<motion.div
				onMouseLeave={() => setActiveMega(null)}
				className={`flex flex-col overflow-hidden rounded-[24px] transition-[border-color,box-shadow,background-color] duration-300 ease-out ${
					isLight
						? "w-full max-w-[1000px] border border-[#0a0d12]/10 bg-white shadow-[#0a0d12]/5 shadow-sm"
						: "w-full max-w-[1000px] border border-white/10 bg-[#0a0a0a]/95"
				}`}
			>
				<div className="flex h-15 w-full items-center justify-between pr-3 transition-all duration-500">
					<div className="flex items-center gap-6">
						<Link href="/" className="flex items-center pl-2">
							<Logo
								theme={isLight ? "light" : "dark"}
								className="w-12 transition-all duration-500"
							/>
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
							className={`inline-flex items-center justify-center gap-2 rounded-[12px] border px-4 py-2 font-semibold text-[13px] transition-all ${
								isLight
									? "border-[#0a0d12]/10 bg-[#0a0d12]/4 text-[#0a0d12] hover:border-[#0a0d12]/20 hover:bg-[#0a0d12]/8"
									: "border-white/10 bg-white/10 text-white hover:border-white/20 hover:bg-white/15"
							}`}
						>
							<Icon name="social-github" className="size-3.5" />
							<span className="hidden sm:inline">{stars}</span>
						</motion.a>
						<motion.a
							href={mounted && session ? "/dashboard" : "/dashboard/login"}
							whileTap={{ scale: 0.97 }}
							className={`inline-flex items-center justify-center gap-2 rounded-[12px] px-4 py-2 font-semibold text-[13px] transition-all hover:scale-[1.02] active:scale-[0.98] ${
								isLight ? "bg-[#0a0d12] text-white" : "bg-white text-[#0a0d12]"
							}`}
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
							<div
								className={`flex w-full p-4 pt-0 ${
									isLight
										? "border-[#0a0d12]/5 border-t"
										: "border-white/5 border-t"
								}`}
							>
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
												{isLight ? (
													<div className="flex w-full gap-4 pt-4">
														<div className="flex w-1/4 flex-col gap-1 border-[#0a0d12]/5 border-r pr-4">
															{activeItem.mega.links.map((link) => (
																<motion.div
																	key={link.title}
																	variants={itemVariants}
																>
																	<Link
																		href={link.href}
																		className="block rounded-lg px-3 py-2 font-semibold text-[#0a0d12]/50 text-[14px] transition-colors hover:bg-[#0a0d12]/4 hover:text-[#0a0d12]"
																	>
																		{link.title}
																	</Link>
																</motion.div>
															))}
														</div>
														<div className="grid flex-1 grid-cols-2 gap-3">
															{activeItem.mega.featured.map((feat) => (
																<motion.div
																	key={feat.title}
																	variants={itemVariants}
																	whileHover={{
																		scale: 1.02,
																	}}
																	whileTap={{
																		scale: 0.98,
																	}}
																>
																	<Link
																		href={feat.href}
																		className="group flex items-center gap-4 rounded-xl border border-[#0a0d12]/5 bg-[#0a0d12]/[0.02] p-4 transition-all hover:border-[#0a0d12]/10 hover:bg-[#0a0d12]/[0.04]"
																	>
																		<div className="flex size-12 items-center justify-center rounded-lg border border-[#0a0d12]/8 bg-[#0a0d12]/4">
																			<Icon
																				name={feat.icon as any}
																				className="size-6 text-[#0a0d12]/60 transition-transform group-hover:scale-110"
																			/>
																		</div>
																		<div>
																			<div className="font-semibold text-[#0a0d12] text-[14px]">
																				{feat.title}
																			</div>
																			<div className="text-[#0a0d12]/40 text-[12px]">
																				{feat.description}
																			</div>
																		</div>
																	</Link>
																</motion.div>
															))}
														</div>
													</div>
												) : (
													<div className="flex w-full gap-4 pt-4">
														<div className="flex w-1/4 flex-col gap-1 border-white/5 border-r pr-4">
															{activeItem.mega.links.map((link) => (
																<motion.div
																	key={link.title}
																	variants={itemVariants}
																>
																	<Link
																		href={link.href}
																		className="block rounded-lg px-3 py-2 font-semibold text-[14px] text-white/50 transition-colors hover:bg-white/5 hover:text-white"
																	>
																		{link.title}
																	</Link>
																</motion.div>
															))}
														</div>
														<div className="grid flex-1 grid-cols-2 gap-3">
															{activeItem.mega.featured.map((feat) => (
																<motion.div
																	key={feat.title}
																	variants={itemVariants}
																	whileHover={{
																		scale: 1.02,
																	}}
																	whileTap={{
																		scale: 0.98,
																	}}
																>
																	<Link
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
																</motion.div>
															))}
														</div>
													</div>
												)}
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
