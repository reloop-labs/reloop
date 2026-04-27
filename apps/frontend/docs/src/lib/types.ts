import type { ReactNode } from "react";

export interface TOCItem {
	title: ReactNode;
	url: string;
	depth: number;
}

export type PageTreeItem = PageNode | FolderNode | SeparatorNode;

export interface PageNode {
	type: "page";
	name: ReactNode;
	url: string;
	icon?: ReactNode;
	method?: string;
}

export interface FolderNode {
	type: "folder";
	name: ReactNode;
	url: string;
	children: PageTreeItem[];
	icon?: ReactNode;
	index?: PageNode;
}

export interface SeparatorNode {
	type: "separator";
	name?: ReactNode;
}
