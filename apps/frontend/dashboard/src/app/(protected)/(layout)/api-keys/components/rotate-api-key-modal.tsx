"use client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface ApiKeyWithKeyResponse {
	id: string;
	name: string | null;
	key: string;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
	createdAt: string;
}

interface RotateApiKeyModalProps {
	isOpen: boolean;
	onClose: () => void;
	apiKeyId: string;
	apiKeyName: string;
	apiKeyStart?: string | null;
}

export const RotateApiKeyModal = ({
	isOpen,
	onClose,
	apiKeyId,
	apiKeyName,
	apiKeyStart,
}: RotateApiKeyModalProps) => {
	const [isRotating, setIsRotating] = useState(false);
	const [rotatedApiKey, setRotatedApiKey] =
		useState<ApiKeyWithKeyResponse | null>(null);
	const [keyCopied, setKeyCopied] = useState(false);
	const { mutate } = useSWRConfig();

	// Block browser refresh/close when key is rotated but not copied
	useEffect(() => {
		if (rotatedApiKey && !keyCopied) {
			const handleBeforeUnload = (e: BeforeUnloadEvent) => {
				e.preventDefault();
				e.returnValue =
					"You haven't copied your new API key yet. Are you sure you want to leave?";
				return e.returnValue;
			};

			window.addEventListener("beforeunload", handleBeforeUnload);
			return () =>
				window.removeEventListener("beforeunload", handleBeforeUnload);
		}
	}, [rotatedApiKey, keyCopied]);

	const handleRotate = async () => {
		try {
			setIsRotating(true);
			const response = await axios.post<ApiKeyWithKeyResponse>(
				`/api/api-key/v1/rotate/${apiKeyId}`,
				{},
				{ withCredentials: true },
			);

			setRotatedApiKey(response.data);
			await mutate(
				(key) => typeof key === "string" && key.startsWith("/api/api-key/v1/"),
			);
			toast.success("API key rotated successfully");
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to rotate API key"
				: "Failed to rotate API key";
			toast.error(errorMessage);
		} finally {
			setIsRotating(false);
		}
	};

	const handleCopyKey = async () => {
		if (rotatedApiKey?.key) {
			try {
				await navigator.clipboard.writeText(rotatedApiKey.key);
				setKeyCopied(true);
				toast.success("API key copied to clipboard");
			} catch {
				toast.error("Failed to copy API key");
			}
		}
	};

	const handleClose = () => {
		if (!rotatedApiKey || keyCopied) {
			setRotatedApiKey(null);
			setKeyCopied(false);
			onClose();
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open && rotatedApiKey && !keyCopied) {
			toast.warning("Please copy your API key before closing");
			return;
		}
		if (!open) {
			handleClose();
		}
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="rounded-20 border-none p-0 sm:max-w-[480px]"
				showClose={!rotatedApiKey || keyCopied}
			>
				<div className="rounded-20 border border-stroke-soft-100/50 bg-bg-white-0">
					{rotatedApiKey ? (
						/* --- Result Stage --- */
						<div className="p-6">
							<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-success-base/10 text-success-base">
								<Icon name="check-circle" className="h-5 w-5" />
							</div>

							<h2 className="font-medium text-text-strong-950 text-title-h5">
								API key rotated successfully
							</h2>
							<p className="mb-6 text-pretty text-sm text-text-sub-600 leading-relaxed">
								Make sure to copy the new secret key now. You won't be able to
								see it again after closing this dialog. Update your applications
								with the new key.
							</p>

							<div className="mb-6 space-y-2">
								<div className="flex items-center justify-between">
									<span className="font-medium text-text-sub-600 text-xs uppercase tracking-wider">
										New Secret Key
									</span>
									{keyCopied && (
										<span className="flex items-center gap-1 font-medium text-success-base text-xs">
											<Icon name="check" className="h-3 w-3" />
											Copied
										</span>
									)}
								</div>
								<div className="group relative overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 transition-all hover:bg-bg-weak-50 dark:border-stroke-soft-100/40">
									<code className="block break-all pr-10 font-mono text-sm text-text-strong-950">
										{rotatedApiKey.key}
									</code>
									<button
										type="button"
										onClick={handleCopyKey}
										className={cn(
											"-translate-y-1/2 absolute top-1/2 right-2 rounded-lg p-2 transition-all",
											keyCopied
												? "bg-success-base/10 text-success-base"
												: "bg-bg-white-0 text-text-sub-600 shadow-sm hover:text-text-strong-950",
										)}
									>
										<Icon
											name={keyCopied ? "check" : "clipboard-copy"}
											className="h-4 w-4"
										/>
									</button>
								</div>
							</div>

							<div className="flex justify-end">
								<Button.Root
									variant="neutral"
									size="xsmall"
									onClick={handleClose}
									disabled={!keyCopied}
									className="gap-2"
								>
									Done
									<Icon name="check" className="h-4 w-4" />
								</Button.Root>
							</div>
						</div>
					) : (
						/* --- Confirmation Stage --- */
						<div className="p-6">
							<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
								<Icon name="rotate-cw" className="h-5 w-5" />
							</div>

							<h2 className="font-medium text-text-strong-950 text-title-h5">
								Rotate API key?
							</h2>
							<p className="mb-6 text-pretty text-sm text-text-sub-600 leading-relaxed">
								This will generate a new secret for this API key. The old key
								will stop working immediately. Any applications using this key
								will need to be updated.
							</p>

							{/* API Key Identity Card */}
							<div className="mb-6 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
									<Icon name="key-new" className="h-5 w-5" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm text-text-strong-950">
										{apiKeyName}
									</p>
									<p className="mt-0.5 truncate font-semibold text-[11px] text-text-sub-600 text-xs">
										{apiKeyStart || "rl_"}...
									</p>
								</div>
							</div>

							<div className="flex flex-col-reverse justify-end gap-2 sm:flex-row sm:items-center">
								<Button.Root
									variant="neutral"
									mode="stroke"
									onClick={handleClose}
									disabled={isRotating}
									className="gap-1.5"
								>
									Cancel
									<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
										Esc
									</span>
								</Button.Root>
								<Button.Root
									variant="neutral"
									onClick={handleRotate}
									disabled={isRotating}
									className="gap-2"
								>
									{isRotating ? (
										<>
											<Spinner size={14} color="currentColor" />
											Rotating...
										</>
									) : (
										<>
											Rotate Key
											<Icon name="rotate-cw" className="h-4 w-4" />
										</>
									)}
								</Button.Root>
							</div>
						</div>
					)}
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
