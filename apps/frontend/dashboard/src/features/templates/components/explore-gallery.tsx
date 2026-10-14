import {
	acmeTemplateExamples,
	type EmailTemplateExample,
	galleryTemplateExamples,
} from "@reloop/email-templates";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCreateTemplateFromExample } from "#/features/templates/hooks/use-create-template-from-example";
import { previewCardClassName, TemplatePreviewPaper } from "./template-grid";

/** Width the email is laid out at before it is scaled into the card. */
const EMAIL_RENDER_WIDTH = 600;

/** Acme set: show only the white email card, without its gray page. */
const CARD_ONLY_PREVIEW_CSS =
	"<style>body,body>table{background:#ffffff!important}body>table>tbody>tr>td{padding:0!important}</style>";

/** Previews read better with sample values than `{{{otp_code}}}`. */
function previewHtml(template: EmailTemplateExample, previewCss?: string) {
	const html = template.variables.reduce(
		(acc, variable) =>
			variable.defaultValue === null
				? acc
				: acc.replaceAll(`{{{${variable.name}}}}`, variable.defaultValue),
		template.html(window.location.origin),
	);
	return previewCss ? html.replace("</head>", `${previewCss}</head>`) : html;
}

/** Scaled, sandboxed render; mounts once the card nears the viewport. */
function ExamplePreview({
	template,
	previewCss,
}: {
	template: EmailTemplateExample;
	previewCss?: string;
}) {
	const frameRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0);
	const [visible, setVisible] = useState(false);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const frame = frameRef.current;
		if (!frame) return;
		const resize = new ResizeObserver(([entry]) => {
			if (entry) setScale(entry.contentRect.width / EMAIL_RENDER_WIDTH);
		});
		const intersect = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setVisible(true);
					intersect.disconnect();
				}
			},
			{ rootMargin: "400px" },
		);
		resize.observe(frame);
		intersect.observe(frame);
		return () => {
			resize.disconnect();
			intersect.disconnect();
		};
	}, []);

	const srcDoc = useMemo(
		() => (visible ? previewHtml(template, previewCss) : null),
		[visible, template, previewCss],
	);

	return (
		<div ref={frameRef} className="absolute inset-0 bg-white">
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

function BlankPreview() {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-3">
			<span className="flex size-10 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors duration-200 group-hover/card:text-text-strong-950 dark:border-stroke-soft-100/40">
				<Icon name="plus" className="size-5" />
			</span>
			<span className="text-[13px] text-text-sub-600">Start from scratch</span>
		</div>
	);
}

function ExampleCard({
	template,
	previewCss,
	isPending,
	disabled,
	onUse,
}: {
	template: EmailTemplateExample;
	previewCss?: string;
	isPending: boolean;
	disabled: boolean;
	onUse: () => void;
}) {
	const isBlank = template.id === "blank";

	return (
		<div className="group/card relative flex flex-col gap-3.5">
			<div
				className={cn(
					previewCardClassName,
					"transition-colors duration-200",
					"hover:border-stroke-sub-300 dark:hover:border-stroke-soft-100/70",
				)}
			>
				<TemplatePreviewPaper>
					{isBlank ? (
						<BlankPreview />
					) : (
						<ExamplePreview template={template} previewCss={previewCss} />
					)}
				</TemplatePreviewPaper>

				{isBlank ? null : (
					<div
						className={cn(
							"pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center transition-opacity duration-200",
							isPending
								? "opacity-100"
								: "opacity-0 group-hover/card:opacity-100",
						)}
					>
						<span className="flex items-center gap-1.5 rounded-full bg-bg-strong-950 px-3.5 py-2 font-medium text-text-white-0 text-xs shadow-sm">
							{isPending ? (
								<>
									<Spinner size={12} color="currentColor" />
									Creating...
								</>
							) : (
								<>
									<Icon name="plus" className="h-3.5 w-3.5" />
									Use template
								</>
							)}
						</span>
					</div>
				)}

				<button
					type="button"
					className="absolute inset-0 z-0 cursor-pointer disabled:cursor-wait"
					aria-label={`Use the ${template.name} template`}
					disabled={disabled}
					onClick={onUse}
				/>
			</div>

			<div className="flex min-w-0 flex-col gap-0.5 px-1">
				<span
					className="ml-2 truncate font-semibold text-label-sm text-text-strong-950"
					title={template.name}
				>
					{template.name}
				</span>
				<span
					className="ml-2 truncate text-paragraph-xs text-text-sub-600"
					title={template.description}
				>
					{template.slug}
				</span>
			</div>
		</div>
	);
}

function matches(template: EmailTemplateExample, q: string): boolean {
	if (!q) return true;
	return (
		template.name.toLowerCase().includes(q) ||
		template.slug.toLowerCase().includes(q) ||
		template.description.toLowerCase().includes(q)
	);
}

const sections = [
	{
		id: "designs",
		title: "Designs",
		description: "Standalone designs, each with its own look.",
		templates: galleryTemplateExamples,
		previewCss: undefined,
	},
	{
		id: "acme",
		title: "Transactional set",
		description:
			"One consistent brand across every lifecycle email. Swap the logo and colors to make it yours.",
		templates: acmeTemplateExamples,
		previewCss: CARD_ONLY_PREVIEW_CSS,
	},
];

/** Ready-made templates from the public email editor, copied on use. */
export function ExploreGallery() {
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const { pendingId, createFromExample } = useCreateTemplateFromExample();

	const q = searchQuery.trim().toLowerCase();
	const visibleSections = sections
		.map((section) => ({
			...section,
			templates: section.templates.filter((t) => matches(t, q)),
		}))
		.filter((section) => section.templates.length > 0);

	if (visibleSections.length === 0) {
		return (
			<div className="flex flex-col items-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-6 py-12 text-center dark:border-stroke-soft-100/40">
				<Icon name="search" className="mb-4 h-8 w-8 text-text-sub-600" />
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					No templates found
				</h3>
				<p className="mb-6 text-[12px] text-text-sub-600">
					Try a different search.
				</p>
				<button
					type="button"
					onClick={() => void setSearchQuery("")}
					className="font-medium text-sm text-text-strong-950 underline underline-offset-4"
				>
					Clear search
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-12">
			{visibleSections.map((section) => (
				<section key={section.id} aria-labelledby={`explore-${section.id}`}>
					<div className="mb-5">
						<h2
							id={`explore-${section.id}`}
							className="font-semibold text-label-md text-text-strong-950"
						>
							{section.title}
						</h2>
						<p className="mt-0.5 text-paragraph-sm text-text-sub-600">
							{section.description}
						</p>
					</div>
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
						{section.templates.map((template) => (
							<ExampleCard
								key={template.id}
								template={template}
								previewCss={section.previewCss}
								isPending={pendingId === template.id}
								disabled={pendingId !== null}
								onUse={() => void createFromExample(template)}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
