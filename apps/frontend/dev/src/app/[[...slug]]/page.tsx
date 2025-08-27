import { baseOptions } from "@dev/app/layout.config";
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
} from "@dev/components/icons/Tech";
import { LLMCopyButton, ViewOptions } from "@dev/components/page-actions";
import { source } from "@dev/lib/source";
import { getMDXComponents } from "@dev/mdx-components";
import { Icon } from "@reloop/ui/components/icon";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsPage } from "fumadocs-ui/page";
import { notFound, redirect } from "next/navigation";
import HomePage from "./home-page";

export default async function Page(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;

	// If we're on the home page (no slug or empty slug), redirect to the new home page
	if (!params.slug || params.slug.length === 0) {
		return <HomePage />;
	}

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
						title: "API",
						url: "/api",
					},
					{
						title: "Integrations",
						url: "/integrations",
					},

					{
						title: "Deploy",
						url: "/deploy",
					},
					{
						title: "Setup",
						url: "/setup",
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
	const params = source.generateParams();
	// Filter out the home page since it's handled by page.tsx
	// Include service overview pages but exclude API documentation pages that cause build issues
	return params.filter((param) => {
		if (!param.slug || param.slug.length === 0) return false;

		const slugPath = param.slug.join("/");

		// Exclude API documentation pages that cause build issues
		// These are the auto-generated API reference pages, not the service overview pages
		if (
			(slugPath.startsWith("setup/backend/auth/") ||
				slugPath.startsWith("service/auth/")) &&
			(slugPath.includes("impersonateUser") ||
				slugPath.includes("banUser") ||
				slugPath.includes("unbanUser") ||
				slugPath.includes("removeUser") ||
				slugPath.includes("setRole") ||
				slugPath.includes("createUser") ||
				slugPath.includes("updateUser") ||
				slugPath.includes("listUsers") ||
				slugPath.includes("listUserSessions") ||
				slugPath.includes("revokeUserSession") ||
				slugPath.includes("revokeUserSessions") ||
				slugPath.includes("setUserPassword") ||
				slugPath.includes("api/auth/v1/") ||
				slugPath.includes("getApiAuth") ||
				slugPath.includes("socialSignIn"))
		) {
			return false;
		}

		// Include service overview pages (they should be statically generated)
		return true;
	});
}

export async function generateMetadata(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;

	// If we're on the home page, return default metadata
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
