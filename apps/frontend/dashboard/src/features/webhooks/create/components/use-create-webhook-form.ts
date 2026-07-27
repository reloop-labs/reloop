import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useInvalidateWebhooks } from "#/features/webhooks/hooks/use-webhooks-query";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useLoading } from "@reloop/ui/use-loading";
import { useNavigate } from "#/lib/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type WebhookFormValues, webhookSchema } from "./webhook-schema";

export function useCreateWebhookForm() {
	const { activeOrganization } = useActiveOrganization();
	const { changeStatus, status } = useLoading();
	const invalidate = useInvalidateWebhooks();
	const navigate = useNavigate();

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
				{ withCredentials: true },
			);

			await invalidate();

			changeStatus("idle");
			const webhookId = response.data?.webhook?.id || response.data?.id;
			if (webhookId) {
				void navigate({
					to: "/webhooks/$webhookId",
					params: { webhookId },
				});
			} else {
				void navigate({ to: "/webhooks" });
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
