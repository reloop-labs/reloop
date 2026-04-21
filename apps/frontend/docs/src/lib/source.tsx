import type { PageTreeItem } from "./types";

// This is a simplified source loader that replaces fumadocs-core.
export const source = {
	getPage: (slug?: string[]) => {
		const path = slug?.join("/") || "index";

		// Mock data for now to keep the UI working
		return {
			data: {
				title: "Docs",
				description: "Documentation",
				body: (props: { components?: any }) => <div>Content for {path}</div>,
				toc: [],
			},
			url: `/docs/${path}`,
		};
	},
	pageTree: {
		children: [
			{
				type: "page",
				name: "Introduction",
				url: "/",
			},
		] as PageTreeItem[],
	},
	generateParams: () => {
		return [];
	},
};
