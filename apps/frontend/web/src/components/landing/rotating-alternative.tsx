"use client";

import { useEffect, useState } from "react";

const competitors = ["AWS SES", "Resend", "Postmark", "Mailchimp", "SendGrid"];

export function RotatingAlternative() {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		const id = window.setInterval(() => {
			setIndex((current) => (current + 1) % competitors.length);
		}, 2200);
		return () => window.clearInterval(id);
	}, []);

	return (
		<>
			<style>
				{
					"@keyframes hero-alternative-swap { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }"
				}
			</style>
			<span
				aria-live="polite"
				className="inline-flex min-w-24 justify-start font-semibold text-zinc-950 sm:min-w-28 dark:text-white"
			>
				<span
					key={competitors[index]}
					className="motion-reduce:animate-none"
					style={{ animation: "hero-alternative-swap 0.4s ease-out" }}
				>
					{competitors[index]}
				</span>
			</span>
		</>
	);
}
