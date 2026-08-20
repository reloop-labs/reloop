import * as Tooltip from "@reloop/ui/tooltip";
import { useCurrentEditor } from "@tiptap/react";
import React from "react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { editorSlashCommands, runSlashCommand } from "../../lib/slash-commands";

export function FloatingMenu() {
	const { editor } = useCurrentEditor();
	const { isGenerating } = useEditorStore();

	if (!editor || isGenerating) return null;

	return (
		<Tooltip.Provider>
			<div className="-translate-x-1/2 absolute bottom-6 left-1/2 z-10">
				<div className="flex items-center gap-1 rounded-full border border-stroke-soft-100/20 bg-bg-strong-950 p-1.5 text-static-white shadow-regular-md backdrop-blur-md">
					{editorSlashCommands.map((item, index) => {
						return (
							<Tooltip.Root key={item.title ?? index}>
								<Tooltip.Trigger asChild>
									<button
										type="button"
										onMouseDown={(e) => {
											// Prevent focus loss from the editor
											e.preventDefault();
										}}
										onClick={() => {
											try {
												runSlashCommand(editor, item);
											} catch (error) {
												console.error("Failed to execute command", error);
											}
										}}
										className="flex items-center justify-center rounded-full p-2 text-static-white transition-colors duration-200 hover:bg-static-white/15 active:scale-95"
									>
										<div className="flex size-5 items-center justify-center">
											{typeof item.icon === "function"
												? React.createElement(item.icon, { size: 20 })
												: (item.icon as React.ReactNode)}
										</div>
									</button>
								</Tooltip.Trigger>
								<Tooltip.Content side="top" sideOffset={12}>
									{item.title}
								</Tooltip.Content>
							</Tooltip.Root>
						);
					})}
				</div>
			</div>
		</Tooltip.Provider>
	);
}
