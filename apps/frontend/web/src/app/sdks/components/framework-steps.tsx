"use client";

import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FrameworkDefinition, FrameworkSlug } from "../frameworks";
import { LanguageIcon } from "./language-icon";
import { SdkCodeBlock } from "./sdk-code-block";

type StepDef = {
	id: string;
	number: number;
	label: string;
	title: string;
	body: string;
	code: string;
	isShell: boolean;
	filename: string | null;
	cta?: { href: string; label: string };
};

/** Docs example pages that exist for a framework; else language examples hub. */
const FRAMEWORK_EXAMPLES_PATH: Partial<Record<FrameworkSlug, string>> = {
	nextjs: "/docs/examples/nodejs/nextjs",
	express: "/docs/examples/nodejs/express",
	django: "/docs/examples/python/django",
	fastapi: "/docs/examples/python/fastapi",
	flask: "/docs/examples/python/flask",
	laravel: "/docs/examples/php/laravel",
	rails: "/docs/examples/ruby/rails",
	gin: "/docs/examples/go/gin",
};

const LANGUAGE_EXAMPLES_PATH: Record<string, string> = {
	nodejs: "/docs/examples/nodejs",
	python: "/docs/examples/python",
	php: "/docs/examples/php",
	ruby: "/docs/examples/ruby",
	go: "/docs/examples/go",
	rust: "/docs/examples/rust",
};

function getExamplesPath(framework: FrameworkDefinition): string {
	return (
		FRAMEWORK_EXAMPLES_PATH[framework.slug] ??
		LANGUAGE_EXAMPLES_PATH[framework.languageSlug] ??
		"/docs/examples"
	);
}

type ResourceCard = {
	title: string;
	description: string;
	href: string;
	iconName: string;
};

