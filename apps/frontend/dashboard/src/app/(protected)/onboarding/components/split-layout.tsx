"use client";

import * as Button from "@reloop/ui/button";
import { ChevronLeft } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import type React from "react";

interface SplitLayoutProps {
	stepIndicator: string;
	title: string;
	children: React.ReactNode;
	previewContent: React.ReactNode;
}

export const SplitLayout = ({
	stepIndicator,
	title,
	children,
	previewContent,
}: SplitLayoutProps) => {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const onBack = step > 1 ? () => setStep(step - 1) : undefined;
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<div className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center border-stroke-soft-200 border-r border-l">
				<div className="w-full border-stroke-soft-200 border-t" />
				<div className="mx-auto grid h-full grid-cols-2">
					<div className="flex flex-col gap-6 p-10">
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
								<div className="font-medium text-text-soft-400 text-xs">
									{stepIndicator}
								</div>
								<h1 className="font-semibold text-title-h5">{title}</h1>
							</div>
						</div>
						{children}
					</div>
					<div className="relative hidden flex-col items-center justify-center overflow-hidden border-stroke-soft-200 border-l p-6 lg:flex">
						<div className="fade-in slide-in-from-bottom-8 relative z-10 w-full max-w-md animate-in duration-700">
							{previewContent}
						</div>
					</div>
				</div>
				<div className="w-full border-stroke-soft-200 border-b" />
			</div>
		</div>
	);
};
