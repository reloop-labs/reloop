"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as DigitInput from "@reloop/ui/digit-input";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

export function VerifyOTP({
	email,
	onBack,
}: {
	email: string;
	onBack: () => void;
}) {
	const router = useRouter();
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const [enterCode, setEnterCode] = useQueryState(
		"enterCode",
		parseAsBoolean.withDefault(false),
	);
	const [otpValue, setOtpValue] = useQueryState(
		"otp",
		parseAsString.withDefault(""),
	);
	const { changeStatus, status } = useLoading();
	const [error, setError] = useState<{
		name: "google" | "github" | "email";
		error: string | null;
	}>({ name: "email", error: null });
	const [isSuccess, setIsSuccess] = useState(false);

	const handleVerify = async (otpToVerify: string) => {
		try {
			changeStatus("loading");
			const { data, error } = await authClient.signIn.emailOtp({
				email: email,
				otp: otpToVerify,
			});
			if (data?.user.id) {
				setIsSuccess(true);
				changeStatus("idle");
				timeoutRef.current = setTimeout(() => {
					router.push("/");
				}, 3000);
			} else {
				changeStatus("idle");
				setError({
					name: "email",
					error:
						error?.message || "Invalid verification code. Please try again.",
				});
			}
		} catch (e) {
			changeStatus("idle");
			setError({
				name: "email",
				error: "An error occurred during verification. Please try again.",
			});
		}
	};

	return (
		<div>
			<AnimatePresence initial={false}>
				{enterCode && (
					<motion.div
						key="otp-input"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="flex flex-col items-center overflow-hidden"
					>
						<div className="pt-1 pb-5">
							<DigitInput.Root
								value={otpValue}
								onChange={(val) => {
									setError({ name: "email", error: null });
									setIsSuccess(false);
									setOtpValue(val);
								}}
								onComplete={handleVerify}
								inputMode="numeric"
								maxLength={6}
								autoFocus
								hasError={!!error.error}
								isSuccess={isSuccess}
							>
								<DigitInput.Group>
									<DigitInput.Slot index={0} />
									<DigitInput.Slot index={1} />
									<DigitInput.Slot index={2} />
									<DigitInput.Separator />
									<DigitInput.Slot index={3} />
									<DigitInput.Slot index={4} />
									<DigitInput.Slot index={5} />
								</DigitInput.Group>
							</DigitInput.Root>
							{error.error && (
								<p className="pt-2 text-center text-error-base text-sm">
									{error.error}
								</p>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<Button.Root
				type="button"
				variant="neutral"
				className={`h-11 w-full rounded-2xl! ${isSuccess ? "border-success-base bg-success-base text-white hover:bg-success-base" : ""}`}
				mode={!enterCode ? "lighter" : undefined}
				onClick={() => {
					if (!enterCode) {
						setEnterCode(true);
					} else {
						handleVerify(otpValue);
					}
				}}
				disabled={
					enterCode &&
					(otpValue.length !== 6 || status === "loading" || isSuccess)
				}
			>
				{status === "loading" && <Spinner color="var(--text-strong-950)" />}
				{!enterCode
					? "Enter code manually"
					: isSuccess
						? "Verified successfully!"
						: status === "loading"
							? "Verifying..."
							: "Continue with signup code"}
			</Button.Root>
			<div className="mt-4 flex justify-center">
				<button
					type="button"
					onClick={onBack}
					className="cursor-pointer text-center font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 hover:underline"
				>
					Back to signup
				</button>
			</div>
		</div>
	);
}
