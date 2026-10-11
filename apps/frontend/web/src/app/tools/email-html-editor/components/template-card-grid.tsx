"use client";

import { cn } from "@reloop/ui/cn";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toolPath } from "../content";
import { type EmailTemplateExample, emailTemplateExamples } from "../templates";

/** Width the email is laid out at before it is scaled into the card. */
const EMAIL_RENDER_WIDTH = 600;

/** Soft inset so the email sits in a padded stage, like the dashboard grid. */
const PAPER_INSET = 16;

const previewCardClassName =
	"relative aspect-[5/4] w-full overflow-hidden rounded-[28px] border border-stroke-soft-100 bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]";

function TemplatePreview({ template }: { template: EmailTemplateExample }) {
	const paperRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0);
	const [srcDoc, setSrcDoc] = useState<string | null>(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setSrcDoc(template.html(window.location.origin));
	}, [template]);

	useEffect(() => {
		const paper = paperRef.current;
		if (!paper) return;
		const observer = new ResizeObserver(([entry]) => {
			if (entry) setScale(entry.contentRect.width / EMAIL_RENDER_WIDTH);
		});
		observer.observe(paper);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			className="pointer-events-none absolute inset-0 select-none overflow-hidden"
			style={{
				paddingTop: PAPER_INSET,
				paddingRight: PAPER_INSET,
				paddingLeft: PAPER_INSET,
			}}
		>
			<div
				ref={paperRef}
				className="relative h-full w-full overflow-hidden rounded-t-2xl border-stroke-soft-100 border-x border-t bg-bg-white-0 dark:border-stroke-soft-100/40"
			>
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
		</div>
	);
}

export function TemplateCardGrid() {
	return (
		<div className="flex w-full flex-wrap justify-center gap-8 lg:gap-x-8 lg:gap-y-10">
			{emailTemplateExamples.map((template) => (
				<Link
					key={template.id}
					href={`${toolPath}/${template.id}`}
					aria-label={`Open ${template.name} template in the editor`}
					className="group/card relative flex w-full flex-col gap-3.5 text-left sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.375rem)]"
				>
					<div
						className={cn(
							previewCardClassName,
							"transition-colors duration-200",
							"group-hover/card:border-stroke-sub-300 dark:group-hover/card:border-stroke-soft-100/70",
						)}
					>
						<TemplatePreview template={template} />
					</div>

					<div className="flex items-start justify-between gap-3 px-1">
						<div className="mr-2 flex min-w-0 flex-1 flex-col gap-0.5">
							<span
								className="truncate font-semibold text-label-sm text-text-strong-950"
								title={template.name}
							>
								{template.name}
							</span>
							<span
								className="truncate text-paragraph-xs text-text-sub-600"
								title={template.slug}
							>
								{template.slug}
							</span>
						</div>
						<span className="shrink-0 select-none rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[11px] text-text-sub-600 leading-none ring-1 ring-stroke-soft-100 ring-inset dark:bg-bg-soft-200 dark:ring-stroke-soft-100/40">
							Example
						</span>
					</div>
				</Link>
			))}
		</div>
	);
}
