"use client";

import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { SdkCodeBlock } from "@reloop/web/app/sdk/components/sdk-code-block";
import Link from "next/link";
import { useState } from "react";
import { apiResponseSample, publicBlocklistCount } from "./content";

const EXAMPLES = [
	{
		slug: "curl",
		name: "cURL",
		fileName: "check_blocklist.sh",
		code: `curl -X POST https://reloop.sh/api/tools/v1/blocklist-check \\
  -H "Content-Type: application/json" \\
  -d '{"target": "203.0.113.10"}'`,
	},
	{
		slug: "javascript",
		name: "JavaScript",
		fileName: "check-blocklist.js",
		code: `const res = await fetch("https://reloop.sh/api/tools/v1/blocklist-check", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ target: "203.0.113.10" }),
});

const report = await res.json();
console.log(report.verdict, report.listedCount, report.errorCount);`,
	},
	{
		slug: "python",
		name: "Python",
		fileName: "check_blocklist.py",
		code: `import json, urllib.request

req = urllib.request.Request(
    "https://reloop.sh/api/tools/v1/blocklist-check",
    data=json.dumps({"target": "203.0.113.10"}).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)

with urllib.request.urlopen(req) as res:
    report = json.load(res)
    print(report["verdict"], report["listedCount"], report["errorCount"])`,
	},
] as const;

type ExampleSlug = (typeof EXAMPLES)[number]["slug"];

export function ApiSection() {
	const [activeSlug, setActiveSlug] = useState<ExampleSlug>("curl");
	const active =
		EXAMPLES.find((item) => item.slug === activeSlug) ?? EXAMPLES[0];

	return (
		<div className="w-full">
			<TabMenuHorizontal.Root
				value={activeSlug}
				onValueChange={(value) => setActiveSlug(value as ExampleSlug)}
			>
				<TabMenuHorizontal.List
					aria-label="Blocklist checker HTTP examples"
					className="gap-1 px-6 sm:px-10 lg:px-12"
				>
					{EXAMPLES.map((example) => (
						<TabMenuHorizontal.Trigger key={example.slug} value={example.slug}>
							{example.name}
						</TabMenuHorizontal.Trigger>
					))}
				</TabMenuHorizontal.List>
			</TabMenuHorizontal.Root>

			<div className="grid grid-cols-1 border-stroke-soft-200 border-b lg:grid-cols-12 dark:border-white/10">
				<aside className="border-stroke-soft-200 border-b bg-transparent lg:col-span-3 lg:border-r lg:border-b-0 dark:border-white/10">
					<div className="flex flex-col gap-4 px-6 py-6 sm:px-10 sm:py-7 lg:sticky lg:top-16 lg:py-8 lg:pr-5 lg:pl-12">
						<h3 className="font-semibold text-base text-text-strong-950 tracking-tight dark:text-white">
							Public HTTP API
						</h3>
						<p className="text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/50">
							No SDK method and no API key. POST an IP or domain name; the
							service queries the same {publicBlocklistCount} public DNS
							blocklists as this page. Rate limited to 60 requests per minute
							per IP.
						</p>
						<LinkButton.Root asChild variant="gray" size="small">
							<Link href="/docs/setup/backend/tools">
								<LinkButton.Icon as={Icon} name="globe" />
								Tools API documentation
							</Link>
						</LinkButton.Root>
					</div>
				</aside>

				<div className="px-6 py-6 sm:px-10 sm:py-7 lg:col-span-9 lg:px-12 lg:py-8">
					<div className="mb-8">
						<h4 className="mb-2.5 font-medium text-[13.5px] text-text-strong-950 dark:text-white">
							1. Send a lookup
						</h4>
						<SdkCodeBlock
							code={active.code}
							lang={active.slug === "curl" ? "bash" : active.slug}
							path={active.fileName}
						/>
					</div>
					<div>
						<h4 className="mb-2.5 font-medium text-[13.5px] text-text-strong-950 dark:text-white">
							2. Inspect the JSON report
						</h4>
						<SdkCodeBlock
							code={apiResponseSample}
							lang="json"
							path="response.json"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
