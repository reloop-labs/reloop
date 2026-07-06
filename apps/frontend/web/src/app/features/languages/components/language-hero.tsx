"use client";

import * as Button from "@reloop/ui/button";
import type { LanguageDefinition } from "../languages";
import { LanguageIcon } from "./language-icon";

export default function LanguageHero({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent pt-48 pb-28 sm:pt-52">
			<main className="relative z-10">
				<section className="mx-auto flex max-w-4xl flex-col px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
					<div className="mx-auto max-w-[1020px] text-center">
						<div
							className="mx-auto mt-6 inline-flex size-14 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10"
							style={{ color: `#${language.icon.hex}` }}
						>
							<LanguageIcon icon={language.icon} className="size-8" />
						</div>

						<h1 className="font-serif text-[2.8rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[4.2rem]">
							Send Email with
							<br />
							{language.name}
						</h1>

						<p className="mx-auto mt-8 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px]">
							{language.shortDescription}
						</p>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<a
								href="/dashboard/signup"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "filled",
								}).root()} h-11! rounded-full! px-8! font-semibold`}
							>
								Get API key
							</a>
							<a
								href="#code"
								className={`${Button.buttonVariants({
									variant: "neutral",
									mode: "stroke",
								}).root()} h-11! rounded-full! px-8! font-semibold`}
							>
								View sample code
							</a>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
