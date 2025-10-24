"use client";

import * as Button from "@reloop/ui/button";
import * as LinkButton from "@reloop/ui/link-button";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

const ForgotPassword = () => {
	return (
		<div>
			<header className="relative mx-auto flex h-16 w-full max-w-7xl flex-1 items-center justify-between gap-4 px-4 lg:p-[18px]">
				<div className="flex items-center">
					<Link href="/">
						<Logo className="h-8 w-8 rounded-full lg:h-10 lg:w-10" />
					</Link>
				</div>
				<div className="flex items-center gap-2">
					<Link
						href="/login"
						className={Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
							size: "xsmall",
						}).root()}
					>
						Back to Login
					</Link>
				</div>
			</header>
			<div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center">
				<div className="flex w-full max-w-[440px] flex-col gap-6 p-5 md:p-8">
					<div className="flex flex-col items-center justify-center gap-2">
						<div className="space-y-1 text-center">
							<h2 className="title-h5 md:title-h5 text-text-strong-950">
								Forgot your password?
							</h2>
							<p className="text-paragraph-sm text-text-sub-600">
								No worries, we'll send you reset instructions.
							</p>
						</div>
					</div>
					<AnimatePresence>
						<ForgotPasswordForm />
					</AnimatePresence>
					<div className="flex items-center justify-center gap-1">
						<p className="text-paragraph-sm text-text-sub-600">
							Remember your password?
						</p>
						<Link
							href="/login"
							className={LinkButton.linkButtonVariants({
								variant: "black",
							}).root({ className: "underline" })}
						>
							Sign in
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
