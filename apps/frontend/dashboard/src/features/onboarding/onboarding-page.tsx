import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { useSessionQuery } from "#/features/auth/session-query";
import { OnboardingShell } from "./onboarding-shell";
import { onboardingStepParser } from "./onboarding-step";
import { StepOne } from "./step1/step-one";
import { StepOneSkeleton } from "./step1/step-one-skeleton";
import { StepTwo } from "./step4/step-two";
import { StepTwoSkeleton } from "./step4/step-two-skeleton";

export function OnboardingPage() {
	const router = useRouter();
	const { data: session, isPending } = useSessionQuery();
	const [step] = useQueryState("step", onboardingStepParser);
	const [, setLang] = useQueryState("lang", parseAsString.withDefault(""));

	useEffect(() => {
		if (isPending) return;
		if (!session) {
			router.push("/login");
		}
	}, [session, isPending, router]);

	const prevStepRef = useRef(step);
	useEffect(() => {
		const prev = prevStepRef.current;
		if (step < prev) {
			if (prev === 2) {
				void setLang(null);
			}
		}
		prevStepRef.current = step;
	}, [step, setLang]);

	useHotkeys(
		"escape",
		() => {
			if (step > 1) {
				window.history.back();
			}
		},
		{ enabled: step > 1 },
	);

	if (!isPending && !session) {
		return <AuthSessionLoader />;
	}

	return (
		<OnboardingShell step={step}>
			{isPending ? (
				step === 2 ? (
					<StepTwoSkeleton />
				) : (
					<StepOneSkeleton />
				)
			) : step === 2 ? (
				<StepTwo />
			) : (
				<StepOne />
			)}
		</OnboardingShell>
	);
}
