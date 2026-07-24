import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
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

const cardVariants = {
	enter: (direction: number) => ({
		y: direction > 0 ? "100%" : "-100%",
		opacity: 0,
	}),
	center: {
		y: 0,
		opacity: 1,
	},
	exit: (direction: number) => ({
		y: direction > 0 ? "-100%" : "100%",
		opacity: 0,
	}),
};

export function CreateContactPage() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] =
		useState<CreateContactStep>("select-method");

	const isMethodSelection = currentStep === "select-method";

	useHotkeys("esc", () => {
		void navigate({ to: "/contacts" });
	});

	return (
		<div className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden bg-[#fcfcfc] font-sans text-text-strong-950 dark:bg-bg-weak-50">
			{/* Top Right Close Button */}
			<div className="absolute top-6 right-6 z-30 lg:right-10">
				<button
					type="button"
					onClick={() => void navigate({ to: "/contacts" })}
					className="group flex cursor-pointer items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-text-sub-600 text-xs shadow-xs transition-all hover:bg-bg-weak-50 hover:text-text-strong-950"
				>
					<Icon
						name="cross"
						className="h-3.5 w-3.5 text-text-sub-600 group-hover:text-text-strong-950"
					/>
					<KbdEsc />
				</button>
			</div>

			{/* Main Content Layout Container - Top anchored so top line & side items NEVER flicker or shift */}
			<div className="relative z-20 mx-auto w-full max-w-[1280px] px-6 lg:px-12 pt-20 lg:pt-28 pb-16">
				<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
					{/* Left Column (3/12) - Aligned to top (start) of card */}
					<div className="flex justify-start pt-8 text-left lg:col-span-3 lg:justify-end lg:text-right">
						<div className="font-semibold text-sm text-text-strong-950">
							Add Contact
						</div>
					</div>

					{/* Center Column (6/12) - Box container with attached dashed grid lines & smooth height transition */}
					<motion.div
						layout
						transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
						className="relative flex flex-col items-center lg:col-span-6"
					>
						{/* Full Viewport Background Grid Lines (Anchored directly to central box) */}
						<div className="pointer-events-none absolute inset-0 z-10 hidden overflow-visible lg:block">
							{/* Top Horizontal Dashed Line */}
							<div className="-left-[100vw] -right-[100vw] absolute top-0 border-[#e5e7eb] border-b border-dashed dark:border-neutral-800" />

							{/* Bottom Horizontal Dashed Line */}
							<div className="-left-[100vw] -right-[100vw] absolute bottom-0 border-[#e5e7eb] border-b border-dashed dark:border-neutral-800" />

							{/* Left Vertical Dashed Line */}
							<div className="-top-[100vh] -bottom-[100vh] absolute left-0 border-[#e5e7eb] border-r border-dashed dark:border-neutral-800" />

							{/* Right Vertical Dashed Line */}
							<div className="-top-[100vh] -bottom-[100vh] absolute right-0 border-[#e5e7eb] border-r border-dashed dark:border-neutral-800" />

							{/* 4 Intersection Corner Handles */}
							<div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 z-20 h-2 w-2 rounded-[1px] border border-[#d1d5db] bg-white dark:border-neutral-700 dark:bg-neutral-900" />
							<div className="-translate-y-1/2 absolute top-0 right-0 z-20 h-2 w-2 translate-x-1/2 rounded-[1px] border border-[#d1d5db] bg-white dark:border-neutral-700 dark:bg-neutral-900" />
							<div className="-translate-x-1/2 absolute bottom-0 left-0 z-20 h-2 w-2 translate-y-1/2 rounded-[1px] border border-[#d1d5db] bg-white dark:border-neutral-700 dark:bg-neutral-900" />
							<div className="absolute right-0 bottom-0 z-20 h-2 w-2 translate-x-1/2 translate-y-1/2 rounded-[1px] border border-[#d1d5db] bg-white dark:border-neutral-700 dark:bg-neutral-900" />
						</div>

						{/* Center Card Content (Container for main card and stacked previous card) */}
						<div className="relative z-20 mx-auto w-full max-w-xl py-8">
							{/* Stacked Previous Card (Method Selection Card sitting above top border line when in step 2) */}
							<motion.div
								initial={false}
								animate={{
									y: isMethodSelection ? 0 : "calc(-100% - 24px)",
									scale: isMethodSelection ? 1 : 0.90,
									opacity: isMethodSelection ? 1 : 0.25,
									filter: isMethodSelection ? "blur(0px)" : "blur(2px)",
								}}
								transition={{
									duration: 0.4,
									ease: [0.16, 1, 0.3, 1],
								}}
								style={{ transformOrigin: "bottom center" }}
								className={`w-full ${
									!isMethodSelection
										? "absolute top-2 left-0 right-0 z-10 cursor-pointer hover:opacity-50 transition-opacity"
										: "relative z-20"
								}`}
								onClick={() => {
									if (!isMethodSelection) {
										setCurrentStep("select-method");
									}
								}}
							>
								<MethodSelectionCard onSelectMethod={setCurrentStep} />
							</motion.div>

							{/* Active Detail Step Card (Single Contact, CSV, API) - Sliding up from the bottom */}
							<AnimatePresence mode="sync">
								{!isMethodSelection && (
									<motion.div
										key={currentStep}
										initial={{ y: "100%", opacity: 0, scale: 0.95 }}
										animate={{ y: 0, opacity: 1, scale: 1 }}
										exit={{ y: "100%", opacity: 0, scale: 0.95 }}
										transition={{
											duration: 0.45,
											ease: [0.16, 1, 0.3, 1],
										}}
										className="relative z-20 w-full"
									>
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
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Footer note sitting directly centered ON the bottom horizontal dashed line */}
						<div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex translate-y-1/2 justify-center">
							<span className="bg-[#fcfcfc] px-3 text-text-sub-600 text-xs dark:bg-bg-weak-50">
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
					</motion.div>

					{/* Right Column (3/12) - Aligned to top (start) of card */}
					<div className="flex justify-start pt-8 lg:col-span-3">
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
