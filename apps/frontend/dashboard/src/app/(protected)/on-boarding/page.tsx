"use client";
import { parseAsInteger, useQueryState } from "nuqs";
import { AddDomainStep } from "./steps/add-domain";
import { CreateOrgStep } from "./steps/create-org";
import { GenerateApiKeyStep } from "./steps/generate-api-key";

const OnBoardingPage = () => {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));

	const handleNext = () => {
		setStep(step + 1);
	};

	const handlePrevious = () => {
		setStep(step - 1);
	};

	return (
		<div>
			{step === 1 && <CreateOrgStep />}
			{step === 2 && <GenerateApiKeyStep />}
			{step === 3 && <AddDomainStep />}
		</div>
	);
};

export default OnBoardingPage;
