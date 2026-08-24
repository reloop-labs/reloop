"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

type LangId = "typescript" | "python" | "go" | "curl";

const SNIPPETS: Record<LangId, { label: string; file: string; code: string }> =
	{
		typescript: {
			label: "TypeScript",
			file: "analytics.ts",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

// 1. Fetch aggregate metrics for a timeframe
const stats = await reloop.analytics.getMetrics({
  timeframe: '30d',
  groupBy: 'domain',
  tags: { environment: 'production' }
});

console.log(\`Delivery rate: \${stats.deliverabilityRate}%\`);
console.log(\`Unique opens: \${stats.uniqueOpens}\`);

// 2. Query raw delivery and bounce events
const events = await reloop.events.list({
  type: 'email.bounced',
  limit: 20
});`,
		},
		python: {
			label: "Python",
			file: "analytics.py",
			code: `import os
from reloop import Reloop

reloop = Reloop(api_key=os.environ["RELOOP_API_KEY"])

# 1. Fetch aggregate delivery metrics
stats = reloop.analytics.get_metrics(
    timeframe="30d",
    group_by="domain",
    tags={"environment": "production"}
)

print(f"Delivery rate: {stats.deliverability_rate}%")
print(f"Unique opens: {stats.unique_opens}")

# 2. Inspect bounce diagnostic logs
bounces = reloop.events.list(event_type="email.bounced", limit=20)`,
		},
		go: {
			label: "Go",
			file: "analytics.go",
			code: `package main

import (
	"context"
	"fmt"
	"os"

	"github.com/reloop-labs/reloop-go/v2"
)

func main() {
	client := reloop.NewClient(os.Getenv("RELOOP_API_KEY"))

	stats, err := client.Analytics.GetMetrics(context.Background(), &reloop.MetricsParams{
		Timeframe: "30d",
		GroupBy:   "domain",
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("Delivery Rate: %.2f%%\\n", stats.DeliverabilityRate)
}`,
		},
		curl: {
			label: "cURL / REST",
			file: "request.sh",
			code: `curl -X GET "https://api.reloop.sh/v1/analytics/metrics?timeframe=30d&groupBy=domain" \\
  -H "Authorization: Bearer $RELOOP_API_KEY" \\
  -H "Content-Type: application/json"`,
		},
	};

export default function Guide() {
	const [activeLang, setActiveLang] = useState<LangId>("typescript");
	const [copied, setCopied] = useState(false);

	const activeSnippet = SNIPPETS[activeLang];

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(activeSnippet.code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<section id="developer-guide" className="relative w-full py-16 sm:py-24">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						Query Analytics in 3 Lines of Code
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						Full programmatic access to your email metrics. Query time-series
						analytics, track delivery SLAs, and fetch raw diagnostic payloads.
					</p>
				</div>

				<div className="mt-12 overflow-hidden rounded-3xl border border-stroke-soft-200 bg-[#0c0d0e] shadow-xl dark:border-white/10">
					{/* Header bar */}
					<div className="flex flex-wrap items-center justify-between border-white/10 border-b bg-white/[0.03] px-6 py-3">
						<div className="flex items-center gap-2">
							{(Object.keys(SNIPPETS) as LangId[]).map((lang) => (
								<button
									key={lang}
									type="button"
									onClick={() => setActiveLang(lang)}
									className={cn(
										"rounded-lg px-3 py-1.5 font-medium text-xs transition-colors",
										activeLang === lang
											? "bg-white/15 text-white"
											: "text-white/50 hover:bg-white/5 hover:text-white",
									)}
								>
									{SNIPPETS[lang].label}
								</button>
							))}
						</div>

						<div className="flex items-center gap-3">
							<span className="font-mono text-white/40 text-xs">
								{activeSnippet.file}
							</span>
							<button
								type="button"
								onClick={handleCopy}
								className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/70 text-xs transition-colors hover:bg-white/10 hover:text-white"
							>
								<Icon
									name={copied ? "check-circle" : "copy"}
									className="size-3.5 text-emerald-400"
								/>
								<span>{copied ? "Copied" : "Copy"}</span>
							</button>
						</div>
					</div>

					{/* Code body */}
					<div className="p-6 font-mono text-sm leading-relaxed sm:p-8">
						<pre className="overflow-x-auto text-white/90">
							<code>{activeSnippet.code}</code>
						</pre>
					</div>
				</div>
			</div>
		</section>
	);
}
