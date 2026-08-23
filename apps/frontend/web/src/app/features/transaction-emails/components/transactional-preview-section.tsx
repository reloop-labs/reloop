"use client";

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

	useEffect(() => {
		const interval = setInterval(() => {
			setEmailIndex((prev) => (prev + 1) % EMAIL_CYCLE.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	const activeEmailId = EMAIL_CYCLE[emailIndex];

	return (
		<section className="w-full border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black">
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-2 lg:divide-y-0 lg:divide-x dark:divide-white/10">
				{/* Left Panel: Frameworks */}
				<div className="flex flex-col justify-between p-8 sm:p-12 lg:p-14">
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

					<div className="mt-10 flex flex-wrap items-center gap-3">
						{frameworks.map((fw) => (
							<Link
								key={fw.slug}
								href={`/frameworks/${fw.slug}`}
								title={`Send email with ${fw.name}`}
								aria-label={`Send email with ${fw.name}`}
								className="group flex size-12 cursor-pointer items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 transition-transform duration-150 hover:scale-105 sm:size-14 dark:border-white/10 dark:bg-white/[0.04]"
							>
								<span
									className="flex size-8 items-center justify-center sm:size-9"
									style={getBrandColorStyle(fw.icon.hex)}
								>
									<LanguageIcon
										icon={fw.icon}
										className="size-8 sm:size-9"
									/>
								</span>
							</Link>
						))}
					</div>
				</div>

				{/* Right Panel: Email Preview */}
				<div className="flex items-center justify-center p-8 sm:p-12 lg:p-14">
					<div className="relative w-full max-w-sm">
						<div className="relative [mask-image:linear-gradient(to_bottom,black_52%,transparent_96%)] [-webkit-mask-image:linear-gradient(to_bottom,black_52%,transparent_96%)]">
							<EmailStack activeId={activeEmailId} />
						</div>
						{/* Gradient fade to section background */}
						<div
							aria-hidden
							className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-bg-white-0 via-bg-white-0/60 to-transparent dark:from-black dark:via-black/60"
						/>
					</div>
				</div>
			</div>
			</div>
		</section>
	);
}
