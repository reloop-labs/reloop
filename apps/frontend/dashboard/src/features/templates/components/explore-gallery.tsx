import {
	categorizedTemplateExamples,
	type EmailTemplateExample,
	type TemplateCategory,
	templateCategories,
} from "@reloop/email-templates";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useCreateTemplateFromExample } from "#/features/templates/hooks/use-create-template-from-example";

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
	return (
		<div
			className={cn(
				"group/card relative flex flex-col gap-2 rounded-t-[24px] rounded-b-[20px] p-1.5",
				"transition-colors duration-200 ease-out motion-reduce:transition-none",
				"hover:bg-bg-weak-50 dark:hover:bg-white/[0.05]",
				isPending && "bg-bg-weak-50 dark:bg-white/[0.05]",
			)}
		>
			<div className="pointer-events-none relative aspect-[5/4] w-full select-none overflow-hidden rounded-[18px] bg-white ring-1 ring-stroke-soft-100 dark:ring-white/10">
				<ExamplePreview template={template} previewCss={previewCss} />

				<div
					className={cn(
						"absolute inset-x-0 bottom-4 z-10 flex justify-center transition-opacity duration-200",
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
			</div>

			<div className="flex min-w-0 flex-col gap-0.5 px-3 pt-1 pb-2.5">
				<h3
					className="truncate font-medium text-[16px] text-text-strong-950"
					title={template.name}
				>
					{template.name}
				</h3>
				<span
					className="truncate text-paragraph-xs text-text-sub-600"
					title={template.description}
				>
					{template.slug}
				</span>
			</div>

			<button
				type="button"
				className="absolute inset-0 cursor-pointer rounded-t-[24px] rounded-b-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-sub-300 disabled:cursor-wait"
				aria-label={`Use the ${template.name} template`}
				disabled={disabled}
				onClick={onUse}
			/>
		</div>
	);
}

/** The Acme family (`acme-` ids) drops its gray page so only the white card shows. */
function previewCssFor(template: EmailTemplateExample) {
	return template.id.startsWith("acme-") ? CARD_ONLY_PREVIEW_CSS : undefined;
}

type Folder = TemplateCategory & { templates: EmailTemplateExample[] };

/** Folders in display order; empty ones are hidden until they're filled. */
const folders: Folder[] = templateCategories
	.map((category) => ({
		...category,
		templates: categorizedTemplateExamples.filter(
			(template) => template.category === category.id,
		),
	}))
	.filter((folder) => folder.templates.length > 0);

function matches(template: EmailTemplateExample, q: string): boolean {
	return (
		template.name.toLowerCase().includes(q) ||
		template.slug.toLowerCase().includes(q) ||
		template.description.toLowerCase().includes(q)
	);
}

function pluralTemplates(count: number) {
	return `${count} ${count === 1 ? "template" : "templates"}`;
}

/** Resting offsets so a few different emails peek out of the folder. */
const paperRestPoses = [
	"-translate-x-[7%] -translate-y-[7%] -rotate-[4deg]",
	"-translate-y-[2%]",
	"translate-x-[6%] translate-y-[1%] rotate-[3deg]",
];

/**
 * At rest the emails sit straight in the folder with only an edge showing;
 * on hover they rise and fan out.
 */
const paperPoses = [
	"group-hover/folder:-translate-x-[9%] group-hover/folder:-translate-y-[30%] group-hover/folder:-rotate-[9deg]",
	"group-hover/folder:-translate-y-[38%] group-hover/folder:-rotate-[1deg]",
	"group-hover/folder:translate-x-[9%] group-hover/folder:-translate-y-[30%] group-hover/folder:rotate-[8deg]",
];

/**
 * Glass folder: a tabbed back panel, the folder's first emails tucked inside,
 * and a frosted front pocket over them.
 */
function FolderCard({
	folder,
	onOpen,
}: {
	folder: Folder;
	onOpen: () => void;
}) {
	const gradientId = useId();
	const papers = folder.templates.slice(0, 3);
	const count = pluralTemplates(folder.templates.length);

	return (
		<div className="group/folder relative flex flex-col gap-2 p-1.5">
			<div className="pointer-events-none relative aspect-[5/4] w-full select-none">
				{/* Back panel with the folder tab */}
				<svg
					viewBox="0 0 100 80"
					preserveAspectRatio="none"
					className="absolute inset-0 h-full w-full"
					aria-hidden
				>
					<defs>
						<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
							<stop
								offset="0"
								className="[stop-color:#e6e6e6] dark:[stop-color:#2e2e2e]"
							/>
							<stop
								offset="1"
								className="[stop-color:#d4d4d4] dark:[stop-color:#141414]"
							/>
						</linearGradient>
					</defs>
					<path
						d="M8 14 Q8 6 16 6 H37 Q41 6 43.5 9 L46 12 Q48.5 15 52.5 15 H84 Q92 15 92 23 V62 Q92 70 84 70 H16 Q8 70 8 62 Z"
						fill={`url(#${CSS.escape(gradientId)})`}
						className="stroke-[0.4] stroke-black/[0.06] dark:stroke-white/10"
					/>
				</svg>

				{papers.map((template, index) => (
					<div
						key={template.id}
						className={cn(
							"absolute top-[26%] left-[17%] aspect-[16/10] w-[66%] origin-bottom overflow-hidden rounded-[8px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] ring-1 ring-black/5",
							"transition-transform duration-300 ease-out motion-reduce:transition-none",
							papers.length > 1 && paperRestPoses[index],
							paperPoses[papers.length === 1 ? 1 : index],
						)}
					>
						<ExamplePreview
							template={template}
							previewCss={previewCssFor(template)}
						/>
					</div>
				))}

				{/* Soft glow under the pocket, dark mode only */}
				<div className="absolute inset-x-[16%] bottom-[7%] hidden h-[10%] rounded-[50%] bg-white/10 blur-xl dark:block" />

				{/* Frosted front pocket */}
				<div
					className={cn(
						"absolute inset-x-[8%] top-[34%] bottom-[10%] overflow-hidden rounded-[20px] backdrop-blur-xl",
						"bg-gradient-to-b from-white/75 to-[#ececec]/75 ring-1 ring-black/[0.06]",
						"shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
						"dark:from-[#5c5c5c]/75 dark:to-[#2a2a2a]/85 dark:ring-white/15",
						"dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_16px_40px_-10px_rgba(0,0,0,0.8)]",
					)}
				>
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.55),transparent_65%)] opacity-70 transition-opacity duration-300 group-hover/folder:opacity-100 dark:bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.16),transparent_65%)]" />
				</div>
			</div>

			<div className="-mt-[6%] flex min-w-0 flex-col gap-0.5 px-[8%] pb-2.5">
				<h3
					className="truncate font-medium text-[16px] text-text-strong-950"
					title={folder.description}
				>
					{folder.name}
				</h3>
				<span className="truncate text-paragraph-xs text-text-sub-600">
					{count}
				</span>
			</div>

			<button
				type="button"
				className="absolute inset-0 cursor-pointer rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-sub-300"
				aria-label={`Open ${folder.name}, ${count}`}
				onClick={onOpen}
			/>
		</div>
	);
}

