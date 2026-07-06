import { integrationConfigs } from "@reloop/web/lib/landing/integrations";
import { getIntegrationEnrichment } from "@reloop/web/lib/landing/integrations/enrichment";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { accentStyles } from "@reloop/web/lib/landing/page-accents";
import Link from "next/link";

export const instant = false;

export const metadata = createLandingMetadata(
	"Email Integrations",
	"Send email from Next.js, Laravel, Django, FastAPI, Rails, Spring Boot, Supabase, Vercel, and Stripe.",
	"/integrations",
	["email integration", "Next.js email", "Laravel email API"],
);

export default function IntegrationsIndexPage() {
	return (
		<div className="min-h-screen bg-[#0c0c0c] text-white">
			<div className="border-white/10 border-b px-4 py-12 sm:px-6">
				<div className="mx-auto max-w-5xl">
					<p className="font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
						// integrations
					</p>
					<h1 className="mt-3 font-semibold text-3xl tracking-tight">
						Send email from your stack
					</h1>
					<p className="mt-3 max-w-2xl text-[16px] text-white/50 leading-relaxed">
						Docs-style guides with install commands and copy-paste code—like
						Resend or Stripe integration pages.
					</p>
				</div>
			</div>

			<div className="mx-auto grid max-w-5xl gap-3 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
				{integrationConfigs.map((item) => {
					const extra = getIntegrationEnrichment(item.slug);
					const accent = accentStyles[extra.accent];
					return (
						<Link
							key={item.path}
							href={item.path}
							className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
						>
							<span
								className={`inline-flex rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${accent.badge}`}
							>
								{extra.language}
							</span>
							<h2 className="mt-3 font-semibold text-[17px] leading-snug group-hover:text-emerald-400">
								{item.titleLines.join(" ")}
							</h2>
							<p className="mt-2 font-mono text-[11px] text-white/35">
								{extra.install}
							</p>
							<p className="mt-2 text-[13px] text-white/45 leading-relaxed">
								{item.description}
							</p>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
