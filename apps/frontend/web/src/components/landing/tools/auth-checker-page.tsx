"use client";

import * as Button from "@reloop/ui/button";
import {
	ChecklistTable,
	ToolPanel,
	ToolTopBar,
	ToolUpsell,
} from "@reloop/web/components/landing/tools/tool-chrome";
import {
	type AuthRecordResult,
	checkDomainAuth,
} from "@reloop/web/lib/landing/tools/validation-utils";
import Link from "next/link";
import { useState } from "react";

export function AuthCheckerPageView() {
	const [domain, setDomain] = useState("");
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<AuthRecordResult[] | null>(null);

	async function handleLookup(e?: React.FormEvent) {
		e?.preventDefault();
		setLoading(true);
		setResults(await checkDomainAuth(domain));
		setLoading(false);
	}

	return (
		<div className="min-h-screen bg-[#0f172a] text-white">
			<div className="border-white/10 border-b bg-[#0b1220]">
				<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
					<nav className="mb-4 flex flex-wrap gap-2 text-[13px] text-white/40">
						<Link href="/tools" className="hover:text-orange-400">
							Tools
						</Link>
						<span>/</span>
						<span className="text-white/70">Authentication Checker</span>
					</nav>
					<h1 className="font-mono text-2xl tracking-tight sm:text-3xl">
						SPF · DKIM · DMARC Lookup
					</h1>
					<p className="mt-2 max-w-2xl text-[15px] text-white/55">
						DNS lookup for sending domains—similar to MXToolbox and DMARC
						analyzers. Enter your domain to inspect authentication records.
					</p>
				</div>
			</div>

			<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
				<ToolPanel className="border-white/10! bg-[#111827]! text-white">
					<form
						onSubmit={handleLookup}
						className="flex flex-col gap-3 sm:flex-row"
					>
						<input
							value={domain}
							onChange={(e) => setDomain(e.target.value)}
							placeholder="yourdomain.com"
							className="h-12 flex-1 rounded-lg border border-white/15 bg-black/40 px-4 font-mono text-[15px] outline-none focus:border-orange-400"
						/>
						<button
							type="submit"
							disabled={loading || !domain.trim()}
							className={`${Button.buttonVariants({ variant: "neutral" }).root()} h-12 rounded-full bg-orange-500! px-6 text-white! hover:bg-orange-600!`}
						>
							{loading ? "Looking up…" : "Lookup DNS"}
						</button>
					</form>

					{results && (
						<div className="mt-8 space-y-4">
							<ChecklistTable checks={results} />
						</div>
					)}
				</ToolPanel>

				<div className="mt-6 font-mono text-[12px] text-white/35">
					TXT lookup via public DNS. For guided SPF/DKIM setup, add your domain
					in{" "}
					<a
						href="/dashboard/signup"
						className="text-orange-400 hover:underline"
					>
						Reloop
					</a>
					.
				</div>
			</div>

			<ToolUpsell
				title="Auto-configure authentication in Reloop"
				description="Copy-paste DNS records for SPF, DKIM, and DMARC when you verify a sending domain."
				primaryHref="/dashboard/signup"
				primaryLabel="Add your domain"
				secondaryHref="/glossary/spf"
				secondaryLabel="What is SPF?"
			/>
		</div>
	);
}
