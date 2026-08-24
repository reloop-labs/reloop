import { SceneGlyph } from "../../../(home)/components/_shared/scene-header";
import { CheckerPanel } from "../checker-panel";

export function TempEmailHero() {
	return (
		<div className="relative w-full overflow-hidden">
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Hero Header */}
				<header className="relative z-10 flex w-full flex-col items-center px-6 pt-28 pb-8 text-center sm:px-8 sm:pt-32 sm:pb-10 lg:px-12 lg:pt-36 lg:pb-12">
					<div className="mb-6 flex items-center justify-center gap-2 sm:mb-8">
						<SceneGlyph icon="shield-cross" color="pink" />
						<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
							Temporary Email Checker
						</span>
					</div>

					<h1 className="max-w-3xl text-balance text-center font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
						Temp Email Checker
					</h1>

					<p className="mt-5 max-w-[46rem] text-balance text-center text-[16.5px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
						Find out if an email is temporary, disposable, or trustworthy.
					</p>
				</header>

				{/* Interactive Checker Panel */}
				<section className="relative z-10 w-full px-5 pb-16 sm:px-6 sm:pb-20 md:px-8 lg:pb-24">
					<div className="mx-auto w-full max-w-2xl">
						<CheckerPanel />
					</div>
				</section>
			</div>
		</div>
	);
}
