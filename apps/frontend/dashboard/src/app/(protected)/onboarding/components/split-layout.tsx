"use client";

import * as Button from "@reloop/ui/button";
import { ChevronLeft } from "lucide-react";
import type React from "react";

interface SplitLayoutProps {
	stepIndicator: string;
	title: string;
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
	children,
	previewContent,
	onBack,
	onNext,
	canProceed,
	isLastStep,
}: SplitLayoutProps) => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<div className="w-full border-stroke-soft-200 border-t" />
			<div className="flex flex-1 items-center justify-center border-stroke-soft-200 border-r border-l">
				<div className="mx-auto flex h-full max-w-6xl bg-bg-white-0 text-text-strong-950">
					<div className="flex flex-col gap-6 border-stroke-soft-200 border-r p-8">
						<div className="flex gap-2">
							{onBack && (
								<Button.Root
									variant="neutral"
									mode="ghost"
									onClick={onBack}
									size="xxsmall"
								>
									<ChevronLeft size={16} />
								</Button.Root>
							)}
							<div>
								<div>
									<div className="mb-2 font-medium text-sm text-text-soft-400">
										{stepIndicator}
									</div>
								</div>
								<h1 className="mb-3 font-bold text-3xl text-text-strong-950">
									{title}
								</h1>
							</div>
						</div>
						{children}
						{/* Footer Actions */}
						<div className="w-full pt-6">
							<Button.Root
								variant="primary"
								mode="filled"
								onClick={onNext}
								disabled={!canProceed}
								className="w-full"
							>
								{isLastStep ? "Finish Setup" : "Continue"}
							</Button.Root>
						</div>
					</div>
					<div className="relative hidden flex-col items-center justify-center overflow-hidden p-6 lg:flex">
						<div className="fade-in slide-in-from-bottom-8 relative z-10 w-full max-w-md animate-in duration-700">
							{previewContent}
						</div>
					</div>
				</div>
			</div>
			<div className="w-full border-stroke-soft-200 border-b" />
		</div>
	);
};
