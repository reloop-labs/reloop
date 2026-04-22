import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import type { PageTreeItem } from "./types";

// This is a simplified source loader that replaces fumadocs-core.
export const source = {
	getPage: (slug?: string[]) => {
		const slugPath = slug?.join("/") || "index";
		const filePath = path.join(
			process.cwd(),
			"content/docs",
			`${slugPath}.mdx`,
		);

		if (!fs.existsSync(filePath)) {
			return null;
		}

		const fileContent = fs.readFileSync(filePath, "utf8");
		const { data: frontmatter, content } = matter(fileContent);

		const toc: { title: string; url: string; depth: number }[] = [];
		const headingRegex = /^(##|###)\s+(.*)$/gm;
		for (const match of content.matchAll(headingRegex)) {
			if (!match[1] || !match[2]) continue;
			const depth = match[1].length;
			const title = match[2].trim();
			const slugId = title
				.toLowerCase()
				.replace(/[^\w\- ]+/g, "")
				.replace(/\s+/g, "-");
			toc.push({ title, url: `#${slugId}`, depth });
		}

		return {
			data: {
				title: frontmatter.title || "Docs",
				description: frontmatter.description || "",
				body: (props: { components?: MDXComponents }) => (
					<MDXRemote source={content} components={props.components} />
				),
				toc,
			},
			url: `/${slugPath === "index" ? "introduction" : slugPath}`,
		};
	},
	pageTree: {
		children: [
			{
				type: "separator",
				name: "Documentation",
			},
			{
				type: "page",
				name: "Introduction",
				url: "/introduction",
			},
			{
				type: "separator",
				name: "Quickstart",
			},
			{
				type: "folder",
				name: "Node.js",
				children: [
					{ type: "page", name: "Introduction", url: "/sdk/nodejs/index" },
					{ type: "page", name: "Next.js", url: "/sdk/nodejs/nextjs" },
					{ type: "page", name: "Remix", url: "/sdk/nodejs/remix" },
					{ type: "page", name: "Nuxt", url: "/sdk/nodejs/nuxt" },
					{ type: "page", name: "SvelteKit", url: "/sdk/nodejs/sveltekit" },
					{ type: "page", name: "Express", url: "/sdk/nodejs/express" },
					{ type: "page", name: "RedwoodJS", url: "/sdk/nodejs/redwoodjs" },
					{ type: "page", name: "Hono", url: "/sdk/nodejs/hono" },
					{ type: "page", name: "Bun", url: "/sdk/nodejs/bun" },
					{ type: "page", name: "Astro", url: "/sdk/nodejs/astro" },
					{ type: "page", name: "Railway", url: "/sdk/nodejs/railway" },
					{ type: "page", name: "Encore", url: "/sdk/nodejs/encore" },
				],
			},
			{
				type: "folder",
				name: "Serverless",
				children: [
					{
						type: "page",
						name: "Vercel Functions",
						url: "/sdk/serverless/vercel-functions",
					},
					{
						type: "page",
						name: "Supabase Edge Functions",
						url: "/sdk/serverless/supabase-edge-functions",
					},
					{
						type: "page",
						name: "Cloudflare Workers",
						url: "/sdk/serverless/cloudflare-workers",
					},
					{
						type: "page",
						name: "Deno Deploy",
						url: "/sdk/serverless/deno-deploy",
					},
				],
			},
			{ type: "page", name: "PHP", url: "/sdk/php/index" },
			{ type: "page", name: "Ruby", url: "/sdk/ruby/introduction" },
			{ type: "page", name: "Python", url: "/sdk/python/index" },
			{ type: "page", name: "Go", url: "/sdk/go/index" },
			{ type: "page", name: "Rust", url: "/sdk/rust/index" },
			{ type: "page", name: "Elixir", url: "/sdk/elixir/index" },
			{ type: "page", name: "Java", url: "/sdk/java/index" },
			{ type: "page", name: ".NET", url: "/sdk/dotnet/index" },
			{ type: "page", name: "SMTP", url: "/sdk/smtp/index" },
			{ type: "page", name: "CLI", url: "/sdk/cli/index" },
		] as PageTreeItem[],
	},
	generateParams: () => {
		return [];
	},
};
