import * as FancyButton from "@reloop/ui/fancy-button";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import { RotatingAlternative } from "./rotating-alternative";

function GridCells({
	count,
	cellClassName = "",
}: {
	count: number;
	cellClassName?: string;
}) {
	return Array.from({ length: count }, (_, index) => (
		<div key={index} className={cellClassName}>
			<div
				data-grid-content
				className="h-full rounded-[4px] bg-white dark:bg-black"
			/>
		</div>
	));
}

const bandClassName = "grid grid-cols-10 gap-px [&>div]:aspect-square";
const sideClassName = "grid grid-rows-4 gap-px max-[1279px]:hidden";

export function GridHero() {
	return (
		<section
			id="features"
			aria-labelledby="home-heading"
			className="overflow-hidden bg-white pt-[73px] text-zinc-950 max-[1279px]:pt-[57px] dark:bg-black dark:text-zinc-50"
		>
			<div className="bg-white dark:bg-black">
				<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1280px)_minmax(24px,1fr)] gap-px bg-[#ebebeb] max-[1279px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
					<div aria-hidden="true" className="col-start-1 max-[1279px]:hidden">
						<div
							data-grid-content
							className="h-full rounded-[4px] bg-white dark:bg-black"
						/>
					</div>
					<div className="relative col-start-2 w-full">
						<div className="relative grid gap-x-px bg-[#ebebeb] dark:bg-[#292929]">
							<div aria-hidden="true" className={bandClassName}>
								<GridCells count={10} />
							</div>
							<div className="grid grid-cols-10 gap-px border-[#ebebeb] border-y dark:border-[#292929]">
								<div aria-hidden="true" className={sideClassName}>
									<GridCells count={4} />
								</div>
								<div className="col-span-8 max-[1279px]:col-[1/-1]">
									<div
										data-grid-content
										className="h-full rounded-[4px] bg-white py-12 text-center dark:bg-black"
									>
										<div className="relative z-[2] mx-auto max-w-3xl px-3 max-[1279px]:px-6 max-[479px]:px-0">
											<p className="mb-4 text-sm text-muted-foreground sm:mb-6">
												An alternative to <RotatingAlternative />
											</p>
											<h1
												id="home-heading"
												className="text-balance font-semibold text-6xl leading-none tracking-[-0.035em] max-[767px]:text-5xl"
											>
												Email for developers
												<br />
												who ship with AI.
											</h1>
											<p className="mx-auto mt-5 mb-9 max-w-2xl text-balance text-lg text-zinc-600 leading-7 dark:text-zinc-400">
												Send transactional emails, run campaigns, and give AI
												agents their own inboxes all with Reloop.
											</p>
											<div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
												<FancyButton.Root
													asChild
													variant="neutral"
													size="medium"
													className="h-10 rounded-lg px-4 font-medium text-sm max-[479px]:min-h-11 sm:h-11 sm:rounded-xl sm:px-6 sm:text-[15.5px] dark:bg-white dark:text-black dark:hover:bg-white/90"
												>
													<a href={hostedSignupHref}>Get Started</a>
												</FancyButton.Root>
												<FancyButton.Root
													asChild
													variant="basic"
													size="medium"
													className="hidden h-11 rounded-xl px-6 font-medium text-[15.5px] sm:inline-flex"
												>
													<Link href="/self-host">Self-host Reloop</Link>
												</FancyButton.Root>
											</div>
											<span className="mt-3 block text-sm text-zinc-600 leading-5 dark:text-zinc-400">
												3,000 emails for free<span aria-hidden="true"> · </span>
												No credit card required.
											</span>
										</div>
									</div>
								</div>
								<div aria-hidden="true" className={sideClassName}>
									<GridCells count={4} />
								</div>
							</div>
							<div aria-hidden="true" className={bandClassName}>
								<GridCells count={10} />
							</div>
						</div>
					</div>
					<div aria-hidden="true" className="col-start-3 max-[1279px]:hidden">
						<div
							data-grid-content
							className="h-full rounded-[4px] bg-white dark:bg-black"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
