import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { toolConfigs } from "@reloop/web/lib/landing/tools";
import Link from "next/link";

export const instant = false;

export const metadata = createLandingMetadata(
	"Free Email Tools",
	"Email validator, SPF checker, deliverability tester, subject line analyzer, template generator, and mobile preview.",
	"/tools",
	["free email tools", "email validator", "SPF checker", "deliverability tester"],
);

const toolMeta: Record<string, { tag: string; accent: string }> = {
	"email-validator": { tag: "Verify addresses", accent: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20" },
	"deliverability-tester": { tag: "Spam score", accent: "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20" },
	"auth-checker": { tag: "DNS lookup", accent: "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20" },
	"subject-tester": { tag: "Open rate", accent: "border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20" },
	"template-generator": { tag: "HTML templates", accent: "border-violet-200 bg-violet-50 dark:border-violet-900/40 dark:bg-violet-950/20" },
	"mobile-preview": { tag: "Client preview", accent: "border-indigo-200 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-950/20" },
};

export default function ToolsIndexPage() {
	return (
		<div className="min-h-screen bg-[#f4f4f5] dark:bg-black">
			<div className="border-stroke-soft-200 border-b bg-white px-4 py-12 dark:border-white/10 dark:bg-[#0a0a0a] sm:px-6">
				<div className="mx-auto max-w-4xl">
					<h1 className="font-semibold text-3xl text-text-strong-950 tracking-tight dark:text-white">
						Free email tools
					</h1>
					<p className="mt-3 max-w-2xl text-[16px] text-text-sub-600 leading-relaxed dark:text-white/50">
						Each tool uses a familiar layout—like the validators and checkers you
						already use—so you can get results immediately.
					</p>
				</div>
			</div>

			<div className="mx-auto grid max-w-4xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6">
				{toolConfigs.map((tool) => {
					const meta = toolMeta[tool.slug] ?? { tag: "Tool", accent: "" };
					return (
						<Link
							key={tool.path}
							href={tool.path}
							className={`rounded-2xl border p-6 transition-shadow hover:shadow-md ${meta.accent}`}
						>
							<span className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
								{meta.tag}
							</span>
							<h2 className="mt-2 font-semibold text-[18px] text-text-strong-950 dark:text-white">
								{tool.titleLines.join(" ")}
							</h2>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
								{tool.description}
							</p>
							<span className="mt-4 inline-block font-semibold text-primary-base text-sm">
								Open tool →
							</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
