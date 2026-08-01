import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { toast } from "sonner";

interface AiImportStepProps {
	onBack: () => void;
}

export function AiImportStep({ onBack }: AiImportStepProps) {
	const router = useRouter();
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
			router.push("/contacts");
		} catch (error) {
			console.error("AI import error:", error);
			toast.error("Failed to parse text with AI");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="w-full space-y-6 font-sans">
			{/* Main Card Container */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50">
				<form onSubmit={handleAiParse}>
					{/* Top Padded Content Area */}
					<div className="m-0.5 max-h-[calc(100dvh-320px)] space-y-6 overflow-y-auto rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-4 pb-6">
						{/* Header */}
						<div>
							<div className="flex items-center gap-2">
								<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
									Import Contacts with AI
								</h2>
								<span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 font-medium text-[11px] text-purple-700">
									<Icon name="sparkling" className="h-3 w-3" />
									AI Powered
								</span>
							</div>
							<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
								Paste raw text, email threads, or unstructured notes. Reloop AI
								will automatically extract and structure contact emails and
								names.
							</p>
						</div>

						<div className="space-y-4">
							<div className="space-y-1.5">
								<label
									htmlFor="rawText"
									className="block font-medium text-text-strong-950 text-xs"
								>
									Paste Unstructured Text
								</label>
								<textarea
									id="rawText"
									rows={5}
									value={rawText}
									onChange={(e) => setRawText(e.target.value)}
									placeholder="e.g. John Doe john@example.com (CEO at Acme Corp), Sarah Smith <sarah@acme.com>..."
									className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 text-sm text-text-strong-950 transition-colors placeholder:text-text-soft-400 focus:border-stroke-strong-950 focus:outline-none focus:ring-1 focus:ring-stroke-strong-950"
									disabled={isProcessing}
								/>
							</div>

							<div className="flex items-start gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/30 p-3.5 text-text-sub-600 text-xs">
								<Icon
									name="sparkling"
									className="mt-0.5 h-4 w-4 shrink-0 text-purple-600"
								/>
								<div className="space-y-0.5">
									<p className="font-medium text-text-strong-950">
										How AI Import Works
									</p>
									<p className="leading-relaxed">
										Reloop AI parses emails, first names, last names, and custom
										attributes from any formatted or unformatted text snippet.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Bottom Footer / Action Bar */}
					<div className="flex items-center justify-between px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={onBack}
							disabled={isProcessing}
						>
							Back
						</Button.Root>

						<FancyButton.Root
							type="submit"
							variant="primary"
							size="small"
							disabled={isProcessing || !rawText.trim()}
						>
							{isProcessing ? (
								<>
									<Spinner size={14} color="currentColor" />
									Parsing with AI...
								</>
							) : (
								<>
									<Icon name="sparkling" className="h-3.5 w-3.5" />
									Extract & Import
								</>
							)}
						</FancyButton.Root>
					</div>
				</form>
			</div>
		</div>
	);
}
