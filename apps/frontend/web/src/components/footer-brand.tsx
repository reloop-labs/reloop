import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";
import type { ReactNode } from "react";
import { siApache } from "simple-icons";
import { FooterBlast } from "./footer-blast";

const socials: {
	label: string;
	href: string;
	external?: boolean;
	icon: ReactNode;
}[] = [
	{
		label: "Linkedin",
		href: socialProfiles.linkedin,
		external: true,
		icon: <Icon name="linkedin" className="size-4" />,
	},
	{
		label: "X (Twitter)",
		href: socialProfiles.x,
		external: true,
		icon: <Icon name="twitter" className="size-4" />,
	},
	{
		label: "Github",
		href: socialProfiles.github,
		external: true,
		icon: <Icon name="github" className="size-4" />,
	},
	{
		label: "Discord",
		href: socialProfiles.discord,
		external: true,
		icon: <DiscordIcon className="size-4" />,
	},
];

function DiscordIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={className}
			aria-hidden
			fill="currentColor"
		>
			<path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
		</svg>
	);
}

function ApacheMark() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="size-7 shrink-0"
			aria-hidden
			fill={`#${siApache.hex}`}
		>
			<title>Apache</title>
			<path d={siApache.path} />
		</svg>
	);
}

const SEAL_POINTS = Array.from({ length: 32 }, (_, i) => {
	const radius = i % 2 === 0 ? 42 : 36;
	const angle = (Math.PI * i) / 16 - Math.PI / 2;
	return `${(44 + radius * Math.cos(angle)).toFixed(1)},${(44 + radius * Math.sin(angle)).toFixed(1)}`;
}).join(" ");

export type FooterBrandAccent = "default" | "emerald" | "ink";

const accentSealText: Record<FooterBrandAccent, string> = {
	default: "text-primary-base",
	emerald: "text-[#047857] dark:text-[#6ee7b7]",
	ink: "text-[#24292f] dark:text-white",
};

function OpenSourceSeal({ accent }: { accent: FooterBrandAccent }) {
	return (
		<div className="relative flex size-[92px] items-center justify-center">
			<svg
				viewBox="0 0 88 88"
				className="absolute inset-0 size-full"
				aria-hidden
			>
				<polygon
					points={SEAL_POINTS}
					className="fill-bg-white-0 stroke-stroke-soft-100 dark:fill-black dark:stroke-white/15"
					strokeWidth="1"
				/>
				<circle
					cx="44"
					cy="44"
					r="31"
					className="stroke-stroke-soft-100 dark:stroke-white/15"
					fill="none"
					strokeWidth=".8"
				/>
			</svg>
			<div className="relative flex flex-col items-center leading-none">
				<span
					className={cn(
						"font-semibold text-[11px] tracking-[0.16em]",
						accentSealText[accent],
					)}
				>
					OPEN
				</span>
				<span className="mt-1 text-[10px] text-text-sub-600 dark:text-white/50">
					SOURCE
				</span>
			</div>
		</div>
	);
}

function BrandCell({
	href,
	external,
	className,
	children,
}: {
	href: string;
	external?: boolean;
	className?: string;
	children: ReactNode;
}) {
	const classes = cn(
		"flex items-center gap-3 px-5 py-4 text-[14px] text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 sm:px-6 dark:text-white/55 dark:hover:bg-white/[0.03] dark:hover:text-white",
		className,
	);

	if (external || href.startsWith("/docs") || href.startsWith("/dashboard")) {
		return (
			<a
				href={href}
				{...(external ? { target: "_blank", rel: "noreferrer" } : {})}
				className={classes}
			>
				{children}
			</a>
		);
	}

	return (
		<Link href={href} className={classes}>
			{children}
		</Link>
	);
}

export function FooterBrand({
	accent = "default",
}: {
	accent?: FooterBrandAccent;
}) {
	return (
		<div className="grid border-stroke-soft-100 border-t border-b lg:grid-cols-2 dark:border-white/10">
			<div className="relative overflow-hidden border-stroke-soft-100 border-b p-8 sm:p-10 lg:border-r lg:border-b-0 dark:border-white/10">
				<div
					aria-hidden="true"
					className="absolute inset-0 opacity-80 [-webkit-mask-image:radial-gradient(ellipse_75%_85%_at_78%_45%,black_20%,transparent_70%)] [mask-image:radial-gradient(ellipse_75%_85%_at_78%_45%,black_20%,transparent_70%)] dark:opacity-60"
				>
					<FooterBlast accent={accent} />
				</div>
				<Link
					href="/home"
					className="relative z-10 inline-flex items-center gap-2"
					aria-label="Reloop home"
				>
					<Logo className="size-8 text-text-strong-950 dark:text-white" />
					<span className="font-semibold text-[18px] text-text-strong-950 tracking-tight dark:text-white">
						Reloop
					</span>
				</Link>
				<p className="relative z-10 mt-8 max-w-[16rem] font-semibold text-[1.65rem] text-text-strong-950 leading-[1.2] tracking-tight sm:mt-10 sm:max-w-[18rem] sm:text-[1.85rem] dark:text-white">
					Email API for Developers
				</p>
			</div>

			<div className="grid grid-cols-2">
				<Link
					href="/why-open-source"
					className="flex flex-col justify-between gap-4 border-stroke-soft-100 border-r border-b px-5 py-6 transition-colors hover:bg-bg-weak-50 sm:px-6 dark:border-white/10 dark:hover:bg-white/[0.03]"
				>
					<p className="inline-flex items-center gap-1.5 text-[13px] text-text-sub-600 dark:text-white/45">
						Trust
						<Icon
							name="shield-check"
							className="size-3.5 opacity-50"
							fill="none"
						/>
					</p>
					<OpenSourceSeal accent={accent} />
				</Link>

				<Link
					href="/license"
					className="flex flex-col justify-start gap-2.5 border-stroke-soft-100 border-b px-5 py-6 transition-colors hover:bg-bg-weak-50 sm:px-6 dark:border-white/10 dark:hover:bg-white/[0.03]"
				>
					<p className="text-[13px] text-text-sub-600 dark:text-white/45">
						Licensed under
					</p>
					<span className="inline-flex items-center gap-2.5 font-medium text-[15px] text-text-strong-950 dark:text-white">
						<ApacheMark />
						Apache 2.0
					</span>
				</Link>

				{socials.map((social, index) => (
					<BrandCell
						key={social.label}
						href={social.href}
						external={social.external}
						className={cn(
							index % 2 === 0 && "border-r",
							index < socials.length - 2 && "border-b",
							"border-stroke-soft-100 dark:border-white/10",
						)}
					>
						{social.icon}
						{social.label}
					</BrandCell>
				))}
			</div>
		</div>
	);
}
