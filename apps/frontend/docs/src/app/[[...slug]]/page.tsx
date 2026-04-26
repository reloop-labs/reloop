import { DocsBody } from "@reloop/fe-docs/components/docs/body";
import { DocsLayout } from "@reloop/fe-docs/components/docs/layout";
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
	return params.filter((param) => param.slug && param.slug.length > 0);
}

export default async function Page(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;

	if (!params.slug || params.slug.length === 0) {
		redirect("/introduction");
	}

	const page = source.getPage(params.slug);
	if (!page) notFound();
	const MDXContent = page.data.body;

	const slugPath = params.slug?.join("/") || "index";
	const breadcrumbs = getBreadcrumbs(
		source.pageTree.children as PageTreeItem[],
		slugPath,
	);

	return (
		<DocsLayout tree={source.pageTree.children as PageTreeItem[]}>
			<div className="mx-auto flex w-full max-w-[1250px] flex-col xl:grid xl:grid-cols-[1fr_240px] xl:gap-8s">
				{/* Main content area */}
				<div className="min-w-0 px-6 py-8 md:px-10 lg:pr-0 lg:pl-16">
					<div className="mx-auto max-w-[720px] xl:mx-0">
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
							<MDXContent components={getMDXComponents({ Icon: Icon })} />
						</DocsBody>
					</div>
				</div>

				{/* Right sidebar - Table of Contents */}
				<aside className="hidden xl:block">
					<div className="sticky top-0 h-[calc(100vh-3rem)] overflow-y-auto pt-8 pr-6">
						<TableOfContents items={page.data.toc as TOCItem[]} />
					</div>
				</aside>
			</div>
		</DocsLayout>
	);
}
