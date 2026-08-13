import { Icon } from "@reloop/ui/icon";
import Image from "next/image";

type Founder = {
	name: string;
	role: string;
	bio: string;
	image: string;
	github: string;
};

const founders: Founder[] = [
	{
		name: "Pranav Patel",
		role: "Co-founder",
		bio: "Sets platform architecture, API ergonomics, and core open-source engine design across Reloop.",
		image: "/company/team/pranav-patel.jpg",
		github: "https://github.com/pranavp10",
	},
	{
		name: "Twinkal P",
		role: "Co-founder",
		bio: "Architects the high-throughput delivery pipeline and deployment infrastructure across hosted and self-hosted environments.",
		image: "/company/team/twinkal-p.jpg",
		github: "https://github.com/twinkalp10",
	},
];

export function AboutFounders() {
	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Section Header */}
				<div className="border-stroke-soft-200 border-b px-6 py-14 sm:px-10 sm:py-16 lg:px-12 dark:border-white/10">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Founders and maintainers.
					</h2>
					<p className="mt-1.5 max-w-2xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Two engineers building the email infrastructure we wanted to use. Still actively architecting and writing the codebase.
					</p>
				</div>

				{/* 2-Column Founder Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-stroke-soft-200 sm:divide-y-0 sm:divide-x dark:divide-white/10">
					{founders.map((founder) => (
						<div key={founder.name} className="flex flex-col p-6 sm:p-8 lg:p-10">
							<div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 sm:aspect-[4/3] dark:bg-white/5">
								<Image
									src={founder.image}
									alt={founder.name}
									fill
									className="object-cover object-center"
									sizes="(max-width: 1024px) 100vw, 50vw"
								/>
							</div>
							<div className="mt-6 flex flex-1 flex-col">
								<p className="font-mono text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/45">
									{founder.role}
								</p>
								<h3 className="mt-1 font-semibold text-[18px] text-text-strong-950 tracking-tight sm:text-[20px] dark:text-white">
									{founder.name}
								</h3>
								<p className="mt-2.5 text-[13.5px] text-text-sub-600 leading-relaxed sm:text-[14px] dark:text-white/55">
									{founder.bio}
								</p>
								<div className="mt-6 pt-4 border-t border-stroke-soft-200 dark:border-white/10">
									<a
										href={founder.github}
										target="_blank"
										rel="noopener noreferrer"
										className="group inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 transition-colors hover:text-text-sub-600 dark:text-white dark:hover:text-white/70"
									>
										GitHub profile
										<Icon
											name="arrow-up-right"
											className="size-3.5 opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
											aria-hidden
										/>
									</a>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
