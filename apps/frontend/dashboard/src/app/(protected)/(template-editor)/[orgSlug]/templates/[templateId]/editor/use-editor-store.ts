import type { TemplateBlock } from "@reloop/db/schema";
import { create } from "zustand";
import { type BlockType, createBlock } from "./block-types";

// ============ Global Settings ============
export interface GlobalSettings {
	contentWidth: number;
	contentAlign: "left" | "center" | "right";
	backgroundColor: string;
	contentBackgroundColor: string;
	fontFamily: string;
	textColor: string;
	linkColor: string;
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
	contentWidth: 600,
	contentAlign: "center",
	backgroundColor: "#F3F4F6",
	contentBackgroundColor: "#FFFFFF",
	fontFamily: "Inter, sans-serif",
	textColor: "#374151",
	linkColor: "#3B82F6",
};

// ============ Editor State ============
export type ViewMode = "desktop" | "mobile";

interface HistoryEntry {
	blocks: TemplateBlock[];
	selectedBlockId: string | null;
}

interface EditorState {
	// Editor Instance Reference (TipTap / React Email Editor)
	editor: any | null;
	setEditor: (editor: any) => void;
	
	tiptapSelection: { nodeName: string | null; attrs: any } | null;
	setTiptapSelection: (nodeName: string | null, attrs: any) => void;

	// Legacy Block data (may be deprecated by Tiptap JSON state)
	blocks: TemplateBlock[];
	selectedBlockId: string | null;

	// View
	viewMode: ViewMode;

	// Global settings
	globalSettings: GlobalSettings;

	// Undo/redo
	undoStack: HistoryEntry[];
	redoStack: HistoryEntry[];

	// Dirty state
	isDirty: boolean;

	// Email metadata
	templateName: string;
	senderName: string;
	fromEmail: string;
	replyTo: string;
	subject: string;

	// Actions — Blocks
	addBlock: (type: BlockType, index?: number) => void;
	removeBlock: (blockId: string) => void;
	updateBlockProps: (
		blockId: string,
		props: Record<string, unknown>,
	) => void;
	moveBlock: (fromIndex: number, toIndex: number) => void;
	duplicateBlock: (blockId: string) => void;

	// Actions — Selection
	selectBlock: (blockId: string | null) => void;

	// Actions — View
	setViewMode: (mode: ViewMode) => void;

	// Actions — Global settings
	updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;

	// Actions — Undo/Redo
	undo: () => void;
	redo: () => void;

	// Actions — Metadata
	setTemplateName: (name: string) => void;
	setSenderName: (name: string) => void;
	setFromEmail: (email: string) => void;
	setReplyTo: (email: string) => void;
	setSubject: (subject: string) => void;

	// Actions — Whole state
	setBlocks: (blocks: TemplateBlock[]) => void;

	// Selectors
	getSelectedBlock: () => TemplateBlock | null;
}

// ============ Helper: Deep clone blocks ============
function cloneBlocks(blocks: TemplateBlock[]): TemplateBlock[] {
	return JSON.parse(JSON.stringify(blocks));
}

// ============ Helper: Find block by ID (recursive) ============
function findBlock(
	blocks: TemplateBlock[],
	id: string,
): TemplateBlock | null {
	for (const block of blocks) {
		if (block.id === id) return block;
		if (block.children) {
			const found = findBlock(block.children, id);
			if (found) return found;
		}
	}
	return null;
}

// ============ Helper: Find block index at root level ============
function findBlockIndex(blocks: TemplateBlock[], id: string): number {
	return blocks.findIndex((b) => b.id === id);
}

// ============ Helper: Remove block recursively ============
function removeBlockFromList(
	blocks: TemplateBlock[],
	id: string,
): TemplateBlock[] {
	return blocks
		.filter((b) => b.id !== id)
		.map((b) => ({
			...b,
			children: b.children
				? removeBlockFromList(b.children, id)
				: undefined,
		}));
}

// ============ Helper: Update block props recursively ============
function updateBlockInList(
	blocks: TemplateBlock[],
	id: string,
	props: Record<string, unknown>,
): TemplateBlock[] {
	return blocks.map((b) => {
		if (b.id === id) {
			return { ...b, props: { ...b.props, ...props } };
		}
		if (b.children) {
			return {
				...b,
				children: updateBlockInList(b.children, id, props),
			};
		}
		return b;
	});
}

