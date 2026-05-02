import {
	BubbleMenu,
	defaultSlashCommands,
	SlashCommand,
} from "@react-email/editor/ui";
import { EditorContext } from "@tiptap/react";
import { useEditorHook } from "./use-editor-hooks";

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
	const editor = useEditorHook();
	return (
		<EditorContext.Provider value={{ editor }}>
			{children}
			<BubbleMenu
				hideWhenActiveNodes={["button"]}
				hideWhenActiveMarks={["link"]}
			/>
			<BubbleMenu.LinkDefault />
			<BubbleMenu.ButtonDefault />
			<SlashCommand items={defaultSlashCommands} />
		</EditorContext.Provider>
	);
};
