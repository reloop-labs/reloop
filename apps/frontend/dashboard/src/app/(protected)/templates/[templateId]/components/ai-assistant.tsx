"use client";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import { useCurrentEditor } from "@tiptap/react";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export function AIAssistant() {
	const { editor } = useCurrentEditor();
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const complete = async (prompt: string) => {
		if (!prompt.trim() || !editor) return;
		setIsLoading(true);

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

			// Wait for the complete HTML string
			const fullHtml = await response.text();

			// Sanitize the output: Local models often ignore instructions and wrap HTML in markdown or add conversational text
			let cleanedHtml = fullHtml;
			const codeBlockMatch = fullHtml.match(/```(?:html)?\s*([\s\S]*?)```/i);

			if (codeBlockMatch?.[1]) {
				cleanedHtml = codeBlockMatch[1];
			} else {
				// Fallback: strip everything before the first < tag and after the last > tag
				const firstTag = fullHtml.indexOf("<");
				const lastTag = fullHtml.lastIndexOf(">");
				if (firstTag !== -1 && lastTag !== -1) {
					cleanedHtml = fullHtml.substring(firstTag, lastTag + 1);
				}
			}

			// Inject the clean template into the editor safely
			editor.commands.setContent(cleanedHtml);
			setInput("");
		} catch (error) {
			console.error("[AI Assistant Error]", error);
		} finally {
			setIsLoading(false);
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			complete(input);
		}
	};

	return (
		<div className="-translate-x-1/2 absolute bottom-24 left-1/2 z-10 w-full max-w-2xl px-4">
			<div className="flex items-center gap-2 rounded-[16px] border border-stroke-soft-200 bg-bg-white-0 p-2 shadow-lg dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
				<Input.Root size="small" className="flex-1">
					<Input.Wrapper className="border-none shadow-none">
						<Input.Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Describe the email you want to generate (e.g., moisturizer launch)..."
							className="focus-visible:ring-0"
							onKeyDown={onKeyDown}
							disabled={isLoading}
						/>
					</Input.Wrapper>
				</Input.Root>
				<Button.Root
					onClick={() => complete(input)}
					disabled={isLoading || !input.trim()}
					variant="neutral"
					mode="filled"
					size="small"
					className="gap-2"
				>
					<Sparkles size={16} />
					{isLoading ? "Generating..." : "Generate"}
				</Button.Root>
			</div>
		</div>
	);
}
