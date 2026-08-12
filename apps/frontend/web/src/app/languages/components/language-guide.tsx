import Link from "next/link";
import type { LanguageDefinition } from "../languages";

export default function LanguageGuide({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<section id="guide" className="w-full border-t border-stroke-soft-200 bg-bg-weak-50/40 py-16 sm:py-20 lg:py-24 dark:border-white/10 dark:bg-white/[0.01]">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-2">
					<p className="font-mono text-xs text-text-sub-600 uppercase tracking-wider dark:text-white/50">
						Quickstart Workflow • 3 Steps
					</p>
					<h2 className="font-sans font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
						Integrate {language.name} in under 5 minutes
					</h2>
				</div>

				<div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-stroke-soft-200 bg-stroke-soft-200 md:grid-cols-3 dark:border-white/10 dark:bg-white/10">
					{/* Step 1 */}
					<div className="flex flex-col justify-between bg-bg-white-0 p-6 dark:bg-bg-black-950">
						<div>
							<span className="font-mono font-semibold text-xs text-text-sub-600 dark:text-white/40">
								STEP 01
							</span>
							<h3 className="mt-2 font-semibold text-base text-text-strong-950 dark:text-white">
								Install Package
							</h3>
							<p className="mt-2 text-xs text-text-sub-600 leading-relaxed dark:text-white/60">
								Add the official client library to your project dependencies:
							</p>
							<div className="mt-4 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 font-mono text-xs text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white">
								{language.installCommand}
							</div>
						</div>
					</div>

					{/* Step 2 */}
					<div className="flex flex-col justify-between bg-bg-white-0 p-6 dark:bg-bg-black-950">
						<div>
							<span className="font-mono font-semibold text-xs text-text-sub-600 dark:text-white/40">
								STEP 02
							</span>
							<h3 className="mt-2 font-semibold text-base text-text-strong-950 dark:text-white">
								Set API Key
							</h3>
							<p className="mt-2 text-xs text-text-sub-600 leading-relaxed dark:text-white/60">
								Export your secret key from the Reloop dashboard into your environment:
							</p>
							<div className="mt-4 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 font-mono text-xs text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white">
								RELOOP_API_KEY="re_..."
							</div>
						</div>
					</div>

					{/* Step 3 */}
					<div className="flex flex-col justify-between bg-bg-white-0 p-6 dark:bg-bg-black-950">
						<div>
							<span className="font-mono font-semibold text-xs text-text-sub-600 dark:text-white/40">
								STEP 03
							</span>
							<h3 className="mt-2 font-semibold text-base text-text-strong-950 dark:text-white">
								Send Message
							</h3>
							<p className="mt-2 text-xs text-text-sub-600 leading-relaxed dark:text-white/60">
								Call the SDK send method with HTML content and recipient address.
							</p>
							<div className="mt-4">
								<Link
									href={language.docsPath}
									className="inline-flex items-center gap-1 font-medium text-primary-base text-xs hover:underline"
								>
									Read complete {language.name} documentation &rarr;
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
