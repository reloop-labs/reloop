import { betterFetch } from "@better-fetch/fetch";
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
import { cn } from "@dev/lib/cn";
import { source } from "@dev/lib/source";
import { getMDXComponents } from "@dev/mdx-components";
import { Icon } from "@reloop/ui/components/icon";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

export default async function Page(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDXContent = page.data.body;

	const { data: releases } = await betterFetch<
		{
			id: number;
			tag_name: string;
			name: string;
			body: string;
			html_url: string;
			prerelease: boolean;
			published_at: string;
		}[]
	>("https://api.github.com/repos/reloop-labs/reloop/releases");

	const messages = releases
		?.filter((release) => !release.prerelease)
		.map((release) => ({
			tag: release.tag_name,
			title: release.name,
			content: getContent(release.body),
			date: new Date(release.published_at).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			}),
			url: release.html_url,
		}));

	function getContent(content: string) {
		const lines = content.split("\n");
		const newContext = lines.map((line) => {
			if (line.startsWith("- ")) {
				const mainContent = line.split(";")[0];
				const context = line.split(";")[2];
				const mentions = context
					?.split(" ")
					.filter((word) => word.startsWith("@"))
					.map((mention) => {
						const username = mention.replace("@", "");
						const avatarUrl = `https://github.com/${username}.png`;
						return `[![${mention}](${avatarUrl})](https://github.com/${username})`;
					});
				if (!mentions) {
					return line;
				}
				// Remove &nbsp
				return mainContent.replace(/&nbsp/g, "") + " – " + mentions.join(" ");
			}
			return line;
		});
		return newContext.join("\n");
	}

	if (params?.slug?.[0] === "changelog") {
		return (
			<DocsBody>
				<div className="grid items-start md:grid-cols-2">
					<div className="relative min-h-screen w-full bg-transparent ">
						{/* Diagonal Stripes Background */}
						<div
							className="absolute inset-0 z-0"
							style={{
								backgroundImage:
									"repeating-linear-gradient(45deg, transparent, transparent 2px, #ffffff1a 2px, #ffffff1a 4px)",
							}}
						/>
						<div className="relative top-0 overflow-hidden bg-gradient-to-tr from-transparent via-stone-100/30 to-stone-200/20 px-12 md:sticky md:h-dvh dark:via-stone-950/5 dark:to-transparent/10">
							<div className="mx-auto flex h-full max-w-xl flex-col md:justify-center">
								<h1 className="mt-16 mb-0 font-sans font-semibold text-5xl tracking-tighter">
									All of the changes made will be{" "}
									<span className="">available here.</span>
								</h1>
								<p className=" text-gray-600 text-sm dark:text-gray-300">
									Better Auth is comprehensive authentication library for
									TypeScript that provides a wide range of features to make
									authentication easier and more secure.
								</p>
								<hr className="mt-5 mb-0 bg-gray-300" />
								<div className="mt-0 flex justify-around text-gray-600 sm:gap-x-2 dark:text-gray-300">
									<div className="flex items-center gap-2">
										<Icon name="book-open" className="block h-4 w-4" />
										<p className=" text-gray-600 dark:text-gray-300">
											Documentation
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Icon name="github" className="h-4 w-4" />
										<p className=" text-gray-600 dark:text-gray-300 ">GitHub</p>
									</div>
									<div className="flex items-center gap-2">
										<Icon name="github" className="h-4 w-4" />
										<p className=" text-gray-600 dark:text-gray-300">Discord</p>
									</div>
								</div>
								<div className="absolute bottom-4 flex items-baseline gap-x-2 text-[0.8125rem]/6 text-gray-500 max-md:left-1/2">
									<div className="flex items-center gap-2">
										<Icon name="twitter" className="h-4 w-4" />
										<p className=" text-gray-600 dark:text-gray-300">Reloop</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="relative h-full bg-[#ffffff1a] p-12">
						<div className="h-full overflow-y-auto rounded bg-[#0c0a0a] p-4">
							<Markdown
								rehypePlugins={[[rehypeHighlight]]}
								components={{
									pre: (props) => (
										<defaultMdxComponents.pre
											{...props}
											className={cn(props.className, "my-2 ml-10")}
										/>
									),
									h2: (props) => (
										<h2
											id={props.children?.toString().split("date=")[0].trim()} // Extract ID dynamically
											className="before:-mt-[10px] relative mb-6 flex flex-col justify-center font-bold text-2xl tracking-tighter before:block before:h-[65px] before:content-['']"
											{...props}
										>
											<div className="sticky top-0 left-[-9.9rem] hidden md:block">
												<time className="flex items-center gap-2 font-normal text-gray-500 text-sm tracking-normal md:absolute md:left-[-9.8rem] dark:text-white/80">
													{props.children?.toString().includes("date=") &&
														props.children?.toString().split("date=")[1]}

													<div className="h-[1px] w-4 bg-black dark:bg-white/60" />
												</time>
											</div>
											<Link
												href={
													props.children
														?.toString()
														.split("date=")[0]
														.trim()
														.endsWith(".00")
														? `/changelogs/${props.children
																?.toString()
																.split("date=")[0]
																.trim()}`
														: `#${props.children
																?.toString()
																.split("date=")[0]
																.trim()}`
												}
											>
												{props.children?.toString().split("date=")[0].trim()}
											</Link>
											<p className="hidden font-normal text-xs opacity-60">
												{props.children?.toString().includes("date=") &&
													props.children?.toString().split("date=")[1]}
											</p>
										</h2>
									),
									h3: (props) => (
										<h3 className="py-1 text-xl tracking-tighter" {...props}>
											{props.children?.toString()?.trim()}
											<hr className="my-1 mb-2 h-[1px] bg-input" />
										</h3>
									),
									p: (props) => <p className="my-0 ml-10 text-sm" {...props} />,
									ul: (props) => (
										<ul
											className="ml-10 list-disc text-[0.855rem] text-gray-600 dark:text-gray-300"
											{...props}
										/>
									),
									li: (props) => <li className="my-1" {...props} />,
									a: ({ className, ...props }: any) => (
										<Link
											target="_blank"
											className={cn("font-medium underline", className)}
											{...props}
										/>
									),
									strong: (props) => (
										<strong className="font-semibold" {...props} />
									),
									img: (props) => (
										<img
											className="inline-block h-6 w-6 rounded-full border opacity-70"
											{...props}
											style={{ maxWidth: "100%" }}
											alt={props.alt || "Image"}
										/>
									),
								}}
							>
								{messages
									?.map((message) => {
										return `
## ${message.title} date=${message.date}

${message.content}
								`;
									})
									.join("\n")}
							</Markdown>
						</div>
					</div>
				</div>
			</DocsBody>
		);
	}

	return (
		<DocsLayout
			tabMode="navbar"
			tree={source.pageTree}
			{...baseOptions}
			nav={{ ...baseOptions.nav, mode: "top" }}
			sidebar={{
				collapsible: false,
				tabs: [
					{
						title: "API",
						url: "/api-reference",
					},
					{
						title: "Self Host",
						url: "/how-to-self-host",
					},
					{
						title: "Contribute",
						url: "/how-to-contribute",
					},
				],
			}}
		>
			<DocsPage
				tableOfContent={{ style: "clerk" }}
				toc={page.data.toc}
				full={page.data.full}
			>
				<DocsTitle>{page.data.title}</DocsTitle>
				<DocsDescription>{page.data.description}</DocsDescription>
				<div className="flex flex-row items-center gap-2 border-b pt-2 pb-6">
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
