import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useInvalidateApiKeys } from "../../hooks/use-api-keys-query";
import type { ApiKeyData } from "../../types";
import { ConfirmStep } from "./confirm-step";
import { SuccessStep } from "./success-step";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

type RotatedKey = {
	id: string;
	name: string | null;
	key: string;
};

const HEADER_CONTENT = {
	confirm: {
		title: "Rotate API key",
		description:
			"Generating a new secret key will instantly revoke the existing key. Any applications using the old key will lose access until updated.",
	},
	success: {
		title: "API key rotated",
		description:
			"Your new secret key has been generated. Copy and store it securely now — for security reasons, it cannot be displayed again.",
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
	const [confirmationText, setConfirmationText] = useState("");
	const [isRotating, setIsRotating] = useState(false);
	const [rotatedApiKey, setRotatedApiKey] = useState<RotatedKey | null>(null);
	const [copied, setCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const invalidate = useInvalidateApiKeys();

	const apiKeyToRotate = apiKeys.find((k) => k.id === rotateId);
	const displayName =
		apiKeyToRotate?.name ||
		apiKeyToRotate?.start ||
		apiKeyToRotate?.prefix ||
		"Unnamed key";
	const keyPrefix = apiKeyToRotate?.start || apiKeyToRotate?.prefix || "rl_...";

	const isConfirmed = confirmationText === displayName;
	const canRotate = isConfirmed && !isRotating;

	const step = rotatedApiKey ? "success" : "confirm";
	const header = HEADER_CONTENT[step];

	const handleClose = () => {
		if (rotatedApiKey) {
			onRotateSuccess?.(displayName);
		}
		void setRotateId(null);
	};

	const handleRotate = async () => {
		if (!apiKeyToRotate || !canRotate) return;
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

	const handleCopyKey = async () => {
		if (!rotatedApiKey) return;
		try {
			await navigator.clipboard.writeText(rotatedApiKey.key);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy API key");
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (step === "confirm" && canRotate) {
				void handleRotate();
			} else if (step === "success") {
				void handleCopyKey();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!rotateId },
	);

	useEffect(() => {
		if (!rotateId) {
			const t = setTimeout(() => {
				setRotatedApiKey(null);
				setConfirmationText("");
				setCopied(false);
			}, 300);
			return () => clearTimeout(t);
		}
	}, [rotateId]);

	return (
		<Modal.Root
			open={!!rotateId}
			onOpenChange={(open) => {
				if (!open) handleClose();
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					setTimeout(() => {
						inputRef.current?.focus();
					}, 0);
				}}
				onPointerDownOutside={(e) => {
					if (rotatedApiKey) e.preventDefault();
				}}
			>
				{/* Outer motion wrapper — animates height as content changes */}
				<motion.div
					layout="size"
					transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
				>
					<div className="p-6">
						{/* Header — title & description update with step */}
						<div className="relative pr-10">
							<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								{header.title}
							</Modal.Title>
							<Modal.Description className="mt-2 text-sm text-text-sub-600 leading-relaxed">
								{header.description}
							</Modal.Description>
						</div>

						{/* Center content only — animates on step change */}
						<AnimatePresence mode="popLayout" initial={false}>
							{step === "confirm" ? (
								<motion.div
									key="confirm"
									initial={{ opacity: 0, filter: "blur(4px)" }}
									animate={{ opacity: 1, filter: "blur(0px)" }}
									exit={{ opacity: 0, filter: "blur(4px)" }}
									transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
								>
									<ConfirmStep
										displayName={displayName}
										keyPrefix={keyPrefix}
										confirmationText={confirmationText}
										onConfirmationTextChange={setConfirmationText}
										isRotating={isRotating}
										inputRef={inputRef}
									/>
								</motion.div>
							) : (
								<motion.div
									layout
									key="success"
									initial={{ opacity: 0, filter: "blur(4px)", height: "315px" }}
									animate={{
										opacity: 1,
										filter: "blur(0px)",
										height: "auto",
									}}
									exit={{ opacity: 0, filter: "blur(4px)" }}
									transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
								>
									<SuccessStep secret={rotatedApiKey!.key} />
								</motion.div>
							)}
						</AnimatePresence>

						{/* Footer — outside animation, plain conditional */}
						<motion.div
							layout
							className="mt-6 flex items-center justify-end gap-3"
						>
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={() => {
									if (!isRotating) handleClose();
								}}
								className={cn(
									"gap-1.5 transition-opacity duration-200",
									isRotating && "pointer-events-none opacity-50",
								)}
							>
								{step === "confirm" ? "Cancel" : "Close"}
								<ActionKbd className="lowercase! w-auto min-w-0 px-1">
									esc
								</ActionKbd>
							</Button.Root>
							{step === "confirm" ? (
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={handleRotate}
									disabled={!canRotate}
									className={cn(
										"min-w-35 justify-center overflow-hidden transition-all duration-200",
										(!canRotate || isRotating) &&
											"pointer-events-none opacity-50",
										isRotating && "opacity-90",
									)}
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={isRotating ? "rotating" : "idle"}
											transition={{ type: "spring", duration: 0.25, bounce: 0 }}
											initial={{ opacity: 0, y: -14 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 14 }}
											className="flex items-center justify-center gap-1.5"
										>
											{isRotating ? (
												<>
													<Spinner size={14} color="currentColor" />
													<span>Rotating...</span>
												</>
											) : (
												<>
													Rotate API key
													<ActionKbd className={actionKbdOnBlueClassName}>
														↵
													</ActionKbd>
												</>
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							) : (
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={handleCopyKey}
									className="min-w-35 justify-center overflow-hidden transition-all duration-200"
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={copied ? "copied" : "idle"}
											transition={{ type: "spring", duration: 0.25, bounce: 0 }}
											initial={{ opacity: 0, y: -14 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 14 }}
											className="flex items-center justify-center gap-1.5"
										>
											{copied ? (
												"Copied!"
											) : (
												<>
													Copy API key
													<ActionKbd className={actionKbdOnBlueClassName}>
														↵
													</ActionKbd>
												</>
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							)}
						</motion.div>
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
}
