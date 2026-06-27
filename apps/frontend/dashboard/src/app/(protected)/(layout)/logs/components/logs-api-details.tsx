"use client";
import { useApiLanguage } from "@fe/dashboard/hooks/use-api-language";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
	siCurl,
	siDotnet,
	siGo,
	siNodedotjs,
	siOpenjdk,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";
import { toast } from "sonner";

const langIcons: Record<string, { path: string; hex: string }> = {
	nodejs: siNodedotjs,
	ruby: siRuby,
	php: siPhp,
	python: siPython,
	go: siGo,
	rust: siRust,
	java: siOpenjdk,
	dotnet: siDotnet,
	curl: siCurl,
};

const codeExamples = {
	nodejs: {
		list: {
			filename: "list_logs.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_xxxxxxxx');

const { data } = await reloop.logs.list({
  page: 1,
  limit: 25,
  service: 'api-gateway'
});`,
		},
		get: {
			filename: "get_log.js",
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop('re_xxxxxxxx');

const { data } = await reloop.logs.get('log_xxxxxxxx');`,
		},
	},
	ruby: {
		list: {
			filename: "list_logs.rb",
			code: `require 'reloop-email'

reloop = Reloop::Client.new('re_xxxxxxxx')

data = reloop.logs.list(
  page:    1,
  limit:   25,
  service: 'api-gateway'
)`,
		},
		get: {
			filename: "get_log.rb",
			code: `require 'reloop-email'

reloop = Reloop::Client.new('re_xxxxxxxx')

data = reloop.logs.get('log_xxxxxxxx')`,
		},
	},
	php: {
		list: {
			filename: "list_logs.php",
			code: `<?php
$reloop = Reloop::client('re_xxxxxxxx');

$reloop->logs->list(
  options: [
    'page' => 1,
    'limit' => 25,
    'service' => 'api-gateway',
  ],
);`,
		},
		get: {
			filename: "get_log.php",
			code: `<?php
$reloop = Reloop::client('re_xxxxxxxx');

$reloop->logs->get('log_xxxxxxxx');`,
		},
	},
	python: {
		list: {
			filename: "list_logs.py",
			code: `from reloop_email import Reloop

reloop = Reloop(api_key='re_xxxxxxxx')

data = reloop.logs.list(
    page=1,
    limit=25,
    service='api-gateway'
)`,
		},
		get: {
			filename: "get_log.py",
			code: `from reloop_email import Reloop

reloop = Reloop(api_key='re_xxxxxxxx')

data = reloop.logs.get('log_xxxxxxxx')`,
		},
	},
	go: {
		list: {
			filename: "list_logs.go",
			code: `package main

import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_xxxxxxxx",
    })

    data, err := reloop.Logs().List(&reloopemail.ListLogsParams{
        Page:    1,
        Limit:   25,
        Service: "api-gateway",
    })
}`,
		},
		get: {
			filename: "get_log.go",
			code: `package main

import reloopemail "github.com/reloop-labs/reloop-email"

func main() {
    reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{
        APIKey: "re_xxxxxxxx",
    })

    result, err := reloop.Logs().Get("log_xxxxxxxx")
}`,
		},
	},
	rust: {
		list: {
			filename: "list_logs.rs",
			code: `use reloop_email::ReloopEmail;

let reloop = ReloopEmail::new("re_xxxxxxxx".to_string(), None);

let data = reloop.logs().list(
    ListLogsParams::builder()
        .page(1)
        .limit(25)
        .service("api-gateway")
        .build(),
).await?;`,
		},
		get: {
			filename: "get_log.rs",
			code: `use reloop_email::ReloopEmail;

let reloop = ReloopEmail::new("re_xxxxxxxx".to_string(), None);

reloop.logs().get("log_xxxxxxxx").await?;`,
		},
	},
	java: {
		list: {
			filename: "ListLogs.java",
			code: `import sh.reloop.email.ReloopEmail;
import sh.reloop.email.models.LogList;

ReloopEmail reloop = ReloopEmail.client("re_xxxxxxxx");

LogList data = reloop.logs().list(
    ListLogsParams.builder()
        .page(1)
        .limit(25)
        .service("api-gateway")
        .build()
);`,
		},
		get: {
			filename: "GetLog.java",
			code: `import sh.reloop.email.ReloopEmail;

ReloopEmail reloop = ReloopEmail.client("re_xxxxxxxx");

reloop.logs().get("log_xxxxxxxx");`,
		},
	},
	dotnet: {
		list: {
			filename: "ListLogs.cs",
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_xxxxxxxx");

var data = await reloop.Logs.ListAsync(new ListLogsParams
{
    Page    = 1,
    Limit   = 25,
    Service = "api-gateway"
});`,
		},
		get: {
			filename: "GetLog.cs",
			code: `using Reloop.Email;

var reloop = ReloopEmail.Client("re_xxxxxxxx");

await reloop.Logs.GetAsync("log_xxxxxxxx");`,
		},
	},
	curl: {
		list: {
			filename: "list_logs.sh",
			code: `curl "https://api.reloop.sh/api/logs/v1/list?page=1&limit=25" \\
  -H "Authorization: Bearer re_xxxxxxxx"`,
		},
		get: {
			filename: "get_log.sh",
			code: `curl https://api.reloop.sh/api/logs/v1/log_xxxxxxxx \\
  -H "Authorization: Bearer re_xxxxxxxx"`,
		},
	},
};

const operations = [
	{ id: "list", label: "List Logs" },
	{ id: "get", label: "Get Log" },
] as const;

const languages = [
	{ id: "nodejs", label: "Node.js", shikiLang: "javascript" },
	{ id: "ruby", label: "Ruby", shikiLang: "ruby" },
	{ id: "php", label: "PHP", shikiLang: "php" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "go", label: "Go", shikiLang: "go" },
	{ id: "rust", label: "Rust", shikiLang: "rust" },
	{ id: "java", label: "Java", shikiLang: "java" },
	{ id: "dotnet", label: ".NET", shikiLang: "csharp" },
	{ id: "curl", label: "cURL", shikiLang: "bash" },
] as const;

type Language = keyof typeof codeExamples;

export const LogsApiDetails = (
	props: React.ComponentPropsWithoutRef<typeof Button.Root>,
) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useApiLanguage<Language>(
		languages.map((l) => l.id),
		"nodejs",
	);

	const [hoveredTabIdx, setHoveredTabIdx] = useState<number | undefined>(
		undefined,
	);
	const [mounted, setMounted] = useState(false);
	const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const isFirstScrollRef = useRef(true);

	useEffect(() => {
		if (isOpen) {
			setMounted(true);
		} else {
			setMounted(false);
		}
	}, [isOpen]);

	const activeTabIndex = languages.findIndex((l) => l.id === selectedLanguage);

	useEffect(() => {
		if (!mounted) return;
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const activeBtn = tabButtonRefs.current[activeTabIndex];
			if (activeBtn && container.clientWidth > 0) {
				const containerLeft = container.scrollLeft;
				const containerWidth = container.clientWidth;
				const containerRight = containerLeft + containerWidth;

				const btnLeft = activeBtn.offsetLeft;
				const btnWidth = activeBtn.offsetWidth;
				const btnRight = btnLeft + btnWidth;

				if (btnLeft < containerLeft || btnRight > containerRight) {
					const targetScrollLeft =
						btnLeft < containerLeft
							? btnLeft - 16
							: btnRight - containerWidth + 16;

					container.scrollTo({
						left: Math.max(0, targetScrollLeft),
						behavior: isFirstScrollRef.current ? "auto" : "smooth",
					});
				}
				isFirstScrollRef.current = false;
			}
		};

		handleScroll();

		const observer = new ResizeObserver(() => {
			handleScroll();
		});
		observer.observe(container);

		return () => {
			observer.disconnect();
		};
	}, [activeTabIndex, mounted]);

	const highlightedTabIndex =
		hoveredTabIdx !== undefined ? hoveredTabIdx : activeTabIndex;
	const highlightedBrandColor =
		highlightedTabIndex >= 0 && languages[highlightedTabIndex]?.id
			? `#${langIcons[languages[highlightedTabIndex].id]?.hex}`
			: undefined;

	const [pillPosition, setPillPosition] = useState<{
		width: number;
		height: number;
		left: number;
		top: number;
	} | null>(null);

	useEffect(() => {
		if (!mounted) {
			setPillPosition(null);
			return;
		}

		const updatePosition = () => {
			const button = tabButtonRefs.current[highlightedTabIndex];
			if (!button) {
				setPillPosition(null);
				return;
			}

			const position = {
				width: button.offsetWidth,
				height: button.offsetHeight,
				left: button.offsetLeft,
				top: button.offsetTop,
			};

			const pillInset = { x: 6, y: 6 };
			setPillPosition({
				width: position.width - pillInset.x * 2,
				height: position.height - pillInset.y * 2 - 2,
				left: position.left + pillInset.x,
				top: position.top + pillInset.y,
			});
		};

		const handle = requestAnimationFrame(updatePosition);

		const container = containerRef.current;
		let observer: ResizeObserver | null = null;
		if (container) {
			observer = new ResizeObserver(() => {
				updatePosition();
			});
			observer.observe(container);
		}

		return () => {
			cancelAnimationFrame(handle);
			if (observer) {
				observer.disconnect();
			}
		};
	}, [highlightedTabIndex, mounted]);

	const highlightedPillPosition = pillPosition;

	useHotkeys("a", (e) => {
		e.preventDefault();
		setIsOpen(true);
	});

	const {
		variant = "neutral",
		mode = "ghost",
		size = "xxsmall",
		className,
		...rest
	} = props;

	// No copy callback needed, managed internally by CopyCodeBlock

	return (
		<Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger asChild>
						<Button.Root
							variant={variant}
							size={size}
							mode={mode}
							className={cn(
								"aspect-square p-0",
								isOpen && "bg-bg-weak-50",
								className,
							)}
							onClick={() => setIsOpen(true)}
							{...rest}
						>
							<Icon name="code" className="h-4 w-4" />
						</Button.Root>
					</Tooltip.Trigger>
					<Tooltip.Content className="flex items-center gap-2 rounded-lg">
						<p className="font-medium text-label-sm">Logs API</p>
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
							A
						</span>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>

			<Drawer.Content className="max-w-[560px]">
				<Drawer.Header
					className="border-stroke-soft-200 border-b"
					showCloseButton={false}
				>
					<div className="flex flex-1 flex-col gap-1">
						<Drawer.Title>Logs API</Drawer.Title>
						<p className="text-paragraph-xs text-text-sub-600">
							Search and retrieve logs programmatically.
						</p>
					</div>
					<Drawer.Close asChild>
						<button
							type="button"
							className="self-start rounded-lg border border-stroke-soft-200 p-1.5 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
							aria-label="Close"
						>
							<Icon name="cross" className="h-4 w-4" />
						</button>
					</Drawer.Close>
				</Drawer.Header>

				<Drawer.Body className="flex flex-col gap-8">
					<style>{`
						.scrollbar-none::-webkit-scrollbar {
							display: none;
						}
					`}</style>

					{/* Language Tabs */}
					<div
						ref={containerRef}
						className="scrollbar-none relative flex min-w-0 items-center overflow-x-auto px-6"
						style={{
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						{languages.map((lang, index) => {
							const icon = langIcons[lang.id];
							const isActive = selectedLanguage === lang.id;
							const brandColor = icon ? `#${icon.hex}` : undefined;
							const isHighlighted = index === highlightedTabIndex;

							let textColorStyle: React.CSSProperties | undefined;
							if (isHighlighted) {
								textColorStyle = { color: "#ffffff" };
							} else if (isActive && brandColor) {
								textColorStyle = { color: brandColor };
							}

							return (
								<button
									key={lang.id}
									ref={(el) => {
										tabButtonRefs.current[index] = el;
									}}
									type="button"
									onClick={() => setSelectedLanguage(lang.id)}
									onPointerEnter={() => setHoveredTabIdx(index)}
									onPointerLeave={() => setHoveredTabIdx(undefined)}
									className={cn(
										"relative z-10 flex shrink-0 items-center gap-2 px-4 py-3 font-medium text-[13px] transition-colors duration-150",
										isActive
											? "text-text-strong-950 dark:text-white"
											: "text-text-sub-600 dark:text-white/70",
									)}
									style={textColorStyle}
								>
									{icon && (
										<svg
											role="img"
											viewBox="0 0 24 24"
											className="size-3.5 shrink-0 transition-colors duration-150"
											fill="currentColor"
											xmlns="http://www.w3.org/2000/svg"
											style={{ color: isHighlighted ? "#ffffff" : brandColor }}
											aria-hidden
										>
											<path d={icon.path} />
										</svg>
									)}
									{lang.label}
								</button>
							);
						})}
						<AnimatePresence>
							{highlightedPillPosition && highlightedTabIndex !== -1 ? (
								<motion.div
									className="pointer-events-none absolute top-0 left-0 rounded-full"
									style={{
										backgroundColor: highlightedBrandColor || undefined,
									}}
									initial={{
										...highlightedPillPosition,
										opacity: 0,
									}}
									animate={{
										...highlightedPillPosition,
										opacity: 1,
									}}
									exit={{
										...highlightedPillPosition,
										opacity: 0,
									}}
									transition={{ duration: 0.14 }}
								/>
							) : null}
						</AnimatePresence>
					</div>

					{operations.map((op) => {
						const example =
							codeExamples[selectedLanguage][
								op.id as keyof (typeof codeExamples)[Language]
							];

						return (
							<section key={op.id} className="px-6">
								<CopyCodeBlock
									code={example?.code || ""}
									lang={
										languages.find((l) => l.id === selectedLanguage)
											?.shikiLang || "javascript"
									}
									label={example?.filename}
									title={op.label}
									titleHref={`https://docs.reloop.sh/api-reference/logs#${op.id}`}
								/>
							</section>
						);
					})}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
