import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AlignedIconBand } from "@reloop/web/app/sdk/components/section-frame";
import { SectionTitle } from "@reloop/web/app/sdk/components/section-title";
import Link from "next/link";

export type Sponsor = {
	name: string;
	href?: string;
	/** Optional logo image URL. When omitted, a monogram is rendered. */
	logo?: string;
};

export type SponsorTier = {
	id: string;
	name: string;
	icon: string;
	accent: string;
	/** Display price, e.g. "$199/mo". Shown under the tier name. */
	monthly: string;
	/** Max logo slots in this tier — diamond 5, gold 10, silver 20, bronze 40. */
	slots: number;
	/** Logo box size — shrinks per tier: diamond largest, bronze smallest. */
	logoSize: string;
	/** Placeholder cell height — shrinks per tier. */
	slotHeight: string;
	/** Placeholder grid density — more columns for lower tiers. */
	slotGrid: string;
	sponsors: Sponsor[];
};

const SPONSOR_HREF = "https://buymeacoffee.com/reloop";

/** Attribution ref appended to every outbound sponsor redirect. */
const SPONSOR_REF = "reloop.sh";

/** Append ?ref=reloop.sh to a sponsor URL, preserving existing params. */
export function withSponsorRef(href: string) {
	try {
		const url = new URL(href);
		url.searchParams.set("ref", SPONSOR_REF);
		return url.toString();
	} catch {
		const sep = href.includes("?") ? "&" : "?";
		return `${href}${sep}ref=${SPONSOR_REF}`;
	}
}

export const SPONSOR_TIERS: SponsorTier[] = [
	{
		id: "diamond",
		name: "Diamond",
		monthly: "$199/mo",
		icon: "star-filled",
		accent: "bg-sky-500/15 text-sky-600 dark:bg-sky-500/25 dark:text-sky-400",
		slots: 5,
		logoSize: "size-20",
		slotHeight: "min-h-28",
		slotGrid: "grid-cols-1 sm:grid-cols-5",
		sponsors: [],
	},
	{
		id: "gold",
		name: "Gold",
		monthly: "$99/mo",
		icon: "award",
		accent:
			"bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400",
		slots: 10,
		logoSize: "size-16",
		slotHeight: "min-h-24",
		slotGrid: "grid-cols-2 sm:grid-cols-5",
		sponsors: [],
	},
	{
		id: "silver",
		name: "Silver",
		monthly: "$49/mo",
		icon: "star",
		accent:
			"bg-slate-500/15 text-slate-600 dark:bg-slate-500/25 dark:text-slate-300",
		slots: 20,
		logoSize: "size-12",
		slotHeight: "min-h-20",
		slotGrid: "grid-cols-2 sm:grid-cols-5 lg:grid-cols-10",
		sponsors: [],
	},
	{
		id: "bronze",
		name: "Bronze",
		monthly: "$19/mo",
		icon: "heart",
		accent:
			"bg-orange-500/15 text-orange-700 dark:bg-orange-500/25 dark:text-orange-400",
		slots: 40,
		logoSize: "size-10",
		slotHeight: "min-h-[4.5rem]",
		slotGrid: "grid-cols-2 sm:grid-cols-5 lg:grid-cols-10",
		sponsors: [
			{
				name: "Encrata",
				href: "https://encrata.com",
				logo: "/sponsors/encrata-logo.svg",
			},
		],
	},
];

export const ONE_TIME_SPONSORS: Sponsor[] = [];

function SponsorLogo({
	sponsor,
	size,
	round = false,
}: {
	sponsor: Sponsor;
	size: string;
	round?: boolean;
}) {
	const label = sponsor.name
		.split(" ")
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	const shape = round ? "rounded-full" : "rounded-xl";

	const inner = (
		<>
			{sponsor.logo ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={sponsor.logo}
					alt={sponsor.name}
					className={`${size} ${shape} object-cover`}
					loading="lazy"
				/>
			) : (
				<span
					className={`flex ${size} items-center justify-center ${shape} border border-stroke-soft-200 bg-bg-weak-50 font-semibold text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white`}
				>
					{label}
				</span>
			)}
			<span className="max-w-full truncate font-medium text-[12px] text-text-sub-600 dark:text-white/50">
				{sponsor.name}
			</span>
		</>
	);

	if (sponsor.href) {
		return (
			<a
				href={withSponsorRef(sponsor.href)}
				target="_blank"
				rel="noopener noreferrer"
				className="flex flex-col items-center justify-center gap-1.5 transition-opacity hover:opacity-80"
			>
				{inner}
			</a>
		);
	}

	return (
		<span className="flex flex-col items-center justify-center gap-1.5">
			{inner}
		</span>
	);
}

