import { baseOptions } from "@reloop/fe-dev/app/layout.config";
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
} from "@reloop/fe-dev/components/icons/Tech";
import { PageActions } from "@reloop/fe-dev/components/page-actions";
import { source } from "@reloop/fe-dev/lib/source";
import { getMDXComponents } from "@reloop/fe-dev/mdx-components";
import { Icon } from "@reloop/ui/icon";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsPage } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import HomePage from "./home-page";

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
	if (!params.slug || params.slug.length === 0) {
		return <HomePage />;
	}

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
				editOnGithub={{
					owner: "reloop-labs",
					repo: "reloop",
					path: `/${params.slug?.join("/")}.mdx?plain=1`,
					sha: "main/apps/frontend/dev/content/docs",
				}}
				footer={{}}
			>
				<div className="flex flex-col items-end gap-2">
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
