"use client";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import { useCompletion } from "@ai-sdk/react";
import { useCurrentEditor } from "@tiptap/react";
import { Sparkles, Square } from "lucide-react";
import { useEditorStore } from "./use-editor-store";
import { useEffect } from "react";

export function AIAssistant() {
	const { editor } = useCurrentEditor();
	const { isGenerating, setIsGenerating, setGeneratingContent } = useEditorStore();

	const {
		completion,
		input,
		setInput,
		handleInputChange,
		isLoading,
		stop,
		complete,
		error,
	} = useCompletion({
		api: "/dashboard/api/ai/generate-template",
		streamProtocol: "text",
		onFinish: (_prompt, finalCompletion) => {
			// Set the final HTML into the Tiptap editor
			if (editor) {
				const cleanHtml = finalCompletion
					.replace(/```(?:html)?/gi, "")
					.replace(/```/g, "");
				editor.commands.setContent(cleanHtml);
			}
			setGeneratingContent("");
			setIsGenerating(false);
		},
		onError: (err) => {
			console.error("[AI Assistant Error]", err);
			setIsGenerating(false);
			setGeneratingContent("");
		},
	});

	// Sync streaming state to the zustand store for GeneratingOverlay & FloatingMenu
	useEffect(() => {
		if (isLoading) {
			setIsGenerating(true);
			setGeneratingContent(completion ?? "");
		}
	}, [isLoading, completion, setIsGenerating, setGeneratingContent]);

	// Clear the editor when a new generation starts
	useEffect(() => {
		if (isLoading && (completion?.length ?? 0) === 0 && editor) {
			editor.commands.setContent("");
		}
	}, [isLoading, completion?.length, editor]);

	const handleGenerate = () => {
		if (!input.trim() || !editor || isGenerating) return;
		setIsGenerating(true);
		setGeneratingContent("");
		editor.commands.setContent("");
		complete(input);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleGenerate();
		}
	};

	return (
		<div className="-translate-x-1/2 absolute bottom-8 left-1/2 z-10 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="flex items-center gap-2 rounded-[20px] border border-stroke-soft-200 bg-bg-white-0/80 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl dark:border-stroke-soft-100/20 dark:bg-[#0a0a0a]/80">
				{error && (
					<div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-500 backdrop-blur-sm">
						{error.message || "Failed to generate. Try again."}
					</div>
				)}
				<Input.Root size="small" className="flex-1">
					<Input.Wrapper className="border-none bg-transparent shadow-none">
						<Input.Input
							value={input}
							onChange={handleInputChange}
							placeholder="Describe the email you want to generate (e.g., moisturizer launch)..."
							className="bg-transparent focus-visible:ring-0"
							onKeyDown={onKeyDown}
							disabled={isGenerating}
						/>
					</Input.Wrapper>
				</Input.Root>
				{isGenerating ? (
					<Button.Root
						onClick={stop}
						variant="neutral"
						mode="filled"
						size="small"
						className="gap-2 rounded-[14px] px-4 transition-all duration-300 hover:opacity-90 active:scale-95"
					>
						<Square size={14} />
						Stop
					</Button.Root>
				) : (
					<Button.Root
						onClick={handleGenerate}
						disabled={!input.trim()}
						variant="neutral"
						mode="filled"
						size="small"
						className="gap-2 rounded-[14px] px-4 transition-all duration-300 hover:opacity-90 active:scale-95"
					>
						<Sparkles size={16} />
						Generate
					</Button.Root>
				)}
			</div>
		</div>
	);
}