function FrameworkResources({
	framework,
}: {
	framework: FrameworkDefinition;
}) {
	const cards: ResourceCard[] = [
		{
			title: "Examples",
			description: `Copy-paste ${framework.name} snippets and full integration guides.`,
			href: getExamplesPath(framework),
			iconName: "brackets",
		},
		{
			title: `${framework.languageName} docs`,
			description: `Install the SDK, authenticate, and send your first email.`,
			href: framework.docsPath,
			iconName: "book-open",
		},
		{
			title: "API reference",
			description: "Every REST endpoint, request body, and response shape.",
			href: "/docs/api",
			iconName: "api",
		},
	];

	return (
		<div className="border-stroke-soft-200 border-t dark:border-white/10">
			<div className="flex flex-col items-start gap-2.5 border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10">
				<Icon
					name="book-open"
					className="size-5 shrink-0 text-text-strong-950 dark:text-white"
					aria-hidden
				/>
				<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
					Examples, docs, and API reference
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-3 sm:gap-4 sm:p-10 lg:p-12">
				{cards.map((card) => (
					<a
						key={card.title}
						href={card.href}
						className="group relative flex flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 transition-all duration-200 hover:border-stroke-soft-300 hover:bg-bg-weak-50 dark:border-white/10 dark:bg-black dark:hover:border-white/20 dark:hover:bg-white/[0.04]"
					>
						<div
							aria-hidden
							className="pointer-events-none absolute inset-0 text-stroke-soft-200/70 dark:text-white/[0.06]"
							style={{
								backgroundImage:
									"repeating-linear-gradient(-45deg, transparent 0, transparent 10px, currentColor 10px, currentColor 10.75px)",
								maskImage:
									"linear-gradient(to bottom right, black 0%, transparent 70%)",
								WebkitMaskImage:
									"linear-gradient(to bottom right, black 0%, transparent 70%)",
							}}
						/>
						<div className="relative z-10 flex flex-col gap-3.5">
							<div className="flex items-start justify-between">
								<span className="flex size-9 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
									<Icon name={card.iconName} className="size-4" />
								</span>
								<Icon
									name="arrow-up-right"
									className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-white/50"
									aria-hidden
								/>
							</div>
							<div>
								<p className="font-semibold text-[14px] text-text-strong-950 tracking-tight dark:text-white">
									{card.title}
								</p>
								<p className="mt-1 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/55">
									{card.description}
								</p>
							</div>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}

export default function FrameworkSteps({
	framework,
}: {
	framework: FrameworkDefinition;
}) {
	const envLine = 'RELOOP_API_KEY="re_xxxxxxxx"';

	const steps: StepDef[] = [
		{
			id: "install",
			number: 1,
			label: "Install",
			title: "Install the package",
			body: `Add the official ${framework.languageName} client to your ${framework.name} project.`,
			code: framework.installCommand,
			isShell: true,
			filename: null,
		},
		{
			id: "api-key",
			number: 2,
			label: "API key",
			title: "Set your API key",
			body: `Create a free Reloop account, copy your API key, and add it to your ${framework.name} environment.`,
			code: envLine,
			isShell: true,
			filename: null,
			cta: { href: "/dashboard/signup", label: "Get an API key free →" },
		},
		{
			id: "send",
			number: 3,
			label: "Send",
			title: `Send email from ${framework.name}`,
			body: `Use this ${framework.name} snippet to send your first message. Works with ${framework.runtimeHint}.`,
			code: framework.sendCode,
			isShell: false,
			filename: null,
		},
	];

	const [activeId, setActiveId] = useState(steps[0]!.id);

	// Highlight the left-rail step as the user scrolls through details
	useEffect(() => {
		const nodes = steps
			.map((s) => document.getElementById(`step-detail-${s.id}`))
			.filter((n): n is HTMLElement => Boolean(n));

		if (nodes.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
				const top = visible[0]?.target.id.replace("step-detail-", "");
				if (top) setActiveId(top);
			},
			{
				rootMargin: "-20% 0px -55% 0px",
				threshold: [0, 0.25, 0.5, 0.75, 1],
			},
		);

		for (const node of nodes) observer.observe(node);
		return () => observer.disconnect();
	}, [framework.slug]);

	return (
		<section
			id="steps"
			className="relative w-full scroll-mt-20 border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Two columns: compact left rail · right details */}
				<div className="grid grid-cols-1 lg:grid-cols-12">
					{/* LEFT: sticky tinted rail — framework meta + connected steps */}
					<aside className="border-stroke-soft-200 border-b bg-[#fafafa] lg:col-span-3 lg:border-r lg:border-b-0 dark:border-white/10 dark:bg-white/[0.025]">
						<div className="px-5 py-7 sm:px-6 sm:py-8 lg:sticky lg:top-24 lg:px-5 lg:py-10">
							{/* Framework chip + identity */}
							<div className="mb-7">
								<span className="inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-0.5 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:border-white/10 dark:bg-black dark:text-white/50">
									Framework
								</span>

								<div className="mt-3.5 flex items-center gap-2.5">
									<span
										className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black"
										style={{ color: `#${framework.icon.hex}` }}
									>
										<LanguageIcon
											icon={framework.icon}
											className="size-4"
										/>
									</span>
									<div className="min-w-0">
										<p className="truncate font-semibold text-[14px] text-text-strong-950 tracking-tight dark:text-white">
											{framework.name}
										</p>
										<p className="truncate font-mono text-[10px] text-text-sub-600 dark:text-white/45">
											{framework.packageName}
										</p>
									</div>
								</div>

								{/* Meta rows */}
								<dl className="mt-4 space-y-2 border-stroke-soft-200 border-t pt-4 dark:border-white/10">
									<div className="flex items-baseline justify-between gap-2">
										<dt className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.1em] dark:text-white/40">
											Runtime
										</dt>
										<dd>
											<Link
												href={`/sdks/${framework.languageSlug}`}
												className="text-[12px] text-text-strong-950 underline decoration-text-sub-600/30 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/25 dark:hover:decoration-white"
											>
												{framework.languageName}
											</Link>
										</dd>
									</div>
									<div className="flex items-baseline justify-between gap-2">
										<dt className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.1em] dark:text-white/40">
											Surface
										</dt>
										<dd className="truncate text-right text-[12px] text-text-sub-600 dark:text-white/55">
											{framework.runtimeHint}
										</dd>
									</div>
								</dl>

								{/* Highlight tags */}
								{framework.highlights.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-1">
										{framework.highlights.map((tag) => (
											<span
												key={tag}
												className="rounded-md border border-stroke-soft-200 bg-bg-white-0 px-1.5 py-0.5 font-mono text-[10px] text-text-sub-600 dark:border-white/10 dark:bg-black dark:text-white/50"
											>
												{tag}
											</span>
										))}
									</div>
								)}
							</div>

							{/* Steps rail */}
							<p className="mb-3 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/40">
								Steps
							</p>
							<nav aria-label="Integration steps">
								<ol className="relative flex flex-row gap-1 lg:flex-col lg:gap-0">
									{/* Vertical connector (desktop) */}
									<div
										aria-hidden
										className="pointer-events-none absolute top-3 bottom-3 left-[11px] hidden w-px bg-stroke-soft-200 lg:block dark:bg-white/15"
									/>

									{steps.map((step, i) => {
										const isActive = activeId === step.id;
										const isPast =
											steps.findIndex((s) => s.id === activeId) > i;

										return (
											<li
												key={step.id}
												className="relative flex-1 lg:flex-none"
											>
												<a
													href={`#step-detail-${step.id}`}
													onClick={() => setActiveId(step.id)}
													className="group flex flex-col items-center gap-1.5 py-1 lg:flex-row lg:items-center lg:gap-2.5 lg:py-2.5"
												>
													<span
														className={[
															"relative z-10 flex size-[22px] shrink-0 items-center justify-center rounded-full font-semibold text-[10px] tabular-nums transition-colors duration-150 sm:size-6 sm:text-[11px]",
															isActive
																? "bg-text-strong-950 text-white ring-[3px] ring-text-strong-950/10 dark:bg-white dark:text-black dark:ring-white/15"
																: isPast
																	? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
																	: "bg-bg-white-0 text-text-sub-600 ring-1 ring-stroke-soft-200 group-hover:ring-stroke-soft-300 dark:bg-black dark:text-white/55 dark:ring-white/15",
														].join(" ")}
													>
														{step.number}
													</span>
													<span
														className={[
															"text-[12px] tracking-tight lg:text-[13px]",
															isActive
																? "font-semibold text-text-strong-950 dark:text-white"
																: "font-medium text-text-sub-600 group-hover:text-text-strong-950 dark:text-white/50 dark:group-hover:text-white",
														].join(" ")}
													>
														{step.label}
													</span>
												</a>
												{i < steps.length - 1 && (
													<div
														aria-hidden
														className="absolute top-[11px] right-0 left-1/2 h-px bg-stroke-soft-200 lg:hidden dark:bg-white/15"
														style={{ width: "calc(50% + 0.15rem)" }}
													/>
												)}
											</li>
										);
									})}
								</ol>
							</nav>
						</div>
					</aside>

					{/* RIGHT: step details */}
					<div className="lg:col-span-9">
						{steps.map((step, i) => (
							<div
								key={step.id}
								id={`step-detail-${step.id}`}
								className={[
									"scroll-mt-28 px-6 py-10 sm:px-8 sm:py-12 lg:px-10",
									i < steps.length - 1
										? "border-stroke-soft-200 border-b dark:border-white/10"
										: "",
								].join(" ")}
							>
								<p className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
									Step {step.number}
								</p>
								<h3 className="mt-2 font-semibold text-[1.05rem] text-text-strong-950 tracking-tight sm:text-[1.2rem] dark:text-white">
									{step.title}
								</h3>
								<p className="mt-2 max-w-xl text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
									{step.body}
								</p>
								{step.cta && (
									<a
										href={step.cta.href}
										className="mt-3 inline-flex font-medium text-[13px] text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
									>
										{step.cta.label}
									</a>
								)}

								<div className="mt-5">
									{step.isShell ? (
										<SdkCodeBlock code={step.code} lang="bash" />
									) : (
										<SdkCodeBlock
											code={step.code}
											slug={framework.slug}
											path={step.filename ?? undefined}
										/>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Resources: examples + docs + API */}
				<FrameworkResources framework={framework} />
			</div>
		</section>
	);
}
