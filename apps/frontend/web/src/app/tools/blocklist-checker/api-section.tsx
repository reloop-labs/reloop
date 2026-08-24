"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { AnimatedHoverBackground } from "@reloop/web/app/sdk/components/animated-hover-background";
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
import { useSidebarHoverBox } from "@reloop/web/app/sdk/components/use-sidebar-hover-box";
import { apiResponseSample } from "./content";

export interface ToolLanguage {
	slug: string;
	name: string;
	packageName: string;
	icon: SimpleIcon;
	installCommand: string;
	frameworks: { slug: string; name: string; icon: SimpleIcon; code: string; installCommand?: string }[];
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
		fileName: "check_blocklist.ts",
		checkCode: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

const report = await reloop.tools.checkBlocklist({
  target: '203.0.113.10',
});

console.log(\`Verdict: \${report.verdict} (Listed: \${report.listedCount}/\${report.totalChecked})\`);
console.log(\`Clean: \${report.cleanCount}, Errors: \${report.errorCount}\`);`,
		frameworks: [
			{
				slug: "nodejs",
				name: "Node.js",
				icon: siNodedotjs,
				code: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

const report = await reloop.tools.checkBlocklist({
  target: '203.0.113.10',
});

console.log(\`Verdict: \${report.verdict} (Listed: \${report.listedCount}/\${report.totalChecked})\`);`,
			},
		],
	},
	{
		slug: "python",
		name: "Python",
		packageName: "reloop-email",
		icon: siPython,
		installCommand: "pip install reloop-email",
		fileName: "check_blocklist.py",
		checkCode: `import os
from reloop import Reloop

client = Reloop(api_key=os.environ["RELOOP_API_KEY"])

report = client.tools.check_blocklist(
    target="203.0.113.10"
)

print(f"Verdict: {report.verdict} (Listed: {report.listed_count}/{report.total_checked})")
print(f"Clean: {report.clean_count}, Errors: {report.error_count}")`,
		frameworks: [
			{
				slug: "python",
				name: "Python",
				icon: siPython,
				code: `import os
from reloop import Reloop

client = Reloop(api_key=os.environ["RELOOP_API_KEY"])

report = client.tools.check_blocklist(
    target="203.0.113.10"
)

print(f"Verdict: {report.verdict} (Listed: {report.listed_count}/{report.total_checked})")`,
			},
		],
	},
	{
		slug: "go",
		name: "Go",
		packageName: "github.com/reloop-labs/reloop-go/v2",
		icon: siGo,
		installCommand: "go get github.com/reloop-labs/reloop-go/v2",
		fileName: "check_blocklist.go",
		checkCode: `package main

import (
	"context"
	"fmt"
	"os"
	"github.com/reloop-labs/reloop-go/v2"
)

func main() {
	client := reloop.NewClient(os.Getenv("RELOOP_API_KEY"))

	res, err := client.Tools.CheckBlocklist(context.Background(), &reloop.BlocklistCheckRequest{
		Target: "203.0.113.10",
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("Verdict: %s (Listed: %d/%d)\\n", res.Verdict, res.ListedCount, res.TotalChecked)
}`,
		frameworks: [
			{
				slug: "go",
				name: "Go",
				icon: siGo,
				code: `package main

import (
	"context"
	"fmt"
	"os"
	"github.com/reloop-labs/reloop-go/v2"
)

func main() {
	client := reloop.NewClient(os.Getenv("RELOOP_API_KEY"))

	res, _ := client.Tools.CheckBlocklist(context.Background(), &reloop.BlocklistCheckRequest{
		Target: "203.0.113.10",
	})

	fmt.Printf("Verdict: %s (Listed: %d/%d)\\n", res.Verdict, res.ListedCount, res.TotalChecked)
}`,
			},
		],
	},
	{
		slug: "rust",
		name: "Rust",
		packageName: "reloop",
		icon: siRust,
		installCommand: "cargo add reloop",
		fileName: "check_blocklist.rs",
		checkCode: `use reloop::{Client, BlocklistCheckRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::from_env()?;

    let report = client.tools().check_blocklist(&BlocklistCheckRequest {
        target: "203.0.113.10".into(),
    }).await?;

    println!("Verdict: {} (Listed: {}/{})", report.verdict, report.listed_count, report.total_checked);
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
		fileName: "check_blocklist.php",
		checkCode: `<?php
use Reloop\\Reloop;

$reloop = new Reloop(getenv('RELOOP_API_KEY'));

$report = $reloop->tools->checkBlocklist([
    'target' => '203.0.113.10',
]);

echo "Verdict: {$report->verdict} (Listed: {$report->listedCount}/{$report->totalChecked})\\n";`,
		frameworks: [],
	},
	{
		slug: "ruby",
		name: "Ruby",
		packageName: "reloop-email",
		icon: siRuby,
		installCommand: "gem install reloop-email",
		fileName: "check_blocklist.rb",
		checkCode: `require 'reloop'

client = Reloop::Client.new(api_key: ENV['RELOOP_API_KEY'])

report = client.tools.check_blocklist(
  target: '203.0.113.10'
)

puts "Verdict: #{report.verdict} (Listed: #{report.listed_count}/#{report.total_checked})"`,
		frameworks: [],
	},
	{
		slug: "elixir",
		name: "Elixir",
		packageName: "reloop",
		icon: siElixir,
		installCommand: "mix deps.get",
		fileName: "check_blocklist.exs",
		checkCode: `report = Reloop.Tools.check_blocklist(%{
  target: "203.0.113.10"
})

IO.puts("Verdict: #{report.verdict} (Listed: #{report.listed_count}/#{report.total_checked})")`,
		frameworks: [],
	},
	{
		slug: "java",
		name: "Java",
		packageName: "sh.reloop:reloop-email",
		icon: siOpenjdk,
		installCommand: "implementation 'sh.reloop:reloop-email:1.0.0'",
		fileName: "CheckBlocklist.java",
		checkCode: `import sh.reloop.Reloop;
import sh.reloop.models.BlocklistCheckRequest;

public class App {
    public static void main(String[] args) {
        var reloop = new Reloop(System.getenv("RELOOP_API_KEY"));

        var report = reloop.tools().checkBlocklist(
            BlocklistCheckRequest.builder()
                .target("203.0.113.10")
                .build()
        );

        System.out.println("Verdict: " + report.getVerdict() + " (Listed: " + report.getListedCount() + ")");
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
		fileName: "CheckBlocklist.cs",
		checkCode: `using Reloop;

var client = new ReloopClient(Environment.GetEnvironmentVariable("RELOOP_API_KEY")!);

var report = await client.Tools.CheckBlocklistAsync(new BlocklistCheckRequest {
    Target = "203.0.113.10"
});

Console.WriteLine("Verdict: " + report.Verdict + " (Listed: " + report.ListedCount + "/" + report.TotalChecked + ")");`,
		frameworks: [],
	},
	{
		slug: "curl",
		name: "cURL",
		packageName: "REST API",
		icon: siCurl,
		installCommand: "curl --version",
		fileName: "check_blocklist.sh",
		checkCode: `curl -X POST https://reloop.sh/api/tools/v1/blocklist-check \\
  -H "Content-Type: application/json" \\
  -d '{
    "target": "203.0.113.10"
  }'`,
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

function darkenHex(hex: string, amount: number) {
	const value = hex.replace("#", "");
	const r = Number.parseInt(value.slice(0, 2), 16);
	const g = Number.parseInt(value.slice(2, 4), 16);
	const b = Number.parseInt(value.slice(4, 6), 16);
	return `rgb(${Math.round(r * amount)}, ${Math.round(g * amount)}, ${Math.round(b * amount)})`;
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

			<div className={`flex min-w-0 flex-1 flex-col gap-2.5 ${isLast ? "" : "pb-6"}`}>
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
	const [hoveredTabIdx, setHoveredTabIdx] = useState<number | undefined>(undefined);
	const [mounted, setMounted] = useState(false);
	const [activePill, setActivePill] = useState<PillBox | null>(null);
	const [hoverPill, setHoverPill] = useState<PillBox | null>(null);
	const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const activeTabIndex = TOOL_LANGUAGES.findIndex((l) => l.slug === activeSlug);
	const isHoveringOther = hoveredTabIdx !== undefined && hoveredTabIdx !== activeTabIndex;
	const hoverBrandColor =
		isHoveringOther && hoveredTabIdx !== undefined
			? `#${TOOL_LANGUAGES[hoveredTabIdx]!.icon.hex}`
			: undefined;

	const active = TOOL_LANGUAGES.find((l) => l.slug === activeSlug) ?? TOOL_LANGUAGES[0]!;
	const brandColor = `#${active.icon.hex}`;

	const [selectedFrameworkSlug, setSelectedFrameworkSlug] = useState<string | null>(null);
	const [hoveredFwEl, setHoveredFwEl] = useState<HTMLElement | undefined>(undefined);
	const [activeFwEl, setActiveFwEl] = useState<HTMLElement | undefined>(undefined);
	const [fwContainerEl, setFwContainerEl] = useState<HTMLDivElement | null>(null);
	const fwRefs = useRef<(HTMLElement | null)[]>([]);

	useEffect(() => {
		setSelectedFrameworkSlug(null);
		setHoveredFwEl(undefined);
	}, [activeSlug]);

	const activeFramework = selectedFrameworkSlug
		? (active.frameworks.find((fw) => fw.slug === selectedFrameworkSlug) ?? null)
		: null;

	const isLanguageSelected = activeFramework === null;

	useLayoutEffect(() => {
		if (!fwContainerEl) {
			setActiveFwEl(undefined);
			return;
		}
		const selected = fwContainerEl.querySelector<HTMLElement>(
			'[role="tab"][aria-selected="true"]',
		);
		setActiveFwEl(selected ?? undefined);
	}, [fwContainerEl, selectedFrameworkSlug, activeSlug]);

	const isHoveringOtherFw = Boolean(hoveredFwEl && activeFwEl && hoveredFwEl !== activeFwEl);

	const fwActiveBox = useSidebarHoverBox(
		activeFwEl,
		fwContainerEl,
		`${active.slug}:${activeFramework?.slug}`,
	);
	const fwHoverBox = useSidebarHoverBox(
		isHoveringOtherFw ? hoveredFwEl : undefined,
		fwContainerEl,
		`${active.slug}:hover:${activeFramework?.slug}`,
	);

	const installCode =
		active.slug === "nodejs"
			? nodeInstallCommands[pkgManager]
			: active.installCommand;

	const sendCode = activeFramework ? activeFramework.code : active.checkCode;

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
			<div className="border-stroke-soft-200 border-b dark:border-white/10">
				<div
					ref={containerRef}
					role="tablist"
					aria-label="Blocklist checker SDK languages"
					onPointerLeave={() => setHoveredTabIdx(undefined)}
					className="scrollbar-none relative flex gap-1 overflow-x-auto px-6 py-3 sm:px-10 sm:py-3.5 lg:px-12"
					style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
				>
					{TOOL_LANGUAGES.map((lang, index) => {
						const isActive = lang.slug === activeSlug;
						const langBrandColor = `#${lang.icon.hex}`;
						const showActiveLabel = isActive && Boolean(activePill || !mounted);
						const isTabLangDark = isDarkBrandColor(lang.icon.hex);

						return (
							<button
								key={lang.slug}
								ref={(el) => {
									tabButtonRefs.current[index] = el;
								}}
								type="button"
								role="tab"
								aria-selected={isActive}
								id={`blocklist-tab-${lang.slug}`}
								onClick={() => setActiveSlug(lang.slug)}
								onPointerEnter={() => setHoveredTabIdx(index)}
								className={cn(
									"relative z-10 inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 font-medium text-xs transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
									!mounted && isActive
										? "bg-text-strong-950 text-white shadow-[0_1.5px_0_0_#1a1a1a,inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-white dark:text-black dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.08),inset_0_0.5px_0_0_rgba(255,255,255,0.28)]"
										: showActiveLabel
											? "text-white"
											: "text-text-sub-600 dark:text-white/60",
								)}
							>
								<span
									className={cn(
										"inline-flex items-center",
										!showActiveLabel && isTabLangDark && "text-text-strong-950 dark:text-white",
									)}
									style={{
										color: showActiveLabel
											? "#ffffff"
											: isTabLangDark
												? undefined
												: langBrandColor,
									}}
								>
									<LanguageIcon icon={lang.icon} className="size-3.5" />
								</span>
								{lang.name}
							</button>
						);
					})}

					<AnimatePresence>
						{hoverPill && hoverBrandColor ? (
							<motion.div
								key="hover-pill"
								className="pointer-events-none absolute top-0 left-0 rounded-full"
								style={{ backgroundColor: hexToRgba(hoverBrandColor, 0.14) }}
								initial={{ ...hoverPill, opacity: 0 }}
								animate={{ ...hoverPill, opacity: 1 }}
								exit={{ ...hoverPill, opacity: 0 }}
								transition={{ duration: 0.16, ease: PILL_EASE }}
							/>
						) : null}
					</AnimatePresence>

					<AnimatePresence>
						{activePill ? (
							<motion.div
								key="active-pill"
								className="pointer-events-none absolute top-0 left-0 rounded-full p-px pb-[2px]"
								style={{ backgroundColor: darkenHex(brandColor, 0.55) }}
								initial={{ ...activePill, opacity: 0 }}
								animate={{ ...activePill, opacity: 1 }}
								exit={{ ...activePill, opacity: 0 }}
								transition={{ duration: 0.2, ease: PILL_EASE }}
							>
								<div
									className="size-full rounded-full shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]"
									style={{ backgroundColor: brandColor }}
								/>
							</motion.div>
						) : null}
					</AnimatePresence>
				</div>
			</div>

			{/* Content: left meta + right code steps */}
			<div className="grid grid-cols-1 lg:grid-cols-12 border-b border-stroke-soft-200 dark:border-white/10">
				{/* Left meta & frameworks rail */}
				<aside className="border-stroke-soft-200 border-b bg-transparent lg:col-span-3 lg:border-r lg:border-b-0 dark:border-white/10">
					<div className="flex flex-col gap-4 px-6 py-6 sm:px-10 sm:py-7 lg:sticky lg:top-16 lg:py-8 lg:pr-5 lg:pl-12">
						<div className="flex items-center gap-3">
							<div
								className={cn(
									"inline-flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black",
									isDarkBrandColor(active.icon.hex) && "text-text-strong-950 dark:text-white",
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

						{/* Frameworks / SDK selector */}
						<div className="-ml-2.5 mt-3 flex flex-col">
							<div className="px-2.5 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em] dark:text-white/45">
								{active.frameworks.length > 0 ? "Frameworks" : "Integration"}
							</div>
							<div
								ref={setFwContainerEl}
								role="tablist"
								aria-label={`${active.name} options`}
								className="relative flex w-full flex-col"
								onPointerLeave={() => setHoveredFwEl(undefined)}
							>
								<button
									ref={(el) => {
										if (el) fwRefs.current[0] = el;
									}}
									type="button"
									role="tab"
									aria-selected={isLanguageSelected}
									onPointerEnter={() => setHoveredFwEl(fwRefs.current[0] ?? undefined)}
									onClick={() => setSelectedFrameworkSlug(null)}
									className="group relative z-10 flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors"
								>
									<span
										className={cn(
											"flex size-4 shrink-0 items-center justify-center",
											isDarkBrandColor(active.icon.hex) && "text-text-strong-950 dark:text-white",
										)}
										style={getBrandColorStyle(active.icon.hex)}
									>
										<LanguageIcon icon={active.icon} className="size-3.5" />
									</span>
									<span
										className={cn(
											"truncate font-medium text-[13px] transition-colors",
											isLanguageSelected
												? "text-text-strong-950 dark:text-white"
												: "text-text-sub-600 group-hover:text-text-strong-950 dark:text-white/60 dark:group-hover:text-white",
										)}
									>
										{active.name} SDK
									</span>
								</button>

								<AnimatedHoverBackground box={fwHoverBox ?? fwActiveBox} />
							</div>
						</div>

						{/* Prerequisites */}
						<div className="mt-4 border-t border-stroke-soft-200/60 pt-4 dark:border-white/10">
							<span className="block font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em] dark:text-white/45">
								Prerequisites
							</span>
							<ul className="mt-2.5 space-y-2 text-[12.5px]">
								<li>
									<a
										href="/docs/learn/api-keys"
										className="group flex items-center gap-2 text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
									>
										<Icon name="key" className="size-3.5 text-text-soft-400 dark:text-white/40" />
										<span>Get an API key</span>
									</a>
								</li>
								<li>
									<a
										href="/docs/setup/backend/tools"
										className="group flex items-center gap-2 text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
									>
										<Icon name="globe-02" className="size-3.5 text-text-soft-400 dark:text-white/40" />
										<span>API documentation</span>
									</a>
								</li>
							</ul>
						</div>
					</div>
				</aside>

				{/* Right: Installation & Code Sample Steps */}
				<div className="px-6 py-6 sm:px-10 sm:py-7 lg:col-span-9 lg:px-12 lg:py-8">
					<StepItem
						number={1}
						title={`Install the ${active.name} package`}
					>
						{active.slug === "nodejs" ? (
							<SdkCodeBlock
								code={installCode}
								slug={active.slug}
								tabs={NODE_PKG_TABS}
								activeTab={pkgManager}
								onTabChange={(tab: string) => setPkgManager(tab as PackageManager)}
							/>
						) : (
							<SdkCodeBlock
								code={installCode}
								slug={active.slug}
								lang="bash"
							/>
						)}
					</StepItem>

					<StepItem
						number={2}
						title={`Check DNS blocklists with ${active.name}`}
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
						title="Inspect JSON blocklist report (200 OK)"
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
