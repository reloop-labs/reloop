import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import { HeroCtaLink } from "@reloop/web/components/landing/hero";
import Link from "next/link";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "./brand-icon";

type MigrateStep = {
	step: number;
	title: string;
	body: string;
	duration: string;
	/** Visual in the upper card area */
	visual: "signin" | "domains" | "success";
};

const defaultSteps: MigrateStep[] = [
	{
		step: 1,
		title: "Step 1",
		body: "Create a Reloop account and verify the domain you already send from with Resend.",
		duration: "2 min",
		visual: "signin",
	},
	{
		step: 2,
		title: "Step 2",
		body: "Keep your templates. Swap the send client—or point SMTP at Reloop—with a small adapter.",
		duration: "5 min",
		visual: "domains",
	},
	{
		step: 3,
		title: "Step 3",
		body: "Re-wire delivery webhooks and start sending. Most teams ship the swap the same afternoon.",
		duration: "3–5 min",
		visual: "success",
	},
];

/**
 * Dub-style "Migrate in minutes" block: headline, CTAs, three step cards.
 */
export function CompareMigrate({
	competitorName,
	competitorIcon,
	primaryHref = "/dashboard/signup",
	guideHref = "#migrate",
	steps = defaultSteps,
	className,
}: {
	competitorName: string;
	competitorIcon: Pick<SimpleIcon, "hex" | "path">;
	primaryHref?: string;
	guideHref?: string;
	steps?: MigrateStep[];
	className?: string;
}) {
	return (
		<div id="migrate" className={cn("scroll-mt-28", className)}>
			{/* Header */}
			<div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
				<h2 className="font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
					Migrate in minutes
				</h2>
				<p className="mx-auto mt-4 max-w-xl text-balance font-medium text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/50">
					Switching from {competitorName} to Reloop is straightforward. Keep
					your templates, swap the send path, and re-wire webhooks—without
					rewriting your product.
				</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<HeroCtaLink
						href={primaryHref}
						label="Start for free"
						variant="primary"
					/>
					<Link
						href={guideHref}
						className="inline-flex h-11 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 px-7 font-semibold text-[14px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
					>
						Migration guide
					</Link>
				</div>
			</div>

			{/* Step cards */}
			<div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3 sm:gap-5">
				{steps.map((step) => (
					<div
						key={step.step}
						className="flex flex-col overflow-hidden rounded-[20px] border border-stroke-soft-200 bg-bg-white-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-white/[0.03]"
					>
						{/* Visual panel */}
						<div className="relative flex min-h-[168px] flex-col items-center justify-center overflow-hidden border-stroke-soft-200 border-b bg-bg-weak-50/60 px-5 py-7 dark:border-white/10 dark:bg-white/[0.02]">
							{/* Square dots pattern background */}
							<div
								aria-hidden
								className="pointer-events-none absolute inset-0 text-text-strong-950/25 dark:text-white/25"
								style={{
									backgroundImage:
										"radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
									backgroundSize: "24px 24px",
									maskImage:
										"radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)",
									WebkitMaskImage:
										"radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)",
								}}
							/>
							<div className="relative z-10 w-full">
								{step.visual === "signin" ? (
									<SignInVisual
										competitorName={competitorName}
										competitorIcon={competitorIcon}
									/>
								) : null}
								{step.visual === "domains" ? <DomainsVisual /> : null}
								{step.visual === "success" ? (
									<SuccessVisual competitorName={competitorName} />
								) : null}
							</div>
						</div>

						{/* Copy */}
						<div className="flex flex-1 flex-col px-5 py-5 sm:px-6">
							<p className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
								{step.title}
							</p>
							<p className="mt-2 flex-1 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/55">
								{step.body}
							</p>
							<span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1 font-medium text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50">
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden
									className="opacity-70"
								>
									<circle cx="12" cy="12" r="10" />
									<path d="M12 6v6l4 2" />
								</svg>
								{step.duration}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function SignInVisual({
	competitorName,
	competitorIcon,
}: {
	competitorName: string;
	competitorIcon: Pick<SimpleIcon, "hex" | "path">;
}) {
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex items-center gap-3">
				<div
					className="flex size-12 items-center justify-center rounded-[14px] shadow-sm ring-1 ring-black/5 dark:ring-white/10"
					style={{ backgroundColor: `#${competitorIcon.hex}` }}
				>
					<BrandIcon icon={competitorIcon} fill="#ffffff" className="size-6" />
				</div>
				<span className="text-text-sub-600 dark:text-white/40" aria-hidden>
					→
				</span>
				<div className="flex size-12 items-center justify-center rounded-[14px] bg-[#0a0d12] shadow-sm ring-1 ring-black/5 dark:ring-white/10">
					<Logo className="[&_rect]:!fill-white size-[70%]" />
				</div>
			</div>
			<div className="w-full max-w-[200px] rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-center font-medium text-[12px] text-text-strong-950 shadow-sm dark:border-white/10 dark:bg-black/40 dark:text-white">
				Connect from {competitorName}
			</div>
		</div>
	);
}

function DomainsVisual() {
	const rows = [
		{ domain: "acme.com", on: true },
		{ domain: "mail.acme.com", on: true },
		{ domain: "staging.acme.com", on: false },
	];
	return (
		<div className="mx-auto w-full max-w-[220px] space-y-2.5">
			{rows.map((row) => (
				<div
					key={row.domain}
					className="flex items-center justify-between gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 dark:border-white/10 dark:bg-black/40"
				>
					<span
						className={cn(
							"font-medium text-[12px] tracking-tight",
							row.on
								? "text-text-strong-950 dark:text-white"
								: "text-text-sub-600/50 dark:text-white/30",
						)}
					>
						{row.domain}
					</span>
					<span
						className={cn(
							"relative h-5 w-9 shrink-0 rounded-full transition-colors",
							row.on
								? "bg-primary-base"
								: "bg-stroke-soft-200 dark:bg-white/15",
						)}
						aria-hidden
					>
						<span
							className={cn(
								"absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
								row.on ? "left-4" : "left-0.5",
							)}
						/>
					</span>
				</div>
			))}
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-center font-medium text-[12px] text-text-strong-950 shadow-sm dark:border-white/10 dark:bg-black/40 dark:text-white">
				Confirm domains
			</div>
		</div>
	);
}

function SuccessVisual({ competitorName }: { competitorName: string }) {
	return (
		<div className="flex flex-col items-center gap-3 text-center">
			<div className="flex size-12 items-center justify-center rounded-[14px] bg-[#0a0d12] shadow-sm">
				<Logo className="[&_rect]:!fill-white size-[70%]" />
			</div>
			<div className="flex items-start gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-left shadow-sm dark:border-white/10 dark:bg-black/40">
				<span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
					<svg
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden
					>
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</span>
				<p className="text-[12px] text-text-strong-950 leading-snug dark:text-white">
					<span className="font-semibold">Domain verified</span>
					<br />
					<span className="text-text-sub-600 dark:text-white/50">
						Ready to send via Reloop
						<span className="sr-only"> from {competitorName}</span>
					</span>
				</p>
			</div>
		</div>
	);
}
