import { alternativeConfigs } from "@reloop/web/lib/landing/alternatives";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import Link from "next/link";

export const instant = false;

export const metadata = createLandingMetadata(
	"Email Provider Alternatives",
	"Open-source alternatives to Resend, SendGrid, Mailgun, AWS SES, Postmark, Loops, and Mailchimp.",
	"/alternatives",
	["email provider alternative", "Resend alternative", "SendGrid alternative"],
);

const competitorStyle: Record<string, string> = {
	resend:
		"border-black/20 bg-neutral-50 hover:border-black/40 dark:border-white/20 dark:bg-neutral-900/50",
	sendgrid: "border-[#51A9E3]/30 bg-[#51A9E3]/5 hover:border-[#51A9E3]/50",
	mailgun: "border-red-500/20 bg-red-500/5 hover:border-red-500/40",
	"aws-ses": "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40",
	postmark: "border-yellow-400/30 bg-yellow-400/5 hover:border-yellow-400/50",
	mailchimp: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40",
	loops: "border-violet-500/20 bg-violet-500/5 hover:border-violet-500/40",
};

export default function AlternativesIndexPage() {
	return (
		<div className="min-h-screen bg-[#fafafa] dark:bg-black">
			<div className="border-stroke-soft-200 border-b bg-white px-4 py-12 text-center sm:px-6 dark:border-white/10 dark:bg-[#0a0a0a]">
				<div className="mx-auto max-w-3xl">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
						Compare
					</p>
					<h1 className="mt-3 font-semibold text-3xl text-text-strong-950 tracking-tight dark:text-white">
						Reloop vs. the rest
					</h1>
					<p className="mt-3 text-[16px] text-text-sub-600 leading-relaxed dark:text-white/50">
						Side-by-side comparison pages—like alternative.to or G2—with feature
						tables and migration paths.
					</p>
				</div>
			</div>

			<div className="mx-auto grid max-w-4xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6">
				{alternativeConfigs.map((alt) => {
					const style =
						competitorStyle[alt.slug] ??
						"border-stroke-soft-200 bg-white dark:border-white/10 dark:bg-[#0a0a0a]";
					const competitor = alt.competitorName ?? alt.titleLines[0];
					return (
						<Link
							key={alt.path}
							href={alt.path}
							className={`rounded-2xl border p-6 transition-shadow hover:shadow-md ${style}`}
						>
							<div className="flex items-center justify-between gap-3">
								<span className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/55">
									Alternative
								</span>
								<span className="rounded-full bg-primary-base/10 px-2.5 py-0.5 font-semibold text-[10px] text-primary-base uppercase tracking-wider">
									VS
								</span>
							</div>
							<h2 className="mt-3 font-semibold text-[18px] text-text-strong-950 dark:text-white">
								Reloop vs {competitor}
							</h2>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{alt.description}
							</p>
							<span className="mt-4 inline-block font-semibold text-primary-base text-sm">
								See comparison →
							</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