const gridClassName =
	"grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10";

/** A folder's templates, over the folder grid so the page keeps its place. */
function FolderModal({
	folder,
	onClose,
	renderCard,
}: {
	folder: Folder | undefined;
	onClose: () => void;
	renderCard: (template: EmailTemplateExample) => React.ReactNode;
}) {
	// Keep the last folder while the close animation plays.
	const [shown, setShown] = useState(folder);
	useEffect(() => {
		if (folder) setShown(folder);
	}, [folder]);

	return (
		<Modal.Root open={!!folder} onOpenChange={(open) => !open && onClose()}>
			{/* Two layers: a soft outer shell holds the title, and an inset white
			    panel holds the templates and scrolls on its own. */}
			<Modal.Content
				showClose={false}
				className="flex max-h-[calc(100dvh-2rem)] max-w-[1080px] flex-col overflow-hidden rounded-[24px] bg-bg-weak-50 p-1.5 ring-1 ring-stroke-soft-100 dark:bg-[#111113] dark:ring-white/10"
			>
				{shown ? (
					<>
						<div className="flex shrink-0 items-start justify-between gap-4 px-4 pt-3 pb-3.5">
							<div className="min-w-0">
								<Modal.Title className="font-semibold text-label-md text-text-strong-950">
									{shown.name}
								</Modal.Title>
								<Modal.Description className="mt-0.5 text-paragraph-sm text-text-sub-600">
									{shown.description} ·{" "}
									{pluralTemplates(shown.templates.length)}
								</Modal.Description>
							</div>
							<Modal.Close asChild>
								<button
									type="button"
									className="-mr-1 flex size-7 shrink-0 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-black/[0.05] hover:text-text-strong-950 dark:hover:bg-white/[0.08]"
									aria-label="Close"
								>
									{/* Inline so it can be heavier than the sprite's fixed 1.5 stroke */}
									<svg
										viewBox="0 0 24 24"
										fill="none"
										className="size-4"
										aria-hidden
									>
										<path
											d="M6 18L18 6M6 6l12 12"
											stroke="currentColor"
											strokeWidth="2.25"
											strokeLinecap="round"
										/>
									</svg>
								</button>
							</Modal.Close>
						</div>
						<div className="min-h-0 flex-1 overflow-y-auto rounded-[18px] bg-bg-white-0 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-stroke-soft-100 sm:p-5 dark:bg-black dark:ring-white/10">
							<div className={gridClassName}>
								{shown.templates.map(renderCard)}
							</div>
						</div>
					</>
				) : null}
			</Modal.Content>
		</Modal.Root>
	);
}

