import { DocsBody } from "@reloop/fe-docs/components/docs/body";
import { DocsLayout } from "@reloop/fe-docs/components/docs/layout";
import { TableOfContents } from "@reloop/fe-docs/components/docs/toc";
import {
	BiomejsIcon,
	BunIcon,
	DockerIcon,
	ElysiaJSIcon,
	KubernetesIcon,
	NextjsIcon,
	PostgreSQLIcon,
	RadixUIIcon,
	RedisIcon,
	SWRIcon,
	TailwindCSSIcon,
	TurborepoIcon,
	TypeScriptIcon,
} from "@reloop/fe-docs/components/icons/Tech";
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
	if (!params.slug || params.slug.length === 0) {
		return {
			title: "Reloop - Modern Email Infrastructure",
			description:
				"The modern email infrastructure for developers. Build, send, and track emails with ease.",
		};
	}

	const page = source.getPage(params.slug);
	if (!page) notFound();

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
	const page = source.getPage(params.slug);
	if (!page) notFound();
	const MDXContent = page.data.body;

	return (
		<DocsLayout tree={source.pageTree.children as PageTreeItem[]}>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
						{page.data.title}
					</h1>
					<p className="mt-2 text-lg text-muted-foreground">
						{page.data.description}
					</p>
				</div>
				<PageActions markdownUrl={`${page.url}.mdx`} />
			</div>
			<div className="mt-8 flex flex-col gap-10 xl:grid xl:grid-cols-[1fr_300px]">
				<DocsBody>
					<MDXContent
						components={getMDXComponents({
							Icon: Icon,
							NextjsIcon: NextjsIcon,
							RadixUIIcon: RadixUIIcon,
							TailwindCSSIcon: TailwindCSSIcon,
							SWRIcon: SWRIcon,
							ElysiaJSIcon: ElysiaJSIcon,
							PostgreSQLIcon: PostgreSQLIcon,
							RedisIcon: RedisIcon,
							BunIcon: BunIcon,
							TurborepoIcon: TurborepoIcon,
							BiomejsIcon: BiomejsIcon,
							KubernetesIcon: KubernetesIcon,
							DockerIcon: DockerIcon,
							TypeScriptIcon: TypeScriptIcon,
						})}
					/>
				</DocsBody>
				<TableOfContents items={page.data.toc as TOCItem[]} />
			</div>
		</DocsLayout>
	);
}
