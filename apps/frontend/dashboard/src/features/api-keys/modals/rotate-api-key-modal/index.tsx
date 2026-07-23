import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
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

export function RotateApiKeyModal({ apiKeys }: { apiKeys: ApiKeyData[] }) {
	const [rotateId, setRotateId] = useQueryState("rotate");
	const [isRotating, setIsRotating] = useState(false);
	const [rotatedApiKey, setRotatedApiKey] = useState<RotatedKey | null>(null);
	const invalidate = useInvalidateApiKeys();

	const apiKeyToRotate = apiKeys.find((k) => k.id === rotateId);
	const displayName =
		apiKeyToRotate?.name ||
		apiKeyToRotate?.start ||
		apiKeyToRotate?.prefix ||
		"Unnamed key";
	const keyPrefix =
		apiKeyToRotate?.start || apiKeyToRotate?.prefix || "rl_...";

	const step = rotatedApiKey ? "success" : "confirm";
	const header = HEADER_CONTENT[step];

	const handleClose = () => {
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
			toast.success("API key rotated successfully");
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to rotate API key"
				: "Failed to rotate API key";
			toast.error(message);
		} finally {
			setIsRotating(false);
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (!rotatedApiKey) void handleRotate();
			else handleClose();
		},
		{ enabled: !!rotateId },
	);

	useEffect(() => {
		if (!rotateId) {
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
				// After rotation, require Done — don't dismiss by backdrop/escape
				// and lose a secret the user hasn't saved.
				if (!open && !rotatedApiKey) handleClose();
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
				onEscapeKeyDown={(e) => {
					if (rotatedApiKey) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (rotatedApiKey) e.preventDefault();
				}}
			>
				{/* Outer motion wrapper — animates height as content changes */}
				<motion.div layout transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}>
					<div className="p-6">
						{/* Header — title & description cross-fade with blur independently */}
						<div className="relative pr-6">
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
									<p className="mt-2 text-sm leading-relaxed text-text-sub-600">
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
										isRotating={isRotating}
										onClose={handleClose}
										onRotate={() => void handleRotate()}
									/>
								) : (
									<SuccessStep secret={rotatedApiKey!.key} onDone={handleClose} />
								)}
							</motion.div>
						</AnimatePresence>
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
}
