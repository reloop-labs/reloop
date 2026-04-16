import type { TemplateBlock } from "@reloop/db/schema";
import { createId } from "@paralleldrive/cuid2";

// ============ Block Type Constants ============
export type BlockType =
	| "heading"
	| "text"
	| "button"
	| "image"
	| "divider"
	| "spacer"
	| "section"
	| "columns"
	| "html";

export type BlockCategory = "text" | "media" | "actions" | "layout";

// ============ Block Props Interfaces ============
export interface HeadingProps {
	level: 1 | 2 | 3;
	text: string;
	color: string;
	fontFamily: string;
	fontSize: number;
	align: "left" | "center" | "right";
	fontWeight: number;
}

export interface TextProps {
	text: string;
	color: string;
	fontFamily: string;
	fontSize: number;
	lineHeight: number;
	align: "left" | "center" | "right";
}

export interface ButtonProps {
	text: string;
	url: string;
	bgColor: string;
	textColor: string;
	borderRadius: number;
	paddingX: number;
	paddingY: number;
	align: "left" | "center" | "right";
	fullWidth: boolean;
	fontFamily: string;
	fontSize: number;
	fontWeight: number;
}

export interface ImageProps {
	src: string;
	alt: string;
	width: string;
	height: string;
	align: "left" | "center" | "right";
	link: string;
}

export interface DividerProps {
	color: string;
	thickness: number;
	style: "solid" | "dashed" | "dotted";
	width: string; // e.g., "100%" or "80%"
}

export interface SpacerProps {
	height: number;
}

export interface SectionProps {
	bgColor: string;
	padding: number;
	borderRadius: number;
}

export interface ColumnsProps {
	columns: number;
	widths: number[];
	gap: number;
}

export interface HtmlProps {
	code: string;
}

// ============ Block Props Type Map ============
export type BlockPropsMap = {
	heading: HeadingProps;
	text: TextProps;
	button: ButtonProps;
	image: ImageProps;
	divider: DividerProps;
	spacer: SpacerProps;
	section: SectionProps;
	columns: ColumnsProps;
	html: HtmlProps;
};

// ============ Default Props ============
export const DEFAULT_BLOCK_PROPS: {
	[K in BlockType]: BlockPropsMap[K];
} = {
	heading: {
		level: 1,
		text: "Heading",
		color: "#000000",
		fontFamily: "Inter, sans-serif",
		fontSize: 32,
		align: "left",
		fontWeight: 700,
	},
	text: {
		text: "Start writing your content here...",
		color: "#374151",
		fontFamily: "Inter, sans-serif",
		fontSize: 16,
		lineHeight: 1.6,
		align: "left",
	},
	button: {
		text: "Click me",
		url: "https://",
		bgColor: "#000000",
		textColor: "#FFFFFF",
		borderRadius: 6,
		paddingX: 24,
		paddingY: 12,
		align: "center",
		fullWidth: false,
		fontFamily: "Inter, sans-serif",
		fontSize: 14,
		fontWeight: 600,
	},
	image: {
		src: "",
		alt: "Image description",
		width: "100%",
		height: "auto",
		align: "center",
		link: "",
	},
	divider: {
		color: "#E5E7EB",
		thickness: 1,
		style: "solid",
		width: "100%",
	},
	spacer: {
		height: 32,
	},
	section: {
		bgColor: "transparent",
		padding: 16,
		borderRadius: 0,
	},
	columns: {
		columns: 2,
		widths: [50, 50],
		gap: 16,
	},
	html: {
		code: "<!-- Your HTML here -->",
	},
};

// ============ Block Definitions (Registry) ============
export interface BlockDefinition {
	type: BlockType;
	label: string;
	icon: string;
	category: BlockCategory;
	description: string;
	hasChildren: boolean;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
	// Text category
	{
		type: "heading",
		label: "Heading",
		icon: "heading",
		category: "text",
		description: "Large title text",
		hasChildren: false,
	},
	{
		type: "text",
		label: "Text",
		icon: "text",
		category: "text",
		description: "Paragraph text",
		hasChildren: false,
	},
	// Media category
	{
		type: "image",
		label: "Image",
		icon: "image-1",
		category: "media",
		description: "Upload or link an image",
		hasChildren: false,
	},
	// Actions category
	{
		type: "button",
		label: "Button",
		icon: "cursor-click-1",
		category: "actions",
		description: "Call-to-action button",
		hasChildren: false,
	},
	// Layout category
	{
		type: "divider",
		label: "Divider",
		icon: "minus",
		category: "layout",
		description: "Horizontal line separator",
		hasChildren: false,
	},
	{
		type: "spacer",
		label: "Spacer",
		icon: "expand",
		category: "layout",
		description: "Empty vertical space",
		hasChildren: false,
	},
	{
		type: "section",
		label: "Section",
		icon: "square",
		category: "layout",
		description: "Container with background",
		hasChildren: true,
	},
	{
		type: "columns",
		label: "Columns",
		icon: "layout-grid",
		category: "layout",
		description: "Multi-column layout",
		hasChildren: true,
	},
	{
		type: "html",
		label: "HTML",
		icon: "source-code",
		category: "layout",
		description: "Custom HTML code",
		hasChildren: false,
	},
];

// ============ Category Metadata ============
export const CATEGORY_LABELS: Record<BlockCategory, string> = {
	text: "Text",
	media: "Media",
	actions: "Actions",
	layout: "Layout",
};

export const CATEGORY_ORDER: BlockCategory[] = [
	"text",
	"media",
	"actions",
	"layout",
];

// ============ Factory Function ============
export function createBlock(type: BlockType): TemplateBlock {
	const block: TemplateBlock = {
		id: `block_${createId()}`,
		type,
		props: { ...DEFAULT_BLOCK_PROPS[type] },
	};

	// Initialize children for container blocks
	const def = BLOCK_DEFINITIONS.find((d) => d.type === type);
	if (def?.hasChildren) {
		if (type === "columns") {
			const colProps = block.props as unknown as ColumnsProps;
			// Create empty column containers
			block.children = Array.from({ length: colProps.columns }, () => ({
				id: `block_${createId()}`,
				type: "container" as string,
				props: {},
				children: [],
			}));
		} else {
			block.children = [];
		}
	}

	return block;
}

// ============ Row Presets ============
export interface RowPreset {
	label: string;
	columns: number;
	widths: number[];
}

export const ROW_PRESETS: RowPreset[] = [
	{ label: "1 Column", columns: 1, widths: [100] },
	{ label: "2 Columns", columns: 2, widths: [50, 50] },
	{ label: "2 Columns (1/3 + 2/3)", columns: 2, widths: [33, 67] },
	{ label: "2 Columns (2/3 + 1/3)", columns: 2, widths: [67, 33] },
	{ label: "3 Columns", columns: 3, widths: [33, 33, 34] },
	{ label: "4 Columns", columns: 4, widths: [25, 25, 25, 25] },
];
