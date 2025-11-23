"use client";

import { CheckCircle2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import {
	ApiPreview,
	DomainPreview,
	SidebarPreview,
} from "./components/previews";
import { SplitLayout } from "./components/split-layout";
import { AddDomainStep } from "./steps/add-domain";
import { CreateOrgStep } from "./steps/create-org";
import { GenerateApiKeyStep } from "./steps/generate-api-key";

interface FormData {
	name: string;
	url: string;
	logo: File | null;
	logoPreview: string | null;
	apiKey: string;
	domain: string;
	country: string;
	referral: string;
}

const OnBoardingPage = () => {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [formData, setFormData] = useState<FormData>({
		name: "",
		url: "",
		logo: null,
		logoPreview: null,
		apiKey: "",
		domain: "",
		country: "US",
		referral: "",
	});

	const updateData = (newData: Partial<FormData>) => {
		setFormData((prev) => ({ ...prev, ...newData }));
	};

	const canProceed = () => {
		if (step === 1) return formData.name.length > 0;
		if (step === 2) return formData.apiKey.length > 0;
		if (step === 3) return true;
		return false;
	};

	const handleNext = () => {
		if (canProceed()) {
			if (step === 3) {
				setStep(4);
			} else {
				setStep(step + 1);
			}
		}
	};

	const handlePrevious = () => {
		if (step > 1) {
			setStep(step - 1);
		}
	};

	// Configuration for each step
	const stepsConfig = {
		1: {
			stepIndicator: "1/3",
			title: "Create your workspace",
			description: "Let's set up your team's environment.",
			component: <CreateOrgStep data={formData} updateData={updateData} />,
			preview: (
				<SidebarPreview name={formData.name} logo={formData.logoPreview} />
			),
		},
		2: {
			stepIndicator: "2/3",
			title: "Generate API Credentials",
			description: "Securely connect your application to our infrastructure.",
			component: <GenerateApiKeyStep data={formData} updateData={updateData} />,
			preview: <ApiPreview apiKey={formData.apiKey} />,
		},
		3: {
			stepIndicator: "3/3",
			title: "Verify Sending Domain",
			description: "Ensure high deliverability by verifying domain ownership.",
			component: <AddDomainStep data={formData} updateData={updateData} />,
			preview: <DomainPreview domain={formData.domain} />,
		},
	};

	if (step === 4) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white p-4">
				<div className="zoom-in max-w-md animate-in text-center duration-500">
					<div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
						<CheckCircle2 size={48} />
					</div>
					<h2 className="mb-4 font-bold text-3xl text-slate-900">
						Setup Complete!
					</h2>
					<p className="mb-8 text-lg text-slate-500">
						Your workspace{" "}
						<span className="font-semibold text-slate-900">
							{formData.name}
						</span>{" "}
						is ready. Redirecting you to the dashboard...
					</p>
					<button
						type="button"
						className="hover:-translate-y-1 w-full transform rounded-xl bg-slate-900 py-4 font-semibold text-white shadow-xl transition-all hover:shadow-2xl"
					>
						Go to Dashboard
					</button>
				</div>
			</div>
		);
	}

	const currentConfig = stepsConfig[step as keyof typeof stepsConfig];

	if (!currentConfig) {
		return null;
	}

	return (
		<SplitLayout
			stepIndicator={currentConfig.stepIndicator}
			title={currentConfig.title}
			description={currentConfig.description}
			previewContent={currentConfig.preview}
			onBack={step > 1 ? handlePrevious : undefined}
			onNext={handleNext}
			canProceed={canProceed()}
			isLastStep={step === 3}
		>
			{currentConfig.component}
		</SplitLayout>
	);
};

export default OnBoardingPage;
