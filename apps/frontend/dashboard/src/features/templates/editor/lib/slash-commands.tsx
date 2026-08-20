import { imageSlashCommand } from "@react-email/editor/plugins";
import {
	defaultSlashCommands,
	PanelBottomIcon,
	type SlashCommandItem,
} from "@react-email/editor/ui";
import { Icon } from "@reloop/ui/icon";
import type { Editor } from "@tiptap/core";

export const variableSlashCommand: SlashCommandItem = {
	title: "Variable",
	description: "Create and insert a dynamic variable",
	icon: <Icon name="brackets" className="h-5 w-5" />,
	category: "Variables",
	searchTerms: ["variable", "dynamic", "custom", "tag", "bracket"],
	command: ({ editor, range }) => {
		editor.chain().focus().deleteRange(range).insertContent("{{").run();
	},
};

export const footerSlashCommand: SlashCommandItem = {
	title: "Footer",
	description: "Unsubscribe and legal footer",
	icon: <PanelBottomIcon size={20} />,
	category: "Footer",
	searchTerms: ["footer", "unsubscribe", "legal", "bottom"],
	command: ({ editor, range }) => {
		editor
			.chain()
			.focus()
			.deleteRange(range)
			.insertContent(
				'<p style="text-align:center;font-size:12px;line-height:20px;color:#888888">You received this email because you signed up.<br/><a href="#">Unsubscribe</a> · <a href="#">Privacy</a></p>',
			)
			.run();
	},
};

/** Same blocks as the canvas `/` menu, plus Variable, Footer, and Image. */
export const editorSlashCommands: SlashCommandItem[] = [
	...defaultSlashCommands,
	imageSlashCommand,
	variableSlashCommand,
	footerSlashCommand,
];

const WIDGET_SECTION_ORDER = [
	"Text",
	"Layout",
	"Variables",
	"Footer",
	"Images",
] as const;

const WIDGET_SECTION_BY_TITLE: Record<string, string> = {
	Text: "Text",
	Title: "Text",
	Subtitle: "Text",
	Heading: "Text",
	"Bullet list": "Text",
	"Numbered list": "Text",
	Quote: "Text",
	"Code block": "Text",
	Button: "Layout",
	Divider: "Layout",
	Section: "Layout",
	"2 columns": "Layout",
	"3 columns": "Layout",
	"4 columns": "Layout",
	Variable: "Variables",
	Footer: "Footer",
	Image: "Images",
};

export function groupWidgetSections(
	items: SlashCommandItem[] = editorSlashCommands,
): SlashCommandGroup<SlashCommandItem>[] {
	const buckets = new Map<string, SlashCommandItem[]>();
	for (const section of WIDGET_SECTION_ORDER) {
		buckets.set(section, []);
	}

	for (const item of items) {
		const section = WIDGET_SECTION_BY_TITLE[item.title];
		if (!section) continue;
		buckets.get(section)?.push(item);
	}

	return WIDGET_SECTION_ORDER.map((category) => ({
		category,
		items: buckets.get(category) ?? [],
	})).filter((group) => group.items.length > 0);
}

export function runSlashCommand(editor: Editor, item: SlashCommandItem) {
	editor.commands.focus();
	const { from, to } = editor.state.selection;
	item.command({ editor, range: { from, to } });
}

export type SlashCommandGroup<T extends { category: string }> = {
	category: string;
	items: T[];
};

export function groupByCategory<T extends { category: string }>(
	items: T[],
): SlashCommandGroup<T>[] {
	const groups: SlashCommandGroup<T>[] = [];
	const indexByCategory = new Map<string, number>();

	for (const item of items) {
		const category = item.category || "Other";
		const existing = indexByCategory.get(category);
		if (existing === undefined) {
			indexByCategory.set(category, groups.length);
			groups.push({ category, items: [item] });
			continue;
		}
		groups[existing]?.items.push(item);
	}

	return groups;
}
