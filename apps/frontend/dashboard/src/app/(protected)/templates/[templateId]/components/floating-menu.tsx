"use client";

import { defaultSlashCommands } from "@react-email/editor/ui";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCurrentEditor } from "@tiptap/react";
import React from "react";

export function FloatingMenu() {
	const { editor } = useCurrentEditor();

	if (!editor) return null;

	return (
		<Tooltip.Provider>
			<div className="-translate-x-1/2 absolute bottom-6 left-1/2 z-10">
				<div className="flex items-center gap-1 rounded-full border border-white/10 bg-bg-strong-950 p-1.5 text-white shadow-2xl backdrop-blur-md">
					{defaultSlashCommands.map((item, index) => {
						return (
							<Tooltip.Root key={index}>
								<Tooltip.Trigger asChild>
									<button
										type="button"
										onMouseDown={(e) => {
											// Prevent focus loss from the editor
											e.preventDefault();
										}}
										onClick={() => {
											// Ensure editor is focused
											editor.commands.focus();

											const { from, to } = editor.state.selection;

											// Try executing the command with various patterns
											if (typeof item.command === "function") {
												try {
													// Standard Tiptap suggestion pattern
													item.command({ editor, range: { from, to } });
												} catch (error) {
													try {
														// Fallback without range
														item.command({ editor });
													} catch (innerError) {
														// Fallback with editor and range as separate args
														(item.command as any)(editor, { from, to });
													}
												}
											}
										}}
										className="flex items-center justify-center rounded-full p-2 transition-all duration-200 hover:scale-110 hover:bg-white/15 active:scale-95"
									>
										<div className="flex size-5 items-center justify-center">
											{typeof item.icon === "function" ? (
												<item.icon size={20} />
											) : (
												item.icon
											)}
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
