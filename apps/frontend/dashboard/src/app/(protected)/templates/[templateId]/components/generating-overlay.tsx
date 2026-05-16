"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "./use-editor-store";

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

const StreamingSkeleton = () => {
	const [text, setText] = useState("");

	useEffect(() => {
		// Create a "flickering/zig-zagging" effect by rapidly changing random characters
		const interval = setInterval(() => {
			const newText = Array.from({ length: 400 })
				.map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
				.join("");
			setText(newText);
		}, 40);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="mx-auto w-full max-w-[600px] px-8 py-10 animate-in fade-in duration-500">
			<div className="space-y-4">
				<div className="font-mono text-[10px] leading-[1.6] break-all text-fg-muted/30 select-none transition-all duration-75">
					{text.substring(0, 150)}
				</div>
				<div className="font-mono text-[10px] leading-[1.6] break-all text-fg-muted/20 select-none transition-all duration-75">
					{text.substring(150, 300)}
				</div>
				<div className="font-mono text-[10px] leading-[1.6] break-all text-fg-muted/10 select-none transition-all duration-75">
					{text.substring(300, 400)}
				</div>
			</div>
			
			<div className="mt-8 flex items-center justify-center gap-3">
				<div className="flex gap-1">
					<div className="h-1 w-1 animate-bounce rounded-full bg-brand-default [animation-delay:-0.3s]" />
					<div className="h-1 w-1 animate-bounce rounded-full bg-brand-default [animation-delay:-0.15s]" />
					<div className="h-1 w-1 animate-bounce rounded-full bg-brand-default" />
				</div>
				<span className="text-[10px] font-bold tracking-widest text-fg-muted uppercase opacity-50">
					Generating Content
				</span>
			</div>
		</div>
	);
};

export const GeneratingOverlay = () => {
	const { isGenerating, generatingContent } = useEditorStore();

	if (!isGenerating) return null;

	return (
		<div className="mx-auto w-full max-w-[600px] px-8 py-10 animate-in fade-in duration-500">
			{generatingContent && (
				<div
					className="prose prose-sm dark:prose-invert mb-10 max-w-none overflow-hidden opacity-40 transition-opacity duration-300"
					dangerouslySetInnerHTML={{
						__html: generatingContent.replace(/```(?:html)?/gi, "").replace(/```/g, ""),
					}}
				/>
			)}
			<StreamingSkeleton />
		</div>
	);
};
