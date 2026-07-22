import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	Code,
	Eye,
	Key,
	RefreshCw,
	Sparkles,
	Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createTemplate } from "#/features/templates/hooks/use-templates-query";

interface AIGenerateModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: (templateId: string) => void;
}

const STARTER_PROMPTS = [
	{
		title: "🚀 Welcome Onboarding",
		prompt:
			"Create a modern dark-mode welcome onboarding email for a developer SaaS. Include a warm greeting, key getting-started steps, and a vibrant primary CTA button to explore the dashboard.",
	},
	{
		title: "🔐 Security & Password Reset",
		prompt:
			"Design a clean security notification email for password reset containing a security code box, link expiration notice, and security advice.",
	},
	{
		title: "📢 Product Release Update",
		prompt:
			"Create a feature release announcement email highlighting 3 new capabilities with icon bullet points, screenshot placeholders, and a 'Try It Out' button.",
	},
	{
		title: "🛍️ Promotional Offer",
		prompt:
			"Design an eye-catching promotional email with a discount badge, countdown urgency banner, item showcase grid, and a high-converting shop now CTA.",
	},
];

const MODELS = [
	{
		id: "gemini-3.6-flash",
		name: "Gemini 3.6 Flash",
		badge: "Recommended",
		provider: "Google AI",
	},
	{
		id: "gemini-2.0-flash",
		name: "Gemini 2.0 Flash",
		badge: "Fast",
		provider: "Google AI",
	},
	{
		id: "gpt-4o",
		name: "GPT-4o",
		badge: "OpenAI",
		provider: "OpenAI",
	},
];

