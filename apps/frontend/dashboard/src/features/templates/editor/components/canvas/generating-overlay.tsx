import { useEffect, useMemo, useState } from "react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";

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
		<div className="fade-in mx-auto w-full max-w-[600px] animate-in px-8 py-10 duration-500">
			<div className="space-y-4">
				<div className="select-none break-all font-mono text-[10px] text-text-soft-400/40 leading-[1.6] transition-all duration-75">
					{text.substring(0, 150)}
				</div>
				<div className="select-none break-all font-mono text-[10px] text-text-soft-400/25 leading-[1.6] transition-all duration-75">
					{text.substring(150, 300)}
				</div>
				<div className="select-none break-all font-mono text-[10px] text-text-soft-400/15 leading-[1.6] transition-all duration-75">
					{text.substring(300, 400)}
				</div>
			</div>

			<div className="mt-8 flex items-center justify-center gap-3">
				<div className="flex gap-1">
					<div className="h-1 w-1 animate-bounce rounded-full bg-primary-base [animation-delay:-0.3s]" />
					<div className="h-1 w-1 animate-bounce rounded-full bg-primary-base [animation-delay:-0.15s]" />
					<div className="h-1 w-1 animate-bounce rounded-full bg-primary-base" />
				</div>
				<span className="font-semibold text-[10px] text-text-soft-400 uppercase tracking-widest">
					Generating email template...
				</span>
			</div>
		</div>
	);
};

export const GeneratingOverlay = () => {
	const { isGenerating, generatingContent } = useEditorStore();

	const previewHtml = useMemo(() => {
		if (!generatingContent) return "";
		return generatingContent.replace(/```(?:html)?/gi, "").replace(/```/g, "");
	}, [generatingContent]);

	if (!isGenerating) return null;

	return (
		<div className="fade-in mx-auto w-full max-w-[600px] animate-in px-8 py-10 duration-500">
			{previewHtml && (
				<iframe
					title="Template preview"
					sandbox=""
					srcDoc={previewHtml}
					className="mb-10 h-[300px] w-full overflow-hidden rounded-xl border border-stroke-soft-100 border-none opacity-40 transition-opacity duration-300"
					tabIndex={-1}
					aria-hidden="true"
				/>
			)}
			<StreamingSkeleton />
		</div>
	);
};
