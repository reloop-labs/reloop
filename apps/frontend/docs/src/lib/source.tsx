import fs from "node:fs";
import path from "node:path";
import { SimpleIcon } from "@reloop/fe-docs/components/mdx/SimpleIcon";
import { Icon } from "@reloop/ui/icon";
import matter from "gray-matter";
import type { MDXComponents } from "mdx/types";
import { MDXRemote } from "next-mdx-remote/rsc";
import type React from "react";
import remarkGfm from "remark-gfm";
import type { PageNode, PageTreeItem, TOCItem } from "./types";
import { timestamp } from "./watcher-trigger";

// Log timestamp load to satisfy webpack/turbopack dependency tracing
if (process.env.NODE_ENV === "development") {
	console.log("[Reloop HMR] Active module revision timestamp:", timestamp);
}

function getDocsDir(): string {
	const paths = [
		"/app/content/docs", // Verified path from debug route
		path.join(process.cwd(), "content/docs"),
		path.join(process.cwd(), "apps/frontend/docs/content/docs"),
		path.resolve("./content/docs"),
		path.resolve("./apps/frontend/docs/content/docs"),
	];

	for (const p of paths) {
		if (fs.existsSync(p)) {
			return p;
		}
	}

	console.error(
		"Could not find docs directory in any of the following locations:",
		paths,
	);
	return paths[0]!; // Fallback to default
}

const docsDir = getDocsDir();

// Bridge dynamic filesystem changes into Next.js's Fast Refresh dependency tree
if (process.env.NODE_ENV === "development") {
	setupDevWatcher();
}

function setupDevWatcher() {
	if (typeof window !== "undefined" || (global as any).__reloop_watcher__)
		return;
	(global as any).__reloop_watcher__ = true;

	const triggerFile = path.join(process.cwd(), "src/lib/watcher-trigger.ts");

	let timeout: ReturnType<typeof setTimeout> | null = null;
	try {
		fs.watch(docsDir, { recursive: true }, (eventType, filename) => {
			if (
				filename &&
				(filename.endsWith(".mdx") || filename.endsWith(".json"))
			) {
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(() => {
					try {
						fs.writeFileSync(
							triggerFile,
							`export const timestamp = ${Date.now()};\n`,
							"utf8",
						);
					} catch (err) {
						console.error(
							"[Reloop HMR] Failed to update watcher trigger file:",
							err,
						);
					}
				}, 150);
			}
		});
		console.log(
			`[Reloop HMR Watcher] Successfully watching ${docsDir} for MDX changes.`,
		);
	} catch (err) {
		console.error("[Reloop HMR Watcher] Failed to initialize watcher:", err);
	}
}

function buildTree(dir: string, base = ""): PageTreeItem[] {
	const metaPath = path.join(dir, "meta.json");
	if (!fs.existsSync(dir)) {
		console.warn(`Directory not found during buildTree: ${dir}`);
		return [];
	}

	let pages: string[] = [];
	let meta: any = {};

	if (fs.existsSync(metaPath)) {
		meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
		pages = meta.pages || [];
	} else {
		// Fallback: read all .mdx files and directories
		pages = fs
			.readdirSync(dir)
			.map((f) => {
				if (fs.statSync(path.join(dir, f)).isDirectory()) return f;
				if (f.endsWith(".mdx") && f !== "introduction.mdx" && f !== "index.mdx")
					return f.replace(".mdx", "");
				return null;
			})
			.filter(Boolean) as string[];
	}

	return pages
		.map((item: string): PageTreeItem | null => {
			if (item.startsWith("---") && item.endsWith("---")) {
				return {
					type: "separator",
					name: item.replace(/-/g, ""),
				} as PageTreeItem;
			}

			// 1. Resolve item path and handle "index" mapping
			const absolutePath = path.resolve(dir, item);
			const url = `/${path
				.join(base, item === "index" ? "" : item)
				.replace(/\\/g, "/")
				.replace(/\/$/, "")}`;

			// 2. Check if it's a direct .mdx file
			let mdxPath = item.endsWith(".mdx")
				? absolutePath
				: `${absolutePath}.mdx`;
			if (!fs.existsSync(mdxPath) && item === "index") {
				mdxPath = path.join(dir, "introduction.mdx");
			}

			if (fs.existsSync(mdxPath)) {
				const { data } = matter(fs.readFileSync(mdxPath, "utf8"));
				const iconName = data.icon;

				let sidebarIcon: React.ReactNode;
				if (iconName) {
					if (iconName.startsWith("si") || iconName.startsWith("Si")) {
						sidebarIcon = (
							<SimpleIcon
								name={iconName}
								className="h-3.5 w-3.5 shrink-0"
								color="currentColor"
							/>
						);
					} else {
						sidebarIcon = <Icon name={iconName} className="h-4 w-4" />;
					}
				}

				return {
					type: "page",
					name:
						data.sidebarTitle || data.title || path.basename(mdxPath, ".mdx"),
					url: url || "/introduction",
					icon: sidebarIcon,
					method: (data._openapi as any)?.method,
				} as PageTreeItem;
			}

			// 3. Check if it's a directory
			if (
				fs.existsSync(absolutePath) &&
				fs.statSync(absolutePath).isDirectory()
			) {
				const children = buildTree(absolutePath, path.join(base, item));
				const indexPath = path.join(absolutePath, "index.mdx");

				// Try to get folder title from its own meta.json
				const childMetaPath = path.join(absolutePath, "meta.json");
				let folderName = item.split("/").filter(Boolean).pop() || item;
				let folderIcon: React.ReactNode;

				if (fs.existsSync(childMetaPath)) {
					try {
						const childMeta = JSON.parse(
							fs.readFileSync(childMetaPath, "utf8"),
						);
						if (childMeta.title) folderName = childMeta.title;
						if (childMeta.icon) {
							if (
								childMeta.icon.startsWith("si") ||
								childMeta.icon.startsWith("Si")
							) {
								folderIcon = (
									<SimpleIcon
										name={childMeta.icon}
										className="h-3.5 w-3.5 shrink-0"
										color="currentColor"
									/>
								);
							} else {
								folderIcon = <Icon name={childMeta.icon} className="h-4 w-4" />;
							}
						}
					} catch (e) {}
				} else {
					// Prettify folder name
					if (folderName.toLowerCase() === "nodejs") folderName = "Node.js";
					else
						folderName =
							folderName.charAt(0).toUpperCase() + folderName.slice(1);
				}

				if (children.length > 0) {
					return {
						type: "folder",
						name: folderName,
						url,
						children,
						icon: folderIcon,
					} as PageTreeItem;
				}

				if (fs.existsSync(indexPath)) {
					return {
						type: "page",
						name: folderName,
						url,
						icon: folderIcon,
					} as PageTreeItem;
				}
			}

			return { type: "page", name: item, url } as PageTreeItem;
		})
		.filter((item): item is PageTreeItem => item !== null);
}

