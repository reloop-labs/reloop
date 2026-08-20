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
			{/* Interactive Code & Live Email Preview */}
			<div className="relative overflow-hidden">
				<div className="relative mx-auto flex flex-col gap-10 px-4 pt-24 pb-12 sm:px-8 sm:pt-28 sm:pb-14 lg:h-[43rem] lg:flex-row lg:items-start lg:gap-8 lg:px-12 lg:pt-36 lg:pb-16">
					{/* Left Column: Title + All Framework Icons linking to framework pages */}
					<div className="flex w-full shrink-0 flex-col gap-6 lg:w-[34%] lg:max-w-sm xl:w-[36%]">
						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-2">
								<SceneGlyph icon="code" color="orange" />
								<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
									Developer First
								</span>
							</div>
							<h3 className="text-balance font-medium text-4xl text-text-strong-950 leading-[1.05] tracking-tighter sm:text-5xl dark:text-white">
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
									className="group flex size-12 cursor-pointer items-center justify-center rounded-2xl bg-transparent transition-transform duration-150 hover:scale-105 sm:size-14"
								>
									<span
										className="flex size-9 items-center justify-center sm:size-10"
										style={getBrandColorStyle(fw.icon.hex)}
									>
										<LanguageIcon
											icon={fw.icon}
											className="size-9 sm:size-10"
										/>
									</span>
								</Link>
							))}
						</div>
					</div>

					{/* Right Column: Code block with Overlapping Live Email preview */}
					<div className="relative w-full min-w-0 flex-1">
						<div className="w-full max-w-xl lg:max-w-[31rem] xl:max-w-[34rem]">
							<SdkCodeBlock code={nodejsLanguage.sendCode} slug="nodejs" />
						</div>
						<div className="lg:-right-12 xl:-right-16 relative z-10 mt-6 w-full max-w-sm lg:absolute lg:top-4">
							<EmailStack activeId="otp" />
						</div>
					</div>
				</div>

				{/* Right-side blur & fade overlay for overflowing email */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 sm:w-36 lg:w-48"
				>
					<div className="absolute inset-0 backdrop-blur-[8px] [mask-image:linear-gradient(to_right,transparent,black_70%)]" />
					<div className="absolute inset-0 bg-gradient-to-l from-15% from-bg-white-0 via-bg-white-0/80 to-transparent dark:from-black dark:via-black/80" />
				</div>

				{/* Bottom fade */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-15% from-bg-white-0 via-bg-white-0/80 to-transparent dark:from-black dark:via-black/80"
				/>
			</div>
		</section>
	);
}
