"use client";

import * as Button from "@reloop/ui/button";
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

	// Configuration for each step
	const stepsConfig = {
		1: {
			stepIndicator: "1/3",
			title: "Create your workspace",
			component: <CreateOrgStep data={formData} updateData={updateData} />,
			preview: (
				<SidebarPreview name={formData.name} logo={formData.logoPreview} />
			),
		},
		2: {
			stepIndicator: "2/3",
			title: "Generate API Credentials",
			component: <GenerateApiKeyStep data={formData} updateData={updateData} />,
			preview: <ApiPreview apiKey={formData.apiKey} />,
		},
		3: {
			stepIndicator: "3/3",
			title: "Verify Sending Domain",
			component: <AddDomainStep data={formData} updateData={updateData} />,
			preview: <DomainPreview domain={formData.domain} />,
		},
	};

	if (step === 4) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-bg-white-0 p-4">
				<div className="zoom-in max-w-md animate-in text-center duration-500">
					<div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-success-lighter text-success-base">
						<CheckCircle2 size={48} />
					</div>
					<h2 className="mb-4 font-bold text-3xl text-text-strong-950">
						Setup Complete!
					</h2>
					<p className="mb-8 text-lg text-text-sub-600">
						Your workspace{" "}
						<span className="font-semibold text-text-strong-950">
							{formData.name}
						</span>{" "}
						is ready. Redirecting you to the dashboard...
					</p>
					<Button.Root variant="neutral" mode="filled" className="w-full">
						Go to Dashboard
					</Button.Root>
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
			previewContent={currentConfig.preview}
		>
			{currentConfig.component}
		</SplitLayout>
	);
};

export default OnBoardingPage;
