import type { SimpleIcon } from "simple-icons";
import {
	siAnthropic,
	siBun,
	siCloudflare,
	siCursor,
	siDocker,
	siGithub,
	siGmail,
	siNextdotjs,
	siNodedotjs,
	siPython,
	siReact,
	siVercel,
} from "simple-icons";

type Brand = { name: string; icon: SimpleIcon };

// 10 developer tools displayed in a 5x2 grid
const brands: Brand[] = [
	{ name: "Claude", icon: siAnthropic },
	{ name: "Cursor", icon: siCursor },
	{ name: "GitHub", icon: siGithub },
	{ name: "Vercel", icon: siVercel },
	{ name: "Next.js", icon: siNextdotjs },
	{ name: "React", icon: siReact },
	{ name: "Node.js", icon: siNodedotjs },
	{ name: "Python", icon: siPython },
	{ name: "Docker", icon: siDocker },
	{ name: "Cloudflare", icon: siCloudflare },
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
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1102px)_minmax(24px,1fr)] gap-x-px bg-[#ebebeb] max-[1099px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
				/>
				<div className="grid gap-y-px bg-[#ebebeb] dark:bg-[#292929]">
					<div className="rounded-[4px] bg-white px-6 py-20 dark:bg-black">
						<h2
							id="developer-proof-heading"
							className="mx-auto max-w-xl text-balance text-center font-normal text-base text-zinc-600 leading-normal md:text-lg lg:text-xl dark:text-zinc-400"
						>
							Reloop works with tools developers already use—from{" "}
							<span className="text-zinc-950 dark:text-white">
								app frameworks
							</span>{" "}
							and{" "}
							<span className="text-blue-600 dark:text-blue-400">
								AI coding agents
							</span>{" "}
							to cloud infrastructure.
						</h2>
					</div>
					<ul
						aria-label="Developer tools supported by Reloop"
						className="grid grid-cols-2 gap-px bg-[#ebebeb] sm:grid-cols-5 dark:bg-[#292929]"
					>
						{brands.map((brand) => (
							<li
								key={brand.name}
								className="flex h-24 items-center justify-center overflow-hidden rounded-[4px] bg-white px-2 sm:px-4 dark:bg-black"
							>
								<BrandMark brand={brand} />
							</li>
						))}
					</ul>
				</div>
				<div
					aria-hidden
					className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
				/>
			</div>
		</section>
	);
}

