import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import {
	AnimatePresence,
	animate,
	motion,
	useMotionValue,
	type AnimationPlaybackControls,
} from "framer-motion";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateApiKeys } from "../../hooks/use-api-keys-query";
import type { ApiKeyData } from "../../types";
import { ConfirmStep } from "./confirm-step";
import { SuccessStep } from "./success-step";

type RotatedKey = {
	id: string;
	name: string | null;
	key: string;
};

const HEADER_CONTENT = {
	confirm: {
		title: "Rotate API key",
		description:
			"Refresh the API key to invalidate the current token and generate a new one. This will require updating all replica instances with the new token.",
	},
	success: {
		title: "API key rotated",
		description:
			"Your new API key has been generated. Save this secret key now — for security, you won't be able to see it again.",
	},
} as const;

export function RotateApiKeyModal({
	apiKeys,
	onRotateSuccess,
}: {
	apiKeys: ApiKeyData[];
	onRotateSuccess?: (rotatedName: string) => void;
}) {
	const [rotateId, setRotateId] = useQueryState("rotate");
	const [isRotating, setIsRotating] = useState(false);
	const [rotatedApiKey, setRotatedApiKey] = useState<RotatedKey | null>(null);
	const [isHolding, setIsHolding] = useState(false);
	const holdProgress = useMotionValue(0);
	const animationRef = useRef<AnimationPlaybackControls | null>(null);
	const invalidate = useInvalidateApiKeys();

	const apiKeyToRotate = apiKeys.find((k) => k.id === rotateId);
	const displayName =
		apiKeyToRotate?.name ||
		apiKeyToRotate?.start ||
		apiKeyToRotate?.prefix ||
		"Unnamed key";
	const keyPrefix = apiKeyToRotate?.start || apiKeyToRotate?.prefix || "rl_...";

	const step = rotatedApiKey ? "success" : "confirm";
	const header = HEADER_CONTENT[step];

	const handleClose = (fromSuccessStep?: boolean) => {
		if (fromSuccessStep && rotatedApiKey) {
			onRotateSuccess?.(displayName);
		}
		void setRotateId(null);
	};

	const handleRotate = async () => {
		if (!apiKeyToRotate || isRotating) return;
		try {
			setIsRotating(true);
			const response = await axios.post<RotatedKey>(
				`/api/api-key/v1/rotate/${apiKeyToRotate.id}`,
				{},
				{ withCredentials: true },
			);
			setRotatedApiKey(response.data);
			await invalidate();
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to rotate API key"
				: "Failed to rotate API key";
			toast.error(message);
		} finally {
			setIsRotating(false);
		}
	};

	const startHold = () => {
		if (step !== "confirm" || isRotating) return;
		setIsHolding(true);
		holdProgress.set(0);
		animationRef.current = animate(holdProgress, 1, {
			duration: 1.2,
			ease: "linear",
			onComplete: () => {
				setIsHolding(false);
				holdProgress.set(0);
				void handleRotate();
			},
		});
	};

	const cancelHold = () => {
		if (!isHolding && holdProgress.get() === 0) return;
		setIsHolding(false);
		animationRef.current?.stop();
		animate(holdProgress, 0, {
			duration: 0.2,
			ease: "easeOut",
		});
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (!rotatedApiKey) void handleRotate();
			else handleClose(true);
		},
		{ enabled: !!rotateId },
	);

	useEffect(() => {
		if (!rotateId) {
			cancelHold();
			const t = setTimeout(() => {
				setRotatedApiKey(null);
			}, 300);
			return () => clearTimeout(t);
		}
	}, [rotateId]);

	return (
		<Modal.Root
			open={!!rotateId}
			onOpenChange={(open) => {
				if (!open) cancelHold();
				// After rotation, require Done — don't dismiss by backdrop/escape
				// and lose a secret the user hasn't saved.
				if (!open && !rotatedApiKey) handleClose();
				// Allow close via backdrop/X after rotation (fires success callback)
				if (!open && rotatedApiKey) handleClose(true);
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
				onEscapeKeyDown={(e) => {
					// Block Escape only on success step if key hasn't been copied yet
					// but still fire the success callback so banner appears
					if (rotatedApiKey) {
						e.preventDefault();
					}
				}}
				onPointerDownOutside={(e) => {
					if (rotatedApiKey) e.preventDefault();
				}}
			>
				{/* Outer motion wrapper — animates height as content changes */}
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className="p-6">
						{/* Header — title & description cross-fade with blur independently */}
						<div className="relative pr-10">
							<AnimatePresence mode="wait" initial={false}>
								<motion.div
									key={step}
									initial={{ opacity: 0, filter: "blur(6px)", y: -4 }}
									animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
									exit={{ opacity: 0, filter: "blur(6px)", y: 4 }}
									transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
								>
									<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
										{header.title}
									</Modal.Title>
									<p className="mt-2 text-sm text-text-sub-600 leading-relaxed">
										{header.description}
									</p>
								</motion.div>
							</AnimatePresence>
						</div>

						{/* Body — center content animates as step key changes */}
						<AnimatePresence mode="wait" initial={false}>
							<motion.div
								key={step}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
							>
								{step === "confirm" ? (
									<ConfirmStep
										displayName={displayName}
										keyPrefix={keyPrefix}
									/>
								) : (
									<SuccessStep secret={rotatedApiKey!.key} />
								)}
							</motion.div>
						</AnimatePresence>

						{/* Footer — single shared button row, outside the animated body */}
						<div className="mt-6 flex items-center justify-end gap-3">
							{step === "confirm" && (
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={() => {
										if (!isRotating) {
											cancelHold();
											handleClose();
										}
									}}
									className={cn(
										"transition-opacity duration-200",
										isRotating && "pointer-events-none opacity-50",
									)}
								>
									Cancel
								</Button.Root>
							)}
							<FancyButton.Root
								type="button"
								variant="blue"
								size="small"
								onPointerDown={step === "confirm" ? startHold : undefined}
								onPointerUp={step === "confirm" ? cancelHold : undefined}
								onPointerLeave={step === "confirm" ? cancelHold : undefined}
								onPointerCancel={step === "confirm" ? cancelHold : undefined}
								onClick={() => {
									if (step === "success") {
										handleClose(true);
									}
								}}
								className={cn(
									"relative select-none justify-center overflow-hidden transition-all duration-200",
									step === "confirm" && "min-w-[134px]",
									step === "success" && "min-w-[100px] gap-2",
									isRotating && "pointer-events-none opacity-90",
								)}
							>
								{/* Hold progress overlay fill */}
								{step === "confirm" && (
									<motion.div
										className="pointer-events-none absolute inset-0 bg-white/25 origin-left"
										style={{ scaleX: holdProgress }}
									/>
								)}

								<AnimatePresence mode="popLayout" initial={false}>
									<motion.span
										key={
											step === "success"
												? "done"
												: isRotating
													? "rotating"
													: "idle"
										}
										transition={{ type: "spring", duration: 0.25, bounce: 0 }}
										initial={{ opacity: 0, y: -14 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 14 }}
										className="relative z-10 flex items-center justify-center gap-1.5"
									>
										{step === "success" ? (
											<>
												Close{" "}
												<span className="inline-flex items-center gap-0.5 opacity-80">
													<Icon
														name="command"
														className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
													/>
													<Icon
														name="enter"
														className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
													/>
												</span>
											</>
										) : isRotating ? (
											<>
												<Spinner size={14} color="currentColor" />
												<span>Rotating...</span>
											</>
										) : (
											<span>Hold to rotate</span>
										)}
									</motion.span>
								</AnimatePresence>
							</FancyButton.Root>
						</div>
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
}
