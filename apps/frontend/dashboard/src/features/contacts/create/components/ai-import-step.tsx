import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

interface AiImportStepProps {
	onBack: () => void;
}

export function AiImportStep({ onBack }: AiImportStepProps) {
	const navigate = useNavigate();
	const [rawText, setRawText] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	const handleAiParse = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!rawText.trim()) return;

		setIsProcessing(true);
		try {
			// Simulate AI parsing delay
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success("AI parsed contacts successfully!");
			void navigate({ to: "/contacts" });
		} catch (error) {
			console.error("AI import error:", error);
			toast.error("Failed to parse text with AI");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="w-full space-y-6 font-sans">
			<div className="rounded-3xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
				<form onSubmit={handleAiParse}>
					<div className="p-6 sm:p-7 space-y-6">
						<div>
							<div className="flex items-center gap-2">
								<h2 className="text-base font-semibold text-text-strong-950 tracking-tight">
									Import Contacts with AI
								</h2>
								<span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-200">
									<Icon name="sparkling" className="h-3 w-3" />
									AI Powered
								</span>
							</div>
							<p className="text-xs text-text-sub-600 mt-1 leading-relaxed">
								Paste raw text, email threads, or unstructured notes. Reloop AI will automatically extract and structure contact emails and names.
							</p>
						</div>

						<div className="space-y-4">
							<div className="space-y-1.5">
								<label
									htmlFor="rawText"
									className="text-xs font-medium text-text-strong-950 block"
								>
									Paste Unstructured Text
								</label>
								<textarea
									id="rawText"
									rows={5}
									value={rawText}
									onChange={(e) => setRawText(e.target.value)}
									placeholder="e.g. John Doe john@example.com (CEO at Acme Corp), Sarah Smith <sarah@acme.com>..."
									className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 text-sm text-text-strong-950 placeholder:text-text-soft-400 focus:border-stroke-strong-950 focus:outline-none focus:ring-1 focus:ring-stroke-strong-950 transition-colors"
									disabled={isProcessing}
								/>
							</div>

							<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/30 p-3.5 text-xs text-text-sub-600 flex items-start gap-2.5">
								<Icon name="sparkling" className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
								<div className="space-y-0.5">
									<p className="font-medium text-text-strong-950">How AI Import Works</p>
									<p className="leading-relaxed">
										Reloop AI parses emails, first names, last names, and custom attributes from any formatted or unformatted text snippet.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Bottom Footer / Action Bar */}
					<div className="border-t border-stroke-soft-200 bg-[#f9fafb] px-6 py-4 flex items-center justify-between dark:bg-bg-weak-50/40">
						<button
							type="button"
							onClick={onBack}
							disabled={isProcessing}
							className="text-sm font-medium text-text-sub-600 hover:text-text-strong-950 transition-colors disabled:opacity-50 cursor-pointer"
						>
							Back
						</button>

						<button
							type="submit"
							disabled={isProcessing || !rawText.trim()}
							className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 text-sm shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
						>
							{isProcessing ? (
								<>
									<Spinner size={14} color="currentColor" />
									Parsing with AI...
								</>
							) : (
								<>
									<Icon name="sparkling" className="h-4 w-4" />
									Extract & Import
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
