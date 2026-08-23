"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SceneGlyph } from "../../../(home)/components/_shared/scene-header";
import { EmailStack } from "../../../(home)/components/transactional-email/email-stack";
import {
	getBrandColorStyle,
	LanguageIcon,
} from "../../../sdk/components/language-icon";
import { frameworks } from "../../../sdk/frameworks";

const EMAIL_CYCLE = ["otp", "reset", "welcome", "invite"] as const;

export function TransactionalPreviewSection() {
	const [emailIndex, setEmailIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);

	useEffect(() => {
		if (!isPlaying) return;

		const interval = setInterval(() => {
			setEmailIndex((prev) => (prev + 1) % EMAIL_CYCLE.length);
		}, 3000);
		return () => clearInterval(interval);
	}, [isPlaying]);

	const activeEmailId = EMAIL_CYCLE[emailIndex];

	return (
		<section className="w-full border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black">
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-white/10">
					{/* Left Panel: Frameworks */}
					<div className="flex flex-col p-6 sm:p-8 lg:p-10">
						<div>
							<div className="mb-4 flex items-center gap-2">
								<SceneGlyph icon="code" color="orange" />
								<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
									Developer First
								</span>
							</div>
							<h3 className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
								Send email from your favorite framework.
							</h3>
							<p className="mt-2.5 max-w-md text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
								Official SDKs and native libraries for Node.js, Python, Go, PHP,
								Ruby, Java, .NET, and Elixir.
							</p>
						</div>

						<div className="mt-6 grid max-w-sm grid-cols-4 items-center gap-y-4 gap-x-4 sm:max-w-md sm:gap-y-5 sm:gap-x-5">
							{frameworks.map((fw) => (
								<Link
									key={fw.slug}
									href={`/frameworks/${fw.slug}`}
									title={`Send email with ${fw.name}`}
									aria-label={`Send email with ${fw.name}`}
									className="group flex cursor-pointer items-center justify-center transition-transform duration-150 hover:scale-110"
								>
									<span
										className="flex items-center justify-center"
										style={getBrandColorStyle(fw.icon.hex)}
									>
										<LanguageIcon icon={fw.icon} className="size-10 sm:size-12" />
									</span>
								</Link>
							))}
						</div>
					</div>

					{/* Right Panel: Email Preview */}
					<div className="relative flex flex-col p-6 sm:p-8 lg:p-10">
						{/* Top Right Timer / Pause-Play Button */}
						<button
							type="button"
							onClick={() => setIsPlaying((p) => !p)}
							aria-label={
								isPlaying ? "Pause preview rotation" : "Play preview rotation"
							}
							className="group absolute top-6 right-6 z-20 flex cursor-pointer items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0/90 px-2.5 py-1 backdrop-blur-md transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
						>
							{/* Circular progress ring */}
							<div className="relative flex size-3 items-center justify-center">
								<svg className="-rotate-90 size-3" viewBox="0 0 24 24">
									<circle
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="3.5"
										className="text-stroke-soft-200 dark:text-white/15"
										fill="none"
									/>
									{isPlaying && (
										<motion.circle
											key={emailIndex}
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="3.5"
											strokeLinecap="round"
											className="text-orange-500 dark:text-orange-400"
											fill="none"
											strokeDasharray="62.83"
											initial={{ strokeDashoffset: 62.83 }}
											animate={{ strokeDashoffset: 0 }}
											transition={{ duration: 3, ease: "linear" }}
										/>
									)}
								</svg>
							</div>

							{/* Pause / Play Icon */}
							<span className="text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:text-white/60 dark:group-hover:text-white">
								{isPlaying ? (
									<svg
										viewBox="0 0 16 16"
										className="size-2.5 fill-current"
										aria-hidden
									>
										<rect x="4" y="3.5" width="2.5" height="9" rx="0.75" />
										<rect x="9.5" y="3.5" width="2.5" height="9" rx="0.75" />
									</svg>
								) : (
									<svg
										viewBox="0 0 16 16"
										className="size-2.5 fill-current"
										aria-hidden
									>
										<path d="M5 3.5v9a.75.75 0 0 0 1.15.64l6.5-4.5a.75.75 0 0 0 0-1.28l-6.5-4.5A.75.75 0 0 0 5 3.5" />
									</svg>
								)}
							</span>

							<span className="font-medium font-mono text-[11px] text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:text-white/70 dark:group-hover:text-white">
								{emailIndex + 1}/{EMAIL_CYCLE.length}
							</span>
						</button>

						<div>
							<div className="mb-4 flex items-center gap-2">
								<SceneGlyph icon="mail-single" color="blue" />
								<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
									Templates
								</span>
							</div>
							<h3 className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
								Readymade templates to send.
							</h3>
							<p className="mt-2.5 max-w-md text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
								Drop-in responsive templates for OTP verification, password
								resets, welcome sequences, and workspace invites.
							</p>
						</div>

						<div className="relative mx-auto mt-6 w-full max-w-sm max-h-[300px] overflow-hidden">
							<div className="relative [-webkit-mask-image:linear-gradient(to_bottom,black_45%,transparent_95%)] [mask-image:linear-gradient(to_bottom,black_45%,transparent_95%)]">
								<EmailStack activeId={activeEmailId} />
							</div>
							{/* Gradient fade to section background */}
							<div
								aria-hidden
								className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-bg-white-0 via-bg-white-0/60 to-transparent dark:from-black dark:via-black/60"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
