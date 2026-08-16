import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import {
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "../../sdk/components/language-icon";
import { frameworks } from "../../sdk/frameworks";

const SURFACES = [
	{
		label: "SDK",
		href: "/sdk",
		detail: "Typed clients for Node.js, Python, Go, and more.",
	},
	{
		label: "API",
		href: "/docs/api",
		detail: "REST and SMTP. Same auth, same send payload.",
	},
	{
		label: "MCP",
		href: "/docs/mcp",
		detail: "Point an agent at Reloop and let it send.",
	},
] as const;

function IntegrateMesh() {
	return (
		<svg
			viewBox="0 0 640 360"
			className="absolute inset-0 size-full text-stroke-soft-200 dark:text-white/12"
			preserveAspectRatio="xMidYMid slice"
			aria-hidden
		>
			<defs>
				<pattern
					id="integrate-dots"
					width="32"
					height="32"
					patternUnits="userSpaceOnUse"
				>
					<circle cx="1" cy="1" r="0.8" fill="currentColor" />
				</pattern>
			</defs>
			<rect width="640" height="360" fill="url(#integrate-dots)" />

			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				strokeDasharray="3 5"
			>
				<polyline points="72,268 168,196 292,220 404,132 528,168" />
				<polyline points="112,88 220,148 292,220 360,284 488,248" />
				<polyline points="72,268 220,148 404,132" />
			</g>

			{[
				[72, 268],
				[168, 196],
				[292, 220],
				[404, 132],
				[528, 168],
				[112, 88],
				[220, 148],
				[360, 284],
				[488, 248],
			].map(([x, y]) => (
				<g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
					<circle
						r="11"
						className="fill-bg-white-0 dark:fill-black"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<rect
						x="-3.5"
						y="-2.5"
						width="7"
						height="5"
						rx="0.6"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					/>
				</g>
			))}
		</svg>
	);
}

function FrameworkTile({
	slug,
	name,
	icon,
}: Pick<(typeof frameworks)[number], "slug" | "name" | "icon">) {
	const isDark = isDarkBrandColor(icon.hex);

	return (
		<Link
			href={`/frameworks/${slug}`}
			aria-label={`${name} email guide`}
			className="group flex size-[4.25rem] shrink-0 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 transition-[border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-stroke-soft-300 active:scale-[0.97] sm:size-[4.75rem] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20"
		>
			<span
				className={cn(
					"inline-flex size-6 items-center justify-center sm:size-7",
					isDark && "text-text-strong-950 dark:text-white",
				)}
				style={getBrandColorStyle(icon.hex)}
			>
				<LanguageIcon icon={icon} className="size-full" />
			</span>
		</Link>
	);
}

export default function Integrate() {
	return (
		<section
			id="integrate"
			aria-labelledby="integrate-heading"
			className="w-full border-stroke-soft-200 border-t dark:border-white/10"
		>
			<div className="flex flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:px-12 lg:py-24">
				<div className="max-w-xl">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Integrate
					</p>
					<h2
						id="integrate-heading"
						className="mt-4 font-serif text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3rem] lg:text-[3.4rem] dark:text-white"
					>
						Drop Reloop into the stack you already run.
					</h2>
					<p className="mt-4 max-w-[440px] text-[15px] text-text-sub-600 leading-7 sm:text-[16px] dark:text-white/60">
						Official guides for Next.js, Django, Laravel, Rails, and a dozen
						more. SMTP if you would rather skip an SDK.
					</p>
				</div>
				<Link
					href="/sdk"
					className={`${Button.buttonVariants({
						variant: "neutral",
						mode: "stroke",
					}).root()} h-10! shrink-0 rounded-full! px-5! font-medium text-[13.5px]`}
				>
					Browse SDKs
					<Icon name="arrow-right" className="size-3.5" aria-hidden />
				</Link>
			</div>

			<div className="relative overflow-hidden border-stroke-soft-200 border-t py-7 sm:py-8 dark:border-white/10">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-bg-white-0 to-transparent sm:w-20"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg-white-0 to-transparent sm:w-20"
				/>

				<div className="flex w-max hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-3 motion-reduce:[animation:none] animate-infinite-scroll">
					<ul className="flex items-center gap-3 px-1.5 motion-reduce:flex-wrap motion-reduce:justify-center">
						{frameworks.map((fw) => (
							<li key={fw.slug}>
								<FrameworkTile slug={fw.slug} name={fw.name} icon={fw.icon} />
							</li>
						))}
					</ul>
					<ul
						aria-hidden
						className="flex items-center gap-3 px-1.5 motion-reduce:hidden"
					>
						{frameworks.map((fw) => (
							<li key={`${fw.slug}-dup`}>
								<FrameworkTile slug={fw.slug} name={fw.name} icon={fw.icon} />
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="grid border-stroke-soft-200 border-t lg:grid-cols-2 dark:border-white/10">
				<div className="flex flex-col justify-center px-4 py-14 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
					<h3 className="font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] dark:text-white">
						SDK. API. MCP.
					</h3>
					<p className="mt-3 max-w-[28rem] text-[15px] text-text-sub-600 leading-7 dark:text-white/60">
						Same mail path from a package, a curl, or an agent. Pick the surface
						that matches the runtime.
					</p>

					<ul className="mt-8 flex flex-col border-stroke-soft-200 border-t dark:border-white/10">
						{SURFACES.map((surface) => (
							<li
								key={surface.label}
								className="border-stroke-soft-200 border-b dark:border-white/10"
							>
								<Link
									href={surface.href}
									className="group flex items-baseline justify-between gap-6 py-3.5 outline-none transition-colors duration-150 ease-out"
								>
									<span className="font-semibold text-[14px] text-text-strong-950 tracking-tight dark:text-white">
										{surface.label}
									</span>
									<span className="min-w-0 flex-1 truncate text-right text-[13px] text-text-sub-600 transition-colors duration-150 group-hover:text-text-strong-950 dark:text-white/45 dark:group-hover:text-white/80">
										{surface.detail}
									</span>
									<Icon
										name="arrow-right"
										className="size-3.5 shrink-0 text-text-sub-600 transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 dark:text-white/35"
										aria-hidden
									/>
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div className="relative min-h-[16rem] overflow-hidden border-stroke-soft-200 border-t lg:min-h-0 lg:border-t-0 lg:border-l dark:border-white/10">
					<IntegrateMesh />
				</div>
			</div>
		</section>
	);
}
