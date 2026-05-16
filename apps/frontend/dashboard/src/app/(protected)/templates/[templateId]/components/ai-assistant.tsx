"use client";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import { useCurrentEditor } from "@tiptap/react";
import { Sparkles } from "lucide-react";
import { useEditorStore } from "./use-editor-store";
import { useState } from "react";

export function AIAssistant() {
	const { editor } = useCurrentEditor();
	const [input, setInput] = useState("");
	const { isGenerating, setIsGenerating, setGeneratingContent } = useEditorStore();

	const complete = async (prompt: string) => {
		if (!prompt.trim() || !editor || isGenerating) return;
		
		setIsGenerating(true);
		setGeneratingContent("");
		
		// Clear editor at the start
		editor.commands.setContent("");

		try {
			const response = await fetch("/dashboard/api/ai/generate-template", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ prompt }),
			});

			if (!response.ok) {
				const errorBody = await response.text();
				console.error("[AI Assistant] Server error:", errorBody);
				throw new Error(`Failed to generate template: ${errorBody}`);
			}

			const reader = response.body?.getReader();
			if (!reader) return;

			const decoder = new TextDecoder();
			let accumulatedHtml = "";

			while (true) {
				const { done, value } = await reader.read();
				
				if (done) {
					// Final update to the editor when everything is complete
					editor.commands.setContent(accumulatedHtml.replace(/```(?:html)?/gi, "").replace(/```/g, ""));
					setGeneratingContent("");
					break;
				}

				const chunk = decoder.decode(value, { stream: true });
				accumulatedHtml += chunk;
				
				// Update the "live" content in the store for the overlay to show
				setGeneratingContent(accumulatedHtml);
			}
			
			// Clear input on success
			setInput("");
		} catch (error) {
			console.error("[AI Assistant Error]", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			complete(input);
		}
	};

	return (
		<div className="-translate-x-1/2 absolute bottom-8 left-1/2 z-10 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="flex items-center gap-2 rounded-[20px] border border-stroke-soft-200 bg-bg-white-0/80 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl dark:border-stroke-soft-100/20 dark:bg-[#0a0a0a]/80">
				<Input.Root size="small" className="flex-1">
					<Input.Wrapper className="border-none bg-transparent shadow-none">
						<Input.Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Describe the email you want to generate (e.g., moisturizer launch)..."
							className="bg-transparent focus-visible:ring-0"
							onKeyDown={onKeyDown}
							disabled={isGenerating}
						/>
					</Input.Wrapper>
				</Input.Root>
				<Button.Root
					onClick={() => complete(input)}
					disabled={isGenerating || !input.trim()}
					variant="neutral"
					mode="filled"
					size="small"
					className="gap-2 rounded-[14px] px-4 transition-all duration-300 hover:opacity-90 active:scale-95"
				>
					<Sparkles size={16} className={isGenerating ? "animate-pulse" : ""} />
					{isGenerating ? "Generating..." : "Generate"}
				</Button.Root>
			</div>
		</div>
	);
}
