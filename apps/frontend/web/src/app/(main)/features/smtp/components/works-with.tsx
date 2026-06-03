"use client";

import Link from "next/link";
import type { SimpleIcon } from "simple-icons";
import {
	siAuth0,
	siDjango,
	siLaravel,
	siMetabase,
	siNestjs,
	siNextdotjs,
	siNodedotjs,
	siPhp,
	siRetool,
	siRubyonrails,
	siShopify,
	siSpring,
	siSupabase,
	siWordpress,
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
		{ label: "Retool", href: `${smtpDocs}/retool`, icon: siRetool },
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
		{ label: "NextAuth", href: `${smtpDocs}/nextauth`, icon: siNextdotjs },
		{ label: "NestJS", href: smtpDocs, icon: siNestjs },
	],
	[
		{ label: "PHPMailer", href: `${smtpDocs}/phpmailer`, icon: siPhp },
		{ label: "Spring", href: smtpDocs, icon: siSpring },
	],
	[{ label: "Shopify", href: smtpDocs, icon: siShopify }],
];

const columnOffsetClass: Record<number, string> = {
	1: "mt-[4.75rem] sm:mt-[5.5rem] lg:mt-[7.25rem]",
	2: "mt-[2.375rem] sm:mt-[2.75rem] lg:mt-[3.625rem]",
	3: "",
};

function IntegrationIcon({ icon }: { icon: SimpleIcon }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className="size-10 sm:size-11 lg:size-12"
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
				className="pointer-events-none absolute inset-x-3 bottom-1 z-0 h-10 opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-75 sm:inset-x-4 sm:h-12 lg:h-14"
				style={{
					background: `radial-gradient(ellipse at center, color-mix(in srgb, ${glow} 55%, transparent) 0%, color-mix(in srgb, ${glow} 20%, transparent) 45%, transparent 75%)`,
				}}
			/>
			<div className="relative z-10 flex size-[5.5rem] items-center justify-center rounded-[22px] border border-stroke-soft-200/80 bg-transparent transition-colors duration-300 group-hover:border-stroke-soft-300 sm:size-24 lg:size-[6.75rem] lg:rounded-[26px] dark:border-white/[0.08] dark:group-hover:border-white/15">
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
					<h2 className="font-serif text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3rem] lg:text-[3.6rem] dark:text-white">
						Works with your stack
					</h2>
				</div>

				<div className="-mx-4 mt-14 overflow-x-auto px-4 sm:mx-0 sm:mt-16 sm:overflow-visible sm:px-0 lg:mt-20">
					<div className="mx-auto flex min-w-max items-start justify-center gap-3 sm:min-w-0 sm:gap-4 lg:gap-5">
						{columns.map((column) => (
							<div
								key={column.map((item) => item.label).join("-")}
								className={`flex flex-col gap-3 sm:gap-4 lg:gap-5 ${columnOffsetClass[column.length]}`}
							>
								{column.map((item) => (
									<IntegrationCard key={item.label} item={item} />
								))}
							</div>
						))}
					</div>
				</div>

				<p className="mx-auto mt-14 max-w-xl text-center text-[15px] text-text-sub-600 leading-7 sm:mt-16 lg:mt-20 dark:text-white/50">
					No extra setup — plug Reloop into the mailer or platform you already
					use.
				</p>

				<div className="mt-8 text-center">
					<Link
						href={smtpDocs}
						className="inline-flex items-center gap-1.5 font-semibold text-primary-base text-sm transition-colors hover:text-primary-dark"
					>
						Explore all integrations
						<svg
							viewBox="0 0 24 24"
							className="size-4"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden
						>
							<path
								d="M7 17L17 7M17 7H8M17 7V16"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</Link>
				</div>
			</div>
		</section>
	);
}
