"use client";

import { sendEmailXCodeSamples } from "@reloop/code-samples/mail";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import {
	type BrandIcon,
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "../../../sdk/components/language-icon";
import { SdkCodeBlock } from "../../../sdk/components/sdk-code-block";
import { frameworks } from "../../../sdk/frameworks";
import { languages } from "../../../sdk/languages";

type Snippet = {
	id: string;
	name: string;
	icon: BrandIcon | null;
	/** Highlighter slug for SdkCodeBlock. */
	slug?: string;
	lang?: string;
	path: string;
	code: string;
};

type Stack = {
	id: string;
	name: string;
	icon: BrandIcon | { sprite: string };
	href: string;
	snippets: Snippet[];
};

const SMTP_CODE = `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.reloop.sh',
  port: 587,
  auth: {
    user: 'reloop',
    pass: process.env.RELOOP_API_KEY,
  },
});

await transporter.sendMail({
  from: 'Acme <onboarding@yourdomain.com>',
  to: 'delivered@yourdomain.com',
  subject: 'Hello from SMTP',
  html: '<strong>It works!</strong>',
});`;

const curlSample = sendEmailXCodeSamples.find((s) => s.id === "curl");

const STACKS: Stack[] = [
	...languages.map((language) => ({
		id: language.slug,
		name: language.name,
		icon: language.icon,
		href: `/sdk/${language.slug}`,
		snippets: [
			{
				id: language.slug,
				name: language.name,
				icon: language.icon,
				slug: language.slug,
				path: "",
				code: language.sendCode,
			},
			...frameworks
				.filter((fw) => fw.languageSlug === language.slug)
				.map((fw) => ({
					id: fw.slug,
					name: fw.name,
					icon: fw.icon,
					slug: fw.slug,
					path: "",
					code: fw.sendCode,
				})),
		],
	})),
	{
		id: "rest",
		name: "REST",
		icon: { sprite: "api" },
		href: "/docs/api",
		snippets: [
			{
				id: "curl",
				name: "cURL",
				icon: null,
				lang: "bash",
				path: "send.sh",
				code: curlSample?.source ?? "",
			},
		],
	},
	{
		id: "smtp",
		name: "SMTP",
		icon: { sprite: "smtp" },
		href: "/docs/examples/smtp/introduction",
		snippets: [
			{
				id: "nodemailer",
				name: "Nodemailer",
				icon: null,
				slug: "nodejs",
				path: "smtp.ts",
				code: SMTP_CODE,
			},
		],
	},
];

function StackIcon({
	icon,
	active,
	className,
}: {
	icon: Stack["icon"];
	active: boolean;
	className: string;
}) {
	if ("sprite" in icon)
		return <Icon name={icon.sprite} className={className} />;
	return (
		<LanguageIcon
			icon={icon}
			className={className}
			style={active ? getBrandColorStyle(icon.hex) : undefined}
		/>
	);
}

const PILL_TRANSITION = { duration: 0.2, ease: "easeOut" } as const;
const UNDERLINE_TRANSITION = { duration: 0.3, ease: "easeInOut" } as const;
const FILL_TRANSITION = { duration: 0.45, ease: "easeOut" } as const;

function FrameworkTabs({
	snippets,
	activeId,
	onSelect,
}: {
	snippets: Snippet[];
	activeId: string;
	onSelect: (id: string) => void;
}) {
	const [hoveredId, setHoveredId] = useState<string>();

	return (
		<div
			role="tablist"
			aria-label="Framework"
			className="-mx-1 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			onPointerLeave={() => setHoveredId(undefined)}
		>
			{snippets.map((s) => {
				const active = s.id === activeId;
				const hovered = s.id === hoveredId && !active;
				// Near-black brands (Next.js, Express) would vanish in dark mode,
				// so they fall back to the neutral text color instead.
				const neutral = !s.icon || isDarkBrandColor(s.icon.hex);
				return (
					<button
						key={s.id}
						type="button"
						role="tab"
						aria-selected={active}
						onPointerEnter={() => setHoveredId(s.id)}
						onClick={() => onSelect(s.id)}
						style={
							neutral
								? undefined
								: ({ "--brand": `#${s.icon?.hex}` } as React.CSSProperties)
						}
						className={cn(
							"relative isolate flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 font-medium text-[13px] transition-colors",
							active
								? neutral
									? "text-white dark:text-black"
									: "text-white"
								: hovered
									? "text-text-strong-950 dark:text-white"
									: "text-text-sub-600 dark:text-white/60",
						)}
					>
						{active && (
							<motion.span
								aria-hidden
								layoutId="integrate-framework-active"
								transition={PILL_TRANSITION}
								className={cn(
									"-z-10 absolute inset-0 rounded-full border",
									neutral
										? "border-text-strong-950 bg-text-strong-950 dark:border-white dark:bg-white"
										: "border-[color-mix(in_srgb,var(--brand),black_25%)] bg-(--brand) shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]",
								)}
							/>
						)}
						{hovered && (
							<motion.span
								aria-hidden
								layoutId="integrate-framework-hover"
								transition={PILL_TRANSITION}
								className={cn(
									"-z-20 absolute inset-0 rounded-full",
									neutral
										? "bg-neutral-alpha-10 dark:bg-white/[0.08]"
										: "bg-[color-mix(in_srgb,var(--brand)_14%,transparent)]",
								)}
							/>
						)}
						{s.icon && (
							<LanguageIcon
								icon={s.icon}
								className={cn(
									"size-3.5",
									!neutral && (active ? "text-white" : "text-(--brand)"),
								)}
							/>
						)}
						{s.name}
					</button>
				);
			})}
		</div>
	);
}

export function IntegrateSection() {
	const [stackId, setStackId] = useState(STACKS[0]?.id ?? "");
	const [snippetId, setSnippetId] = useState<string | null>(null);

	const stack = STACKS.find((s) => s.id === stackId) ?? STACKS[0];
	if (!stack) return null;
	const snippet =
		stack.snippets.find((s) => s.id === snippetId) ?? stack.snippets[0];
	if (!snippet) return null;

	const selectStack = (id: string) => {
		setStackId(id);
		setSnippetId(null);
	};

	return (
		<section
			id="integrate"
			aria-labelledby="integrate-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-16 text-left sm:px-8 sm:py-20 sm:text-center lg:px-12 dark:border-white/10">
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 dark:text-white/60">
					<Icon name="code" className="size-3.5" aria-hidden />
					Developer first
				</span>
				<h2
					id="integrate-heading"
					className="mt-3 text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
				>
					Integrate in minutes,
					<br />
					with AI agent or by hand
				</h2>
				<p className="mt-3 max-w-2xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mx-auto sm:text-base dark:text-white/60">
					A simple API that fits right into your code, with official SDKs for
					your language and a drop-in SMTP relay for everything else.
				</p>
			</div>

			<div
				role="tablist"
				aria-label="Language"
				className="flex overflow-x-auto border-stroke-soft-100 border-b [scrollbar-width:none] dark:border-white/10 [&::-webkit-scrollbar]:hidden"
			>
				{STACKS.map((s) => {
					const active = s.id === stack.id;
					// Tint the active tab with the brand color; sprites (REST, SMTP)
					// and near-black brands fall back to the neutral text color.
					const hex = "sprite" in s.icon ? null : s.icon.hex;
					const neutral = !hex || isDarkBrandColor(hex);
					return (
						<button
							key={s.id}
							type="button"
							role="tab"
							aria-selected={active}
							onClick={() => selectStack(s.id)}
							style={
								neutral
									? undefined
									: ({ "--brand": `#${hex}` } as React.CSSProperties)
							}
							className={cn(
								"group relative flex flex-[1_0_7rem] flex-col items-center gap-2.5 border-stroke-soft-100 border-r px-2 py-5 transition-colors duration-300 last:border-r-0 dark:border-white/10",
								"bg-bg-white-0 dark:bg-black",
								!active && "hover:bg-bg-weak-50 dark:hover:bg-[#080808]",
							)}
						>
							{active && (
								// Active tint grows out from the center of the tab.
								<motion.span
									aria-hidden
									initial={{ clipPath: "circle(0% at 50% 50%)" }}
									animate={{ clipPath: "circle(100% at 50% 50%)" }}
									transition={FILL_TRANSITION}
									className={cn(
										"absolute inset-0",
										neutral
											? "bg-bg-weak-50 dark:bg-[#0c0c0c]"
											: "bg-[color-mix(in_srgb,var(--brand)_8%,white)] dark:bg-[color-mix(in_srgb,var(--brand)_14%,black)]",
									)}
								/>
							)}
							{active && (
								<motion.span
									aria-hidden
									layoutId="integrate-language-underline"
									transition={UNDERLINE_TRANSITION}
									className={cn(
										"absolute inset-x-0 bottom-0 z-10 h-0.5",
										neutral
											? "bg-text-strong-950 dark:bg-white"
											: "bg-(--brand)",
									)}
								/>
							)}
							<StackIcon
								icon={s.icon}
								active={active}
								className={cn(
									"relative size-6 transition-all",
									active
										? "text-text-strong-950 dark:text-white"
										: "text-text-sub-600 opacity-70 grayscale group-hover:opacity-100 dark:text-white/60",
								)}
							/>
							<span
								className={cn(
									"relative font-medium text-[13px]",
									active
										? "text-text-strong-950 dark:text-white"
										: "text-text-sub-600 dark:text-white/50",
								)}
							>
								{s.name}
							</span>
						</button>
					);
				})}
			</div>

			<div className="border-stroke-soft-100 border-b px-4 py-3 sm:px-8 lg:px-12 dark:border-white/10">
				<FrameworkTabs
					snippets={stack.snippets}
					activeId={snippet.id}
					onSelect={setSnippetId}
				/>
			</div>

			<div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
				<SdkCodeBlock
					key={snippet.id}
					code={snippet.code}
					slug={snippet.slug}
					lang={snippet.lang}
					path={snippet.path || undefined}
				/>
			</div>

			<div className="flex flex-wrap gap-x-6 gap-y-2 border-stroke-soft-100 border-t px-4 py-4 sm:px-8 lg:px-12 dark:border-white/10">
				<Link
					href={stack.href}
					className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 hover:text-text-sub-600 dark:text-white dark:hover:text-white/70"
				>
					{stack.name} guide
					<Icon
						name="arrow-right"
						className="size-3 transition-transform group-hover:translate-x-0.5"
						aria-hidden
					/>
				</Link>
				<Link
					href="/sdk"
					className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					All SDKs & frameworks
					<Icon
						name="arrow-right"
						className="size-3 transition-transform group-hover:translate-x-0.5"
						aria-hidden
					/>
				</Link>
			</div>
		</section>
	);
}
