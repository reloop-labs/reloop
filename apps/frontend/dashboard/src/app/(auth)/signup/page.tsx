"use client";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import { Logo } from "@reloop/ui/logo";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { SignupForm } from "./signup-form";

const Page = () => {
	const [showEmail, setShowEmail] = useState(false);
	const [loading, setLoading] = useState<{
		name: "google" | "github" | "email";
		loading: boolean;
	}>({ name: "email", loading: false });
	const [error, setError] = useState<{
		name: "google" | "github" | "email";
		error: string | null;
	}>({ name: "email", error: null });

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
						Login
					</Link>
				</div>
			</header>
			<div
				className={`flex flex-col items-center justify-center ${showEmail ? "h-[calc(100vh-64px)]" : "h-[calc(100vh-150px)]"}`}
			>
				<div className="flex w-full max-w-[440px] flex-col gap-6 p-5 md:p-8">
					<div className="flex flex-col items-center justify-center gap-2">
						<div className="space-y-1 text-center">
							<h2 className="title-h5 md:title-h5 text-text-strong-950">
								Let's create your account{" "}
							</h2>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-2">
						<Button.Root
							disabled={loading.loading}
							mode="stroke"
							variant="neutral"
							className="h-12 w-full"
							onClick={async () => {
								try {
									setLoading({ name: "google", loading: true });
									await authClient.signIn.social({
										provider: "google",
										callbackURL: "/dashboard",
									});
								} catch (error) {
									setLoading({ name: "google", loading: false });
									setError({
										name: "google",
										error: "Failed to login with Google",
									});
								}
							}}
						>
							{loading.name === "google" && loading.loading ? (
								<Spinner color="var(--text-strong-950)" size={16} />
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
									fill="none"
								>
									<path
										fill="#4280EF"
										d="M14.117 7.661c0-.456-.045-.926-.118-1.368H7.63v2.604h3.648a3.07 3.07 0 0 1-1.353 2.044l2.177 1.692c1.28-1.192 2.015-2.927 2.015-4.972"
									/>
									<path
										fill="#34A353"
										d="M7.63 14.252c1.824 0 3.354-.604 4.472-1.633l-2.177-1.677c-.603.412-1.383.647-2.295.647-1.765 0-3.25-1.191-3.794-2.78L1.6 10.53a6.74 6.74 0 0 0 6.03 3.722"
									/>
									<path
										fill="#F6B704"
										d="M3.836 8.794a4.1 4.1 0 0 1 0-2.588L1.6 4.47a6.76 6.76 0 0 0 0 6.06z"
									/>
									<path
										fill="#E54335"
										d="M7.63 3.426A3.68 3.68 0 0 1 10.22 4.44L12.146 2.5A6.5 6.5 0 0 0 7.63.749a6.74 6.74 0 0 0-6.03 3.72l2.236 1.736c.544-1.603 2.03-2.78 3.794-2.78"
									/>
								</svg>
							)}
							Sign up with Google
						</Button.Root>
						<Button.Root
							disabled={loading.loading}
							mode="stroke"
							variant="neutral"
							className="h-12 w-full"
							onClick={async () => {
								try {
									setLoading({ name: "github", loading: true });
									await authClient.signIn.social({
										provider: "github",
										callbackURL: "/dashboard",
									});
								} catch (error) {
									setLoading({ name: "github", loading: false });
									setError({
										name: "github",
										error: "Failed to login with GitHub",
									});
								}
							}}
						>
							{loading.name === "github" && loading.loading ? (
								<Spinner color="var(--text-strong-950)" size={16} />
							) : (
								<Icon name="github" className="h-5 w-5" />
							)}
							Sign up with GitHub
						</Button.Root>
						{!showEmail && (
							<Button.Root
								disabled={loading.loading}
								mode="stroke"
								variant="neutral"
								className="h-12 w-full"
								onClick={() => setShowEmail(true)}
							>
								<Icon name="social-mail" className="h-[17.5px] w-[17.5px]" />
								Sign up with Email
							</Button.Root>
						)}
					</div>
					<AnimatePresence>{showEmail && <SignupForm />}</AnimatePresence>
					<p className="text-center text-xs">
						By creating an account, you agree to our <br />
						<Link
							href="/terms"
							className={LinkButton.linkButtonVariants({
								variant: "black",
							}).root({ className: "text-xs!" })}
						>
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link
							href="/privacy"
							className={LinkButton.linkButtonVariants({
								variant: "black",
							}).root({ className: "text-xs!" })}
						>
							Privacy Policy
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Page;
