import { Icon } from "@reloop/ui/components/icon";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsPage } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { baseOptions } from "@/app/layout.config";
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
} from "@/components/icons/Tech";
import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

export default async function Page(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();
	const MDXContent = page.data.body;

	return (
		<DocsLayout
			tabMode="navbar"
			tree={source.pageTree}
			{...baseOptions}
			githubUrl="https://github.com/reloop-labs/reloop"
			nav={{ ...baseOptions.nav, mode: "top" }}
			sidebar={{
				collapsible: false,
				tabs: [
					{
						title: "SDK",
						url: "/sdk",
					},
					{
						title: "Integrations",
						url: "/integrations",
					},
					{
						title: "Apps",
						url: "/apps",
					},
					{
						title: "Deploy",
						url: "/deploy",
					},
					{
						title: "Setup",
						url: "/setup",
					},
					{
						title: "API",
						url: "/api",
					},
				],
			}}
		>
			<DocsPage
				tableOfContent={{ style: "clerk" }}
				toc={page.data.toc}
				full={page.data.full}
				editOnGithub={{
					owner: "reloop-labs",
					repo: "reloop",
					path: `/${params.slug?.join("/")}.mdx?plain=1`,
					sha: "main/apps/frontend/dev/content/docs",
				}}
			>
				<div className="flex flex-row items-center gap-2">
					<LLMCopyButton markdownUrl={`${page.url}.mdx`} />
					<ViewOptions
						markdownUrl={`${page.url}.mdx`}
						githubUrl="https://github.com//reloop-labs/reloop"
					/>
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

export async function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	return {
		title: page.data.title,
		description: page.data.description,
	};
}