/** Ready-made templates from the public email editor, filed into folders. */
export function ExploreGallery() {
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [folderId, setFolderId] = useQueryState(
		"folder",
		parseAsString.withOptions({ history: "push" }),
	);
	const { pendingId, createFromExample } = useCreateTemplateFromExample();
	// Opened by a click here (a history entry was pushed) vs. a shared
	// `?folder=` link: closing should step back only in the first case.
	const openedHere = useRef(false);

	const openFolder = (id: string) => {
		openedHere.current = true;
		void setFolderId(id);
	};

	const closeFolder = () => {
		if (openedHere.current) {
			openedHere.current = false;
			window.history.back();
		} else {
			void setFolderId(null, { history: "replace" });
		}
	};

	const renderCard = (template: EmailTemplateExample) => (
		<ExampleCard
			key={template.id}
			template={template}
			previewCss={previewCssFor(template)}
			isPending={pendingId === template.id}
			disabled={pendingId !== null}
			onUse={() => void createFromExample(template)}
		/>
	);

	const q = searchQuery.trim().toLowerCase();
	const openFolderData = folders.find((folder) => folder.id === folderId);

	// Search spans every folder; a folder whose name matches shows in full.
	if (q) {
		const results = folders
			.map((folder) => ({
				...folder,
				templates: folder.name.toLowerCase().includes(q)
					? folder.templates
					: folder.templates.filter((template) => matches(template, q)),
			}))
			.filter((folder) => folder.templates.length > 0);

		if (results.length === 0) {
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
				{results.map((folder) => (
					<section key={folder.id} aria-labelledby={`explore-${folder.id}`}>
						<div className="mb-5 flex items-baseline gap-2">
							<h2
								id={`explore-${folder.id}`}
								className="font-semibold text-label-md text-text-strong-950"
							>
								{folder.name}
							</h2>
							<span className="text-paragraph-sm text-text-sub-600">
								{folder.templates.length}
							</span>
						</div>
						<div className={gridClassName}>
							{folder.templates.map(renderCard)}
						</div>
					</section>
				))}
			</div>
		);
	}

	return (
		<>
			<div className={gridClassName}>
				{folders.map((folder) => (
					<FolderCard
						key={folder.id}
						folder={folder}
						onOpen={() => openFolder(folder.id)}
					/>
				))}
			</div>
			<FolderModal
				folder={openFolderData}
				onClose={closeFolder}
				renderCard={renderCard}
			/>
		</>
	);
}
