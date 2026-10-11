import {
	BrandMark,
	brands,
} from "@reloop/web/app/(home)/components/developer-proof";
import { AutoScrollRow } from "./auto-scroll-row";

export function LandingDeveloperProof() {
	return (
		<section
			aria-labelledby="landing-developer-proof-heading"
			className="overflow-hidden bg-white dark:bg-black"
		>
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div className="border-stroke-soft-100 border-t px-6 py-20 dark:border-white/10">
					<h2
						id="landing-developer-proof-heading"
						className="mx-auto max-w-xl text-balance text-center font-normal text-base text-zinc-600 leading-normal md:text-lg lg:text-xl dark:text-zinc-400"
					>
						Trusted by{" "}
						<span className="text-zinc-950 dark:text-white">
							250+ developers
						</span>
						<br />
						and used by people working at
					</h2>
				</div>
				<AutoScrollRow
					label="Companies using Reloop"
					className="border-stroke-soft-100 border-y dark:border-white/10"
				>
					{brands.map((brand) => (
						<div
							key={brand.name}
							className="flex h-28 w-48 shrink-0 items-center justify-center overflow-hidden border-stroke-soft-100 border-r px-4 sm:h-32 sm:w-52 dark:border-white/10"
						>
							<BrandMark brand={brand} />
						</div>
					))}
				</AutoScrollRow>
			</div>
		</section>
	);
}
