"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as DigitInput from "@reloop/ui/digit-input";
import { useRouter } from "next/navigation";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

export function VerifyOTP({
	email,
	onBack,
}: {
	email: string;
	onBack: () => void;
}) {
	const router = useRouter();
	const [enterCode, setEnterCode] = useQueryState(
		"enterCode",
		parseAsBoolean.withDefault(false),
	);
	const [otpValue, setOtpValue] = useQueryState(
		"otp",
		parseAsString.withDefault(""),
	);
	const [, setError] = useState<{
		name: "google" | "github" | "email";
		error: string | null;
	}>({ name: "email", error: null });

	const handleVerify = async (otpToVerify: string) => {
		try {
			const response = await authClient.emailOtp.checkVerificationOtp({
				otp: otpToVerify,
				email: email,
				type: "sign-in",
			});
			if (response.data?.success) {
				const { data } = await authClient.signIn.emailOtp({
					email: email,
					otp: otpToVerify,
				});
				if (data?.user.id) {
					router.push("/");
				} else {
					setError({
						name: "email",
						error: "Failed to login with email",
					});
				}
			} else {
				setError({
					name: "email",
					error: "Failed to login with email",
				});
			}
		} catch (e) {
			setError({
				name: "email",
				error: "Failed to login with email",
			});
		}
	};

	return (
		<div className="flex flex-col gap-4">
			{!enterCode ? (
				<Button.Root
					variant="neutral"
					className="h-11 w-full rounded-2xl!"
					mode="lighter"
					onClick={() => setEnterCode(true)}
				>
					Enter code manually
				</Button.Root>
			) : (
				<div className="flex flex-col items-center gap-8 py-4">
					<DigitInput.Root
						value={otpValue}
						onChange={(val) => setOtpValue(val)}
						onComplete={handleVerify}
						inputMode="numeric"
						maxLength={6}
						autoFocus
					>
						<DigitInput.Group>
							<DigitInput.Slot index={0} />
							<DigitInput.Slot index={1} />
							<DigitInput.Slot index={2} />
							<span className="mx-2 h-0.5 w-4 rounded-full bg-bg-sub-300" />
							<DigitInput.Slot index={3} />
							<DigitInput.Slot index={4} />
							<DigitInput.Slot index={5} />
						</DigitInput.Group>
					</DigitInput.Root>
					<Button.Root
						type="button"
						variant="neutral"
						className="h-11 w-full rounded-2xl!"
						onClick={() => handleVerify(otpValue)}
						disabled={otpValue.length !== 6}
					>
						Continue with login code
					</Button.Root>
				</div>
			)}
			<button
				type="button"
				onClick={onBack}
				className="text-center font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950"
			>
				Back to login
			</button>
		</div>
	);
}
