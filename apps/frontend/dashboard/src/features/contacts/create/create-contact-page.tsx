import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ApiSyncStep } from "./components/api-sync-step";
import {
	type CreateContactStep,
	CreateContactStepper,
} from "./components/create-contact-stepper";
import { CsvImportStep } from "./components/csv-import-step";
import { MethodSelectionCard } from "./components/method-selection-card";
import { SingleContactForm } from "./components/single-contact-form";

export function CreateContactPage() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] =
		useState<CreateContactStep>("select-method");

	useHotkeys("esc", () => {
		void navigate({ to: "/contacts" });
	});

	return (
		<div className="min-h-screen w-full bg-[#fcfcfc] dark:bg-bg-weak-50 text-text-strong-950 font-sans relative flex flex-col justify-center items-center overflow-x-hidden p-6 lg:p-12">
			{/* Top Right Close Button */}
			<div className="absolute top-6 right-6 lg:right-10 z-30">
				<button
					type="button"
					onClick={() => void navigate({ to: "/contacts" })}
					className="group flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-xs text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 shadow-xs transition-all cursor-pointer"
				>
					<Icon name="cross" className="h-3.5 w-3.5 text-text-sub-600 group-hover:text-text-strong-950" />
					<KbdEsc />
				</button>
			</div>

			{/* Main Content Layout Container */}
			<div className="w-full max-w-[1280px] mx-auto my-auto relative z-20">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
					{/* Left Column (3/12) - Aligned to top (start) of card */}
					<div className="lg:col-span-3 flex justify-start lg:justify-end text-left lg:text-right pt-0.5 lg:pt-1">
						<div className="font-semibold text-sm text-text-strong-950">
							Create Contact
						</div>
					</div>

					{/* Center Column (6/12) - Box container with attached dashed grid lines */}
					<div className="lg:col-span-6 flex flex-col items-center relative">
						{/* Full Viewport Background Grid Lines (Anchored directly to central box) */}
						<div className="absolute inset-0 pointer-events-none z-10 hidden lg:block overflow-visible">
							{/* Top Horizontal Dashed Line */}
							<div className="absolute top-0 -left-[100vw] -right-[100vw] border-b border-dashed border-[#e5e7eb] dark:border-neutral-800" />

							{/* Bottom Horizontal Dashed Line */}
							<div className="absolute bottom-0 -left-[100vw] -right-[100vw] border-b border-dashed border-[#e5e7eb] dark:border-neutral-800" />

							{/* Left Vertical Dashed Line */}
							<div className="absolute -top-[100vh] -bottom-[100vh] left-0 border-r border-dashed border-[#e5e7eb] dark:border-neutral-800" />

							{/* Right Vertical Dashed Line */}
							<div className="absolute -top-[100vh] -bottom-[100vh] right-0 border-r border-dashed border-[#e5e7eb] dark:border-neutral-800" />

							{/* 4 Intersection Corner Handles */}
							<div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-[#d1d5db] dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-[1px] z-20" />
							<div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-[#d1d5db] dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-[1px] z-20" />
							<div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 border border-[#d1d5db] dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-[1px] z-20" />
							<div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-2 h-2 border border-[#d1d5db] dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-[1px] z-20" />
						</div>

						{/* Center Card Content */}
						<div className="w-full max-w-xl mx-auto relative z-20 pb-8">
							{currentStep === "select-method" && (
								<MethodSelectionCard onSelectMethod={setCurrentStep} />
							)}

							{currentStep === "single-contact" && (
								<SingleContactForm
									onBack={() => setCurrentStep("select-method")}
								/>
							)}

							{currentStep === "csv-import" && (
								<CsvImportStep onBack={() => setCurrentStep("select-method")} />
							)}

							{currentStep === "api-sync" && (
								<ApiSyncStep onBack={() => setCurrentStep("select-method")} />
							)}
						</div>

						{/* Footer note sitting directly centered ON the bottom horizontal dashed line */}
						<div className="absolute bottom-0 translate-y-1/2 inset-x-0 flex justify-center z-20 pointer-events-auto">
							<span className="bg-[#fcfcfc] dark:bg-bg-weak-50 px-3 text-xs text-text-sub-600">
								Looking to configure custom properties?{" "}
								<button
									type="button"
									onClick={() => void navigate({ to: "/contacts/properties" })}
									className="font-semibold text-text-strong-950 underline hover:text-black"
								>
									Get started
								</button>
							</span>
						</div>
					</div>

					{/* Right Column (3/12) - Aligned to top (start) of card */}
					<div className="lg:col-span-3 flex justify-start pt-0.5 lg:pt-1">
						<div className="w-full max-w-xs">
							<CreateContactStepper
								currentStep={currentStep}
								onStepClick={setCurrentStep}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
