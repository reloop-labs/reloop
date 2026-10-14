"use client";

import type { EmailTemplateExample } from "@reloop/email-templates";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";

/** Width the email is laid out at before it is scaled into the card. */
const EMAIL_RENDER_WIDTH = 600;

/**
 * For single-brand sets: show only the white email card, dropping the
 * email's gray page and the padding around it so every side has the same inset.
 */
export const CARD_ONLY_PREVIEW_CSS =
	"<style>body,body>table{background:#ffffff!important}body>table>tbody>tr>td{padding:0!important}</style>";

const previewFrameClassName =
	"pointer-events-none relative aspect-[5/4] w-full select-none overflow-hidden rounded-[18px] bg-white ring-1 ring-stroke-soft-100 dark:ring-white/10";

/** Marketing previews read better with sample values than `{{{otp_code}}}`. */
export function withSampleValues(
	template: EmailTemplateExample,
): EmailTemplateExample {
	return {
		...template,
		html: (origin) =>
			template.variables.reduce(
				(html, variable) =>
					variable.defaultValue === null
						? html
						: html.replaceAll(`{{{${variable.name}}}}`, variable.defaultValue),
				template.html(origin),
			),
	};
}

/**
 * Scaled, non-interactive render of a template. `previewCss` is injected
 * into the email's <head>, e.g. to drop its page background.
 */
export function EmailPreview({
	template,
	previewCss,
	className,
}: {
	template: EmailTemplateExample;
	previewCss?: string;
	className?: string;
}) {
	const frameRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0);
	const [srcDoc, setSrcDoc] = useState<string | null>(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const html = template.html(window.location.origin);
		setSrcDoc(
			previewCss ? html.replace("</head>", `${previewCss}</head>`) : html,
		);
	}, [template, previewCss]);

	useEffect(() => {
		const frame = frameRef.current;
		if (!frame) return;
		const observer = new ResizeObserver(([entry]) => {
			if (entry) setScale(entry.contentRect.width / EMAIL_RENDER_WIDTH);
		});
		observer.observe(frame);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={frameRef} className={cn(previewFrameClassName, className)}>
			{srcDoc && scale > 0 ? (
				<iframe
					title={`Preview of ${template.name}`}
					srcDoc={srcDoc}
					sandbox=""
					tabIndex={-1}
					aria-hidden
					scrolling="no"
					onLoad={() => setLoaded(true)}
					className={cn(
						"absolute top-0 left-0 origin-top-left border-0 bg-white transition-opacity duration-300",
						loaded ? "opacity-100" : "opacity-0",
					)}
					style={{
						width: EMAIL_RENDER_WIDTH,
						height: `${100 / scale}%`,
						transform: `scale(${scale})`,
					}}
				/>
			) : null}
		</div>
	);
}

/** Preview slot for the blank template: an empty email with a plus. */
export function BlankPreview() {
	return (
		<div
			className={cn(
				previewFrameClassName,
				"flex flex-col items-center justify-center gap-3 dark:bg-black",
			)}
		>
			<span className="flex size-10 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors duration-200 group-hover/card:text-text-strong-950 dark:border-white/10 dark:text-white/60 dark:group-hover/card:text-white">
				<Icon name="plus" className="size-5" />
			</span>
			<span className="text-[13px] text-text-sub-600 dark:text-white/60">
				Start from scratch
			</span>
		</div>
	);
}

/** Grey tile with a preview on top and a title that reveals an arrow on hover. */
export function TemplateCard({
	href,
	title,
	ariaLabel,
	preview,
}: {
	href: string;
	title: string;
	ariaLabel: string;
	preview: ReactNode;
}) {
	return (
		<Link
			href={href}
			aria-label={ariaLabel}
			className={cn(
				"group/card flex flex-col gap-2 rounded-t-[24px] rounded-b-[20px] bg-bg-weak-50 p-1.5 dark:bg-white/[0.03]",
				"transition-colors duration-200 ease-out",
				"hover:bg-bg-soft-200 dark:hover:bg-white/[0.07]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-sub-300",
				"motion-reduce:transition-none",
			)}
		>
			{preview}
			<div className="flex flex-col gap-1 px-3 pt-1 pb-2.5">
				<div className="flex items-center justify-between gap-2">
					<h3 className="font-medium text-[16px] text-text-strong-950 dark:text-white">
						{title}
					</h3>
					<Icon
						name="arrow-up-right"
						aria-hidden
						className="-translate-x-1 size-4 shrink-0 text-text-sub-600 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover/card:translate-x-0 group-hover/card:opacity-100 group-focus-visible/card:translate-x-0 group-focus-visible/card:opacity-100 motion-reduce:transition-none dark:text-white/60"
					/>
				</div>
			</div>
		</Link>
	);
}

/** Card grid that shows `initialVisible` cards, then a Show more toggle. */
export function ShowMoreGrid({
	id,
	initialVisible = 12,
	children,
}: {
	id: string;
	initialVisible?: number;
	children: ReactNode[];
}) {
	const [showAll, setShowAll] = useState(false);
	const toggleRef = useRef<HTMLDivElement>(null);
	const hiddenCount = children.length - initialVisible;

	const toggleShowAll = () => {
		const collapsing = showAll;
		setShowAll(!collapsing);
		if (!collapsing) return;
		// Collapsing removes rows above the button; keep it under the pointer
		// instead of leaving the reader deep in the next section.
		requestAnimationFrame(() => {
			const reduceMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			toggleRef.current?.scrollIntoView({
				block: "center",
				behavior: reduceMotion ? "auto" : "smooth",
			});
		});
	};

	return (
		<>
			<div
				id={id}
				className="grid grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 sm:gap-12 sm:px-8 sm:py-12 lg:grid-cols-3 lg:px-12"
			>
				{showAll ? children : children.slice(0, initialVisible)}
			</div>
			{hiddenCount > 0 && (
				<div
					ref={toggleRef}
					className="flex justify-center px-4 pb-12 sm:px-8 lg:px-12"
				>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						aria-controls={id}
						aria-expanded={showAll}
						onClick={toggleShowAll}
					>
						{showAll ? "Show less" : "Show more"}
						<Icon
							name="chevron-down"
							aria-hidden
							className={cn(
								"size-3.5 transition-transform duration-200 ease-out motion-reduce:transition-none",
								showAll && "rotate-180",
							)}
						/>
					</Button.Root>
				</div>
			)}
		</>
	);
}
