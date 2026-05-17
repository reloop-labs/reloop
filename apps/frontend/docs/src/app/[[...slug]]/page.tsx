import { DocsBody } from "@reloop/fe-docs/components/docs/body";
import {
	CodeColumnProvider,
	CodeDisplay,
} from "@reloop/fe-docs/components/docs/code-column-context";
import { DocsLayout } from "@reloop/fe-docs/components/docs/layout";
import { PageFooter } from "@reloop/fe-docs/components/docs/page-footer";
import { TableOfContents } from "@reloop/fe-docs/components/docs/toc";
import { PageActions } from "@reloop/fe-docs/components/page-actions";
import { source } from "@reloop/fe-docs/lib/source";
import type { PageTreeItem, TOCItem } from "@reloop/fe-docs/lib/types";
import { getMDXComponents } from "@reloop/fe-docs/mdx-components";
import { Icon } from "@reloop/ui/icon";
import { ChevronRight } from "lucide-react";
import { notFound, redirect } from "next/navigation";

function getBreadcrumbs(
	tree: PageTreeItem[],
	slugPath: string,
	parentPath: string[] = [],
): string[] {
	let currentSection = "";
	const targetUrl =
		slugPath === "index" ? "/" : `/${slugPath.replace(/\/index$/, "")}`;

	for (const item of tree) {
		if (item.type === "separator") {
			currentSection = (item.name as string) || "";
			continue;
		}

		if (
			item.type === "page" &&
			(item.url === targetUrl ||
				(item.url === "/introduction" && targetUrl === "/"))
		) {
			return currentSection
				? [currentSection, ...parentPath, item.name as string]
				: [...parentPath, item.name as string];
		}

		if (item.type === "folder") {
			const found = getBreadcrumbs(item.children, slugPath, [
				...parentPath,
				item.name as string,
			]);
			if (found.length) {
				return currentSection ? [currentSection, ...found] : found;
			}
		}
	}
	return [];
}

export async function generateMetadata(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;

	const page = source.getPage(params.slug);
	if (!page) {
		if (!params.slug || params.slug.length === 0) {
			return {
				title: "Reloop - Modern Email Infrastructure",
				description: "The modern email infrastructure for developers.",
			};
		}
		notFound();
	}

	return {
		title: page.data.title,
		description: page.data.description,
	};
}

export async function generateStaticParams() {
	const params = source.generateParams() as { slug: string[] }[];
	return [
		{ slug: [] },
		...params.filter((param) => param.slug && param.slug.length > 0),
	];
}

export default async function Page(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;

	const page = source.getPage(
		params.slug?.length ? params.slug : ["introduction"],
	);
	if (!page) notFound();
	const MDXContent = page.data.body;
	const isFullWidth = page.data.full === true;

	const slugPath = params.slug?.join("/") || "index";

	// Resend Logic:
	// 1. General guides (slug depth <= 2) like /webhooks/introduction show TOC and use standard width.
	// 2. Event references (slug depth > 2) like /webhooks/emails/sent hide TOC and use full width.
	const isWebhookEvent =
		params.slug?.[0] === "webhooks" && params.slug?.length > 2;

	const hideToc = isFullWidth || isWebhookEvent;
	const useFullWidth = isFullWidth || isWebhookEvent;

	const breadcrumbs = getBreadcrumbs(
		source.pageTree.children as PageTreeItem[],
		slugPath,
	);

	const { previous, next } = source.findNeighbor(page.url);

	// Force RSC cache bust: 2026-05-17T03:30:00Z
	const pathname = page.url;

	return (
		<CodeColumnProvider>
			<DocsLayout
				tree={source.pageTree.children as PageTreeItem[]}
				pathname={pathname}
			>
				<div
					className={`mx-auto flex w-full flex-col ${hideToc ? "max-w-none" : "max-w-[1100px] xl:grid xl:grid-cols-[1fr_240px] xl:gap-8"}`}
				>
					{/* Main content area */}
					<div
						className={`min-w-0 px-6 py-8 md:px-10 ${isWebhookEvent ? "lg:grid lg:grid-cols-[1fr_400px] lg:gap-16" : ""}`}
					>
						<div className={hideToc ? "" : "mx-auto max-w-[800px] xl:mx-0"}>
							{/* Breadcrumb */}
							{breadcrumbs.length > 0 ? (
								<div className="mb-3 flex items-center gap-1.5 font-medium text-[12px] text-fd-muted-foreground/60 uppercase tracking-wider">
									{breadcrumbs.map((crumb, i) => (
										<div key={i} className="flex items-center gap-1.5">
											{i > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
											<span
												className={
													i === breadcrumbs.length - 1
														? "text-fd-foreground/80"
														: ""
												}
											>
												{crumb}
											</span>
										</div>
									))}
								</div>
							) : (
								<div className="mb-3 font-medium text-[12px] text-fd-muted-foreground/60 uppercase tracking-wider">
									Documentation
								</div>
							)}

							{/* Title row */}
							<div className="mb-8 flex items-start justify-between gap-4">
								<div className="flex-1">
									<h1 className="font-bold text-4xl text-fd-foreground tracking-[-0.03em] sm:text-[40px]">
										{page.data.title}
									</h1>
									{page.data.description && (
										<p className="mt-3.5 text-[18px] text-fd-muted-foreground/90 leading-relaxed tracking-[-0.01em]">
											{page.data.description}
										</p>
									)}
								</div>
								<div className="mt-2 shrink-0">
									<PageActions markdownUrl={`${page.url}.mdx`} />
								</div>
							</div>

							{/* Content */}
							<DocsBody>
								<MDXContent
									components={getMDXComponents({
										Icon: Icon,
										_apiData: page.data._apiData,
									} as any)}
								/>
							</DocsBody>

							<PageFooter previous={previous} next={next} />
						</div>

						{/* Right Column for Code (Visible only for Webhook Events) */}
						{isWebhookEvent && (
							<div className="hidden lg:block">
								<div className="sticky top-24 px-2 pt-4 pb-12">
									<CodeDisplay />
								</div>
							</div>
						)}
					</div>

					{/* Right sidebar - Table of Contents (hidden on full-width API pages) */}
					{!hideToc && (
						<aside className="hidden xl:block">
							<div className="sticky top-0 h-[calc(100vh-3rem)] overflow-y-auto pt-8 pr-18">
								<TableOfContents items={page.data.toc as TOCItem[]} />
							</div>
						</aside>
					)}
				</div>
			</DocsLayout>
		</CodeColumnProvider>
	);
}
