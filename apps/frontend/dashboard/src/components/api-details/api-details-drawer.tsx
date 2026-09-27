import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import {
	BrandLanguageIcon,
	CopyCodeBlock,
	type CopyCodeBlockIcon,
} from "@reloop/ui/copy-code-block";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import { JAVA_ICON } from "@reloop/ui/icons/java";
import * as Tooltip from "@reloop/ui/tooltip";
import {
	CheckCircle2,
	FileText,
	Folder,
	List,
	Pencil,
	Plus,
	RefreshCw,
	Share2,
	Trash2,
	XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
	siCurl,
	siDotnet,
	siGo,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";
import { useApiLanguage } from "#/hooks/use-api-language";

type PillBox = {
	width: number;
	height: number;
	left: number;
	top: number;
};

const PILL_EASE = [0.23, 1, 0.32, 1] as const;

function hexToRgb(hex: string) {
	const value = hex.replace("#", "");
	return {
		r: Number.parseInt(value.slice(0, 2), 16),
		g: Number.parseInt(value.slice(2, 4), 16),
		b: Number.parseInt(value.slice(4, 6), 16),
	};
}

function hexToRgba(hex: string, alpha: number) {
	const { r, g, b } = hexToRgb(hex);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Darker lip under the pill face — same extrusion as the landing page. */
function darkenHex(hex: string, amount: number) {
	const { r, g, b } = hexToRgb(hex);
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

const langIcons: Record<string, CopyCodeBlockIcon> = {
	nodejs: siNodedotjs,
	javascript: siNodedotjs,
	python: siPython,
	php: siPhp,
	go: siGo,
	ruby: siRuby,
	// Brand hex is #000000 — override so the gear stays visible on dark UI
	rust: { path: siRust.path, hex: "e24d2b" },
	java: JAVA_ICON,
	dotnet: siDotnet,
	curl: siCurl,
};

/** Public origin for API sample URLs — same resolution as auth client. */
function resolveDocBaseUrl(): string {
	const fromEnv = (process.env.NEXT_PUBLIC_URL || "").trim();
	if (fromEnv) return fromEnv.replace(/\/$/, "");
	if (typeof window !== "undefined") return window.location.origin;
	return "";
}

const docBaseUrl = resolveDocBaseUrl();

function getDefaultOpIcon(id: string): React.ReactNode {
	switch (id) {
		case "create":
		case "add":
			return (
				<Plus className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		case "list":
			return (
				<List className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		case "get":
		case "retrieve":
		case "getContacts":
			return (
				<FileText className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		case "update":
		case "updateChannel":
		case "edit":
			return (
				<Pencil className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		case "delete":
		case "deleteGroup":
		case "remove":
			return (
				<Trash2 className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		case "rotate":
			return (
				<RefreshCw className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		case "enable":
			return (
				<CheckCircle2 className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		case "disable":
			return (
				<XCircle className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		case "addChannel":
			return (
				<Share2 className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		case "addGroup":
			return (
				<Folder className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		case "verify":
			return (
				<CheckCircle2 className="size-4 shrink-0 text-text-sub-500 dark:text-white/60" />
			);
		default:
			return undefined;
	}
}

export interface LanguageConfig {
	id: string;
	label: string;
	shikiLang: string;
}

export interface OperationConfig {
	id: string;
	label: string;
	docSlug?: string;
	icon?: React.ReactNode;
}

export interface ApiDetailsDrawerProps {
	title: string;
	icon?: React.ReactNode;
	hotkey?: string;
	languages: readonly LanguageConfig[];
	operations: readonly OperationConfig[];
	codeExamples: Record<
		string,
		Record<string, string | { filename: string; code: string }>
	>;
	docSection: string;
	buttonProps?: React.ComponentPropsWithoutRef<typeof Button.Root>;
	codeExtraPadding?: boolean;
	/** Custom trigger (e.g. full-width card). Defaults to the code icon button. */
	renderTrigger?: (args: {
		isOpen: boolean;
		open: () => void;
	}) => React.ReactNode;
}

export const ApiDetailsDrawer = ({
	title,
	icon,
	hotkey,
	languages,
	operations,
	codeExamples,
	docSection,
	buttonProps = {},
	codeExtraPadding = false,
	renderTrigger,
}: ApiDetailsDrawerProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useApiLanguage<string>(
		languages.map((l) => l.id),
		languages[0]?.id || "javascript",
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

	if (hotkey) {
		useHotkeys(hotkey, (e) => {
			e.preventDefault();
			setIsOpen(true);
		});
	}

	useEffect(() => {
		const handleOpenEvent = (e: Event) => {
			const customEvent = e as CustomEvent<{ docSection?: string }>;
			if (
				!customEvent.detail?.docSection ||
				customEvent.detail.docSection === docSection
			) {
				setIsOpen(true);
			}
		};
		window.addEventListener("api-details:open", handleOpenEvent);
		return () => {
			window.removeEventListener("api-details:open", handleOpenEvent);
		};
	}, [docSection]);

	const brandColorFor = (id: string | undefined) => {
		const hex = id ? langIcons[id]?.hex : undefined;
		return hex ? `#${hex}` : undefined;
	};
	const isHoveringOther =
		hoveredTabIdx !== undefined && hoveredTabIdx !== activeTabIndex;
	const hoverBrandColor = isHoveringOther
		? brandColorFor(languages[hoveredTabIdx ?? -1]?.id)
		: undefined;
	const activeBrandColor = brandColorFor(languages[activeTabIndex]?.id);

	const [activePill, setActivePill] = useState<PillBox | null>(null);
	const [hoverPill, setHoverPill] = useState<PillBox | null>(null);

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
			observer = new ResizeObserver(() => {
				updatePosition();
			});
			observer.observe(container);
		}
		window.addEventListener("resize", updatePosition);

		return () => {
			cancelAnimationFrame(handle);
			if (observer) {
				observer.disconnect();
			}
			window.removeEventListener("resize", updatePosition);
		};
	}, [activeTabIndex, hoveredTabIdx, isHoveringOther, mounted]);

	const {
		variant = "neutral",
		mode = "ghost",
		size = "xxsmall",
		className,
		...rest
	} = buttonProps;

	const currentLanguageConfig = languages.find(
		(l) => l.id === selectedLanguage,
	);

	const getFilename = (lang: string, opId: string) => {
		const ext =
			lang === "nodejs" || lang === "javascript"
				? "js"
				: lang === "python"
					? "py"
					: lang === "php"
						? "php"
						: lang === "go"
							? "go"
							: lang === "ruby"
								? "rb"
								: lang === "rust"
									? "rs"
									: lang === "java"
										? "java"
										: lang === "dotnet"
											? "cs"
											: "sh";

		const snakeOp = opId.replace(
			/[A-Z]/g,
			(letter) => `_${letter.toLowerCase()}`,
		);
		return `${snakeOp}.${ext}`;
	};

	const open = () => setIsOpen(true);

	const defaultTrigger = (
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
						onClick={open}
						{...rest}
					>
						<Icon name="code" className="h-4 w-4" />
					</Button.Root>
				</Tooltip.Trigger>
				<Tooltip.Content className="flex items-center gap-2 rounded-lg">
					<p className="font-medium text-label-sm">{title}</p>
					{hotkey && (
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
							{hotkey}
						</span>
					)}
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	);

	return (
		<Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
			{renderTrigger ? renderTrigger({ isOpen, open }) : defaultTrigger}

			<Drawer.Content className="w-[560px] max-w-[90vw]">
				<div className="sticky top-0 z-30 border-stroke-soft-100/40 border-b bg-bg-white-0">
					<Drawer.Header className="pb-3!">
						<div className="flex flex-1 flex-col gap-1">
							<Drawer.Title className="flex items-center gap-2.5 font-semibold text-2xl">
								{icon}
								<span>{title}</span>
							</Drawer.Title>
						</div>
					</Drawer.Header>

					{/* Language Tabs */}
					<div
						ref={containerRef}
						role="tablist"
						aria-label={`${title} languages`}
						onPointerLeave={() => setHoveredTabIdx(undefined)}
						className="scrollbar-none relative flex min-w-0 items-center gap-1 overflow-x-auto px-4 py-2"
						style={{
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						{languages.map((lang, index) => {
							const icon = langIcons[lang.id];
							const isActive = selectedLanguage === lang.id;
							const showActiveLabel =
								isActive && Boolean(activePill || !mounted);

							return (
								<button
									key={lang.id}
									ref={(el) => {
										tabButtonRefs.current[index] = el;
									}}
									type="button"
									role="tab"
									aria-selected={isActive}
									onClick={() => setSelectedLanguage(lang.id)}
									onPointerEnter={() => setHoveredTabIdx(index)}
									className={cn(
										"relative z-10 inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 font-medium text-xs ease-[cubic-bezier(0.23,1,0.32,1)]",
										!mounted && isActive
											? "bg-text-strong-950 text-white shadow-[0_1.5px_0_0_#1a1a1a,inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:bg-white dark:text-black dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.08),inset_0_0.5px_0_0_rgba(255,255,255,0.28)]"
											: showActiveLabel
												? "text-white"
												: "text-text-sub-600 dark:text-white/60",
										showActiveLabel &&
											!activeBrandColor &&
											"bg-black/[0.04] dark:bg-white/10",
									)}
								>
									{icon && (
										<span className="inline-flex items-center">
											<BrandLanguageIcon
												icon={
													showActiveLabel && !icon.layers
														? { ...icon, hex: "ffffff" }
														: icon
												}
												className="size-3.5 shrink-0"
											/>
										</span>
									)}
									{lang.label}
								</button>
							);
						})}
						<AnimatePresence>
							{hoverPill && hoverBrandColor ? (
								<motion.div
									key="hover-pill"
									className="pointer-events-none absolute top-0 left-0 rounded-full"
									style={{
										backgroundColor: hexToRgba(hoverBrandColor, 0.14),
									}}
									initial={{ ...hoverPill, opacity: 0 }}
									animate={{ ...hoverPill, opacity: 1 }}
									exit={{ ...hoverPill, opacity: 0 }}
									transition={{ duration: 0.16, ease: PILL_EASE }}
								/>
							) : null}
						</AnimatePresence>
						<AnimatePresence>
							{activePill && activeBrandColor ? (
								<motion.div
									key="active-pill"
									className="pointer-events-none absolute top-0 left-0 rounded-full p-px pb-[2px]"
									style={{
										backgroundColor: darkenHex(activeBrandColor, 0.55),
									}}
									initial={{ ...activePill, opacity: 0 }}
									animate={{ ...activePill, opacity: 1 }}
									exit={{ ...activePill, opacity: 0 }}
									transition={{ duration: 0.2, ease: PILL_EASE }}
								>
									<div
										className="size-full rounded-full shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]"
										style={{ backgroundColor: activeBrandColor }}
									/>
								</motion.div>
							) : null}
						</AnimatePresence>
					</div>
				</div>

				<Drawer.Body className="flex flex-col gap-8 pt-6 pb-10">
					<style>{`
						.scrollbar-none::-webkit-scrollbar {
							display: none;
						}
					`}</style>

					{operations.map((op) => {
						const example = codeExamples[selectedLanguage]?.[op.id];
						const code =
							typeof example === "string" ? example : example?.code || "";
						const filename =
							typeof example === "string" || !example?.filename
								? getFilename(selectedLanguage, op.id)
								: example.filename;

						const docSlug = op.docSlug || op.id;

						return (
							<section key={op.id} className="px-6">
								<CopyCodeBlock
									code={code}
									lang={currentLanguageConfig?.shikiLang || "javascript"}
									label={filename}
									title={op.label}
									titleHref={`${docBaseUrl}/docs/api/${docSection}/${docSlug}`}
									noScroll={false}
									codeExtraPadding={codeExtraPadding}
									icon={op.icon || getDefaultOpIcon(op.id)}
								/>
							</section>
						);
					})}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
