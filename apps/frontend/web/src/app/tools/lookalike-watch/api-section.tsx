"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "@reloop/web/app/sdk/components/language-icon";
import {
	NODE_PKG_TABS,
	nodeInstallCommands,
	type PackageManager,
} from "@reloop/web/app/sdk/components/node-install-block";
import { SdkCodeBlock } from "@reloop/web/app/sdk/components/sdk-code-block";
import { motion } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { SimpleIcon } from "simple-icons";
import {
	siCurl,
	siDotnet,
	siElixir,
	siGo,
	siNodedotjs,
	siOpenjdk,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";
import { apiResponseSample } from "./content";

export interface ToolLanguage {
	slug: string;
	name: string;
	packageName: string;
	icon: SimpleIcon;
	installCommand: string;
	frameworks: {
		slug: string;
		name: string;
		icon: SimpleIcon;
		code: string;
		installCommand?: string;
	}[];
	checkCode: string;
	fileName: string;
}

const TOOL_LANGUAGES: ToolLanguage[] = [
	{
		slug: "nodejs",
		name: "Node.js",
		packageName: "reloop-email",
		icon: siNodedotjs,
		installCommand: "npm install reloop-email",
		fileName: "check_lookalikes.ts",
		checkCode: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

const report = await reloop.tools.lookalikeWatch({
  domain: 'stripe.com',
});

console.log(\`Verdict: \${report.verdict}\`);
console.log(\`Detected \${report.hits.length} active lookalike domains\`);
for (const hit of report.hits) {
  console.log(\`- \${hit.name} (Mail Capable: \${hit.mailCapable})\`);
}`,
		frameworks: [],
	},
	{
		slug: "python",
		name: "Python",
		packageName: "reloop-email",
		icon: siPython,
		installCommand: "pip install reloop-email",
		fileName: "check_lookalikes.py",
		checkCode: `import os
from reloop import Reloop

client = Reloop(api_key=os.environ["RELOOP_API_KEY"])

report = client.tools.lookalike_watch(domain="stripe.com")

print(f"Verdict: {report.verdict}")
print(f"Scanned {report.scanned} permutations, found {len(report.hits)} active twins:")
for hit in report.hits:
    print(f"- {hit.name} [mail_ready={hit.mail_capable}]")`,
		frameworks: [],
	},
	{
		slug: "go",
		name: "Go",
		packageName: "github.com/reloop-labs/reloop-go/v2",
		icon: siGo,
		installCommand: "go get github.com/reloop-labs/reloop-go/v2",
		fileName: "check_lookalikes.go",
		checkCode: `package main

import (
	"context"
	"fmt"
	"os"
	"github.com/reloop-labs/reloop-go/v2"
)

func main() {
	client := reloop.NewClient(os.Getenv("RELOOP_API_KEY"))

	report, err := client.Tools.LookalikeWatch(context.Background(), &reloop.LookalikeWatchRequest{
		Domain: "stripe.com",
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("Headline: %s\\n", report.Headline)
	fmt.Printf("Active Twins: %d\\n", len(report.Hits))
}`,
		frameworks: [],
	},
	{
		slug: "rust",
		name: "Rust",
		packageName: "reloop",
		icon: siRust,
		installCommand: "cargo add reloop",
		fileName: "check_lookalikes.rs",
		checkCode: `use reloop::{Client, LookalikeWatchRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::from_env()?;

    let report = client.tools().lookalike_watch(&LookalikeWatchRequest {
        domain: "stripe.com".into(),
    }).await?;

    println!("Verdict: {}", report.verdict);
    println!("Hits: {:?}", report.hits);
    Ok(())
}`,
		frameworks: [],
	},
	{
		slug: "php",
		name: "PHP",
		packageName: "reloop/reloop-email",
		icon: siPhp,
		installCommand: "composer require reloop/reloop-email",
		fileName: "check_lookalikes.php",
		checkCode: `<?php
use Reloop\\Reloop;

$reloop = new Reloop(getenv('RELOOP_API_KEY'));

$report = $reloop->tools->lookalikeWatch([
    'domain' => 'stripe.com',
]);

echo "Verdict: " . $report->verdict . "\\n";
echo "Active Hits: " . count($report->hits) . "\\n";`,
		frameworks: [],
	},
	{
		slug: "ruby",
		name: "Ruby",
		packageName: "reloop-email",
		icon: siRuby,
		installCommand: "gem install reloop-email",
		fileName: "check_lookalikes.rb",
		checkCode: `require 'reloop'

client = Reloop::Client.new(api_key: ENV['RELOOP_API_KEY'])

report = client.tools.lookalike_watch(domain: 'stripe.com')

puts "Verdict: #{report.verdict}"
puts "Hits: #{report.hits.length}"`,
		frameworks: [],
	},
	{
		slug: "elixir",
		name: "Elixir",
		packageName: "reloop",
		icon: siElixir,
		installCommand: "mix deps.get",
		fileName: "check_lookalikes.exs",
		checkCode: `report = Reloop.Tools.lookalike_watch(%{domain: "stripe.com"})

IO.puts("Verdict: #{report.verdict}")
IO.puts("Hits count: #{length(report.hits)}")`,
		frameworks: [],
	},
	{
		slug: "java",
		name: "Java",
		packageName: "sh.reloop:reloop-email",
		icon: siOpenjdk,
		installCommand: "implementation 'sh.reloop:reloop-email:1.0.0'",
		fileName: "CheckLookalikes.java",
		checkCode: `import sh.reloop.Reloop;
import sh.reloop.models.LookalikeWatchRequest;

public class App {
    public static void main(String[] args) {
        var reloop = new Reloop(System.getenv("RELOOP_API_KEY"));

        var report = reloop.tools().lookalikeWatch(
            LookalikeWatchRequest.builder().domain("stripe.com").build()
        );

        System.out.println("Verdict: " + report.getVerdict());
        System.out.println("Hits: " + report.getHits().size());
    }
}`,
		frameworks: [],
	},
	{
		slug: "dotnet",
		name: ".NET",
		packageName: "Reloop.Email",
		icon: siDotnet,
		installCommand: "dotnet add package Reloop.Email",
		fileName: "CheckLookalikes.cs",
		checkCode: `using Reloop;

var client = new ReloopClient(Environment.GetEnvironmentVariable("RELOOP_API_KEY")!);

var report = await client.Tools.LookalikeWatchAsync(new LookalikeWatchRequest {
    Domain = "stripe.com"
});

Console.WriteLine($"Verdict: {report.Verdict}");
Console.WriteLine($"Hits: {report.Hits.Count}");`,
		frameworks: [],
	},
	{
		slug: "curl",
		name: "cURL",
		packageName: "REST API",
		icon: siCurl,
		installCommand: "curl --version",
		fileName: "check_lookalikes.sh",
		checkCode: `curl -X POST https://reloop.sh/api/tools/v1/lookalike-watch \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "stripe.com"}'`,
		frameworks: [],
	},
];

type PillBox = {
	width: number;
	height: number;
	left: number;
	top: number;
};

const PILL_EASE = [0.23, 1, 0.32, 1] as const;

function hexToRgba(hex: string, alpha: number) {
	const value = hex.replace("#", "");
	const r = Number.parseInt(value.slice(0, 2), 16);
	const g = Number.parseInt(value.slice(2, 4), 16);
	const b = Number.parseInt(value.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function measureTab(button: HTMLButtonElement | null): PillBox | null {
	if (!button) return null;
	return {
		width: button.offsetWidth,
		height: button.offsetHeight,
		left: button.offsetLeft,
		top: button.offsetTop,
	};
}

function StepItem({
	number,
	title,
	isLast = false,
	children,
}: {
	number: number;
	title: string;
	isLast?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="flex gap-3.5">
			<div className="flex flex-col items-center">
				<div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 font-mono font-semibold text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75">
					{number}
				</div>
				{!isLast && (
					<div className="my-1.5 w-px flex-1 bg-stroke-soft-200 dark:bg-white/10" />
				)}
			</div>

			<div
				className={`flex min-w-0 flex-1 flex-col gap-2.5 ${isLast ? "" : "pb-6"}`}
			>
				<h4 className="mt-0.5 font-medium text-[13.5px] text-text-strong-950 dark:text-white">
					{title}
				</h4>
				<div className="w-full min-w-0">{children}</div>
			</div>
		</div>
	);
}

export function ApiSection() {
	const [activeSlug, setActiveSlug] = useState("nodejs");
	const [pkgManager, setPkgManager] = useState<PackageManager>("npm");
	const [hoveredTabIdx, setHoveredTabIdx] = useState<number | undefined>(
		undefined,
	);
	const [mounted, setMounted] = useState(false);
	const [activePill, setActivePill] = useState<PillBox | null>(null);
	const [hoverPill, setHoverPill] = useState<PillBox | null>(null);
	const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const activeTabIndex = TOOL_LANGUAGES.findIndex((l) => l.slug === activeSlug);
	const isHoveringOther =
		hoveredTabIdx !== undefined && hoveredTabIdx !== activeTabIndex;
	const hoverBrandColor =
		isHoveringOther && hoveredTabIdx !== undefined
			? `#${TOOL_LANGUAGES[hoveredTabIdx]!.icon.hex}`
			: undefined;

	const active =
		TOOL_LANGUAGES.find((l) => l.slug === activeSlug) ?? TOOL_LANGUAGES[0]!;
	const brandColor = `#${active.icon.hex}`;

	const installCode =
		active.slug === "nodejs"
			? nodeInstallCommands[pkgManager]
			: active.installCommand;

	const sendCode = active.checkCode;

	useEffect(() => {
		if (!mounted) {
			setActivePill(null);
			setHoverPill(null);
			return;
		}

		const updatePosition = () => {
			setActivePill(measureTab(tabButtonRefs.current[activeTabIndex] ?? null));
			setHoverPill(
				isHoveringOther && hoveredTabIdx !== undefined
					? measureTab(tabButtonRefs.current[hoveredTabIdx] ?? null)
					: null,
			);
		};

		const handle = requestAnimationFrame(updatePosition);
		const container = containerRef.current;
		let observer: ResizeObserver | null = null;
		if (container) {
			observer = new ResizeObserver(updatePosition);
			observer.observe(container);
		}
		window.addEventListener("resize", updatePosition);

		return () => {
			cancelAnimationFrame(handle);
			observer?.disconnect();
			window.removeEventListener("resize", updatePosition);
		};
	}, [activeTabIndex, hoveredTabIdx, isHoveringOther, mounted, activeSlug]);

	return (
		<div className="w-full">
			{/* Language tabs */}
			<div
				ref={containerRef}
				className="relative flex items-center gap-1 overflow-x-auto border-stroke-soft-200 border-b px-5 py-3 sm:px-6 md:px-8 dark:border-white/10"
			>
				{mounted && activePill && (
					<motion.div
						className="pointer-events-none absolute z-0 rounded-full"
						initial={false}
						animate={{
							width: activePill.width,
							height: activePill.height,
							left: activePill.left,
							top: activePill.top,
						}}
						transition={{
							type: "spring",
							stiffness: 380,
							damping: 30,
						}}
					>
						<span
							className="block size-full rounded-full border"
							style={{
								backgroundColor: hexToRgba(brandColor, 0.12),
								borderColor: hexToRgba(brandColor, 0.35),
							}}
						/>
					</motion.div>
				)}

				{mounted && hoverPill && hoverBrandColor && (
					<motion.div
						className="pointer-events-none absolute z-0 rounded-full"
						initial={{ opacity: 0 }}
						animate={{
							opacity: 1,
							width: hoverPill.width,
							height: hoverPill.height,
							left: hoverPill.left,
							top: hoverPill.top,
						}}
						exit={{ opacity: 0 }}
						transition={{
							duration: 0.15,
							ease: PILL_EASE,
						}}
					>
						<span
							className="block size-full rounded-full"
							style={{
								backgroundColor: hexToRgba(hoverBrandColor, 0.07),
							}}
						/>
					</motion.div>
				)}

				{TOOL_LANGUAGES.map((lang, index) => {
					const isActive = lang.slug === activeSlug;
					return (
						<button
							key={lang.slug}
							ref={(el) => {
								tabButtonRefs.current[index] = el;
							}}
							type="button"
							onClick={() => setActiveSlug(lang.slug)}
							onMouseEnter={() => setHoveredTabIdx(index)}
							onMouseLeave={() => setHoveredTabIdx(undefined)}
							className={cn(
								"relative z-10 flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[12px] transition-colors",
								isActive
									? "font-medium text-text-strong-950 dark:text-white"
									: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/45 dark:hover:text-white",
							)}
						>
							<span
								className={cn(
									"flex size-4 shrink-0 items-center justify-center transition-colors",
									isDarkBrandColor(lang.icon.hex) &&
										"text-text-strong-950 dark:text-white",
								)}
								style={getBrandColorStyle(lang.icon.hex)}
							>
								<LanguageIcon icon={lang.icon} className="size-3.5" />
							</span>
							<span>{lang.name}</span>
						</button>
					);
				})}
			</div>

			{/* Content */}
			<div className="grid grid-cols-1 border-stroke-soft-200 border-b lg:grid-cols-12 dark:border-white/10">
				{/* Left meta rail */}
				<aside className="border-stroke-soft-200 border-b bg-transparent lg:col-span-3 lg:border-r lg:border-b-0 dark:border-white/10">
					<div className="flex flex-col gap-4 px-6 py-6 sm:px-10 sm:py-7 lg:sticky lg:top-16 lg:py-8 lg:pr-5 lg:pl-12">
						<div className="flex items-center gap-3">
							<div
								className={cn(
									"inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black",
									isDarkBrandColor(active.icon.hex) &&
										"text-text-strong-950 dark:text-white",
								)}
								style={getBrandColorStyle(active.icon.hex)}
							>
								<LanguageIcon icon={active.icon} className="size-4.5" />
							</div>
							<div className="min-w-0">
								<h3 className="font-semibold text-base text-text-strong-950 tracking-tight dark:text-white">
									{active.name}
								</h3>
								<p className="truncate font-mono text-[11px] text-text-sub-600 dark:text-white/45">
									{active.packageName}
								</p>
							</div>
						</div>

						<div className="mt-4 border-stroke-soft-200/60 border-t pt-4 dark:border-white/10">
							<span className="block font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em] dark:text-white/45">
								Prerequisites
							</span>
							<ul className="mt-2.5 space-y-2 text-[12.5px]">
								<li>
									<a
										href="/docs/learn/api-keys"
										className="group flex items-center gap-2 text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
									>
										<Icon
											name="key"
											className="size-3.5 text-text-soft-400 dark:text-white/40"
										/>
										<span>Get an API key</span>
									</a>
								</li>
								<li>
									<a
										href="/docs/setup/backend/tools"
										className="group flex items-center gap-2 text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
									>
										<Icon
											name="globe-02"
											className="size-3.5 text-text-soft-400 dark:text-white/40"
										/>
										<span>API documentation</span>
									</a>
								</li>
							</ul>
						</div>
					</div>
				</aside>

				{/* Right: Steps */}
				<div className="px-6 py-6 sm:px-10 sm:py-7 lg:col-span-9 lg:px-12 lg:py-8">
					<StepItem number={1} title={`Install the ${active.name} package`}>
						{active.slug === "nodejs" ? (
							<SdkCodeBlock
								code={installCode}
								slug={active.slug}
								tabs={NODE_PKG_TABS}
								activeTab={pkgManager}
								onTabChange={(tab: string) =>
									setPkgManager(tab as PackageManager)
								}
							/>
						) : (
							<SdkCodeBlock code={installCode} slug={active.slug} lang="bash" />
						)}
					</StepItem>

					<StepItem
						number={2}
						title={`Scan lookalike permutations with ${active.name}`}
						isLast={false}
					>
						<SdkCodeBlock
							code={sendCode}
							slug={active.slug}
							path={active.fileName}
						/>
					</StepItem>

					<StepItem
						number={3}
						title="Inspect JSON lookalike scan report (200 OK)"
						isLast={true}
					>
						<SdkCodeBlock
							code={apiResponseSample}
							slug="json"
							path="response.json"
						/>
					</StepItem>
				</div>
			</div>
		</div>
	);
}
