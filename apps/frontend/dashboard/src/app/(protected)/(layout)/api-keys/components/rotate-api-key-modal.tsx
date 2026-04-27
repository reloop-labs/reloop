"use client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { codeToHtml } from "shiki";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { ModalHeader } from "./create-api-key-modal/header";

interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
}

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
	apiKeys: ApiKeyData[];
}

export const RotateApiKeyModal = ({ apiKeys }: RotateApiKeyModalProps) => {
	const [rotateId, setRotateId] = useQueryState("rotate");
	const [isRotating, setIsRotating] = useState(false);
	const [rotatedApiKey, setRotatedApiKey] =
		useState<ApiKeyWithKeyResponse | null>(null);
	const [keyCopied, setKeyCopied] = useState(false);
	const { mutate } = useSWRConfig();
	const [html, setHtml] = useState("");

	const apiKeyToRotate = apiKeys.find((apiKey) => apiKey.id === rotateId);
	const displayName =
		apiKeyToRotate?.name ||
		apiKeyToRotate?.start ||
		apiKeyToRotate?.prefix ||
		"Unnamed";

	// Command/Ctrl + Enter to handle actions
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!rotatedApiKey) {
				handleRotate();
			} else {
				handleClose();
			}
		},
		{ enabled: !!rotateId },
	);

	const handleRotate = async () => {
		if (!apiKeyToRotate) return;

		try {
			setIsRotating(true);
			const response = await axios.post<ApiKeyWithKeyResponse>(
				`/api/api-key/v1/rotate/${apiKeyToRotate.id}`,
				{},
				{ withCredentials: true },
			);
			const generatedHtml = await codeToHtml(
				`RELOOP_API_KEY=${response.data.key}`,
				{
					lang: "bash",
					theme: "github-light",
					transformers: [
						{
							pre(node) {
								this.addClassToHast(
									node,
									cn(
										"py-4",
										"overflow-x-auto",
										"whitespace-pre-wrap break-all",
									),
								);
							},
							line(node) {
								this.addClassToHast(node, "line");
							},
						},
					],
				},
			);
			setHtml(generatedHtml);
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
				await navigator.clipboard.writeText(
					`RELOOP_API_KEY=${rotatedApiKey.key}`,
				);
				setKeyCopied(true);
				setTimeout(() => setKeyCopied(false), 2000);
			} catch {
				toast.error("Failed to copy API key");
			}
		}
	};

	const handleClose = () => {
		handleCopyKey();
		setRotateId(null);
		setRotatedApiKey(null);
		setKeyCopied(false);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			handleClose();
		}
	};

	return (
		<Modal.Root open={!!rotateId} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				{rotatedApiKey ? (
					/* --- Result Stage --- */
					<div className="flex flex-col">
						<ModalHeader
							title="API Key Rotated"
							icon="check-circle"
							iconClassName="text-success-base"
							onClose={() => {}}
							showCloseIcon={false}
						/>

						<Modal.Body className="space-y-4 px-5 py-3.5">
							<div className="group relative overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
								{/* Code Block Header */}
								<div className="flex items-center justify-between px-4 py-2">
									<p className="font-medium text-sm text-text-sub-600">.env</p>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={handleCopyKey}
											className="cursor-pointer"
										>
											<Icon
												name={keyCopied ? "check" : "copy"}
												className={"h-3.5 w-3.5 stroke-3"}
											/>
										</button>
									</div>
								</div>
								<div className="rounded-t-[10px] rounded-b-2xl bg-bg-weak-50/70 dark:bg-bg-weak-50/45">
									<CodeBlock
										code={`RELOOP_API_KEY=${rotatedApiKey.key}`}
										lang="bash"
										className="text-[10px]"
										hideLineNumbers={true}
										noScroll={true}
										defaultHtml={html}
									/>
								</div>
							</div>

							<div className="mt-3 mb-1 ml-1.5">
								<p className="flex items-center gap-1.5 text-error-base text-xs">
									<Icon
										name="alert-triangle"
										className="h-3.5 w-3.5 flex-shrink-0"
									/>
									Old API key invalid. Make sure to copy your new key now!
								</p>
							</div>
						</Modal.Body>

						<div className="flex items-center justify-end border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
							<Button.Root
								variant="neutral"
								size="xsmall"
								onClick={handleClose}
								className="gap-2"
							>
								Continue
								<span className="inline-flex items-center gap-0.5">
									<Icon
										name="command"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
									<Icon
										name="enter"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
								</span>
							</Button.Root>
						</div>
					</div>
				) : (
					/* --- Confirmation Stage --- */
					<div className="flex flex-col">
						<ModalHeader
							title="Rotate API Key"
							icon="rotate-cw"
							iconClassName="text-orange-500"
							onClose={handleClose}
						/>

						<Modal.Body className="space-y-4 px-5 py-4 pb-5">
							<p className="text-sm text-text-sub-600 leading-relaxed">
								This will invalidate the current key and generate a new one.
								Applications using the old key will need to be updated.
							</p>

							{/* API Key Identity Card */}
							<div className="flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
									<Icon name="key-new" className="h-5 w-5" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm text-text-strong-950">
										{displayName}
									</p>
									<p className="mt-0.5 truncate font-semibold text-text-sub-600 text-xs">
										{apiKeyToRotate?.start || "rl_"}...
									</p>
								</div>
							</div>
						</Modal.Body>

						<div className="flex items-center justify-end border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
							<div className="flex items-center gap-2">
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
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
									size="xsmall"
									onClick={handleRotate}
									disabled={isRotating}
									className="gap-2"
								>
									{isRotating ? (
										<>
											<Spinner size={12} color="currentColor" />
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
					</div>
				)}
			</Modal.Content>
		</Modal.Root>
	);
};
