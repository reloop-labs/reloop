"use client";

import { useEffect, useState } from "react";
import type { SimpleIcon } from "simple-icons";
import {
	siAnthropic,
	siBun,
	siCloudflare,
	siCursor,
	siDocker,
	siGithub,
	siGmail,
	siNextdotjs,
	siNodedotjs,
	siPython,
	siReact,
	siVercel,
} from "simple-icons";

type Brand = { name: string; icon: SimpleIcon };

const brandSets: Brand[][] = [
	[
		{ name: "Claude", icon: siAnthropic },
		{ name: "Cursor", icon: siCursor },
		{ name: "GitHub", icon: siGithub },
		{ name: "Vercel", icon: siVercel },
	],
	[
		{ name: "Node.js", icon: siNodedotjs },
		{ name: "Python", icon: siPython },
		{ name: "Docker", icon: siDocker },
		{ name: "React", icon: siReact },
	],
	[
		{ name: "Next.js", icon: siNextdotjs },
		{ name: "Cloudflare", icon: siCloudflare },
		{ name: "Gmail", icon: siGmail },
		{ name: "Bun", icon: siBun },
	],
];

function BrandMark({ brand }: { brand: Brand }) {
	return (
		<div className="flex items-center justify-center gap-2.5 text-zinc-950 dark:text-white">
			<svg
				viewBox="0 0 24 24"
				aria-hidden="true"
				className="size-[22px] shrink-0 fill-current"
			>
				<path d={brand.icon.path} />
			</svg>
			<span className="font-semibold text-base tracking-[-0.025em]">
				{brand.name}
			</span>
		</div>
	);
}

export function DeveloperProof() {
	const [setIndex, setSetIndex] = useState(0);
	const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		let swapTimer: ReturnType<typeof setTimeout> | undefined;
		let settleTimer: ReturnType<typeof setTimeout> | undefined;
		const interval = setInterval(() => {
			setPhase("exit");
			swapTimer = setTimeout(() => {
				setSetIndex((current) => (current + 1) % brandSets.length);
				setPhase("enter");
				settleTimer = setTimeout(() => setPhase("idle"), 40);
			}, 320);
		}, 2600);

		return () => {
			clearInterval(interval);
			if (swapTimer) clearTimeout(swapTimer);
			if (settleTimer) clearTimeout(settleTimer);
		};
	}, []);

	const brands = brandSets[setIndex] ?? brandSets[0] ?? [];
	const motionClass =
		phase === "exit"
			? "translate-y-2 scale-[0.98] opacity-0 blur-[6px]"
			: phase === "enter"
				? "-translate-y-2 scale-[0.98] opacity-0 blur-[6px]"
				: "translate-y-0 scale-100 opacity-100 blur-0";

	return (
		<section
			aria-labelledby="developer-proof-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1102px)_minmax(24px,1fr)] gap-x-px bg-[#ebebeb] max-[1099px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
				/>
				<div className="grid gap-y-px bg-[#ebebeb] dark:bg-[#292929]">
					<div className="rounded-[4px] bg-white px-6 py-20 dark:bg-black">
						<h2
							id="developer-proof-heading"
							className="mx-auto max-w-xl text-balance text-center font-normal text-base text-zinc-600 leading-normal md:text-lg lg:text-xl dark:text-zinc-400"
						>
							Reloop works with tools developers already use—from{" "}
							<span className="text-zinc-950 dark:text-white">
								app frameworks
							</span>{" "}
							and{" "}
							<span className="text-blue-600 dark:text-blue-400">
								AI coding agents
							</span>{" "}
							to cloud infrastructure.
						</h2>
					</div>
					<ul
						aria-label="Developer tools supported by Reloop"
						className="grid grid-cols-2 gap-px bg-[#ebebeb] md:grid-cols-4 dark:bg-[#292929]"
					>
						{brands.map((brand) => (
							<li
								key={`${setIndex}-${brand.name}`}
								className="flex h-24 items-center justify-center overflow-hidden rounded-[4px] bg-white px-4 dark:bg-black"
							>
								<div
									className={`transition-[transform,opacity,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:blur-0 ${motionClass}`}
								>
									<BrandMark brand={brand} />
								</div>
							</li>
						))}
					</ul>
				</div>
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
				/>
			</div>
		</section>
	);
}
