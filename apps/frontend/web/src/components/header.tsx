"use client";

import { authClient } from "@reloop/auth/client";
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
						{ title: "Marketing Teams", href: "/features/marketing-teams" },
						{ title: "Developers", href: "/features/developers" },
						{ title: "Integrations", href: "/features/integration" },
					],
				},
				{
					title: "Developers",
					links: [
						{ title: "SDKs", href: "/docs/resources/sdks" },
						{ title: "API Reference", href: "/docs/api-reference" },
						{ title: "Getting Started", href: "/docs/getting-started" },
						{ title: "Campaign Builder", href: "/docs/campaign-builder" },
						{ title: "Languages", href: "/features/languages" },
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
						{ title: "Blog", href: "/company/blog" },
						{ title: "Changelog", href: "/resources/changelog" },
						{ title: "Glossary", href: "/resources/glossary" },
						{ title: "Community", href: "/resources/community" },
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
						{ title: "Free tools", href: "/resources/tools" },
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
		href: "/company/about-us",
		mega: {
			categories: [
				{
					title: "Company",
					links: [
						{ title: "About", href: "/company/about-us" },
						{ title: "Contact", href: "/company/contact-us" },
						{ title: "Blog", href: "/company/blog" },
						{ title: "Pricing", href: "/pricing" },
					],
				},
				{
					title: "Open Source",
					links: [
						{ title: "Why Open Source", href: "/philosophy/why-open-source" },
						{ title: "Self-host", href: "/docs/self-host" },
						{ title: "License", href: "/company/license" },
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
];

function MegaLink({ link }: { link: NavLink }) {
	return (
		<Link
			href={link.href}
			{...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
			className="group inline-flex items-center gap-1 font-medium text-[18px] text-text-strong-950 leading-snug transition-colors hover:text-text-strong-950/70 dark:text-white dark:hover:text-white/70"
		>
			{link.title}
			{link.external && (
				<span className="group-hover:-translate-y-px text-[12px] text-text-sub-600 transition-transform group-hover:translate-x-px dark:text-white/45">
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
	const [mounted, setMounted] = useState(false);
	const [stars, setStars] = useState<string>("GitHub");

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

	const activeItem = navItems.find((item) => item.title === activeMega);

	return (
		<header
			className="fixed top-0 right-0 left-0 z-50 border-stroke-soft-200/70 border-b bg-bg-white-0 dark:border-white/10 dark:bg-black"
			onMouseLeave={() => setActiveMega(null)}
		>
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center">
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
								<Link
									href={item.href}
									className={`inline-flex items-center gap-1 px-3 py-2 font-medium text-[14px] transition-colors ${
										activeMega === item.title
											? "text-text-strong-950 dark:text-white"
											: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
									}`}
								>
									{item.title}
									{item.mega && (
										<Icon
											name="chevron-down"
											className={`size-3 transition-transform duration-200 ${
												activeMega === item.title ? "rotate-180" : "opacity-50"
											}`}
										/>
									)}
								</Link>
							</div>
						))}
					</nav>

					<div className="flex items-center gap-3 justify-self-end sm:gap-4">
						<a
							href="https://github.com/reloop-labs/reloop"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 px-1 py-2 font-medium text-[13px] text-text-strong-950 transition-opacity hover:opacity-70 dark:text-white"
						>
							<Icon name="social-github" className="size-3.5" />
							<span className="hidden sm:inline">{stars}</span>
						</a>

						{mounted && session ? (
							<Link
								href="/dashboard"
								className="inline-flex items-center justify-center rounded-full bg-text-strong-950 px-4 py-1.5 font-medium text-[13px] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
							>
								Dashboard
							</Link>
						) : (
							<>
								<Link
									href="/dashboard/login"
									className="hidden font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 sm:inline dark:text-white/55 dark:hover:text-white"
								>
									Log in
								</Link>
								<Link
									href="/dashboard/signup"
									className="inline-flex items-center justify-center rounded-full bg-text-strong-950 px-4 py-1.5 font-medium text-[13px] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
								>
									Sign up
								</Link>
							</>
						)}
					</div>
				</div>

				<AnimatePresence>
					{activeMega && activeItem?.mega && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
							className="overflow-hidden"
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
