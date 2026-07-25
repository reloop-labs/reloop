import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import {
	type WebhookDetailData,
	useInvalidateWebhooks,
} from "#/features/webhooks/hooks/use-webhooks-query";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useLoading } from "@reloop/ui/use-loading";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as v from "valibot";

const editWebhookSchema = v.object({
	description: v.pipe(
		v.string("Description is required"),
		v.minLength(1, "Description is required"),
	),
	url: v.pipe(
		v.string("URL is required"),
		v.minLength(1, "URL is required"),
		v.regex(
			/^https?:\/\/.+/,
			"Please enter a valid URL starting with http:// or https://",
		),
	),
	events: v.pipe(
		v.array(v.string()),
		v.minLength(1, "At least one event is required"),
	),
});

export type EditWebhookFormValues = v.InferInput<typeof editWebhookSchema>;

export function useEditWebhookForm(webhook: WebhookDetailData | undefined) {
	const { activeOrganization } = useActiveOrganization();
	const { changeStatus, status } = useLoading();
	const invalidate = useInvalidateWebhooks();
	const navigate = useNavigate();

	const form = useForm<EditWebhookFormValues>({
		resolver: valibotResolver(
			editWebhookSchema,
		) as Resolver<EditWebhookFormValues>,
		defaultValues: {
			description: "",
			url: "",
			events: [],
		},
	});

	useEffect(() => {
		if (!webhook) return;
		form.reset({
			description: webhook.name || "",
			url: webhook.url || "",
			events: webhook.events || [],
		});
	}, [webhook, form]);

	const onSubmit = async (data: EditWebhookFormValues) => {
		if (!activeOrganization?.id || !webhook?.id) return;

		try {
			changeStatus("loading");
			await axios.patch(
				`/api/webhook/v1/${webhook.id}`,
				{
					description: data.description,
					url: data.url,
					events: data.events,
				},
				{ withCredentials: true },
			);
			await invalidate();
			changeStatus("idle");
			toast.success("Webhook updated successfully");
			void navigate({
				to: "/webhooks/$webhookId",
				params: { webhookId: webhook.id },
			});
		} catch (error) {
			changeStatus("idle");
			if (axios.isAxiosError(error)) {
				const responseData = error.response?.data?.message;
				if (responseData) {
					toast.error(responseData);
				} else {
					toast.error("Failed to update webhook.");
				}
			} else {
				toast.error("An unexpected error occurred.");
			}
		}
	};

	return {
		form,
		status,
		isLoading: status === "loading",
		onSubmit: form.handleSubmit(onSubmit),
	};
}
