import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { MDXComponents } from "mdx/types";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { PageTreeItem, TOCItem } from "./types";

const docsDir = path.join(process.cwd(), "content/docs");

function getTitle(filePath: string): string {
	try {
		const content = fs.readFileSync(filePath, "utf8");
		return matter(content).data.title || path.basename(filePath, ".mdx");
	} catch (e) {
		return path.basename(filePath, ".mdx");
	}
}

function buildTree(dir: string, base = ""): PageTreeItem[] {
	const metaPath = path.join(dir, "meta.json");
	let pages: string[] = [];

	if (fs.existsSync(metaPath)) {
		const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
		pages = meta.pages || [];
	} else {
		// Fallback: read all .mdx files and directories
		pages = fs.readdirSync(dir).map(f => {
			if (fs.statSync(path.join(dir, f)).isDirectory()) return f;
			if (f.endsWith(".mdx") && f !== "introduction.mdx" && f !== "index.mdx") return f.replace(".mdx", "");
			return null;
		}).filter(Boolean) as string[];
	}

	return pages
		.map((item: string): PageTreeItem | null => {
			if (item.startsWith("---") && item.endsWith("---")) {
				return { type: "separator", name: item.replace(/-/g, "") } as PageTreeItem;
			}

			// 1. Resolve item path and handle "index" mapping
			const resolvedItem = item === "index" ? "introduction" : item;
			const absolutePath = path.resolve(dir, item);
			const url = `/${path.join(base, resolvedItem).replace(/\\/g, "/")}`;

			// 2. Check if it's a direct .mdx file (at the actual path or mapped from index)
			const mdxPath = item === "index" ? path.join(dir, "introduction.mdx") : `${absolutePath}.mdx`;
			if (fs.existsSync(mdxPath)) {
				return { type: "page", name: getTitle(mdxPath), url } as PageTreeItem;
			}

			// 3. Check if it's a directory
			if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
				const children = buildTree(absolutePath, path.join(base, item));
				const indexPath = path.join(absolutePath, "index.mdx");

				// Try to get folder title from its own meta.json
				const childMetaPath = path.join(absolutePath, "meta.json");
				let folderName = item.split("/").filter(Boolean).pop() || item;
				if (fs.existsSync(childMetaPath)) {
					try {
						const childMeta = JSON.parse(fs.readFileSync(childMetaPath, "utf8"));
						if (childMeta.title) folderName = childMeta.title;
					} catch (e) {}
				} else {
					// Prettify folder name (e.g., nodejs -> Node.js)
					if (folderName.toLowerCase() === "nodejs") folderName = "Node.js";
					else folderName = folderName.charAt(0).toUpperCase() + folderName.slice(1);
				}

				if (children.length > 0) {
					return { type: "folder", name: folderName, children } as PageTreeItem;
				}

				if (fs.existsSync(indexPath)) {
					return { type: "page", name: folderName, url } as PageTreeItem;
				}
			}

			return { type: "page", name: item, url } as PageTreeItem;
		})
		.filter((item): item is PageTreeItem => item !== null);
}

export const source = {
	getPage: (slug?: string[]) => {
		const slugPath = slug?.join("/") || "index";
		const filePath = path.join(docsDir, `${slugPath}.mdx`);

		if (!fs.existsSync(filePath)) return null;

		const { data: frontmatter, content } = matter(
			fs.readFileSync(filePath, "utf8"),
		);
		const toc: TOCItem[] = [];
		const headingRegex = /^(##|###)\s+(.*)$/gm;
		for (const match of content.matchAll(headingRegex)) {
			if (!match[1] || !match[2]) continue;
			const title = match[2].trim();
			const url = `#${title
				.toLowerCase()
				.replace(/[^\w ]+/g, "")
				.replace(/\s+/g, "-")}`;
			toc.push({ title, url, depth: match[1].length });
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
	get pageTree() {
		return { children: buildTree(docsDir) };
	},
	generateParams: () => {
		const getSlugs = (
			dir: string,
			base: string[] = [],
		): { slug: string[] }[] => {
			const results: { slug: string[] }[] = [];
			const items = fs.readdirSync(dir);
			for (const item of items) {
				const full = path.join(dir, item);
				if (fs.statSync(full).isDirectory()) {
					results.push(...getSlugs(full, [...base, item]));
				} else if (item.endsWith(".mdx")) {
					const slug = [...base, path.basename(item, ".mdx")];
					if (!(slug.length === 1 && slug[0] === "index"))
						results.push({ slug });
				}
			}
			return results;
		};
		return getSlugs(docsDir);
	},
};
