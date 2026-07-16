import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { useEffect, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import * as v from "valibot";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useInvalidateApiKeys } from "../../hooks/use-api-keys-query";
import type { ApiKeyWithSecret } from "../../types";
import { type ApiKeyFormValues, FormStep } from "./form-step";
import { SuccessStep } from "./success-step";

const apiKeySchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name must be at least 1 character")),
});

export function CreateApiKeyModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const { activeOrganization } = useActiveOrganization();
	const invalidate = useInvalidateApiKeys();
	const [isLoading, setIsLoading] = useState(false);
	const [createdApiKey, setCreatedApiKey] = useState<ApiKeyWithSecret | null>(
		null,
	);

	const form = useForm<ApiKeyFormValues>({
		resolver: valibotResolver(apiKeySchema) as Resolver<ApiKeyFormValues>,
		defaultValues: { name: "" },
	});

	const handleContinue = () => {
		setCreatedApiKey(null);
		onClose();
	};

	const onSubmit = async (data: ApiKeyFormValues) => {
		if (!activeOrganization?.id) return;
		try {
			setIsLoading(true);
			const response = await axios.post<ApiKeyWithSecret>(
				"/api/api-key/v1/",
				{ name: data.name },
				{ withCredentials: true },
			);
			await invalidate();
			setCreatedApiKey(response.data);
			form.reset();
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to create API key"
				: "Failed to create API key";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!createdApiKey) {
				void form.handleSubmit(onSubmit)();
			} else {
				handleContinue();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: isOpen },
	);

	useEffect(() => {
		if (!isOpen) {
			const timer = setTimeout(() => {
				setCreatedApiKey(null);
				form.reset();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen, form]);

	return (
		<Modal.Root
			open={isOpen}
			onOpenChange={(open) => {
				if (!open && !createdApiKey) onClose();
			}}
		>
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
						onClose={onClose}
						isLoading={isLoading}
					/>
				) : (
					<SuccessStep
						apiKey={createdApiKey.key}
						onContinue={handleContinue}
					/>
				)}
			</Modal.Content>
		</Modal.Root>
	);
}