export function SelfHostSponsors() {
	return (
		<section
			id="sponsors"
			className="w-full border-stroke-soft-200 border-t dark:border-white/10"
		>
			<SectionTitle
				title="Sponsors"
				icon="heart"
				action={
					<FancyButton.Root asChild variant="neutral" size="small">
						<a href={SPONSOR_HREF} target="_blank" rel="noopener noreferrer">
							Become a sponsor
						</a>
					</FancyButton.Root>
				}
			/>

			<AlignedIconBand>
				{/* Stacked rows: Diamond / Gold / Silver / Bronze — dividers between, logos shrink per tier */}
				<div className="grid grid-cols-1 gap-px bg-stroke-soft-200 dark:bg-white/10">
					{SPONSOR_TIERS.map((tier) => {
						const filled = tier.sponsors.length;
						const empty = Math.max(tier.slots - filled, 0);
						return (
							<div
								key={tier.id}
								className="flex flex-col gap-5 bg-bg-white-0 p-6 sm:p-7 dark:bg-black"
							>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div className="flex items-center gap-2.5">
										<span
											className={`inline-flex size-9 items-center justify-center overflow-hidden rounded-[10px] ${tier.accent}`}
										>
											<Icon name={tier.icon} className="size-4" aria-hidden />
										</span>
										<div>
											<h3 className="font-semibold text-[15px] text-text-strong-950 leading-tight dark:text-white">
												{tier.name}
											</h3>
											<p className="text-[12.5px] text-text-sub-600 tabular-nums dark:text-white/50">
												{tier.monthly}
											</p>
										</div>
									</div>
									<span className="inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-weak-50/50 px-2.5 py-1 font-medium text-[11.5px] text-text-sub-600 tabular-nums dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50">
										{filled} / {tier.slots} sponsors
									</span>
								</div>

								<div className={`grid w-full gap-2.5 ${tier.slotGrid}`}>
									{tier.sponsors.map((sponsor) => (
										<div
											key={sponsor.name}
											className={`flex ${tier.slotHeight} flex-col items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-2 dark:border-white/10 dark:bg-white/[0.02]`}
										>
											<SponsorLogo sponsor={sponsor} size={tier.logoSize} />
										</div>
									))}
									{Array.from({ length: empty }).map((_, index) => (
										<Link
											key={index}
											href={SPONSOR_HREF}
											className={`flex ${tier.slotHeight} items-center justify-center rounded-xl border border-stroke-soft-200 border-dashed bg-bg-weak-50/50 px-3 text-center font-medium text-[12.5px] text-text-sub-600 transition-colors hover:border-text-sub-600/40 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/40 dark:hover:border-white/30 dark:hover:text-white`}
										>
											Your logo here
										</Link>
									))}
								</div>
							</div>
						);
					})}
				</div>

				{/* Bottom row: one-time sponsors, smallest icons */}
				<div className="border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black">
					<div className="flex flex-col gap-5 p-6 sm:p-7">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex items-center gap-2.5">
								<span className="inline-flex size-9 items-center justify-center rounded-[10px] border border-stroke-soft-200 bg-bg-weak-50/50 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
									<Icon name="gift" className="size-4" aria-hidden />
								</span>
								<div>
									<h3 className="font-semibold text-[15px] text-text-strong-950 leading-tight dark:text-white">
										One-time sponsors
									</h3>
									<p className="text-[12.5px] text-text-sub-600 dark:text-white/50">
										From $5 · one-time
									</p>
								</div>
							</div>
							<span className="inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-weak-50/50 px-2.5 py-1 font-medium text-[11.5px] text-text-sub-600 tabular-nums dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50">
								{ONE_TIME_SPONSORS.length}{" "}
								{ONE_TIME_SPONSORS.length === 1 ? "sponsor" : "sponsors"}
							</span>
						</div>

						{ONE_TIME_SPONSORS.length > 0 ? (
							<div className="flex flex-wrap items-start gap-3">
								{ONE_TIME_SPONSORS.map((sponsor) => (
									<SponsorLogo
										key={sponsor.name}
										sponsor={sponsor}
										size="size-10"
										round
									/>
								))}
							</div>
						) : (
							<div className="flex flex-nowrap items-center gap-2.5 overflow-hidden">
								{Array.from({ length: 30 }).map((_, index) => (
									<Link
										key={index}
										href={SPONSOR_HREF}
										aria-label="Become a one-time sponsor"
										className="flex size-10 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 border-dashed bg-bg-weak-50/50 text-text-sub-600 transition-colors hover:border-text-sub-600/40 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/40 dark:hover:border-white/30 dark:hover:text-white"
									>
										<Icon name="plus" className="size-4" aria-hidden />
									</Link>
								))}
							</div>
						)}
					</div>
				</div>
			</AlignedIconBand>
		</section>
	);
}

export default SelfHostSponsors;
