"use client";

import { Logo } from "@reloop/ui/logo";
import { ChevronLeft } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import type React from "react";

interface SplitLayoutProps {
	stepIndicator: string;
	title: string;
	children: React.ReactNode;
	previewContent?: React.ReactNode;
	fullWidth?: boolean;
}

export const SplitLayout = ({
	stepIndicator,
	title,
	children,
	previewContent,
	fullWidth = false,
}: SplitLayoutProps) => {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const onBack = step > 1 ? () => setStep(step - 1) : undefined;
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<div className="-translate-x-1/2 absolute top-5 left-1/2 flex items-center space-x-2">
				<Logo className="h-10 w-10 lg:h-11 lg:w-11" />
				<span
					className="-ml-3 -mt-1 font-semibold text-text-strong-950 text-xl"
					style={{ fontFamily: "var(--font-outfit)" }}
				>
					reloop
				</span>
			</div>
			<div className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center border-stroke-soft-100 border-r border-l">
				<div className="w-full border-stroke-soft-100 border-t" />
				<div
					className={`mx-auto grid h-full w-full ${fullWidth ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}
				>
					<div
						className={`flex flex-col gap-4 ${fullWidth ? "px-12 lg:px-24" : "px-12"} pt-9 pb-9`}
					>
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
					{!fullWidth && previewContent && (
						<div className="relative hidden w-full overflow-hidden border-stroke-soft-100 border-l lg:flex">
							<div className="fade-in slide-in-from-bottom-8 relative z-10 w-full animate-in duration-700">
								{previewContent}
							</div>
						</div>
					)}
				</div>
				<div className="w-full border-stroke-soft-100 border-b" />
			</div>
		</div>
	);
};
