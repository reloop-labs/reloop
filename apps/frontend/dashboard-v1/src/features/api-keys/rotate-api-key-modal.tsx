import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";
import { ModalHeader } from "./create-api-key-modal/header";
import { useInvalidateApiKeys } from "./use-api-keys-query";
import type { ApiKeyData } from "./types";

type RotatedKey = {
	id: string;
	name: string | null;
	key: string;
};

export function RotateApiKeyModal({ apiKeys }: { apiKeys: ApiKeyData[] }) {
	const [rotateId, setRotateId] = useQueryState("rotate");
	const [isRotating, setIsRotating] = useState(false);
	const [rotatedApiKey, setRotatedApiKey] = useState<RotatedKey | null>(null);
	const [activeTab, setActiveTab] = useState<"key" | "env">("key");
	const invalidate = useInvalidateApiKeys();

	const apiKeyToRotate = apiKeys.find((k) => k.id === rotateId);
	const displayName =
		apiKeyToRotate?.name ||
		apiKeyToRotate?.start ||
		apiKeyToRotate?.prefix ||
		"Unnamed";

	const handleClose = () => {
		void setRotateId(null);
	};

	const handleRotate = async () => {
		if (!apiKeyToRotate) return;
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
		"mod+enter",
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
				setActiveTab("key");
			}, 300);
			return () => clearTimeout(t);
		}
	}, [rotateId]);

	const display = rotatedApiKey
		? activeTab === "env"
			? `RELOOP_API_KEY=${rotatedApiKey.key}`
			: rotatedApiKey.key
		: "";

	return (
		<Modal.Root
			open={!!rotateId}
			onOpenChange={(open) => {
				if (!open) handleClose();
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={false}
				onEscapeKeyDown={(e) => {
					if (rotatedApiKey) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (rotatedApiKey) e.preventDefault();
				}}
			>
				{!rotatedApiKey ? (
					<>
						<ModalHeader
							title="Rotate API key"
							subtitle={`Generate a new secret for “${displayName}”. The previous key stops working immediately.`}
							icon="rotate-cw"
							onClose={handleClose}
						/>
						<div className="flex justify-end gap-2 border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={handleClose}
								disabled={isRotating}
							>
								Cancel
							</Button.Root>
							<Button.Root
								variant="neutral"
								size="xsmall"
								onClick={() => void handleRotate()}
								disabled={isRotating}
							>
								{isRotating ? (
									<>
										<Spinner size={12} color="currentColor" />
										Rotating...
									</>
								) : (
									"Rotate key"
								)}
							</Button.Root>
						</div>
					</>
				) : (
					<>
						<ModalHeader
							title="Key rotated"
							icon="check-circle"
							iconClassName="text-success-base"
							onClose={() => {}}
							showCloseIcon={false}
						/>
						<Modal.Body className="space-y-4 px-5 py-3.5">
							<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
								<div className="flex items-center gap-4 border-stroke-soft-100 border-b px-4 dark:border-stroke-soft-100/40">
									{(["key", "env"] as const).map((tab) => (
										<button
											key={tab}
											type="button"
											onClick={() => setActiveTab(tab)}
											className={cn(
												"relative cursor-pointer py-2 font-medium text-xs transition-colors",
												activeTab === tab
													? "font-semibold text-text-strong-950"
													: "text-text-soft-400 hover:text-text-sub-600",
											)}
										>
											{tab === "key" ? "API Key" : ".env"}
											{activeTab === tab && (
												<span className="absolute right-0 bottom-0 left-0 h-[1.5px] rounded-full bg-text-strong-950" />
											)}
										</button>
									))}
								</div>
								<div className="p-2">
									<CopyCodeBlock
										key={activeTab}
										code={display}
										lang="bash"
										copyValue={display}
										hideLineNumbers
										noScroll
										codeExtraPadding
									/>
								</div>
							</div>
							<p className="flex items-center gap-1.5 text-error-base text-xs">
								<Icon name="alert-triangle" className="h-3.5 w-3.5" />
								Copy the new key now — it won&apos;t be shown again.
							</p>
						</Modal.Body>
						<div className="flex justify-end border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
							<Button.Root
								variant="neutral"
								size="xsmall"
								onClick={handleClose}
							>
								Done
							</Button.Root>
						</div>
					</>
				)}
			</Modal.Content>
		</Modal.Root>
	);
}
