import Image from "next/image";

type Logo = { name: string; src?: string };

const logos: Logo[] = [
	{ name: "Chatbase", src: "/company-logos/chatbase.svg" },
	{ name: "Instinct", src: "/company-logos/instinct.png" },
	{ name: "Darkless", src: "/company-logos/darkless.svg" },
	{ name: "Ironwill Capital", src: "/company-logos/ironwillcapital.png" },
	{ name: "Avanet", src: "/company-logos/avanet.svg" },
	{ name: "True Heal", src: "/company-logos/trueheal.png" },
];

function LogoMark({ logo }: { logo: Logo }) {
	if (logo.src) {
		if (logo.name === "Instinct" || logo.name === "True Heal") {
			return (
				<div className="flex items-center justify-center gap-2.5 opacity-40">
									<Image
										alt={logo.name}
										src={logo.src}
										width={27}
										height={71}
										loading="lazy"
										className="h-10 w-auto object-contain dark:invert"
									/>
					<span className="font-semibold text-sm tracking-[-0.025em] text-zinc-950 sm:text-base dark:text-white">
						{logo.name}
					</span>
				</div>
			);
		}
		return (
			<Image
				alt={logo.name}
				src={logo.src}
				width={140}
				height={48}
				loading="lazy"
				className="h-12 w-auto object-contain opacity-40 sm:h-14 dark:invert"
			/>
		);
	}
	return (
		<div className="flex items-center justify-center gap-2.5 text-zinc-950 opacity-40 dark:text-white">
			<span
				aria-hidden="true"
				className="flex size-[22px] shrink-0 items-center justify-center rounded-[6px] bg-zinc-950 font-bold text-[13px] text-white dark:bg-white dark:text-zinc-950"
			>
				{logo.name.charAt(0)}
			</span>
			<span className="font-semibold text-sm tracking-[-0.025em] sm:text-base">
				{logo.name}
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
							</span>{" "}
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
							{[...logos, ...logos].map((logo, i) => (
								<li
									key={`${logo.name}-${i}`}
									aria-hidden={i >= logos.length}
									className="flex h-24 w-48 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-white px-4 dark:bg-black"
								>
									<LogoMark logo={logo} />
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
