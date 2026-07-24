import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyData } from "../types";

export interface EditApiKeyModalProps {
	apiKeys: ApiKeyData[];
	onEditSuccess?: (updatedName: string) => void;
}

export function EditApiKeyModal({
	apiKeys,
	onEditSuccess,
}: EditApiKeyModalProps) {
	const [editId, setEditId] = useQueryState("edit");
	const invalidate = useInvalidateApiKeys();

	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");

	const targetApiKeyRef = useRef<ApiKeyData | null>(null);
	const currentApiKey = apiKeys.find((k) => k.id === editId);
	if (currentApiKey) {
		targetApiKeyRef.current = currentApiKey;
	}
	const apiKeyToEdit = currentApiKey || targetApiKeyRef.current;

	useEffect(() => {
		if (editId && apiKeyToEdit) {
			setName(apiKeyToEdit.name || "");
		}
	}, [editId, apiKeyToEdit]);

	const handleClose = () => {
		setError(null);
		setStatus("idle");
		void setEditId(null);
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!apiKeyToEdit || !name.trim() || status !== "idle") return;

		setError(null);
		setStatus("saving");
		try {
			await axios.patch(
				`/api/api-key/v1/${apiKeyToEdit.id}`,
				{ name: name.trim() },
				{ withCredentials: true },
			);
			setStatus("success");
			onEditSuccess?.(name.trim());
		} catch (err) {
			const message = axios.isAxiosError(err)
				? err.response?.data?.message || "Failed to update API key"
				: "Failed to update API key";
			setError(message);
			toast.error(message);
			setStatus("idle");
		}
	};

	useEffect(() => {
		if (status === "success") {
			const timer = setTimeout(() => {
				void invalidate();
				handleClose();
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [status, invalidate]);

	const open = !!editId;

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && status === "idle" && name.trim() && apiKeyToEdit && name !== (apiKeyToEdit.name || "")) {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open && !!apiKeyToEdit },
		[open, status, name, apiKeyToEdit],
	);

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className="p-6">
						<div className="relative pr-6">
							<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								Edit API key
							</Modal.Title>
						</div>

						<form onSubmit={handleSubmit} className="mt-5">
							<div className="space-y-2">
								<Label.Root htmlFor="edit-api-key-name">
									Key name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root size="medium" hasError={Boolean(error)}>
									<Input.Wrapper>
										<Input.Input
											id="edit-api-key-name"
											placeholder="e.g., Production Server, Web App"
											value={name}
											onChange={(e) => {
												setName(e.target.value);
												if (error) setError(null);
											}}
											autoFocus
											disabled={status !== "idle"}
										/>
									</Input.Wrapper>
								</Input.Root>
								{error ? (
									<p className="text-error-base text-paragraph-xs">
										{error}
									</p>
								) : (
									<p className="text-paragraph-xs text-text-sub-600">
										Provide a descriptive name to help you identify this API key later.
									</p>
								)}
							</div>

							<div className="mt-6 flex items-center justify-end gap-3">
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={handleClose}
									className={cn(
										"transition-opacity duration-200",
										status !== "idle" && "pointer-events-none opacity-50",
									)}
								>
									Cancel
								</Button.Root>

								<FancyButton.Root
									type="submit"
									variant={status === "success" ? "success" : "blue"}
									size="small"
									disabled={
										status === "saving" ||
										(status === "idle" && (!name.trim() || name === (apiKeyToEdit?.name || "")))
									}
									className={cn(
										"min-w-[140px] justify-center overflow-hidden transition-all duration-200",
										status !== "idle" && "pointer-events-none",
										status === "saving" && "opacity-90",
									)}
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={status}
											transition={{
												type: "spring",
												duration: 0.25,
												bounce: 0,
											}}
											initial={{ opacity: 0, y: -14 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 14 }}
											className="flex items-center justify-center gap-1.5"
										>
											{status === "saving" ? (
												<>
													<Spinner size={14} color="currentColor" />
													<span>Saving...</span>
												</>
											) : status === "success" ? (
												<>
													<Icon name="check-circle" className="h-4 w-4" />
													<span>Key Updated</span>
												</>
											) : (
												<>
													Save changes
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
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							</div>
						</form>
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
}
