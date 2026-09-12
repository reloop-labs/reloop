"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { AiImportStep } from "./components/ai-import-step";
import { ApiSyncStep } from "./components/api-sync-step";
import { CsvImportStep } from "./components/csv-import-step";
import { MethodSelectionCard } from "./components/method-selection-card";
import { SingleContactForm } from "./components/single-contact-form";
import type { CreateContactStep } from "./types";

export function CreateContactPage() {
	const [currentStep, setCurrentStep] =
		useState<CreateContactStep>("select-method");
	const [droppedFile, setDroppedFile] = useState<File | null>(null);

	const isMethodSelection = currentStep === "select-method";

	const handleFileSelect = (file: File) => {
		setDroppedFile(file);
		setCurrentStep("csv-import");
	};

	return (
		<div className="w-full min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-8 sm:py-10">
			<div className="mx-auto w-full max-w-xl">
				{/* Top Navigation Row: Back Button */}
				<div className="mb-6 flex items-center justify-between">
					<AnimatedBackButton
						fallbackHref="/contacts"
						onClick={
							!isMethodSelection ? () => setCurrentStep("select-method") : undefined
						}
					/>
				</div>

				{/* Main Flow Content */}
				<div className="relative w-full">
					<AnimatePresence mode="wait">
						{isMethodSelection ? (
							<motion.div
								key="select-method"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
								className="w-full"
							>
								<MethodSelectionCard
									onSelectMethod={setCurrentStep}
									onFileSelect={handleFileSelect}
								/>
							</motion.div>
						) : (
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
								className="w-full"
							>
								{currentStep === "single-contact" && (
									<SingleContactForm
										onBack={() => setCurrentStep("select-method")}
									/>
								)}

								{currentStep === "csv-import" && (
									<CsvImportStep
										initialFile={droppedFile}
										onBack={() => {
											setDroppedFile(null);
											setCurrentStep("select-method");
										}}
									/>
								)}

								{currentStep === "api-sync" && (
									<ApiSyncStep onBack={() => setCurrentStep("select-method")} />
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
			</div>
		</div>
	);
}
