"use client";

import { SdkCodeBlock } from "@reloop/web/app/sdk/components/sdk-code-block";
import Link from "next/link";
import { SceneGlyph } from "../../../(home)/components/_shared/scene-header";
import { EmailStack } from "../../../(home)/components/transactional-email/email-stack";
import {
	getBrandColorStyle,
	LanguageIcon,
} from "../../../sdk/components/language-icon";
import { frameworks } from "../../../sdk/frameworks";
import { languages } from "../../../sdk/languages";

const nodejsLanguage =
	languages.find((l) => l.slug === "nodejs") ?? languages[0]!;

export function TransactionalPreviewSection() {
	return (
		<section className="w-full bg-bg-white-0 dark:bg-black">
			{/* Title & Header */}
			<div className="border-stroke-soft-200 border-b px-4 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20 dark:border-white/10">
				<div className="flex items-center gap-2">
					<SceneGlyph icon="send-2" color="orange" />
					<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
						Developer Primitives
					</span>
				</div>
				<h2 className="mt-3.5 max-w-3xl text-balance font-medium text-4xl text-text-strong-950 leading-[1.05] tracking-tighter sm:text-5xl dark:text-white">
					Developer first.
				</h2>
			</div>

			{/* Interactive Code & Live Email Preview */}
			<div className="relative overflow-hidden">
				<div className="relative mx-auto flex flex-col gap-10 px-4 pt-10 pb-16 sm:px-8 sm:pt-12 lg:h-[36rem] lg:flex-row lg:items-start lg:gap-8 lg:px-12">
					{/* Left Column: Title + All Framework Icons linking to framework pages */}
					<div className="flex w-full shrink-0 flex-col gap-6 lg:w-[32%] lg:max-w-sm">
						<div>
							<h3 className="font-semibold text-2xl text-text-strong-950 leading-tight tracking-tight sm:text-3xl dark:text-white">
								Send email from your favorite framework
							</h3>
						</div>

						{/* All Framework Icons Grid (with links to /frameworks/[slug]) */}
						<div className="flex flex-wrap items-center gap-3">
							{frameworks.map((fw) => (
								<Link
									key={fw.slug}
									href={`/frameworks/${fw.slug}`}
									title={`Send email with ${fw.name}`}
									aria-label={`Send email with ${fw.name}`}
									className="group flex size-12 sm:size-14 cursor-pointer items-center justify-center rounded-2xl bg-transparent transition-transform duration-150 hover:scale-105"
								>
									<span
										className="flex size-9 sm:size-10 items-center justify-center"
										style={getBrandColorStyle(fw.icon.hex)}
									>
										<LanguageIcon icon={fw.icon} className="size-9 sm:size-10" />
									</span>
								</Link>
							))}
						</div>
					</div>

					{/* Right Column: Code block with Overlapping Live Email preview */}
					<div className="relative w-full min-w-0 flex-1">
						<div className="w-full max-w-xl lg:max-w-[31rem] xl:max-w-[34rem]">
							<SdkCodeBlock
								code={nodejsLanguage.sendCode}
								slug="nodejs"
							/>
						</div>
						<div className="lg:-right-4 relative z-10 mt-6 w-full max-w-sm lg:absolute lg:top-4 xl:right-0">
							<EmailStack activeId="otp" />
						</div>
					</div>
				</div>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-15% from-bg-white-0 via-bg-white-0/80 to-transparent dark:from-black dark:via-black/80"
				/>
			</div>
		</section>
	);
}
