import { Icon } from "@reloop/ui/components/icon";
import { createRelativeLink } from "fumadocs-ui/mdx";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
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
} from "@/components/icons/Tech";
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
		<DocsPage toc={page.data.toc} full={page.data.full}>
			<DocsTitle>{page.data.title}</DocsTitle>
			<DocsDescription>{page.data.description}</DocsDescription>
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
					})}
				/>
			</DocsBody>
		</DocsPage>
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
