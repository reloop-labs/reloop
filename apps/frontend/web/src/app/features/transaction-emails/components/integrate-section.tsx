"use client";

import { sendEmailXCodeSamples } from "@reloop/code-samples/mail";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useState } from "react";
import {
	type BrandIcon,
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
	install?: string;
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
		install: language.installCommand,
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
		install: "npm install nodemailer",
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
	className,
}: {
	icon: Stack["icon"];
	className: string;
}) {
	if ("sprite" in icon)
		return <Icon name={icon.sprite} className={className} />;
	return <LanguageIcon icon={icon} className={className} />;
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
			<div className="border-stroke-soft-100 border-b px-4 py-16 text-center sm:px-8 sm:py-20 lg:px-12 dark:border-white/10">
				<h2
					id="integrate-heading"
					className="text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
				>
					Integrate in minutes
				</h2>
				<p className="mx-auto mt-3 max-w-2xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
					A simple API that fits right into your code, with official SDKs for
					your language and a drop-in SMTP relay for everything else.
				</p>
			</div>

			<div
				role="tablist"
				aria-label="Language"
				className="flex gap-px overflow-x-auto border-stroke-soft-100 border-b bg-stroke-soft-100 lg:grid lg:grid-cols-11 lg:overflow-visible dark:border-white/10 dark:bg-white/10"
			>
				{STACKS.map((s) => {
					const active = s.id === stack.id;
					return (
						<button
							key={s.id}
							type="button"
							role="tab"
							aria-selected={active}
							onClick={() => selectStack(s.id)}
							className={cn(
								"group relative flex min-w-[88px] flex-1 flex-col items-center gap-2.5 px-2 py-5 transition-colors",
								active
									? "bg-bg-weak-50 dark:bg-white/[0.04]"
									: "bg-bg-white-0 hover:bg-bg-weak-50 dark:bg-black dark:hover:bg-white/[0.03]",
							)}
						>
							{active && (
								<span
									aria-hidden
									className="absolute inset-x-0 top-0 h-0.5 bg-text-strong-950 dark:bg-white"
								/>
							)}
							<StackIcon
								icon={s.icon}
								className={cn(
									"size-6 transition-all",
									active
										? "text-text-strong-950 dark:text-white"
										: "text-text-sub-600 opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0 dark:text-white/60",
								)}
							/>
							<span
								className={cn(
									"font-medium text-[13px]",
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

			<div className="flex flex-col gap-3 border-stroke-soft-100 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12 dark:border-white/10">
				<div
					role="tablist"
					aria-label="Framework"
					className="-mx-1 flex gap-1 overflow-x-auto"
				>
					{stack.snippets.map((s) => {
						const active = s.id === snippet.id;
						return (
							<button
								key={s.id}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setSnippetId(s.id)}
								className={cn(
									"flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-[13px] transition-colors",
									active
										? "bg-bg-weak-50 text-text-strong-950 ring-1 ring-stroke-soft-200 dark:bg-white/[0.06] dark:text-white dark:ring-white/10"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/50 dark:hover:text-white",
								)}
							>
								{s.icon && <LanguageIcon icon={s.icon} className="size-3.5" />}
								{s.name}
							</button>
						);
					})}
				</div>
				{stack.install && (
					<code className="shrink-0 font-mono text-[12.5px] text-text-sub-600 dark:text-white/50">
						<span className="text-text-soft-400 dark:text-white/30">$ </span>
						{stack.install}
					</code>
				)}
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
