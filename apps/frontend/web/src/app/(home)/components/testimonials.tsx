"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { testimonials } from "@reloop/web/lib/testimonials";
import { useCallback, useEffect, useRef, useState } from "react";

const ROTATE_MS = 6000;

export function Testimonials() {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const timer = useRef<ReturnType<typeof setInterval> | null>(null);

	const goTo = useCallback((next: number) => {
		setIndex(
			((next % testimonials.length) + testimonials.length) %
				testimonials.length,
		);
	}, []);

	useEffect(() => {
		if (paused || testimonials.length < 2) return;
		timer.current = setInterval(() => {
			setIndex((prev) => (prev + 1) % testimonials.length);
		}, ROTATE_MS);
		return () => {
			if (timer.current) clearInterval(timer.current);
		};
	}, [paused]);

	const featured = testimonials[index];
	if (!featured) return null;

	return (
		<section aria-label="Testimonials">
			<div className="px-6 pb-10 sm:px-8 sm:pb-12 lg:px-12">
				<p className="font-medium text-[12px] text-primary-base uppercase">
					Testimonials
				</p>
				<h2 className="mt-3 max-w-[38rem] font-medium text-2xl text-text-strong-950 leading-[1.1] tracking-tight sm:text-3xl lg:text-4xl dark:text-white">
					Loved by developers shipping email.
				</h2>
			</div>
			<div
				className="border-stroke-soft-100 border-y dark:border-white/10"
				onMouseEnter={() => setPaused(true)}
				onMouseLeave={() => setPaused(false)}
			>
				<figure
					key={index}
					aria-live="polite"
					className="fade-in-0 group relative grid animate-in gap-8 px-6 py-12 transition-colors duration-500 hover:bg-bg-weak-50/70 sm:px-8 sm:py-16 lg:grid-cols-[1.8fr_1fr] lg:items-center lg:gap-12 lg:px-12 lg:py-20 dark:hover:bg-white/[0.03]"
				>
					{featured.sourceUrl && (
						<a
							href={featured.sourceUrl}
							target="_blank"
							rel="noreferrer"
							aria-label={`View post by ${featured.name}`}
							className="absolute inset-0 cursor-pointer"
						>
							<span className="sr-only">View post by {featured.name}</span>
						</a>
					)}
					{featured.sourceUrl && (
						<span
							aria-hidden
							className="group-hover:-translate-y-0.5 absolute top-6 right-6 text-text-sub-600 transition-transform duration-300 group-hover:translate-x-0.5 sm:top-8 sm:right-8 lg:top-10 lg:right-12 dark:text-white/40"
						>
							<Icon name="arrow-up-right" className="size-5" />
						</span>
					)}
					<blockquote className="max-w-4xl text-balance text-text-strong-950 text-xl leading-snug tracking-tight sm:text-2xl lg:text-[1.75rem] dark:text-white">
						<span
							aria-hidden
							className="mr-1 text-text-sub-600 dark:text-white/40"
						>
							&ldquo;
						</span>
						{featured.quote}
						<span
							aria-hidden
							className="ml-1 text-text-sub-600 dark:text-white/40"
						>
							&rdquo;
						</span>
					</blockquote>
					<figcaption className="flex items-center gap-4 lg:flex-col lg:items-end lg:gap-5 lg:text-right">
						<span className="font-medium text-[15px] text-text-strong-950 sm:text-base dark:text-white">
							{featured.name}
						</span>
						{featured.avatarUrl ? (
							<img
								src={featured.avatarUrl}
								alt=""
								aria-hidden
								className="size-12 shrink-0 rounded-full object-cover"
							/>
						) : (
							<span
								aria-hidden
								className="flex size-12 shrink-0 items-center justify-center rounded-full bg-black font-semibold text-sm text-white dark:bg-white dark:text-black"
							>
								{featured.initials}
							</span>
						)}
					</figcaption>
				</figure>
				{testimonials.length > 1 && (
					<div className="flex items-center gap-2 px-6 pb-8 sm:px-8 lg:px-12">
						{testimonials.map((item, i) => (
							<button
								key={`${item.name}-${i}`}
								type="button"
								onClick={() => goTo(i)}
								aria-label={`Show testimonial from ${item.name}`}
								aria-current={i === index ? "true" : undefined}
								className={cn(
									"h-1.5 cursor-pointer rounded-full transition-all duration-300",
									i === index
										? "w-6 bg-text-strong-950 dark:bg-white"
										: "w-1.5 bg-text-strong-950/20 hover:bg-text-strong-950/40 dark:bg-white/20 dark:hover:bg-white/40",
								)}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
