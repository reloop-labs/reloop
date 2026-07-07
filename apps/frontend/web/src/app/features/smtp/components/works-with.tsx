"use client";

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

/** Diamond layout: 1 · 2 · 3 · 2 · 3 · 2 · 1 (14 icons) */
const columns: Integration[][] = [
	[
		{
			label: "WordPress",
			href: "/docs/integrations/wordpress",
			icon: siWordpress,
		},
	],
	[
		{
			label: "Laravel",
			href: "/docs/examples/smtp/introduction",
			icon: siLaravel,
		},
		{ label: "n8n", href: "/docs/integrations/n8n", icon: siN8n },
	],
	[
		{
			label: "Nodemailer",
			href: "/docs/examples/smtp/nodemailer",
			icon: siNodedotjs,
		},
		{
			label: "Django",
			href: "/docs/examples/smtp/introduction",
			icon: siDjango,
		},
		{
			label: "Metabase",
			href: "/docs/examples/smtp/introduction",
			icon: siMetabase,
		},
	],
	[
		{ label: "Rails", href: "/docs/examples/smtp/ruby", icon: siRubyonrails },
		{ label: "Auth0", href: "/docs/examples/smtp/introduction", icon: siAuth0 },
	],
	[
		{
			label: "Supabase",
			href: "/docs/knowledge-base/supabase-quickstart",
			icon: siSupabase,
		},
		{ label: "Zapier", href: "/docs/integrations/zapier", icon: siZapier },
		{
			label: "NestJS",
			href: "/docs/examples/smtp/introduction",
			icon: siNestjs,
		},
	],
	[
		{ label: "PHPMailer", href: "/docs/examples/smtp/php", icon: siPhp },
		{
			label: "Spring",
			href: "/docs/examples/smtp/introduction",
			icon: siSpring,
		},
	],
	[
		{
			label: "Shopify",
			href: "/docs/examples/smtp/introduction",
			icon: siShopify,
		},
	],
];

const integrations = columns.flat();

const columnOffsetClass: Record<number, string> = {
	1: "mt-[7.25rem]",
	2: "mt-[3.625rem]",
	3: "",
};

const columnOffsetClassTopFold: Record<number, string> = {
	1: "mt-[5.5rem]",
	2: "mt-[2.75rem]",
	3: "",
};

function IntegrationIcon({
	icon,
	topFold,
}: {
	icon: SimpleIcon;
	topFold?: boolean;
}) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={
				topFold ? "size-7 sm:size-8 lg:size-10" : "size-8 sm:size-9 lg:size-12"
			}
			aria-hidden
		>
			<path d={icon.path} fill={`#${icon.hex}`} />
		</svg>
	);
}

function IntegrationCard({
	item,
	topFold,
}: {
	item: Integration;
	topFold?: boolean;
}) {
	const glow = `#${item.icon.hex}`;

	return (
		<a
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
			<div
				className={`relative z-10 flex items-center justify-center rounded-[18px] border border-stroke-soft-200/80 bg-transparent transition-colors duration-300 group-hover:border-stroke-soft-300 dark:border-white/[0.08] dark:group-hover:border-white/15 ${
					topFold
						? "size-[4rem] sm:size-[4.5rem] lg:size-[5.5rem] lg:rounded-[20px]"
						: "size-[4.5rem] sm:size-20 lg:size-[6.75rem] lg:rounded-[26px]"
				}`}
			>
				<IntegrationIcon icon={item.icon} topFold={topFold} />
			</div>
		</a>
	);
}

export default function WorksWith({ topFold = false }: { topFold?: boolean }) {
	return (
		<section id="works-with">
			<div
				className={
					topFold
						? "mx-auto max-w-[1320px] px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14"
						: "mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
				}
			>
				<div className="text-center">
					<h2
						className={
							topFold
								? "text-balance font-serif text-[2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.6rem] lg:text-[3.2rem] dark:text-white"
								: "text-balance font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white"
						}
					>
						Connect easily with any service.
					</h2>
					<p
						className={`mx-auto max-w-xl text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50 ${topFold ? "mt-3" : "mt-4"}`}
					>
						No extra setup — plug Reloop into the mailer or platform you already
						use.
					</p>
				</div>

				{/* Mobile & tablet — centered wrap grid */}
				<div
					className={`mx-auto flex max-w-[20rem] flex-wrap justify-center gap-2.5 sm:max-w-md sm:gap-3 md:max-w-xl lg:hidden ${topFold ? "mt-6 sm:mt-8" : "mt-10 sm:mt-14"}`}
				>
					{integrations.map((item) => (
						<IntegrationCard key={item.label} item={item} topFold={topFold} />
					))}
				</div>

				{/* Desktop — diamond honeycomb */}
				<div
					className={`hidden lg:block ${topFold ? "mt-8 lg:mt-10" : "mt-14 lg:mt-20"}`}
				>
					<div className="mx-auto flex items-start justify-center gap-4 lg:gap-5">
						{columns.map((column) => (
							<div
								key={column.map((item) => item.label).join("-")}
								className={`flex flex-col gap-4 lg:gap-5 ${(topFold ? columnOffsetClassTopFold : columnOffsetClass)[column.length]}`}
							>
								{column.map((item) => (
									<IntegrationCard
										key={item.label}
										item={item}
										topFold={topFold}
									/>
								))}
							</div>
						))}
					</div>
				</div>

				<div
					className={`text-center ${topFold ? "mt-8 sm:mt-10 lg:mt-12" : "mt-10 sm:mt-14 lg:mt-20"}`}
				>
					<a
						href="/docs/integrations"
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
					</a>
				</div>
			</div>
		</section>
	);
}
