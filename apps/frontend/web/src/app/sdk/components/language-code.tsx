"use client";

import { SdkCodeBlock } from "./sdk-code-block";

export type CodeSampleProps = {
	slug: string;
	installCommand: string;
	sendCode: string;
	/** Optional filename label override */
	fileLabel?: string;
};

export default function LanguageCode({
	language,
	sample,
}: {
	/** Prefer sample; language kept for existing call sites */
	language?: CodeSampleProps;
	sample?: CodeSampleProps;
}) {
	const data = sample ?? language;
	if (!data) {
		throw new Error("LanguageCode requires language or sample");
	}

	return (
		<section
			id="code"
			className="relative w-full scroll-mt-20 border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 xl:border-x md:max-w-7xl dark:border-white/10">
				<div className="border-stroke-soft-200 border-b px-6 py-8 sm:px-10 sm:py-10 lg:px-12 dark:border-white/10">
					<p className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
						Install
					</p>
					<div className="mt-3">
						<SdkCodeBlock
							code={data.installCommand}
							lang="bash"
							path={undefined}
						/>
					</div>
				</div>

				<div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
					<p className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
						Send email
					</p>
					<div className="mt-3">
						<SdkCodeBlock
							code={data.sendCode}
							slug={data.slug}
							path={data.fileLabel}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
