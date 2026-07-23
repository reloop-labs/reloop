import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Popover from "@reloop/ui/popover";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ForwardDNSRecordsButtonProps {
	domainId: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const layoutSpringConfig = {
	type: "spring" as const,
	duration: 0.3,
	bounce: 0,
};

export const ForwardDNSRecordsButton = ({
	domainId,
}: ForwardDNSRecordsButtonProps) => {
	const shouldReduceMotion = !!useReducedMotion();
	const [isOpen, setIsOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [isSent, setIsSent] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			setEmail("");
			setError(null);
			setIsSending(false);
			setIsSent(false);
		}
	}, [isOpen]);

	const handleEmailChange = (val: string) => {
		setEmail(val);
		if (error) {
			setError(null);
		}
	};

	const handleForward = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedEmail = email.trim();

		if (!trimmedEmail) {
			setError("Email is required.");
			return;
		}

		if (!EMAIL_REGEX.test(trimmedEmail)) {
			setError("Please enter a valid email address.");
			return;
		}

		if (!domainId || isSending) return;

		setIsSending(true);
		setError(null);

		try {
			await axios.post(
				`/api/domain/v1/verify/${domainId}/forward-dns`,
				{ email: trimmedEmail },
				{ withCredentials: true },
			);
			setIsSending(false);
			setIsSent(true);
			setTimeout(() => {
				setIsOpen(false);
				setIsSent(false);
				setEmail("");
			}, 2000);
		} catch (err) {
			const errorMessage = axios.isAxiosError(err)
				? err.response?.data?.message || "Failed to forward DNS records"
				: "Failed to forward DNS records";
			setError(errorMessage);
			toast.error(errorMessage);
			setIsSending(false);
		}
	};

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					className={cn(
						"gap-1.5 rounded-xl transition-transform duration-150 ease-out active:scale-[0.98]",
						isOpen && "bg-bg-weak-50",
					)}
				>
					<Icon name="mail-single" className="h-4 w-4" />
					Forward records
				</Button.Root>
			</Popover.Trigger>
			<Popover.Content
				align="end"
				sideOffset={8}
				showArrow={false}
				className="w-[300px] overflow-hidden p-0"
			>
				<motion.div
					animate={{ height: isSent ? 176 : error ? 253 : 233 }}
					transition={shouldReduceMotion ? { duration: 0 } : layoutSpringConfig}
					className="overflow-hidden"
				>
					<div className="p-4">
						<AnimatePresence mode="wait">
							{isSent ? (
								<motion.div
									key="success"
									initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
									transition={{ duration: 0.2 }}
									className="flex flex-col items-center justify-center py-6 text-center"
								>
									<motion.div
										initial={{ scale: shouldReduceMotion ? 1 : 0, opacity: 0 }}
										animate={{
											scale: shouldReduceMotion ? 1 : [0, 1.15, 1],
											opacity: 1,
										}}
										transition={{
											duration: shouldReduceMotion ? 0.2 : 0.4,
											ease: "easeOut",
										}}
										className="mb-2 flex items-center justify-center rounded-full bg-emerald-500/10 p-3 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
									>
										<svg
											className="h-6 w-6"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={3}
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<motion.path
												d="M5 13l4 4L19 7"
												initial={{
													pathLength: shouldReduceMotion ? 1 : 0,
													opacity: shouldReduceMotion ? 1 : 0,
												}}
												animate={{ pathLength: 1, opacity: 1 }}
												transition={{
													pathLength: {
														duration: shouldReduceMotion ? 0 : 0.35,
														ease: [0.65, 0, 0.35, 1],
														delay: shouldReduceMotion ? 0 : 0.1,
													},
													opacity: {
														duration: shouldReduceMotion ? 0 : 0.05,
														delay: shouldReduceMotion ? 0 : 0.1,
													},
												}}
											/>
										</svg>
									</motion.div>
									<p className="font-medium text-sm text-text-strong-950">
										Instructions sent!
									</p>
									<p className="mt-1 text-text-sub-600 text-xs">
										Sent to{" "}
										<span className="font-medium text-text-strong-950">
											{email}
										</span>
									</p>
								</motion.div>
							) : (
								<motion.div
									key="form"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<div className="space-y-1 text-left">
										<h3 className="font-semibold text-sm text-text-strong-950">
											Forward DNS records
										</h3>
										<p className="text-text-sub-600 text-xs leading-relaxed">
											Send these DNS instructions directly to a teammate or
											domain administrator — they'll get everything needed to
											complete setup.
										</p>
									</div>

									<form
										onSubmit={handleForward}
										className="mt-3 flex flex-col gap-3"
									>
										<div className="space-y-1.5 text-left">
											<Label.Root
												htmlFor="forward-email"
												className="block font-medium text-text-strong-950 text-xs"
											>
												Email
												<Label.Asterisk />
											</Label.Root>

											<Input.Root
												size="small"
												hasError={!!error}
												className="w-full rounded-xl"
											>
												<Input.Wrapper>
													<Input.Input
														id="forward-email"
														type="email"
														placeholder="enter@example.com"
														value={email}
														onChange={(e) => handleEmailChange(e.target.value)}
														disabled={isSending}
														autoFocus
													/>
												</Input.Wrapper>
											</Input.Root>

											<AnimatePresence>
												{error && (
													<motion.p
														initial={{ opacity: 0, height: 0 }}
														animate={{ opacity: 1, height: "auto" }}
														exit={{ opacity: 0, height: 0 }}
														transition={{
															duration: 0.15,
															ease: [0.23, 1, 0.32, 1],
														}}
														className="overflow-hidden text-error-base text-xs"
													>
														{error}
													</motion.p>
												)}
											</AnimatePresence>
										</div>

										<div className="flex items-center justify-end gap-2 pt-1">
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="xsmall"
												onClick={() => setIsOpen(false)}
												disabled={isSending}
												className="rounded-lg"
											>
												Cancel
											</Button.Root>
											<FancyButton.Root
												type="submit"
												variant="blue"
												size="xsmall"
												disabled={isSending}
												className={cn(
													"min-w-[130px] justify-center overflow-hidden rounded-lg transition-opacity duration-200 ease-out",
													isSending && "pointer-events-none opacity-90",
												)}
											>
												<AnimatePresence mode="popLayout" initial={false}>
													<motion.span
														key={isSending ? "sending" : "idle"}
														transition={{
															type: "spring",
															duration: 0.2,
															bounce: 0,
														}}
														initial={{
															opacity: 0,
															y: shouldReduceMotion ? 0 : -8,
														}}
														animate={{
															opacity: 1,
															y: 0,
														}}
														exit={{
															opacity: 0,
															y: shouldReduceMotion ? 0 : 8,
														}}
														className="flex items-center justify-center gap-1.5"
													>
														{isSending ? (
															<>
																<Spinner size={12} color="currentColor" />
																<span>Sending...</span>
															</>
														) : (
															"Send instructions"
														)}
													</motion.span>
												</AnimatePresence>
											</FancyButton.Root>
										</div>
									</form>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
			</Popover.Content>
		</Popover.Root>
	);
};
