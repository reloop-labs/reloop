"use client";

import * as Button from "@reloop/ui/button";
import { Mail } from "lucide-react";
import type React from "react";

interface SplitLayoutProps {
	stepIndicator: string;
	title: string;
	description: string;
	children: React.ReactNode;
	previewContent: React.ReactNode;
	onBack?: () => void;
	onNext: () => void;
	canProceed: boolean;
	isLastStep: boolean;
}

export const SplitLayout = ({
	stepIndicator,
	title,
	description,
	children,
	previewContent,
	onBack,
	onNext,
	canProceed,
	isLastStep,
}: SplitLayoutProps) => {
	return (
		<div className="flex min-h-screen bg-bg-white-0 font-sans text-text-strong-950">
			{/* Left Panel - Form */}
			<div className="flex w-full flex-col overflow-y-auto border-stroke-soft-200 border-r px-8 py-12 lg:w-[55%] lg:px-24 lg:py-16">
				{/* Header / Nav */}
				<div className="mb-12">
					<div className="mb-8 flex items-center justify-between">
						{/* Simple Logo placeholder */}
						<div className="flex items-center gap-2 font-bold text-text-strong-950 text-xl">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-strong-950 text-text-white-0">
								<Mail size={16} />
							</div>
							<span>MailInfra</span>
						</div>
					</div>
					<div className="mb-2 font-medium text-sm text-text-soft-400">
						{stepIndicator}
					</div>
					<h1 className="mb-3 font-bold text-3xl text-text-strong-950">
						{title}
					</h1>
					<p className="text-lg text-text-sub-600">{description}</p>
				</div>

				{/* Main Form Content */}
				<div className="flex-1">{children}</div>

				{/* Footer Actions */}
				<div className="mt-12 flex items-center justify-between pt-6">
					{onBack && (
						<Button.Root variant="neutral" mode="ghost" onClick={onBack}>
							Back
						</Button.Root>
					)}
					<div className="ml-auto">
						<Button.Root
							variant="primary"
							mode="filled"
							onClick={onNext}
							disabled={!canProceed}
						>
							{isLastStep ? "Finish Setup" : "Continue"}
						</Button.Root>
					</div>
				</div>
			</div>

			{/* Right Panel - Live Preview */}
			<div className="relative hidden flex-col items-center justify-center overflow-hidden bg-bg-weak-50 p-12 lg:flex lg:w-[45%]">
				{/* Decorative Background Elements */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute top-[20%] right-[10%] h-64 w-64 rounded-full bg-information-lighter opacity-60 mix-blend-multiply blur-3xl dark:opacity-30" />
					<div className="absolute bottom-[20%] left-[10%] h-64 w-64 rounded-full bg-feature-lighter opacity-60 mix-blend-multiply blur-3xl dark:opacity-30" />
				</div>

				{/* Preview Card */}
				<div className="fade-in slide-in-from-bottom-8 relative z-10 w-full max-w-md animate-in duration-700">
					{previewContent}
				</div>
			</div>
		</div>
	);
};
