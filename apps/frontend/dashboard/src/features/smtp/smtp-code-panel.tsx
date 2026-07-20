import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	siCurl,
	siGo,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";
// Bright-based code card via shared `@reloop/ui` CodeBlock.
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";
import { useApiLanguage } from "#/hooks/use-api-language";
import {
	buildSmtpCodeExamples,
	SMTP_LANGUAGES,
	type SmtpLanguageId,
} from "./smtp-code-examples";

const langIcons: Record<SmtpLanguageId, { path: string; hex: string }> = {
	nodejs: siNodedotjs,
	python: siPython,
	go: siGo,
	php: siPhp,
	ruby: siRuby,
	rust: siRust,
	curl: siCurl,
};

function SmtpLanguagePills({
	value,
	onChange,
}: {
	value: SmtpLanguageId;
	onChange: (lang: SmtpLanguageId) => void;
}) {
	const [hoveredTabIdx, setHoveredTabIdx] = useState<number | undefined>(
		undefined,
	);
	const [mounted, setMounted] = useState(false);
	const [pillPosition, setPillPosition] = useState<{
		width: number;
		height: number;
		left: number;
		top: number;
	} | null>(null);
	const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const activeTabIndex = SMTP_LANGUAGES.findIndex((lang) => lang.id === value);
	const highlightedTabIndex =
		hoveredTabIdx !== undefined ? hoveredTabIdx : activeTabIndex;
	const highlightedBrandColor =
		highlightedTabIndex >= 0
			? `#${langIcons[SMTP_LANGUAGES[highlightedTabIndex]!.id].hex}`
			: undefined;

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

			const pillInset = { x: 6, y: 3 };
			setPillPosition({
				width: button.offsetWidth - pillInset.x * 2,
				height: button.offsetHeight - pillInset.y * 2 - 2,
				left: button.offsetLeft + pillInset.x,
				top: button.offsetTop + pillInset.y,
			});
		};

		const handle = requestAnimationFrame(updatePosition);
		const container = containerRef.current;
		let observer: ResizeObserver | null = null;
		if (container) {
			observer = new ResizeObserver(updatePosition);
			observer.observe(container);
		}

		return () => {
			cancelAnimationFrame(handle);
			observer?.disconnect();
		};
	}, [highlightedTabIndex, mounted, value]);

	return (
		<div
			ref={containerRef}
			className="scrollbar-none relative flex min-w-0 items-center overflow-x-auto"
			style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
		>
			{SMTP_LANGUAGES.map((lang, index) => {
				const isActive = value === lang.id;
				const brandColor = `#${langIcons[lang.id].hex}`;
				const isHighlighted = index === highlightedTabIndex;
				const icon = langIcons[lang.id];

				let textColorStyle: React.CSSProperties | undefined;
				if (isHighlighted && pillPosition) {
					textColorStyle = { color: "#ffffff" };
				} else if (isActive) {
					textColorStyle = { color: brandColor };
				}

				return (
					<button
						key={lang.id}
						ref={(el) => {
							tabButtonRefs.current[index] = el;
						}}
						type="button"
						onClick={() => onChange(lang.id)}
						onPointerEnter={() => setHoveredTabIdx(index)}
						onPointerLeave={() => setHoveredTabIdx(undefined)}
						className={cn(
							"relative z-10 flex shrink-0 items-center gap-2 px-3 py-2 font-medium text-sm transition-colors duration-150",
							isActive
								? "text-text-strong-950 dark:text-white"
								: "text-text-sub-600 dark:text-white/70",
						)}
						style={textColorStyle}
					>
						<svg
							role="img"
							viewBox="0 0 24 24"
							className="size-3.5 shrink-0 transition-colors duration-150"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							style={{
								color: isHighlighted && pillPosition ? "#ffffff" : brandColor,
							}}
							aria-hidden
						>
							<path d={icon.path} />
						</svg>
						{lang.label}
					</button>
				);
			})}
			<AnimatePresence>
				{pillPosition && highlightedTabIndex !== -1 ? (
					<motion.div
						className="pointer-events-none absolute top-0 left-0 rounded-full"
						style={{ backgroundColor: highlightedBrandColor || undefined }}
						initial={{ ...pillPosition, opacity: 0 }}
						animate={{ ...pillPosition, opacity: 1 }}
						exit={{ ...pillPosition, opacity: 0 }}
						transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
					/>
				) : null}
			</AnimatePresence>
		</div>
	);
}

export function SmtpCodePanel({
	apiKeyPlaceholder = "YOUR_API_KEY",
}: {
	apiKeyPlaceholder?: string;
}) {
	const languageIds = useMemo(() => SMTP_LANGUAGES.map((l) => l.id), []);
	const [selectedLanguage, setSelectedLanguage] =
		useApiLanguage<SmtpLanguageId>(languageIds, "nodejs");

	const examples = useMemo(
		() => buildSmtpCodeExamples(apiKeyPlaceholder),
		[apiKeyPlaceholder],
	);

	const active = SMTP_LANGUAGES.find((l) => l.id === selectedLanguage);
	const code = examples[selectedLanguage];
	const icon = langIcons[selectedLanguage];

	return (
		<div className="flex min-w-0 flex-col gap-4">
			<div>
				<p className="font-medium text-label-md text-text-strong-950">
					Send with SMTP
				</p>
				<p className="mt-1 text-paragraph-sm text-text-sub-600">
					Copy a ready-to-run example for your stack. Use your API key as the
					SMTP password.
				</p>
			</div>

			<div>
				<SmtpLanguagePills
					value={selectedLanguage}
					onChange={setSelectedLanguage}
				/>

				<div className="pt-3">
					<CopyCodeBlock
						key={selectedLanguage}
						code={code}
						lang={active?.shikiLang ?? "text"}
						label={active?.filename}
						si={icon}
						codeExtraPadding
						maxHeight="420px"
					/>
				</div>
			</div>
		</div>
	);
}
