import Link from "next/link";
import type { LanguageDefinition } from "../languages";

const stepCardClassName =
	"flex flex-col justify-between border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 md:border-t md:border-l md:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] md:[&:nth-child(-n+3)]:border-t-0 md:[&:nth-child(3n+1)]:border-l-0";

export default function LanguageGuide({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<section
			id="guide"
			className="bg-[#f8f8f8] text-text-strong-950 dark:bg-black dark:text-white"
		>
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Three steps with {language.name}
					</h2>
				</div>

				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 md:grid-cols-3 dark:border-white/10">
					<div className={stepCardClassName}>
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								1
							</div>
							<h3 className="mt-4 font-semibold text-lg leading-snug">
								Install
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Run{" "}
								<code className="font-mono text-primary-base">
									{language.installCommand}
								</code>{" "}
								in your project.
							</p>
						</div>
					</div>
					<div className={stepCardClassName}>
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								2
							</div>
							<h3 className="mt-4 font-semibold text-lg leading-snug">
								Authenticate
							</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Add your Reloop API key from the dashboard and verify a sending
								domain.
							</p>
						</div>
					</div>
					<div className={stepCardClassName}>
						<div>
							<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
								3
							</div>
							<h3 className="mt-4 font-semibold text-lg leading-snug">Send</h3>
							<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
								Copy the sample above or follow the{" "}
								<Link
									href={language.docsPath}
									className="text-primary-base hover:underline"
								>
									full {language.name} guide
								</Link>
								.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
