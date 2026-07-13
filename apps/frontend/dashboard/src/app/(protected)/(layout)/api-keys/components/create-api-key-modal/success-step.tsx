"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { useState } from "react";
import { toast } from "sonner";
import { ModalHeader } from "./header";

interface SuccessStepProps {
	apiKey: string;
	onContinue: () => void;
	defaultHtml?: string;
}

export const SuccessStep = ({
	apiKey,
	onContinue,
	defaultHtml,
}: SuccessStepProps) => {
	const [copied, setCopied] = useState(false);
	const [activeTab, setActiveTab] = useState<"key" | "env">("key");

	const handleCopy = async () => {
		try {
			const textToCopy =
				activeTab === "env" ? `RELOOP_API_KEY=${apiKey}` : apiKey;
			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy API key");
		}
	};

	return (
		<div className="flex flex-col">
			<ModalHeader
				title="API Key Created"
				icon="check-circle"
				iconClassName="text-success-base"
				onClose={() => {}} // Disabled in success state unless copied
				showCloseIcon={false}
			/>

			<Modal.Body className="space-y-4 px-5 py-3.5">
				<div className="group relative overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
					{/* Code Block Header */}
					<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-0 dark:border-stroke-soft-100/40">
						<div className="flex items-center gap-4">
							<button
								type="button"
								onClick={() => setActiveTab("key")}
								className={cn(
									"relative cursor-pointer py-2 font-medium text-xs transition-colors",
									activeTab === "key"
										? "font-semibold text-text-strong-950"
										: "text-text-soft-400 hover:text-text-sub-600",
								)}
							>
								API Key
								{activeTab === "key" && (
									<span className="absolute right-0 bottom-0 left-0 h-[1.5px] rounded-full bg-text-strong-950" />
								)}
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("env")}
								className={cn(
									"relative cursor-pointer py-2 font-medium text-xs transition-colors",
									activeTab === "env"
										? "font-semibold text-text-strong-950"
										: "text-text-soft-400 hover:text-text-sub-600",
								)}
							>
								.env
								{activeTab === "env" && (
									<span className="absolute right-0 bottom-0 left-0 h-[1.5px] rounded-full bg-text-strong-950" />
								)}
							</button>
						</div>
					</div>
					<div className="group/code relative rounded-t-[10px] rounded-b-2xl bg-bg-weak-50/70 dark:bg-bg-weak-50/45">
						<CodeBlock
							code={activeTab === "env" ? `RELOOP_API_KEY=${apiKey}` : apiKey}
							lang="bash"
							className="pr-12 text-[10px]"
							hideLineNumbers={true}
							noScroll={true}
							defaultHtml={activeTab === "env" ? defaultHtml : undefined}
						/>
						<div className="-translate-y-1/2 absolute top-1/2 right-4">
							<button
								type="button"
								onClick={handleCopy}
								className="cursor-pointer text-text-sub-600 transition-colors hover:text-text-strong-950"
							>
								<Icon
									name={copied ? "check" : "copy"}
									className="h-3.5 w-3.5 stroke-3"
								/>
							</button>
						</div>
					</div>
				</div>

				<div className="mt-3">
					<p className="flex items-center gap-1.5 text-error-base text-xs">
						<Icon name="alert-triangle" className="h-3.5 w-3.5" />
						Make sure to copy your API key now. You won't be able to see it
						again!
					</p>
				</div>
			</Modal.Body>

			<div className="flex items-center justify-end border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
				<Button.Root
					type="button"
					variant="neutral"
					size="xsmall"
					onClick={onContinue}
					className="gap-2"
				>
					Continue
					<span className="inline-flex items-center gap-0.5">
						<Icon
							name="command"
							className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
						/>
						<Icon
							name="enter"
							className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
						/>
					</span>
				</Button.Root>
			</div>
		</div>
	);
};
