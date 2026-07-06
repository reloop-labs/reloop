"use client";

import type React from "react";

export const grosoryContentClass = "mx-auto max-w-[920px] px-6";

export function GrosoryPageHeader({ description }: { description: string }) {
	const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
		window.history.pushState(null, "", " ");
	};

	return (
		<header className="mx-auto max-w-[1200px] px-6 pt-36 pb-4 text-center sm:pt-40">
			<h1 className="font-serif text-[2.75rem] text-text-strong-950 leading-tight tracking-tight sm:text-[3.25rem] lg:text-[3.75rem] dark:text-white">
				<a
					href="#"
					onClick={handleScrollToTop}
					className="no-underline transition-colors duration-200 hover:text-primary-base"
				>
					Grosory
				</a>
			</h1>
			<p className="mx-auto mt-3 max-w-[60ch] text-[15px] text-text-sub-600 leading-relaxed dark:text-white/50">
				{description}
			</p>
		</header>
	);
}
