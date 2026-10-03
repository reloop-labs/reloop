import type { SimpleIcon } from "simple-icons";
import {
	siAtandt,
	siAtlassian,
	siGithub,
	siNotion,
	siShopify,
	siTrello,
	siZoho,
} from "simple-icons";

type Brand = { name: string; icon: SimpleIcon };

const brands: Brand[] = [
	{ name: "Shopify", icon: siShopify },
	{ name: "GitHub", icon: siGithub },
	{ name: "Zoho", icon: siZoho },
	{ name: "AT&T", icon: siAtandt },
	{ name: "Notion", icon: siNotion },
	{ name: "Trello", icon: siTrello },
	{ name: "Atlassian", icon: siAtlassian },
];

function BrandMark({ brand }: { brand: Brand }) {
	return (
		<div className="flex items-center justify-center gap-2.5 text-zinc-950 dark:text-white">
			<svg
				viewBox="0 0 24 24"
				aria-hidden="true"
				className="size-[22px] shrink-0 fill-current"
			>
				<path d={brand.icon.path} />
			</svg>
			<span className="font-semibold text-sm tracking-[-0.025em] sm:text-base">
				{brand.name}
			</span>
		</div>
	);
}

export function DeveloperProof() {
	return (
		<section
			aria-labelledby="developer-proof-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			<style>{`@keyframes developer-proof-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1280px)_minmax(24px,1fr)] gap-x-px bg-[#ebebeb] max-[1279px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1279px]:hidden dark:bg-black"
				/>
				<div className="grid gap-y-px bg-[#ebebeb] dark:bg-[#292929]">
					<div className="rounded-[4px] bg-white px-6 py-20 dark:bg-black">
						<h2
							id="developer-proof-heading"
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
					<div className="overflow-hidden rounded-[4px] bg-[#ebebeb] dark:bg-[#292929]">
						<ul
							aria-label="Companies using Reloop"
							className="flex w-max gap-px hover:[animation-play-state:paused] motion-reduce:animate-none"
							style={{
								animation:
									"developer-proof-marquee 60s linear infinite",
							}}
						>
							{[...brands, ...brands].map((brand, i) => (
								<li
									key={`${brand.name}-${i}`}
									aria-hidden={i >= brands.length}
									className="flex h-24 w-48 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-white px-4 dark:bg-black"
								>
									<BrandMark brand={brand} />
								</li>
							))}
						</ul>
					</div>
				</div>
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1279px]:hidden dark:bg-black"
				/>
			</div>
		</section>
	);
}
