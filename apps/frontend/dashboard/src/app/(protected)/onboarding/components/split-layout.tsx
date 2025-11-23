"use client";

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
			<div className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center border-stroke-soft-100 border-r border-l">
				<div className="w-full border-stroke-soft-100 border-t" />
				<div className="mx-auto grid h-full w-full lg:grid-cols-2">
					<div className="flex flex-col gap-4 px-12 pt-9 pb-9">
						<div className="relative flex gap-2">
							{onBack && (
								<div className="-left-7 -top-[2.1px] absolute">
									<button
										type="button"
										onClick={onBack}
										className="cursor-pointer text-text-soft-400 hover:text-text-strong-950"
									>
										<ChevronLeft size={16} />
									</button>
								</div>
							)}
							<div>
								<div className="mb-1 font-medium text-text-soft-400 text-xs">
									{stepIndicator}
								</div>
								<h1 className="font-semibold text-title-h5">{title}</h1>
							</div>
						</div>
						{children}
					</div>
					<div className="relative hidden w-full overflow-hidden border-stroke-soft-100 border-l lg:flex">
						<div className="fade-in slide-in-from-bottom-8 relative z-10 w-full animate-in duration-700">
							{previewContent}
						</div>
					</div>
				</div>
				<div className="w-full border-stroke-soft-100 border-b" />
			</div>
		</div>
	);
};
