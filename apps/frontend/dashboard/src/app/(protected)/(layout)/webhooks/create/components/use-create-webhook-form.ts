import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { type WebhookFormValues, webhookSchema } from "./webhook-schema";

export function useCreateWebhookForm() {
	
	const { activeOrganization } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const router = useRouter();

	const form = useForm<WebhookFormValues>({
		resolver: valibotResolver(webhookSchema),
		defaultValues: {
			url: "",
			description: "",
			events: [],
		},
	});

	const onSubmit = async (data: WebhookFormValues) => {
		if (!activeOrganization?.id) return;

		try {
			changeStatus("loading");
			const response = await axios.post(
				"/api/webhook/v1/",
				{
					url: data.url,
					events: data.events,
					description: data.description,
				},
				{ headers: { credentials: "include" } },
			);

			await mutate(
				`/api/webhook/v1/?organizationId=${activeOrganization.id}&limit=100`,
			);

			changeStatus("idle");
			const webhookId = response.data?.webhook?.id || response.data?.id;
			if (webhookId) {
				router.push(`/webhooks/${webhookId}`);
			} else {
				router.push(`/webhooks`);
			}
			toast.success("Webhook created successfully.");
		} catch (error) {
			changeStatus("idle");
			if (axios.isAxiosError(error)) {
				const responseData = error.response?.data?.message;
				if (responseData) {
					form.setError("url", {
						type: "server",
						message: responseData,
					});
				} else {
					toast.error("Failed to create webhook.");
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
