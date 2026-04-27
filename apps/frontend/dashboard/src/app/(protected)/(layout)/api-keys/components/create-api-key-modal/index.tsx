"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Modal from "@reloop/ui/modal";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";
import { FormStep } from "./form-step";
import { SuccessStep } from "./success-step";

const apiKeySchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name must be at least 1 character")),
});

type ApiKeyFormValues = v.InferInput<typeof apiKeySchema>;

interface CreateApiKeyModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface ApiKeyWithKeyResponse {
	id: string;
	name: string | null;
	key: string;
}

export const CreateApiKeyModal = ({
	isOpen,
	onClose,
}: CreateApiKeyModalProps) => {
	const { activeOrganization } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const router = useRouter();
	const [createdApiKey, setCreatedApiKey] =
		useState<ApiKeyWithKeyResponse | null>(null);
	const [keyCopied, setKeyCopied] = useState(false);

	const form = useForm<ApiKeyFormValues>({
		resolver: valibotResolver(apiKeySchema) as Resolver<ApiKeyFormValues>,
		defaultValues: {
			name: "",
		},
	});

	// Block browser refresh/close when key is created but not copied
	useEffect(() => {
		if (createdApiKey && !keyCopied) {
			const handleBeforeUnload = (e: BeforeUnloadEvent) => {
				e.preventDefault();
				e.returnValue = "You haven't copied your API key yet.";
				return e.returnValue;
			};
			window.addEventListener("beforeunload", handleBeforeUnload);
			return () =>
				window.removeEventListener("beforeunload", handleBeforeUnload);
		}
	}, [createdApiKey, keyCopied]);

	// Command/Ctrl + Enter to submit form
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!createdApiKey) {
				form.handleSubmit(onSubmit)();
			} else if (keyCopied) {
				handleContinue();
			}
		},
		{ enableOnFormTags: ["INPUT"] },
	);

	const onSubmit = async (data: ApiKeyFormValues) => {
		if (!activeOrganization?.id) return;

		try {
			changeStatus("loading");
			const response = await axios.post<ApiKeyWithKeyResponse>(
				"/api/api-key/v1/",
				{ name: data.name },
				{ withCredentials: true },
			);

			await mutate(
				(key) => typeof key === "string" && key.startsWith("/api/api-key/v1/"),
			);

			setCreatedApiKey(response.data);
			changeStatus("idle");
			form.reset();
		} catch (error) {
			changeStatus("idle");
			if (axios.isAxiosError(error)) {
				const responseData = error.response?.data?.message;
				toast.error(responseData || "Failed to create API key");
			} else {
				toast.error("An unexpected error occurred.");
			}
		}
	};

	const handleCopyKey = async () => {
		if (createdApiKey?.key) {
			try {
				await navigator.clipboard.writeText(createdApiKey.key);
				setKeyCopied(true);
				toast.success("API key copied to clipboard");
			} catch {
				toast.error("Failed to copy API key");
			}
		}
	};

	const handleContinue = () => {
		if (createdApiKey?.id) {
			setCreatedApiKey(null);
			setKeyCopied(false);
			onClose();
			router.push(`/api-keys/${createdApiKey.id}`);
		}
	};

	const handleClose = () => {
		if (!createdApiKey || keyCopied) {
			setCreatedApiKey(null);
			setKeyCopied(false);
			form.reset();
			onClose();
		} else {
			toast.warning("Please copy your API key before closing");
		}
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={handleClose}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={false}
				onEscapeKeyDown={(e) => {
					if (createdApiKey && !keyCopied) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (createdApiKey && !keyCopied) e.preventDefault();
				}}
			>
				{!createdApiKey ? (
					<FormStep
						form={form}
						onSubmit={onSubmit}
						onClose={handleClose}
						isLoading={status === "loading"}
					/>
				) : (
					<SuccessStep
						apiKey={createdApiKey.key}
						isCopied={keyCopied}
						onCopy={handleCopyKey}
						onContinue={handleContinue}
					/>
				)}
			</Modal.Content>
		</Modal.Root>
	);
};
