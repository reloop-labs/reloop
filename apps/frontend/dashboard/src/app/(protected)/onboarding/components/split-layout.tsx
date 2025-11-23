"use client";

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
		<div className="flex min-h-screen bg-white font-sans text-slate-900">
			{/* Left Panel - Form */}
			<div className="flex w-full flex-col overflow-y-auto border-slate-100 border-r px-8 py-12 lg:w-[55%] lg:px-24 lg:py-16">
				{/* Header / Nav */}
				<div className="mb-12">
					<div className="mb-8 flex items-center justify-between">
						{/* Simple Logo placeholder */}
						<div className="flex items-center gap-2 font-bold text-slate-900 text-xl">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
								<Mail size={16} />
							</div>
							<span>MailInfra</span>
						</div>
					</div>
					<div className="mb-2 font-medium text-slate-400 text-sm">
						{stepIndicator}
					</div>
					<h1 className="mb-3 font-bold text-3xl text-slate-900">{title}</h1>
					<p className="text-lg text-slate-500">{description}</p>
				</div>

				{/* Main Form Content */}
				<div className="flex-1">{children}</div>

				{/* Footer Actions */}
				<div className="mt-12 flex items-center justify-between pt-6">
					{onBack && (
						<button
							type="button"
							onClick={onBack}
							className="rounded-lg px-4 py-2 font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
						>
							Back
						</button>
					)}
					<div className="ml-auto">
						<button
							type="button"
							onClick={onNext}
							disabled={!canProceed}
							className={`flex w-full items-center justify-center rounded-xl px-8 py-3.5 font-semibold text-base transition-all sm:w-auto ${
								canProceed
									? "hover:-translate-y-0.5 transform bg-blue-600 text-white shadow-blue-600/20 shadow-lg hover:bg-blue-700"
									: "cursor-not-allowed bg-slate-100 text-slate-400"
							}`}
						>
							{isLastStep ? "Finish Setup" : "Continue"}
						</button>
					</div>
				</div>
			</div>

			{/* Right Panel - Live Preview */}
			<div className="relative hidden flex-col items-center justify-center overflow-hidden bg-slate-50 p-12 lg:flex lg:w-[45%]">
				{/* Decorative Background Elements */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute top-[20%] right-[10%] h-64 w-64 rounded-full bg-blue-100 opacity-60 mix-blend-multiply blur-3xl" />
					<div className="absolute bottom-[20%] left-[10%] h-64 w-64 rounded-full bg-indigo-100 opacity-60 mix-blend-multiply blur-3xl" />
				</div>

				{/* Preview Card */}
				<div className="fade-in slide-in-from-bottom-8 relative z-10 w-full max-w-md animate-in duration-700">
					{previewContent}
				</div>
			</div>
		</div>
	);
};
