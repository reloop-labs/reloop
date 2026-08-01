import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { AiPanel } from "#/features/dashboard/layout/ai-panel";
import { useUIStore } from "#/store/use-ui-store";
import { AiImportStep } from "./components/ai-import-step";
import { ApiSyncStep } from "./components/api-sync-step";
import {
	type CreateContactStep,
	CreateContactStepper,
} from "./components/create-contact-stepper";
import { CsvImportStep } from "./components/csv-import-step";
import { MethodSelectionCard } from "./components/method-selection-card";
import { SingleContactForm } from "./components/single-contact-form";

export function CreateContactPage() {
	const router = useRouter();
	const isAiPanelOpen = useUIStore((s) => s.isAiPanelOpen);
	const [currentStep, setCurrentStep] =
		useState<CreateContactStep>("select-method");

	const isMethodSelection = currentStep === "select-method";

	useHotkeys("esc", () => {
		router.push("/contacts");
	});

	return (
		<div className="flex h-dvh max-h-[100dvh] w-full overflow-hidden bg-[#fcfcfc] font-sans text-text-strong-950 dark:bg-bg-weak-50">
			{/* Left Main Workspace (Locked 100dvh, Overflow Hidden) */}
			<div className="relative flex h-[100dvh] max-h-[100dvh] min-w-0 flex-1 flex-col overflow-hidden">
				{/* Top Right Close Button */}
				<div className="absolute top-6 right-6 z-30 lg:right-10">
					<button
						type="button"
						onClick={() => router.push("/contacts")}
						className="group flex cursor-pointer items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-text-sub-600 text-xs shadow-xs transition-all hover:bg-bg-weak-50 hover:text-text-strong-950"
					>
						<Icon
							name="cross"
							className="h-3.5 w-3.5 text-text-sub-600 group-hover:text-text-strong-950"
						/>
						<KbdEsc />
					</button>
				</div>

				{/* Main Content Layout Container */}
				<div className="relative z-20 mx-auto w-full max-w-7xl px-6 pt-28 pb-16 lg:px-12">
					<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
						{/* Left Column (3/12) */}
						<div className="flex justify-start px-4 pt-12 text-left lg:col-span-3 lg:justify-end lg:px-4 lg:text-right">
							<div className="font-medium text-text-sub-600/70 text-xs">
								Add Contact
							</div>
						</div>

						{/* Center Column (6/12) */}
						<motion.div
							layout
							transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
							className="relative flex flex-col items-center lg:col-span-6"
						>
							{/* Full Viewport Background Grid Lines */}
							<div className="pointer-events-none absolute inset-0 z-10 hidden overflow-visible lg:block">
								<div className="-left-[100vw] -right-[100vw] absolute top-0 border-[#e5e7eb] border-b border-dashed dark:border-neutral-800" />
								<div className="-left-[100vw] -right-[100vw] absolute bottom-0 border-[#e5e7eb] border-b border-dashed dark:border-neutral-800" />
								<div className="-top-[100vh] -bottom-[100vh] absolute left-0 border-[#e5e7eb] border-r border-dashed dark:border-neutral-800" />
								<div className="-top-[100vh] -bottom-[100vh] absolute right-0 border-[#e5e7eb] border-r border-dashed dark:border-neutral-800" />
								<div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 z-20 h-2 w-2 rounded-[1px] border border-[#d1d5db] bg-white dark:border-neutral-700 dark:bg-neutral-900" />
								<div className="-translate-y-1/2 absolute top-0 right-0 z-20 h-2 w-2 translate-x-1/2 rounded-[1px] border border-[#d1d5db] bg-white dark:border-neutral-700 dark:bg-neutral-900" />
								<div className="-translate-x-1/2 absolute bottom-0 left-0 z-20 h-2 w-2 translate-y-1/2 rounded-[1px] border border-[#d1d5db] bg-white dark:border-neutral-700 dark:bg-neutral-900" />
								<div className="absolute right-0 bottom-0 z-20 h-2 w-2 translate-x-1/2 translate-y-1/2 rounded-[1px] border border-[#d1d5db] bg-white dark:border-neutral-700 dark:bg-neutral-900" />
							</div>

							{/* Center Card Content */}
							<div
								className={`relative z-20 w-full p-7 ${
									isMethodSelection ? "overflow-hidden" : ""
								}`}
							>
								<motion.div
									initial={false}
									animate={{
										y: isMethodSelection ? 0 : "calc(-100% - 20px)",
										scale: isMethodSelection ? 1 : 0.92,
										opacity: isMethodSelection ? 1 : 0.65,
										filter: isMethodSelection ? "blur(0px)" : "blur(0px)",
									}}
									transition={{
										duration: 0.4,
										ease: [0.16, 1, 0.3, 1],
									}}
									style={{ transformOrigin: "bottom center" }}
									className={`w-full ${
										!isMethodSelection
											? "absolute top-2 right-0 left-0 z-10 cursor-pointer transition-opacity hover:opacity-100"
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
											className={`w-full ${
												isMethodSelection
													? "pointer-events-none absolute top-7 right-7 left-7 z-10"
													: "relative z-20"
											}`}
										>
											{currentStep === "single-contact" && (
												<SingleContactForm
													onBack={() => setCurrentStep("select-method")}
												/>
											)}

											{currentStep === "csv-import" && (
												<CsvImportStep
													onBack={() => setCurrentStep("select-method")}
												/>
											)}

											{currentStep === "api-sync" && (
												<ApiSyncStep
													onBack={() => setCurrentStep("select-method")}
												/>
											)}

											{currentStep === "ai-import" && (
												<AiImportStep
													onBack={() => setCurrentStep("select-method")}
												/>
											)}
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</motion.div>

						{/* Right Column (3/12) */}
						<div className="flex justify-start px-4 pt-12 lg:col-span-3 lg:px-4">
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

			{/* Inline Support Side Panel - matches DashboardShell */}
			<AnimatePresence>{isAiPanelOpen ? <AiPanel /> : null}</AnimatePresence>
		</div>
	);
}
