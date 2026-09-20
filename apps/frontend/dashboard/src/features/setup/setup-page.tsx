"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard } from "#/features/auth/auth-card";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { AuthShell } from "#/features/auth/auth-shell";
import { useAuthStepDirection } from "#/features/auth/use-auth-step-direction";
import { SETUP_STEPS, SetupForm } from "./setup-form";
import { useSetupStatusQuery } from "./use-setup-status";

function StepIndicator({ step }: { step: number }) {
	return (
		<div className="flex flex-col items-end gap-2">
			<p className="font-medium text-[12px] text-text-soft-400 tabular-nums">
				Step {step + 1} of {SETUP_STEPS.length}
			</p>
			<div className="flex gap-1" aria-hidden>
				{SETUP_STEPS.map(({ title }, index) => (
					<span
						key={title}
						className={`h-1 w-6 rounded-full transition-colors duration-200 ${
							index <= step ? "bg-primary-base" : "bg-bg-soft-200"
						}`}
					/>
				))}
			</div>
		</div>
	);
}

export function SetupWizard() {
	const [step, setStep] = useState(0);
	const direction = useAuthStepDirection(step);

	return (
		<AuthShell direction={direction} hideLogo>
			<AuthCard
				footer="First run only. The key stops working after setup."
				headerAside={<StepIndicator step={step} />}
			>
				<SetupForm step={step} direction={direction} onStepChange={setStep} />
			</AuthCard>
		</AuthShell>
	);
}

export function SetupPage() {
	const router = useRouter();
	const { data, isFetched, isError, isPending } = useSetupStatusQuery();

	const isSetupRequired = data?.required === true;
	const isUnavailable = isFetched && !isError && !isSetupRequired;

	useEffect(() => {
		if (!isUnavailable) return;
		router.replace("/login");
	}, [isUnavailable, router]);

	if (isPending || isError || !isSetupRequired) {
		return <AuthSessionLoader />;
	}

	return <SetupWizard />;
}
