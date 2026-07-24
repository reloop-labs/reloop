import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const layoutSpringConfig = {
	type: "spring" as const,
	duration: 0.3,
	bounce: 0,
};

export const ForwardDNSRecordsModal = ({
	domainId,
	open,
	onOpenChange,
}: {
	domainId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const shouldReduceMotion = !!useReducedMotion();
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [isSent, setIsSent] = useState(false);

	useEffect(() => {
		if (!open) {
			setEmail("");
			setError(null);
			setIsSending(false);
			setIsSent(false);
		}
	}, [open]);

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
				onOpenChange(false);
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
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="w-[400px] max-w-[90vw] overflow-hidden p-0">
				<motion.div
					animate={{ height: isSent ? 156 : error ? 273 : 255 }}
					transition={shouldReduceMotion ? { duration: 0 } : layoutSpringConfig}
					className="overflow-hidden"
				>
					<div className="p-5">
						<AnimatePresence mode="wait">
							{isSent ? (
								<motion.div
									key="success"
									initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
									transition={{ duration: 0.2 }}
									className="flex flex-col items-center justify-center py-4 text-center"
								>
									<div className="flex size-10 items-center justify-center rounded-full bg-success-weak-50 text-success-base">
										<svg
											className="size-5"
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
									</div>
									<p className="mt-3 font-medium text-sm text-text-strong-950">
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
										<Modal.Title className="font-semibold text-text-strong-950 text-title-h6">
											Forward DNS records
										</Modal.Title>
										<Modal.Description className="text-text-sub-600 text-xs leading-relaxed">
											Send these DNS instructions directly to a teammate or
											domain administrator — they'll get everything needed to
											complete setup.
										</Modal.Description>
									</div>

									<form onSubmit={handleForward} className="mt-4 flex flex-col">
										<div className="text-left">
											<Label.Root
												htmlFor="forward-email-modal"
												className="mb-1.5 block font-medium text-text-strong-950 text-xs"
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
														id="forward-email-modal"
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
														className="mt-1 overflow-hidden font-medium text-error-base text-xs"
													>
														{error}
													</motion.p>
												)}
											</AnimatePresence>
										</div>

										<div className="mt-4 flex items-center justify-end gap-2">
											<Button.Root
												type="button"
												variant="neutral"
												mode="ghost"
												size="small"
												onClick={() => onOpenChange(false)}
												disabled={isSending}
												className="rounded-xl"
											>
												Cancel
											</Button.Root>
											<FancyButton.Root
												type="submit"
												variant="blue"
												size="small"
												disabled={isSending}
												className={cn(
													"min-w-[130px] justify-center overflow-hidden rounded-xl transition-opacity duration-200 ease-out",
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
																<Spinner size={14} color="currentColor" />
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
			</Modal.Content>
		</Modal.Root>
	);
};