export const source = {
	getPage: (slug?: string[]) => {
		try {
			const slugPath = slug?.join("/") || "index";
			let filePath = path.join(docsDir, `${slugPath}.mdx`);

			if (!fs.existsSync(filePath)) {
				// Try index.mdx if it's a directory
				const indexPath = path.join(docsDir, slugPath, "index.mdx");
				if (fs.existsSync(indexPath)) {
					filePath = indexPath;
				} else {
					return null;
				}
			}

			const fileContent = fs.readFileSync(filePath, "utf-8");
			const { data: frontmatter, content } = matter(fileContent);
			const toc: TOCItem[] = [];
			const headingRegex = /^(##|###)\s+(.*)$/gm;
			for (const match of content.matchAll(headingRegex)) {
				if (!match[1] || !match[2]) continue;
				const title = match[2].trim();
				const url = `#${title
					.toLowerCase()
					.replace(/[^\w\- ]+/g, "")
					.replace(/\s+/g, "-")}`;
				toc.push({ title, url, depth: match[1].length });
			}

			return {
				data: {
					title: frontmatter.title || "Docs",
					description: frontmatter.description || "",
					full: frontmatter.full === true,
					body: (props: { components?: MDXComponents }) => (
						<MDXRemote
							source={content}
							components={props.components}
							options={{
								mdxOptions: {
									remarkPlugins: [remarkGfm],
								},
							}}
						/>
					),
					toc,
					faq: Array.isArray(frontmatter.faq) ? frontmatter.faq : null,
					_apiData: frontmatter._apiData || null,
					_openapi: frontmatter._openapi || null,
					raw: fileContent,
				},
				url: `/${slugPath === "index" ? "introduction" : slugPath}`,
				filePath: filePath.includes("content/docs")
					? `apps/frontend/docs/content/docs${filePath.split("content/docs")[1]}`
					: `apps/frontend/docs/content/docs/${slugPath}.mdx`,
			};
		} catch (error: any) {
			console.error(
				`FATAL ERROR in getPage for slug ${slug?.join("/")}:`,
				error,
			);
			return {
				data: {
					title: "Error Loading Content",
					description: `We encountered an error while reading this documentation page: ${error.message}. Paths tried: ${docsDir}`,
					full: false,
					body: () => (
						<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
							<h2 className="font-bold">System Error</h2>
							<p>Failed to read file from disk.</p>
							<pre className="mt-2 overflow-auto text-xs">{error.stack}</pre>
						</div>
					),
					toc: [],
					_apiData: null,
				},
				url: "#",
				filePath: "",
			};
		}
	},

	get pageTree() {
		return { children: buildTree(docsDir) };
	},
	generateParams: () => {
		const getSlugs = (
			dir: string,
			base: string[] = [],
		): { slug: string[] }[] => {
			if (!fs.existsSync(dir)) {
				console.warn(`Directory not found during generateParams: ${dir}`);
				return [];
			}
			const results: { slug: string[] }[] = [];
			const items = fs.readdirSync(dir);
			for (const item of items) {
				const full = path.join(dir, item);
				if (fs.statSync(full).isDirectory()) {
					results.push(...getSlugs(full, [...base, item]));
				} else if (item.endsWith(".mdx")) {
					const name = path.basename(item, ".mdx");
					if (name === "index") {
						// index.mdx maps to the parent directory slug
						// e.g., quickstart/dotnet/index.mdx → slug ["quickstart", "dotnet"]
						if (base.length > 0) {
							results.push({ slug: [...base] });
						}
						// Skip root-level index.mdx (handled by { slug: [] } in generateStaticParams)
					} else {
						results.push({ slug: [...base, name] });
					}
				}
			}
			return results;
		};
		return getSlugs(docsDir);
	},
	findNeighbor: (url: string) => {
		const tree = buildTree(docsDir);
		const pages: PageNode[] = [];

		const flatten = (items: PageTreeItem[]) => {
			for (const item of items) {
				if (item.type === "page") {
					pages.push(item);
				} else if (item.type === "folder") {
					flatten(item.children);
				}
			}
		};

		flatten(tree);
		const index = pages.findIndex((p) => p.url === url);

		return {
			previous: index > 0 ? pages[index - 1] : undefined,
			next: index < pages.length - 1 ? pages[index + 1] : undefined,
		};
	},
};