export function AIGenerateModal({ open, onOpenChange }: AIGenerateModalProps) {
	const navigate = useNavigate();
	const [prompt, setPrompt] = useState("");
	const [selectedModel, setSelectedModel] = useState("gemini-3.6-flash");
	const [customApiKey, setCustomApiKey] = useState("");
	const [showApiKeyInput, setShowApiKeyInput] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedContent, setGeneratedContent] = useState("");
	const [templateName, setTemplateName] = useState("");
	const [isApplying, setIsApplying] = useState(false);
	const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

	const previewHtml = useMemo(() => {
		if (!generatedContent) return "";
		// Clean markdown fences if model outputs code blocks
		return generatedContent
			.replace(/^```(?:html)?\s*/i, "")
			.replace(/\s*```$/i, "");
	}, [generatedContent]);

	const handleGenerate = async () => {
		if (!prompt.trim()) {
			toast.error("Please enter a prompt to generate your email template");
			return;
		}

		setIsGenerating(true);
		setGeneratedContent("");

		try {
			const systemPrompt = `You are a world-class email designer and copywriter.
Generate a complete, modern, fully-responsive HTML email template.
Use inline CSS styling, beautiful dark-mode or sleek modern palettes, clean typography, and compelling content.
Output only the pure HTML template code without markdown backticks or extra conversation text.`;

			const response = await fetch("/api/template/v1/ai", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					prompt: prompt.trim(),
					system: systemPrompt,
					model: selectedModel,
					apiKey: customApiKey.trim() || undefined,
					mode: "text-stream",
				}),
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => null);
				throw new Error(errData?.message || "Failed to initiate stream");
			}

			if (!response.body) {
				throw new Error("No response body received from server");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let accumulated = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const chunk = decoder.decode(value, { stream: true });
				accumulated += chunk;
				setGeneratedContent(accumulated);
			}

			toast.success("Email template generated successfully!");
		} catch (error: any) {
			toast.error(error.message || "Failed to generate AI template");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCreateFromAI = async () => {
		if (!previewHtml) {
			toast.error("Generate a template first before saving");
			return;
		}

		setIsApplying(true);
		try {
			// 1. Create a new template record
			const newTemplate = await createTemplate();

			// 2. Extract title/subject from prompt or default
			const name =
				templateName.trim() ||
				prompt.slice(0, 40) + (prompt.length > 40 ? "..." : "");

			const contentBlock = [{ type: "html", html: previewHtml }];

			// 3. Update template metadata (name, subject, previewText)
			const updateRes = await fetch(`/api/template/v1/${newTemplate.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					name,
					subject: `AI Template: ${name}`,
					previewText: prompt.slice(0, 100),
					content: contentBlock,
				}),
			});

			if (!updateRes.ok) {
				throw new Error("Failed to populate template content");
			}

			// 4. Create an initial version so the editor's initializeEditor()
			//    finds real content in versionList[0] rather than falling through
			//    to an empty template. Without this the editor opens blank.
			const versionRes = await fetch(
				`/api/template/v1/${newTemplate.id}/versions`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						content: contentBlock,
						subject: `AI Template: ${name}`,
						previewText: prompt.slice(0, 100),
						name: "AI Generated",
						renderedHtml: previewHtml,
					}),
				},
			);

			if (!versionRes.ok) {
				// Non-fatal — the template baseline content is still saved above.
				console.warn(
					"[AIGenerateModal] Failed to create initial version, editor will fall back to template content.",
				);
			}

			// 5. Navigate into editor
			toast.success("Template created! Redirecting to editor...");
			onOpenChange(false);

			void navigate({
				to: "/templates/$templateId",
				params: { templateId: newTemplate.id },
			});
		} catch (error: any) {
			toast.error(error.message || "Failed to save template");
		} finally {
			setIsApplying(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="w-full max-w-4xl rounded-3xl border border-stroke-soft-200 bg-bg-white-0 shadow-2xl dark:border-stroke-soft-100/50 dark:bg-[#0a0a0a]"
				showClose
			>
				{/* Modal Header */}
				<Modal.Header className="border-stroke-soft-200/60 border-b px-6 py-5 dark:border-stroke-soft-100/40">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
							<Sparkles className="h-5 w-5 animate-pulse" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h2 className="font-bold text-lg text-text-strong-950 dark:text-white">
									AI Email Template Generator
								</h2>
								<span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 font-medium text-[11px] text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
									<Zap className="h-3 w-3" /> Powered by Gemini Flash
								</span>
							</div>
							<p className="text-paragraph-xs text-text-sub-600 dark:text-zinc-400">
								Describe your email goal and let Vercel AI SDK & Google Gemini
								generate a production-ready responsive email.
							</p>
						</div>
					</div>
				</Modal.Header>

				{/* Modal Body */}
				<Modal.Body className="space-y-6 px-6 py-5">
					{/* Prompt Input & Starters */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label
								htmlFor="ai-prompt-instructions"
								className="font-semibold text-text-strong-950 text-xs uppercase tracking-wider dark:text-zinc-200"
							>
								Prompt Instructions
							</label>
							<button
								type="button"
								onClick={() => setShowApiKeyInput(!showApiKeyInput)}
								className="flex items-center gap-1 font-medium text-indigo-500 text-xs hover:underline dark:text-indigo-400"
							>
								<Key className="h-3.5 w-3.5" />
								{showApiKeyInput
									? "Hide API Key Settings"
									: "Custom Gemini API Key"}
							</button>
						</div>

						{/* Optional Custom API Key Input */}
						{showApiKeyInput && (
							<div className="fade-in animate-in rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 duration-200">
								<label
									htmlFor="custom-gemini-api-key"
									className="mb-1 block font-medium text-[11px] text-text-sub-600 dark:text-zinc-400"
								>
									Enter your Google Gemini API Key (Optional)
								</label>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											id="custom-gemini-api-key"
											type="password"
											placeholder="AIzaSy..."
											value={customApiKey}
											onChange={(e) => setCustomApiKey(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
								<p className="mt-1 text-[10px] text-text-sub-600/80 dark:text-zinc-500">
									If left blank, the generator uses the server environment API
									key.
								</p>
							</div>
						)}

						<Textarea.Root
							id="ai-prompt-instructions"
							rows={3}
							placeholder="E.g. Create a sleek dark-mode onboarding email for a developer platform with a primary CTA button, social links, and clear feature callouts..."
							value={prompt}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
							className="text-sm"
						/>

						{/* Quick Starter Chips */}
						<div className="flex flex-wrap items-center gap-2">
							<span className="font-medium text-[11px] text-text-sub-600 dark:text-zinc-400">
								Quick Starters:
							</span>
							{STARTER_PROMPTS.map((item) => (
								<button
									key={item.title}
									type="button"
									onClick={() => setPrompt(item.prompt)}
									className="rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1 font-medium text-[11px] text-text-sub-600 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-indigo-600 dark:border-stroke-soft-100/50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-indigo-400"
								>
									{item.title}
								</button>
							))}
						</div>
					</div>

					{/* Model Selection Chips */}
					<div className="flex items-center justify-between gap-4 border-stroke-soft-200/60 border-t pt-4 dark:border-stroke-soft-100/40">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-text-strong-950 text-xs uppercase tracking-wider dark:text-zinc-200">
								AI Model:
							</span>
							<div className="flex gap-2">
								{MODELS.map((model) => (
									<button
										key={model.id}
										type="button"
										onClick={() => setSelectedModel(model.id)}
										className={cn(
											"flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-all",
											selectedModel === model.id
												? "border-indigo-500 bg-indigo-500/10 font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
												: "border-stroke-soft-200 text-text-sub-600 hover:border-stroke-soft-300 dark:border-stroke-soft-100/50 dark:text-zinc-400",
										)}
									>
										<span>{model.name}</span>
										<span className="rounded-full bg-zinc-200 px-1.5 py-0.2 font-mono text-[9px] dark:bg-zinc-800">
											{model.badge}
										</span>
									</button>
								))}
							</div>
						</div>

						{/* Action: Generate */}
						<Button.Root
							variant="primary"
							size="small"
							onClick={() => void handleGenerate()}
							disabled={isGenerating || !prompt.trim()}
							className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-500 hover:to-purple-500"
						>
							{isGenerating ? (
								<Spinner size={16} />
							) : (
								<Sparkles className="h-4 w-4" />
							)}
							{isGenerating ? "Generating Stream..." : "Generate Template"}
						</Button.Root>
					</div>

					{/* Live Stream / Result View */}
					{generatedContent && (
						<div className="fade-in animate-in space-y-3 duration-300">
							<div className="flex items-center justify-between border-stroke-soft-200/60 border-t pt-4 dark:border-stroke-soft-100/40">
								<div className="flex items-center gap-2">
									<h3 className="font-semibold text-text-strong-950 text-xs uppercase tracking-wider dark:text-zinc-200">
										Generated Template Output
									</h3>
									{isGenerating && (
										<span className="flex items-center gap-1 font-medium text-[11px] text-indigo-500">
											<RefreshCw className="h-3 w-3 animate-spin" /> Streaming
											chunks...
										</span>
									)}
								</div>

								{/* Toggle Preview vs HTML Code */}
								<div className="flex rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-stroke-soft-100/40 dark:bg-zinc-900">
									<button
										type="button"
										onClick={() => setActiveTab("preview")}
										className={cn(
											"flex items-center gap-1 rounded-md px-2.5 py-1 font-medium text-xs transition-all",
											activeTab === "preview"
												? "bg-bg-white-0 text-text-strong-950 shadow-xs dark:bg-zinc-800 dark:text-white"
												: "text-text-sub-600 hover:text-text-strong-950 dark:text-zinc-400",
										)}
									>
										<Eye className="h-3.5 w-3.5" /> Visual Preview
									</button>
									<button
										type="button"
										onClick={() => setActiveTab("code")}
										className={cn(
											"flex items-center gap-1 rounded-md px-2.5 py-1 font-medium text-xs transition-all",
											activeTab === "code"
												? "bg-bg-white-0 text-text-strong-950 shadow-xs dark:bg-zinc-800 dark:text-white"
												: "text-text-sub-600 hover:text-text-strong-950 dark:text-zinc-400",
										)}
									>
										<Code className="h-3.5 w-3.5" /> HTML Code
									</button>
								</div>
							</div>

							{activeTab === "preview" ? (
								<div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-stroke-soft-200 bg-zinc-950 dark:border-stroke-soft-100/50">
									<iframe
										title="Live Email Stream Preview"
										srcDoc={previewHtml}
										className="h-full w-full border-none bg-white dark:bg-zinc-950"
									/>
								</div>
							) : (
								<pre className="h-[320px] w-full overflow-y-auto rounded-2xl border border-stroke-soft-200 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 leading-relaxed dark:border-stroke-soft-100/50">
									{previewHtml}
								</pre>
							)}

							{/* Template Title Name Override */}
							<div className="flex items-center gap-3 pt-2">
								<Input.Root size="small" className="flex-1">
									<Input.Wrapper>
										<Input.Input
											type="text"
											placeholder="Template Name (e.g. Welcome Email v1)"
											value={templateName}
											onChange={(e) => setTemplateName(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>

								<Button.Root
									variant="neutral"
									size="small"
									onClick={() => void handleCreateFromAI()}
									disabled={isApplying || isGenerating}
									className="bg-emerald-600 text-white hover:bg-emerald-500"
								>
									{isApplying ? (
										<Spinner size={16} />
									) : (
										<ArrowRight className="h-4 w-4" />
									)}
									{isApplying ? "Saving Template..." : "Create & Edit Template"}
								</Button.Root>
							</div>
						</div>
					)}
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
}
