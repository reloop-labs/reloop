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
import { notFound } from "next/navigation";

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

	const isApiPage = !!page.data._apiData;
	let ogImage: string | undefined = undefined;

	if (isApiPage) {
		const operation = page.data._apiData?.operationData?.[0];
		const method = operation?.method || "GET";
		const path = operation?.path || "";
		const description = page.data.description || "";

		const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reloop.sh";
		const searchParams = new URLSearchParams({
			title: page.data.title,
			description: description,
			method: method,
			path: path,
		});
		const isApiKeyPage =
			page.data.title.toLowerCase().includes("api key") ||
			path.toLowerCase().includes("api-key");
		const ogPath = isApiKeyPage ? "api/og/api-key" : "api/og";
		ogImage = `${appUrl}/docs/${ogPath}?${searchParams.toString()}`;
	}

	return {
		title: page.data.title,
		description: page.data.description,
		openGraph: {
			title: page.data.title,
			description: page.data.description,
			images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title: page.data.title,
			description: page.data.description,
			images: ogImage ? [ogImage] : undefined,
		},
	};
}

export async function generateStaticParams() {
	const params = source.generateParams() as { slug: string[] }[];
	return [
		{ slug: [] },
		...params.filter((param) => param.slug && param.slug.length > 0),
	];
}

export const dynamic = "force-dynamic";

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
	const isApiPage = !!page.data._apiData;

	const _slugPath = params.slug?.join("/") || "index";

	// Resend Logic:
	// 1. General guides (slug depth <= 2) like /webhooks/introduction show TOC and use standard width.
	// 2. Event references (slug depth > 2) like /webhooks/emails/sent hide TOC and use full width.
	const isWebhookEvent =
		params.slug?.[0] === "webhooks" && params.slug?.length > 2;

	const hideToc = isFullWidth || isWebhookEvent;
	const useSplitLayout = isWebhookEvent || isApiPage;

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
					className={`mx-auto flex w-full flex-col ${
						hideToc
							? isApiPage
								? "max-w-6xl"
								: "max-w-none"
							: "max-w-[1040px] xl:grid xl:grid-cols-[1fr_240px] xl:gap-8"
					}`}
				>
					{/* Main content area */}
					<div
						className={`min-w-0 px-6 py-8 md:px-10 ${useSplitLayout ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(380px,480px)] lg:gap-x-10 xl:gap-x-12" : ""}`}
					>
						<div
							className={
								hideToc
									? isApiPage
										? "min-w-0"
										: ""
									: "mx-auto max-w-[680px] xl:mx-0"
							}
						>
							{/* Title row */}
							<div className="mb-8 flex items-start justify-between gap-4">
								<div className="flex-1">
									<h1 className="font-semibold text-3xl text-fd-foreground tracking-[-0.03em]">
										{page.data.title}
									</h1>
									{page.data.description && !isApiPage && (
										<p className="mt-3.5 text-[16px] text-text-sub-600/90 leading-relaxed tracking-[-0.01em]">
											{page.data.description}
										</p>
									)}
								</div>
								<div className="mt-2 shrink-0">
									<PageActions rawContent={(page.data as any).raw} />
								</div>
							</div>

							{/* Content */}
							<DocsBody
								className={
									isApiPage
										? "[&>p:first-child]:m-0 [&>p:first-child]:hidden"
										: ""
								}
							>
								<MDXContent
									components={getMDXComponents({
										Icon: Icon,
										_apiData: page.data._apiData,
									} as any)}
								/>
							</DocsBody>

							<PageFooter previous={previous} next={next} />
						</div>

						{/* Right column: sticky code + response (API reference & webhook events) */}
						{useSplitLayout && (
							<div className="hidden lg:block">
								<div className="sticky top-10 space-y-6 pb-12 pl-2">
									<CodeDisplay />
								</div>
							</div>
						)}
					</div>

					{/* Right sidebar - Table of Contents (hidden on full-width API pages) */}
					{!hideToc && (
						<aside className="hidden xl:block">
							<div className="sticky top-0 h-[calc(100vh-3rem)] overflow-y-auto pt-8 pr-4">
								<TableOfContents items={page.data.toc as TOCItem[]} />
							</div>
						</aside>
					)}
				</div>
			</DocsLayout>
		</CodeColumnProvider>
	);
}
