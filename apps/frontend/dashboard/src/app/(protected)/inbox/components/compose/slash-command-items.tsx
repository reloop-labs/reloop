"use client";

import type { Editor, Range } from "@tiptap/core";
import {
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	Quote,
	Text,
} from "lucide-react";
import type { ReactNode } from "react";

export type SlashCommandItem = {
	title: string;
	description: string;
	searchTerms: string[];
	icon: ReactNode;
	command: (props: { editor: Editor; range: Range }) => void;
};

export const slashCommandItems: SlashCommandItem[] = [
	{
		title: "Text",
		description: "Just start typing with plain text.",
		searchTerms: ["p", "paragraph"],
		icon: <Text size={18} />,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.toggleNode("paragraph", "paragraph")
				.run();
		},
	},
	{
		title: "Heading 1",
		description: "Big section heading.",
		searchTerms: ["title", "big", "large", "h1"],
		icon: <Heading1 size={18} />,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 1 })
				.run();
		},
	},
	{
		title: "Heading 2",
		description: "Medium section heading.",
		searchTerms: ["subtitle", "medium", "h2"],
		icon: <Heading2 size={18} />,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 2 })
				.run();
		},
	},
	{
		title: "Heading 3",
		description: "Small section heading.",
		searchTerms: ["subtitle", "small", "h3"],
		icon: <Heading3 size={18} />,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 3 })
				.run();
		},
	},
	{
		title: "Bullet List",
		description: "Create a simple bullet list.",
		searchTerms: ["unordered", "point", "ul"],
		icon: <List size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBulletList().run();
		},
	},
	{
		title: "Numbered List",
		description: "Create a list with numbering.",
		searchTerms: ["ordered", "ol"],
		icon: <ListOrdered size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleOrderedList().run();
		},
	},
	{
		title: "Quote",
		description: "Capture a quote.",
		searchTerms: ["blockquote", "citation"],
		icon: <Quote size={18} />,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBlockquote().run();
		},
	},
];

export function filterSlashCommands(query: string) {
	const q = query.trim().toLowerCase();
	if (!q) return slashCommandItems;
	return slashCommandItems.filter((item) => {
		if (item.title.toLowerCase().includes(q)) return true;
		if (item.description.toLowerCase().includes(q)) return true;
		return item.searchTerms.some((t) => t.toLowerCase().includes(q));
	});
}
