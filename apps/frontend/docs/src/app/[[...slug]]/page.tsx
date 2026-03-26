import { baseOptions } from "@reloop/fe-docs/app/layout.config";
import { Footer } from "@reloop/fe-docs/components/footer";
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
import { getMDXComponents } from "@reloop/fe-docs/mdx-components";
import { Icon } from "@reloop/ui/icon";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { createRelativeLink } from "fumadocs-ui/mdx";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";
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
	const params = source.generateParams();
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
		<DocsLayout
			tree={source.pageTree}
			{...baseOptions}
			githubUrl="https://github.com/reloop-labs/reloop"
			tabs={false}
			sidebar={{ collapsible: false }}
		>
			<DocsPage
				tableOfContent={{ style: "clerk" }}
				toc={page.data.toc}
				full={page.data.full}
				title={page.data.title}
				editOnGithub={{
					owner: "reloop-labs",
					repo: "reloop",
					path: `/${params.slug?.join("/")}.mdx?plain=1`,
					sha: "main/apps/frontend/dev/content/docs",
				}}
				slots={{
					footer: Footer,
				}}
			>
				<div className="flex items-center justify-between">
					<div>
						<DocsTitle>{page.data.title}</DocsTitle>
						<DocsDescription className="mb-4">
							{page.data.description}
						</DocsDescription>
					</div>
					<PageActions markdownUrl={`${page.url}.mdx`} />
				</div>
				<DocsBody>
					<MDXContent
						components={getMDXComponents({
							// this allows you to link to other pages with relative file paths
							a: createRelativeLink(source, page),
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
			</DocsPage>
		</DocsLayout>
	);
}
