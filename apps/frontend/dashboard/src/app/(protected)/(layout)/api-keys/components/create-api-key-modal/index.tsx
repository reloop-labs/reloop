"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { cn } from "@reloop/ui/cn";
import * as Modal from "@reloop/ui/modal";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { codeToHtml } from "shiki";
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
	const [html, setHtml] = useState("");

	const form = useForm<ApiKeyFormValues>({
		resolver: valibotResolver(apiKeySchema) as Resolver<ApiKeyFormValues>,
		defaultValues: {
			name: "",
		},
	});

	// Command/Ctrl + Enter to submit form
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!createdApiKey) {
				form.handleSubmit(onSubmit)();
			} else {
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

	const handleContinue = () => {
		if (createdApiKey?.id) {
			setCreatedApiKey(null);
			onClose();
			router.push(`/api-keys/${createdApiKey.id}`);
		}
	};

	const handleClose = () => {
		setCreatedApiKey(null);
		form.reset();
		onClose();
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={handleClose}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={false}
				onEscapeKeyDown={(e) => {
					if (createdApiKey) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (createdApiKey) e.preventDefault();
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
						onContinue={handleContinue}
						defaultHtml={html}
					/>
				)}
			</Modal.Content>
		</Modal.Root>
	);
};