// ============ Store ============
export const useEditorStore = create<EditorState>((set, get) => ({
	// Editor Reference
	editor: null,
	setEditor: (editor) => set({ editor }),
	
	tiptapSelection: null,
	setTiptapSelection: (nodeName, attrs) => set({ 
		tiptapSelection: { nodeName, attrs },
		selectedBlockId: nodeName ? 'tiptap-selection' : null
	}),

	// Initial state
	blocks: [],
	selectedBlockId: null,
	viewMode: "desktop",
	globalSettings: { ...DEFAULT_GLOBAL_SETTINGS },
	undoStack: [],
	redoStack: [],
	isDirty: false,

	// Email metadata
	templateName: "Untitled Template",
	senderName: "",
	fromEmail: "",
	replyTo: "",
	subject: "",

	// ----- Block Actions -----

	addBlock: (type, index) => {
		const state = get();
		
		// If TipTap editor is available, insert into the document directly
		if (state.editor) {
			const editor = state.editor;
			
			// Simple mapping from BlockType to TipTap HTML/Nodes
			// This will be expanded based on the exact extensions used 
			// from @react-email/editor
			const nodeMap: Record<BlockType, string> = {
				heading: "<h1>New Heading</h1>",
				text: "<p>Start writing your content here...</p>",
				button: '<a href="#" style="background-color: #000; color: #fff; padding: 12px 24px; border-radius: 6px; display: inline-block; cursor: pointer; text-align: center; font-weight: 500; text-decoration: none;">Click me</a>',
				image: '<img src="https://placehold.co/200x200?text=Upload+Image" alt="Placeholder Image" style="display: block; max-width: 100%; border-radius: 8px;" />',
				divider: "<hr>",
				spacer: '<div style="height: 32px"></div>',
				section: '<section><p>New Section</p></section>',
				columns: '<div style="display: flex; gap: 16px;"><div style="flex:1;"><p>Col 1</p></div><div style="flex:1;"><p>Col 2</p></div></div>',
				html: '<div><p>Custom HTML</p></div>'
			};
			
			editor.chain().focus().insertContent(nodeMap[type] || "<p></p>").run();
			
			// We skip local legacy state block arrays since Tiptap maintains the state tree
			return;
		}
		
		// Fallback for legacy blocks tree (will eventually be removed)
		const newBlock = createBlock(type);
		const newBlocks = cloneBlocks(state.blocks);

		const historyEntry: HistoryEntry = {
			blocks: cloneBlocks(state.blocks),
			selectedBlockId: state.selectedBlockId,
		};

		if (index !== undefined && index >= 0 && index <= newBlocks.length) {
			newBlocks.splice(index, 0, newBlock);
		} else {
			newBlocks.push(newBlock);
		}

		set({
			blocks: newBlocks,
			selectedBlockId: newBlock.id,
			undoStack: [...state.undoStack, historyEntry],
			redoStack: [],
			isDirty: true,
		});
	},

	removeBlock: (blockId) => {
		const state = get();
		const historyEntry: HistoryEntry = {
			blocks: cloneBlocks(state.blocks),
			selectedBlockId: state.selectedBlockId,
		};

		const newBlocks = removeBlockFromList(state.blocks, blockId);

		set({
			blocks: newBlocks,
			selectedBlockId:
				state.selectedBlockId === blockId
					? null
					: state.selectedBlockId,
			undoStack: [...state.undoStack, historyEntry],
			redoStack: [],
			isDirty: true,
		});
	},

	updateBlockProps: (blockId, props) => {
		const state = get();

		if (state.editor && blockId === 'tiptap-selection' && state.tiptapSelection?.nodeName) {
			const { nodeName } = state.tiptapSelection;
			
			// Map legacy props to TipTap HTML attributes
			const newAttrs: Record<string, any> = { ...props };
			if (nodeName === 'image' && props.url) {
				newAttrs.src = props.url; // Convert 'url' back to 'src'
			}
			if (nodeName === 'link' && props.url) {
			    newAttrs.href = props.url;
			}
			
			state.editor.chain().focus().updateAttributes(nodeName, newAttrs).run();
			
			// Refresh our store selection state visually
			const updatedAttrs = state.editor.getAttributes(nodeName);
			state.setTiptapSelection(nodeName, updatedAttrs);
			return;
		}

		const historyEntry: HistoryEntry = {
			blocks: cloneBlocks(state.blocks),
			selectedBlockId: state.selectedBlockId,
		};

		const newBlocks = updateBlockInList(state.blocks, blockId, props);

		set({
			blocks: newBlocks,
			undoStack: [...state.undoStack, historyEntry],
			redoStack: [],
			isDirty: true,
		});
	},

	moveBlock: (fromIndex, toIndex) => {
		const state = get();
		const historyEntry: HistoryEntry = {
			blocks: cloneBlocks(state.blocks),
			selectedBlockId: state.selectedBlockId,
		};

		const newBlocks = cloneBlocks(state.blocks);
		const [movedBlock] = newBlocks.splice(fromIndex, 1);
		if (movedBlock) {
			newBlocks.splice(toIndex, 0, movedBlock);
		}

		set({
			blocks: newBlocks,
			undoStack: [...state.undoStack, historyEntry],
			redoStack: [],
			isDirty: true,
		});
	},

	duplicateBlock: (blockId) => {
		const state = get();
		const idx = findBlockIndex(state.blocks, blockId);
		if (idx === -1) return;

		const historyEntry: HistoryEntry = {
			blocks: cloneBlocks(state.blocks),
			selectedBlockId: state.selectedBlockId,
		};

		const original = state.blocks[idx];
		if (!original) return;

		const duplicate: TemplateBlock = {
			...JSON.parse(JSON.stringify(original)),
			id: `block_${Date.now()}`,
		};

		const newBlocks = cloneBlocks(state.blocks);
		newBlocks.splice(idx + 1, 0, duplicate);

		set({
			blocks: newBlocks,
			selectedBlockId: duplicate.id,
			undoStack: [...state.undoStack, historyEntry],
			redoStack: [],
			isDirty: true,
		});
	},

	// ----- Selection -----

	selectBlock: (blockId) => {
		set({ selectedBlockId: blockId });
	},

	// ----- View -----

	setViewMode: (mode) => {
		set({ viewMode: mode });
	},

	// ----- Global Settings -----

	updateGlobalSettings: (settings) => {
		const state = get();
		set({
			globalSettings: { ...state.globalSettings, ...settings },
			isDirty: true,
		});
	},

	// ----- Undo/Redo -----

	undo: () => {
		const state = get();
		if (state.undoStack.length === 0) return;

		const currentEntry: HistoryEntry = {
			blocks: cloneBlocks(state.blocks),
			selectedBlockId: state.selectedBlockId,
		};

		const previousEntry = state.undoStack[state.undoStack.length - 1];
		if (!previousEntry) return;

		set({
			blocks: previousEntry.blocks,
			selectedBlockId: previousEntry.selectedBlockId,
			undoStack: state.undoStack.slice(0, -1),
			redoStack: [...state.redoStack, currentEntry],
			isDirty: true,
		});
	},

	redo: () => {
		const state = get();
		if (state.redoStack.length === 0) return;

		const currentEntry: HistoryEntry = {
			blocks: cloneBlocks(state.blocks),
			selectedBlockId: state.selectedBlockId,
		};

		const nextEntry = state.redoStack[state.redoStack.length - 1];
		if (!nextEntry) return;

		set({
			blocks: nextEntry.blocks,
			selectedBlockId: nextEntry.selectedBlockId,
			undoStack: [...state.undoStack, currentEntry],
			redoStack: state.redoStack.slice(0, -1),
			isDirty: true,
		});
	},

	// ----- Metadata -----

	setTemplateName: (name) => set({ templateName: name, isDirty: true }),
	setSenderName: (name) => set({ senderName: name, isDirty: true }),
	setFromEmail: (email) => set({ fromEmail: email, isDirty: true }),
	setReplyTo: (email) => set({ replyTo: email, isDirty: true }),
	setSubject: (subject) => set({ subject, isDirty: true }),

	// ----- Whole state -----

	setBlocks: (blocks) => set({ blocks, isDirty: false }),

	// ----- Selectors -----

	getSelectedBlock: () => {
		const state = get();
		
		// Priority: Read from TipTap selection explicitly
		if (state.editor && state.tiptapSelection?.nodeName) {
			const { nodeName, attrs } = state.tiptapSelection;
			
			// Bridge TipTap names to Legacy BlockTypes
			let legacyType = nodeName;
			
			const mappedProps: Record<string, any> = { ...attrs };
			
			// Provide backward compatible Image properties
			if (nodeName === 'image') {
				mappedProps.url = attrs.src; // some sidebars expect url
			}

			return {
				id: 'tiptap-selection',
				type: legacyType as BlockType,
				props: mappedProps,
			} as TemplateBlock;
		}

		if (!state.selectedBlockId) return null;
		return findBlock(state.blocks, state.selectedBlockId);
	},
}));
