"use client";

import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavLink = {
	title: string;
	href: string;
	external?: boolean;
};

type NavCategory = {
	title: string;
	links: NavLink[];
};

type NavItem = {
	title: string;
	href: string;
	mega?: { categories: NavCategory[] };
};

const navItems: NavItem[] = [
	{
		title: "Products",
		href: "/features",
		mega: {
			categories: [
				{
					title: "Email",
					links: [
						{ title: "Campaigns", href: "/features/campaigns" },
						{
							title: "Transaction Emails",
							href: "/features/transaction-emails",
						},
						{ title: "SMTP Relay", href: "/features/smtp" },
						{ title: "Email Analytics", href: "/features/email-analytics" },
						{ title: "Email Validation", href: "/features/email-validation" },
						{ title: "Email Templates", href: "/features/email-templates" },
					],
				},
				{
					title: "Feather",
					links: [
						{ title: "AI Agents", href: "/features/ai-agents" },
						{ title: "Webhooks", href: "/features/webhooks" },
						{ title: "Deliverability", href: "/features/deliverability" },
						{ title: "Marketing Teams", href: "/features/campaigns" },
						{ title: "Developers", href: "/developers" },
						{ title: "Integrations", href: "/docs/integrations" },
					],
				},
				{
					title: "Developers",
					links: [
						{ title: "SDKs", href: "/docs/resources/sdks" },
						{ title: "API Reference", href: "/docs/api" },
						{ title: "Getting Started", href: "/docs" },
						{ title: "Campaign Builder", href: "/docs/features/templates" },
						{ title: "Languages", href: "/languages" },
						{ title: "Webhooks", href: "/docs/webhooks" },
					],
				},
			],
		},
	},
	{
		title: "Resources",
		href: "/resources",
		mega: {
			categories: [
				{
					title: "Learn",
					links: [
						{ title: "Blog", href: "/blog" },
						{ title: "Changelog", href: "/changelog" },
						{ title: "Glossary", href: "/glossary" },
						{ title: "Community", href: "/community" },
						{ title: "Documentation", href: "/docs" },
					],
				},
				{
					title: "Compare",
					links: [
						{ title: "vs Resend", href: "/compare/resend" },
						{ title: "vs SendGrid", href: "/compare/sendgrid" },
						{ title: "vs Mailgun", href: "/compare/mailgun" },
						{ title: "vs AWS SES", href: "/compare/aws-ses" },
						{ title: "All comparisons", href: "/compare" },
					],
				},
				{
					title: "Tools",
					links: [
						{ title: "Free tools", href: "/tools" },
						{ title: "Email validator", href: "/tools/email-validator" },
						{ title: "Subject tester", href: "/tools/subject-tester" },
						{ title: "Template generator", href: "/tools/template-generator" },
						{
							title: "Deliverability tester",
							href: "/tools/deliverability-tester",
						},
					],
				},
			],
		},
	},
	{
		title: "Company",
		href: "/about",
		mega: {
			categories: [
				{
					title: "Company",
					links: [
						{ title: "About", href: "/about" },
						{ title: "Contact", href: "/contact" },
						{ title: "Blog", href: "/blog" },
						{ title: "Pricing", href: "/pricing" },
					],
				},
				{
					title: "Open Source",
					links: [
						{ title: "Why Open Source", href: "/philosophy/why-open-source" },
						{ title: "Self-host", href: "/docs/self-host" },
						{ title: "License", href: "/license" },
						{
							title: "GitHub",
							href: "https://github.com/reloop-labs/reloop",
							external: true,
						},
					],
				},
				{
					title: "Philosophy",
					links: [
						{ title: "Why Reloop", href: "/philosophy/why-reloop" },
						{
							title: "What We Stand For",
							href: "/philosophy/what-we-stand-for",
						},
						{
							title: "Product Beliefs",
							href: "/philosophy/our-product-beliefs",
						},
						{ title: "Engineering", href: "/philosophy/engineering" },
					],
				},
			],
		},
	},
	{ title: "Pricing", href: "/pricing" },
	{ title: "Contact", href: "/contact" },
];

