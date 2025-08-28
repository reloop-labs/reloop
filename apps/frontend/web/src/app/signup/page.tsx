"use client";
import * as Button from "@reloop/ui/components/button";
import * as Divider from "@reloop/ui/components/divider";
import { Icon } from "@reloop/ui/components/icon";
import * as Input from "@reloop/ui/components/input";
import * as Label from "@reloop/ui/components/label";
import * as LinkButton from "@reloop/ui/components/link-button";
import { Logo } from "@reloop/ui/components/logo";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const Page = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showEmail, setShowEmail] = useState(false);

	return (
		<div>
			<header className="relative mx-auto flex h-16 w-full max-w-7xl flex-1 items-center justify-between gap-4 px-4 lg:p-[18px]">
				<div className="flex items-center">
					<Logo className="h-8 w-8 rounded-full lg:h-10 lg:w-10" />
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
			<div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center">
				<div className="flex w-full max-w-[440px] flex-col gap-6 p-5 md:p-8">
					<div className="flex flex-col items-center justify-center gap-2">
						<div className="space-y-1 text-center">
							<h2 className="title-h6 md:title-h5 text-text-strong-950">
								Create your account
							</h2>
							<h2 className="paragraph-sm md:paragraph-md text-text-sub-600">
								Join us and get started today.
							</h2>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-2">
						<Button.Root
							mode="stroke"
							variant="neutral"
							className="h-12 w-full"
						>
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
							Sign up with Google
						</Button.Root>
						<Button.Root
							mode="stroke"
							variant="neutral"
							className="h-12 w-full"
						>
							<Icon name="github" className="h-5 w-5" />
							Sign up with GitHub
						</Button.Root>
						{!showEmail && (
							<Button.Root
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
					<AnimatePresence>
						{showEmail && (
							<motion.div
								initial={{ opacity: 0, height: 0, y: -20 }}
								animate={{ opacity: 1, height: "auto", y: 0 }}
								exit={{ opacity: 0, height: 0, y: -20 }}
								transition={{
									duration: 0.3,
									ease: "easeOut",
									opacity: { duration: 0.2 },
									height: { duration: 0.3 },
								}}
								className="overflow-hidden"
							>
								<div className="flex flex-col gap-3">
									<Divider.Root variant="line-text">OR</Divider.Root>
									<div className="flex flex-col gap-1">
										<Label.Root htmlFor="email">
											Email Address
											<Label.Asterisk />
										</Label.Root>
										<Input.Root>
											<Input.Wrapper>
												<Input.Input
													className="h-12 font-medium"
													id="email"
													type="email"
													placeholder="hello@reloop.com"
												/>
											</Input.Wrapper>
										</Input.Root>
									</div>
									<div className="flex flex-col gap-1">
										<Label.Root htmlFor="password1">
											Password <Label.Asterisk />
										</Label.Root>
										<Input.Root>
											<Input.Wrapper>
												<Input.Input
													id="password1"
													type={showPassword ? "text" : "password"}
													placeholder="••••••••••"
													className="h-12 font-medium"
												/>
												<button
													type="button"
													onClick={() => setShowPassword((s) => !s)}
												>
													{showPassword ? (
														<Icon
															name="eye-outline"
															className="size-5 fill-none text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
														/>
													) : (
														<Icon
															name="eye-slash-outline"
															className="size-5 fill-none text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
														/>
													)}
												</button>
											</Input.Wrapper>
										</Input.Root>
									</div>
								</div>
								<Button.Root variant="neutral" className="mt-4 h-12 w-full">
									Create Account
								</Button.Root>
							</motion.div>
						)}
					</AnimatePresence>
					<p className="text-center text-xs">
						By signing up, you agree to our <br />
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
