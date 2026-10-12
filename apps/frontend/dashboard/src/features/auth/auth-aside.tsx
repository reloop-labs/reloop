"use client";

import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { SimpleIcon } from "simple-icons";
import {
	siAtandt,
	siAtlassian,
	siGithub,
	siNotion,
	siShopify,
	siTrello,
	siZoho,
} from "simple-icons";

// Mirrors the marketing site's testimonials and brand strip
// (apps/frontend/web/src/lib/testimonials.ts, developer-proof.tsx).
const TESTIMONIALS = [
	{
		quote: "Most underrated Github project",
		name: "Alexis Maresca",
		initials: "AM",
		sourceUrl: "https://x.com/MarescaAlexis/status/2092973405553238462",
		avatarUrl:
			"https://pbs.twimg.com/profile_images/2092634806647455744/oDSXFFr0.jpg",
	},
	{
		quote:
			"If your still using resend what are you doing. @reloop_labs is infinitely better.",
		name: "mulu mex",
		initials: "MM",
		sourceUrl: "https://x.com/mulumexx/status/2098345235268948476",
		avatarUrl:
			"https://pbs.twimg.com/profile_images/2093200456138862592/1uFOXfFv.jpg",
	},
];

const ROTATE_MS = 8000;

const BRANDS: { name: string; icon: SimpleIcon }[] = [
	{ name: "Shopify", icon: siShopify },
	{ name: "GitHub", icon: siGithub },
	{ name: "Zoho", icon: siZoho },
	{ name: "AT&T", icon: siAtandt },
	{ name: "Notion", icon: siNotion },
	{ name: "Trello", icon: siTrello },
	{ name: "Atlassian", icon: siAtlassian },
];

/** Full-height brand panel for the left side of auth pages. */
export function AuthAside() {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		// Fresh quote on each visit, then rotate slowly.
		setIndex(Math.floor(Math.random() * TESTIMONIALS.length));
		if (TESTIMONIALS.length < 2) return;
		const id = setInterval(() => {
			setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
		}, ROTATE_MS);
		return () => clearInterval(id);
	}, []);

	const testimonial = TESTIMONIALS[index];
	if (!testimonial) return null;

	return (
		<div className="flex w-full flex-col justify-between p-10">
			{/* Plain <a> so we leave /dashboard basePath and hit the marketing site root. */}
			<a
				href="/home"
				aria-label="Reloop home"
				className="w-fit rounded-lg transition-opacity hover:opacity-80"
			>
				<Logo className="h-9 w-9" />
			</a>

			<AnimatePresence mode="wait" initial={false}>
				<motion.figure
					key={testimonial.name}
					initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
					transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
					className="mx-auto max-w-[320px] text-center"
				>
					<blockquote className="text-balance font-medium text-lg text-text-strong-950 leading-relaxed tracking-tight">
						&ldquo;{testimonial.quote}&rdquo;
					</blockquote>
					<figcaption className="mt-6">
						<a
							href={testimonial.sourceUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex flex-col items-center transition-opacity hover:opacity-80"
						>
							<span className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-bg-soft-200 font-medium text-sm text-text-sub-600">
								{testimonial.initials}
								<img
									src={testimonial.avatarUrl}
									alt=""
									className="absolute inset-0 size-full object-cover"
								/>
							</span>
							<span className="mt-3 font-medium text-sm text-text-strong-950">
								{testimonial.name}
							</span>
							<span className="mt-0.5 text-[13px] text-text-sub-600">on X</span>
						</a>
					</figcaption>
				</motion.figure>
			</AnimatePresence>

			<div className="text-center">
				<p className="text-balance text-[13px] text-text-sub-600">
					Trusted by{" "}
					<span className="text-text-strong-950">250+ developers</span> and used
					by people working at
				</p>
				<ul
					aria-label="Companies using Reloop"
					className="mt-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-4"
				>
					{BRANDS.map((brand) => (
						<li key={brand.name} title={brand.name}>
							<svg
								viewBox="0 0 24 24"
								role="img"
								aria-label={brand.name}
								className="size-5 fill-current text-text-soft-400"
							>
								<path d={brand.icon.path} />
							</svg>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
