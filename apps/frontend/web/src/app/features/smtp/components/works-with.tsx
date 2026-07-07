"use client";

import Link from "next/link";
import type { SimpleIcon } from "simple-icons";
import {
	siAuth0,
	siDjango,
	siLaravel,
	siMetabase,
	siN8n,
	siNestjs,
	siNodedotjs,
	siPhp,
	siRubyonrails,
	siShopify,
	siSpring,
	siSupabase,
	siWordpress,
	siZapier,
} from "simple-icons";

type Integration = {
	label: string;
	href: string;
	icon: SimpleIcon;
};

const smtpDocs = "/docs/quickstart/smtp";

/** Diamond layout: 1 · 2 · 3 · 2 · 3 · 2 · 1 (14 icons) */
const columns: Integration[][] = [
	[{ label: "WordPress", href: `${smtpDocs}/wordpress`, icon: siWordpress }],
	[
		{ label: "Laravel", href: `${smtpDocs}/laravel`, icon: siLaravel },
		{ label: "n8n", href: smtpDocs, icon: siN8n },
	],
	[
		{ label: "Nodemailer", href: `${smtpDocs}/nodemailer`, icon: siNodedotjs },
		{ label: "Django", href: `${smtpDocs}/django`, icon: siDjango },
		{ label: "Metabase", href: `${smtpDocs}/metabase`, icon: siMetabase },
	],
	[
		{ label: "Rails", href: `${smtpDocs}/rails`, icon: siRubyonrails },
		{ label: "Auth0", href: `${smtpDocs}/auth0`, icon: siAuth0 },
	],
	[
		{ label: "Supabase", href: `${smtpDocs}/supabase`, icon: siSupabase },
		{ label: "Zapier", href: smtpDocs, icon: siZapier },
		{ label: "NestJS", href: smtpDocs, icon: siNestjs },
	],
	[
		{ label: "PHPMailer", href: `${smtpDocs}/phpmailer`, icon: siPhp },
		{ label: "Spring", href: smtpDocs, icon: siSpring },
	],
	[{ label: "Shopify", href: smtpDocs, icon: siShopify }],
];

const integrations = columns.flat();

const columnOffsetClass: Record<number, string> = {
	1: "mt-[7.25rem]",
	2: "mt-[3.625rem]",
	3: "",
};

function IntegrationIcon({ icon }: { icon: SimpleIcon }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className="size-8 sm:size-9 lg:size-12"
			aria-hidden
		>
			<path d={icon.path} fill={`#${icon.hex}`} />
		</svg>
	);
}

function IntegrationCard({ item }: { item: Integration }) {
	const glow = `#${item.icon.hex}`;

	return (
		<Link
			href={item.href}
			aria-label={`${item.label} SMTP guide`}
			className="group relative flex flex-col items-center transition-transform duration-300 hover:scale-[1.04]"
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-2 bottom-0.5 z-0 h-8 opacity-50 blur-lg transition-opacity duration-300 group-hover:opacity-75 sm:inset-x-3 sm:h-10 lg:inset-x-4 lg:h-14 lg:blur-xl"
				style={{
					background: `radial-gradient(ellipse at center, color-mix(in srgb, ${glow} 55%, transparent) 0%, color-mix(in srgb, ${glow} 20%, transparent) 45%, transparent 75%)`,
				}}
			/>
			<div className="relative z-10 flex size-[4.5rem] items-center justify-center rounded-[18px] border border-stroke-soft-200/80 bg-transparent transition-colors duration-300 group-hover:border-stroke-soft-300 sm:size-20 lg:size-[6.75rem] lg:rounded-[26px] dark:border-white/[0.08] dark:group-hover:border-white/15">
				<IntegrationIcon icon={item.icon} />
			</div>
		</Link>
	);
}

export default function WorksWith() {
	return (
		<section id="works-with">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
				<div className="text-center">
					<h2 className="text-balance font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Works with your stack
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						No extra setup — plug Reloop into the mailer or platform you already
						use.
					</p>
				</div>

				{/* Mobile & tablet — centered wrap grid */}
				<div className="mx-auto mt-10 flex max-w-[20rem] flex-wrap justify-center gap-2.5 sm:mt-14 sm:max-w-md sm:gap-3 md:max-w-xl lg:hidden">
					{integrations.map((item) => (
						<IntegrationCard key={item.label} item={item} />
					))}
				</div>

				{/* Desktop — diamond honeycomb */}
				<div className="mt-14 hidden lg:mt-20 lg:block">
					<div className="mx-auto flex items-start justify-center gap-5">
						{columns.map((column) => (
							<div
								key={column.map((item) => item.label).join("-")}
								className={`flex flex-col gap-5 ${columnOffsetClass[column.length]}`}
							>
								{column.map((item) => (
									<IntegrationCard key={item.label} item={item} />
								))}
							</div>
						))}
					</div>
				</div>

				<div className="mt-10 text-center sm:mt-14 lg:mt-20">
					<Link
						href={smtpDocs}
						className="group inline-flex h-11 items-center justify-center overflow-hidden rounded-full border border-stroke-soft-200 bg-bg-white-0 px-5 font-medium text-[14px] text-text-strong-950 transition-colors duration-300 hover:bg-bg-weak-50 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
					>
						<span className="inline-flex items-center">
							<span className="group-hover:-translate-x-1 transition-transform duration-300 ease-out">
								Explore all integrations
							</span>
							<svg
								viewBox="0 0 24 24"
								className="ml-0 size-4 max-w-0 shrink-0 translate-x-1 opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-4 group-hover:translate-x-0 group-hover:opacity-100"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								aria-hidden
							>
								<path
									d="M5 12h14M13 6l6 6-6 6"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
					</Link>
				</div>
			</div>
		</section>
	);
}
