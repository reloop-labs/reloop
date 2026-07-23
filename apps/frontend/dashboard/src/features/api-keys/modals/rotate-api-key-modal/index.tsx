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
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
				onEscapeKeyDown={(e) => {
					if (rotatedApiKey) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (rotatedApiKey) e.preventDefault();
				}}
			>
				<AnimatePresence mode="wait" initial={false}>
					{!rotatedApiKey ? (
						<motion.div
							key="confirm"
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
						>
							<ConfirmStep
								displayName={displayName}
								keyPrefix={keyPrefix}
								isRotating={isRotating}
								onClose={handleClose}
								onRotate={() => void handleRotate()}
							/>
						</motion.div>
					) : (
						<motion.div
							key="success"
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
						>
							<SuccessStep secret={rotatedApiKey.key} onDone={handleClose} />
						</motion.div>
					)}
				</AnimatePresence>
			</Modal.Content>
		</Modal.Root>
	);
}