function MegaLink({ link }: { link: NavLink }) {
	const isCrossDomain =
		link.href.startsWith("/docs") || link.href.startsWith("/dashboard");

	if (isCrossDomain) {
		return (
			<a
				href={link.href}
				{...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
				className="group inline-flex items-center gap-1 font-medium text-[18px] text-text-strong-950 leading-snug transition-colors hover:text-text-strong-950/70 dark:text-white dark:hover:text-white/70"
			>
				{link.title}
				{link.external && (
					<span className="group-hover:-translate-y-px text-[12px] text-text-sub-600 transition-transform group-hover:translate-x-px dark:text-white/55">
						↗
					</span>
				)}
			</a>
		);
	}

	return (
		<Link
			href={link.href}
			{...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
			className="group inline-flex items-center gap-1 font-medium text-[18px] text-text-strong-950 leading-snug transition-colors hover:text-text-strong-950/70 dark:text-white dark:hover:text-white/70"
		>
			{link.title}
			{link.external && (
				<span className="group-hover:-translate-y-px text-[12px] text-text-sub-600 transition-transform group-hover:translate-x-px dark:text-white/55">
					↗
				</span>
			)}
		</Link>
	);
}

export const Header = () => {
	const { useSession } = authClient;
	const { data: session } = useSession();
	const [activeMega, setActiveMega] = useState<string | null>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);
	const [stars, setStars] = useState<string>("GitHub");
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > 0);
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		setMounted(true);

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

	useEffect(() => {
		if (!mobileMenuOpen) {
			document.body.style.overflow = "";
			return;
		}

		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileMenuOpen]);

	const closeMobileMenu = () => {
		setMobileMenuOpen(false);
		setExpandedMobile(null);
	};

	const toggleMobileMenu = () => {
		setMobileMenuOpen((open) => {
			if (open) setExpandedMobile(null);
			return !open;
		});
		setActiveMega(null);
	};

	const activeItem = navItems.find((item) => item.title === activeMega);

	return (
		<header
			className={cn(
				"fixed top-0 right-0 left-0 z-50 bg-bg-white-0 transition-[border-color] duration-200 dark:bg-black",
				scrolled
					? "border-stroke-soft-200/70 border-b dark:border-white/10"
					: "border-transparent border-b",
			)}
			onMouseLeave={() => setActiveMega(null)}
		>
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="grid h-16 grid-cols-[1fr_auto] items-center lg:grid-cols-[1fr_auto_1fr]">
					<Link
						href="/"
						className="flex shrink-0 items-center gap-2.5 justify-self-start"
						aria-label="Reloop home"
					>
						<Logo className="size-11 text-text-strong-950 dark:text-white" />
						<span className="-ml-3 font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
							Reloop
						</span>
					</Link>

					<nav className="hidden items-center justify-self-center lg:flex">
						{navItems.map((item) => (
							<div
								key={item.title}
								className="relative"
								onMouseEnter={() =>
									item.mega ? setActiveMega(item.title) : setActiveMega(null)
								}
							>
								{item.mega ? (
									<span
										className={`inline-flex cursor-default items-center gap-1 px-3 py-2 font-medium text-[14px] transition-colors ${
											activeMega === item.title
												? "text-text-strong-950 dark:text-white"
												: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
										}`}
									>
										{item.title}
										<Icon
											name="chevron-down"
											className={`size-3 transition-transform duration-200 ${
												activeMega === item.title ? "rotate-180" : "opacity-50"
											}`}
										/>
									</span>
								) : (
									<Link
										href={item.href}
										className={`inline-flex items-center gap-1 px-3 py-2 font-medium text-[14px] transition-colors ${
											activeMega === item.title
												? "text-text-strong-950 dark:text-white"
												: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
										}`}
									>
										{item.title}
									</Link>
								)}
							</div>
						))}
					</nav>

					<div className="hidden items-center gap-3 justify-self-end sm:gap-4 lg:flex">
						<a
							href="https://github.com/reloop-labs/reloop"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 px-1 py-2 font-medium text-[13px] text-text-strong-950 transition-opacity hover:opacity-70 dark:text-white"
						>
							<Icon name="social-github" className="size-3.5" />
							<span>{stars}</span>
						</a>

						{mounted && session ? (
							<a
								href="/dashboard"
								className="inline-flex items-center justify-center rounded-full bg-text-strong-950 px-4 py-1.5 font-medium text-[13px] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
							>
								Dashboard
							</a>
						) : (
							<>
								<a
									href="/dashboard/login"
									className="font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
								>
									Log in
								</a>
								<a
									href="/dashboard/signup"
									className="inline-flex items-center justify-center rounded-full bg-text-strong-950 px-4 py-1.5 font-medium text-[13px] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
								>
									Sign up
								</a>
							</>
						)}
					</div>

					<button
						type="button"
						className="inline-flex size-10 items-center justify-center rounded-lg text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] lg:hidden dark:text-white dark:hover:bg-white/[0.06]"
						onClick={toggleMobileMenu}
						aria-expanded={mobileMenuOpen}
						aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
					>
						<Icon name={mobileMenuOpen ? "cross" : "menu"} className="size-5" />
					</button>
				</div>

				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
							className="overflow-hidden border-stroke-soft-200/70 border-t lg:hidden dark:border-white/10"
						>
							<div className="max-h-[calc(100dvh-4rem)] overflow-y-auto py-4">
								<nav className="flex flex-col gap-1">
									{navItems.map((item) =>
										item.mega ? (
											<div key={item.title}>
												<button
													type="button"
													className="flex w-full items-center justify-between rounded-lg px-2 py-3 font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
													onClick={() =>
														setExpandedMobile((current) =>
															current === item.title ? null : item.title,
														)
													}
													aria-expanded={expandedMobile === item.title}
												>
													{item.title}
													<Icon
														name="chevron-down"
														className={`size-4 transition-transform duration-200 ${
															expandedMobile === item.title
																? "rotate-180"
																: "opacity-50"
														}`}
													/>
												</button>
												<AnimatePresence initial={false}>
													{expandedMobile === item.title && (
														<motion.div
															initial={{ height: 0, opacity: 0 }}
															animate={{ height: "auto", opacity: 1 }}
															exit={{ height: 0, opacity: 0 }}
															transition={{
																duration: 0.2,
																ease: [0.23, 1, 0.32, 1],
															}}
															className="overflow-hidden"
														>
															<div className="space-y-6 pb-4 pl-2">
																{item.mega.categories.map((category) => (
																	<div key={category.title}>
																		<p className="mb-3 text-[12px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/55">
																			{category.title}
																		</p>
																		<div className="flex flex-col gap-2">
																			{category.links.map((link) => {
																				const isCrossDomain =
																					link.href.startsWith("/docs") ||
																					link.href.startsWith("/dashboard");
																				const linkProps = {
																					key: link.title,
																					href: link.href,
																					onClick: closeMobileMenu,
																					className:
																						"inline-flex items-center gap-1 py-1 font-medium text-[15px] text-text-strong-950 transition-colors hover:text-text-strong-950/70 dark:text-white dark:hover:text-white/70",
																					...(link.external
																						? {
																								target: "_blank",
																								rel: "noreferrer",
																							}
																						: {}),
																				};

																				if (isCrossDomain) {
																					return (
																						<a {...linkProps}>
																							{link.title}
																							{link.external && (
																								<span className="text-[12px] text-text-sub-600 dark:text-white/55">
																									↗
																								</span>
																							)}
																						</a>
																					);
																				}

																				return (
																					<Link {...linkProps}>
																						{link.title}
																						{link.external && (
																							<span className="text-[12px] text-text-sub-600 dark:text-white/55">
																								↗
																							</span>
																						)}
																					</Link>
																				);
																			})}
																		</div>
																	</div>
																))}
															</div>
														</motion.div>
													)}
												</AnimatePresence>
											</div>
										) : (
											<Link
												key={item.title}
												href={item.href}
												onClick={closeMobileMenu}
												className="rounded-lg px-2 py-3 font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
											>
												{item.title}
											</Link>
										),
									)}
								</nav>

								<div className="mt-6 flex flex-col gap-3 border-stroke-soft-200/70 border-t pt-6 dark:border-white/10">
									<a
										href="https://github.com/reloop-labs/reloop"
										target="_blank"
										rel="noreferrer"
										onClick={closeMobileMenu}
										className="inline-flex items-center gap-2 rounded-lg px-2 py-3 font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
									>
										<Icon name="social-github" className="size-4" />
										{stars}
									</a>

									{mounted && session ? (
										<a
											href="/dashboard"
											onClick={closeMobileMenu}
											className="inline-flex items-center justify-center rounded-full bg-text-strong-950 px-4 py-3 font-medium text-[15px] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
										>
											Dashboard
										</a>
									) : (
										<div className="grid grid-cols-2 gap-3">
											<a
												href="/dashboard/login"
												onClick={closeMobileMenu}
												className="inline-flex items-center justify-center rounded-full border border-stroke-soft-200 px-4 py-3 font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] dark:border-white/15 dark:text-white dark:hover:bg-white/[0.06]"
											>
												Log in
											</a>
											<a
												href="/dashboard/signup"
												onClick={closeMobileMenu}
												className="inline-flex items-center justify-center rounded-full bg-text-strong-950 px-4 py-3 font-medium text-[15px] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
											>
												Sign up
											</a>
										</div>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{activeMega && activeItem?.mega && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
							className="hidden overflow-hidden lg:block"
						>
							<div className="pt-2 pb-10">
								<div className="grid grid-cols-[1fr_auto_1fr]">
									<div />
									<div className="flex flex-wrap justify-center gap-x-20 gap-y-10">
										{activeItem.mega.categories.map((category) => (
											<div key={category.title} className="min-w-[160px]">
												<p className="mb-4 text-[13px] text-text-sub-600 dark:text-[#888888]">
													{category.title}
												</p>
												<div className="flex flex-col gap-3">
													{category.links.map((link) => (
														<MegaLink key={link.title} link={link} />
													))}
												</div>
											</div>
										))}
									</div>
									<div />
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</header>
	);
};
