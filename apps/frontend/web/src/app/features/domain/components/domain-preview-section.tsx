"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SdkCodeBlock } from "../../../sdk/components/sdk-code-block";

const RECORD_CYCLES = [
	{
		type: "DKIM",
		name: "rl._domainkey.acme.com",
		value: "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...",
		status: "Verified",
		badgeColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400",
		description: "2048-bit RSA key cryptographic identity signature",
	},
	{
		type: "SPF",
		name: "acme.com",
		value: "v=spf1 include:_spf.reloop.sh ~all",
		status: "Aligned",
		badgeColor: "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400",
		description: "Authorizes Reloop edge MTAs to deliver from your domain",
	},
	{
		type: "DMARC",
		name: "_dmarc.acme.com",
		value: "v=DMARC1; p=reject; rua=mailto:dmarc@reloop.sh",
		status: "Enforced",
		badgeColor: "text-purple-600 bg-purple-500/10 border-purple-500/20 dark:text-purple-400",
		description: "Strict policy protecting against sender spoofing & phishing",
	},
	{
		type: "RETURN-PATH",
		name: "mail.acme.com",
		value: "CNAME bounce.reloop.sh",
		status: "Custom Mail-From",
		badgeColor: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
		description: "Custom envelope domain to eliminate 'via reloop.sh' warnings",
	},
] as const;

const DOMAIN_CODE_TS = `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

// Register a new custom domain
const domain = await reloop.domains.create({
  name: 'acme.com',
  region: 'us-east-1',
});

// Check automated DNS verification status
const status = await reloop.domains.verify(domain.id);
console.log(status.dkim.status); // "verified"`;

export function DomainPreviewSection() {
	const [recordIndex, setRecordIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setRecordIndex((prev) => (prev + 1) % RECORD_CYCLES.length);
		}, 3500);
		return () => clearInterval(interval);
	}, []);

	const activeRecord = RECORD_CYCLES[recordIndex];

	return (
		<section className="w-full border-stroke-soft-200 border-t bg-bg-white-0 dark:border-white/10 dark:bg-black">
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-white/10">
					{/* Left Panel: DNS-as-Code */}
					<div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
						<div>
							<div className="mb-4">
								<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-emerald-50 px-2.5 py-1 font-medium text-[13px] text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
									<Icon name="code" className="size-3.5" />
									DNS as Code
								</span>
							</div>
							<h3 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[23px] xl:text-[26px] dark:text-white">
								Provision &amp; verify domains via API.
							</h3>
							<p className="mt-2.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] lg:text-[15px] dark:text-white/60">
								Automate domain provisioning in CI/CD pipelines, multi-tenant SaaS
								apps, and agentic workflows with our TypeScript SDK and CLI.
							</p>

							<div className="mt-6 flex flex-wrap items-center gap-2">
								<span className="rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1 font-mono text-[11.5px] text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
									reloop domains add &lt;domain&gt;
								</span>
								<span className="rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1 font-mono text-[11.5px] text-text-sub-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
									reloop domains verify &lt;id&gt;
								</span>
							</div>
						</div>

						<div className="mt-8 w-full">
							<SdkCodeBlock
								slug="nodejs"
								code={DOMAIN_CODE_TS}
								path="domain.ts"
							/>
						</div>
					</div>

					{/* Right Panel: Live DNS Status Showcase */}
					<div className="relative flex flex-col justify-between p-8 sm:p-10 lg:p-12">
						<div>
							<div className="mb-4 flex items-center justify-between gap-3">
								<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-emerald-50 px-2.5 py-1 font-medium text-[13px] text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
									<Icon name="shield-check" className="size-3.5" />
									DNS Verification
								</span>

								{/* Progress Indicator */}
								<div className="flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0/90 px-2.5 py-1 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
									<div className="relative flex size-3 items-center justify-center">
										<svg className="-rotate-90 size-3" viewBox="0 0 24 24">
											<circle
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="3.5"
												className="text-stroke-soft-200 dark:text-white/15"
												fill="none"
											/>
											<motion.circle
												key={recordIndex}
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="3.5"
												strokeLinecap="round"
												className="text-emerald-500 dark:text-emerald-400"
												fill="none"
												strokeDasharray="62.83"
												initial={{ strokeDashoffset: 62.83 }}
												animate={{ strokeDashoffset: 0 }}
												transition={{ duration: 3.5, ease: "linear" }}
											/>
										</svg>
									</div>

									<span className="font-medium font-mono text-[11px] text-text-sub-600 dark:text-white/70">
										{recordIndex + 1}/{RECORD_CYCLES.length}
									</span>
								</div>
							</div>

							<h3 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[23px] xl:text-[26px] dark:text-white">
								Automated record diagnostics.
							</h3>
							<p className="mt-2.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] lg:text-[15px] dark:text-white/60">
								Zero DNS guesswork. Reloop validates name servers, checks
								propagation across global resolvers, and flags misconfigurations instantly.
							</p>
						</div>

						{/* Interactive DNS Record Card Stack */}
						<div className="mt-8 w-full space-y-3">
							{RECORD_CYCLES.map((record, index) => {
								const isActive = index === recordIndex;
								return (
									<div
										key={record.type}
										onClick={() => setRecordIndex(index)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												setRecordIndex(index);
											}
										}}
										tabIndex={0}
										role="button"
										className={cn(
											"cursor-pointer rounded-xl border p-4 text-left transition-all duration-200",
											isActive
												? "border-emerald-500/40 bg-emerald-500/[0.04] shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/[0.06]"
												: "border-stroke-soft-200 bg-bg-weak-50/40 hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]",
										)}
									>
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-2">
												<span className="font-bold font-mono text-[12px] text-text-strong-950 dark:text-white">
													{record.type}
												</span>
												<span className="font-mono text-[11px] text-text-sub-600 dark:text-white/50">
													{record.name}
												</span>
											</div>
											<span
												className={cn(
													"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium text-[11px]",
													record.badgeColor,
												)}
											>
												<span className="size-1.5 rounded-full bg-current" />
												{record.status}
											</span>
										</div>

										<p className="mt-2 text-[12.5px] text-text-sub-600 dark:text-white/60">
											{record.description}
										</p>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
