import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useInvalidateWebhooks } from "#/features/webhooks/hooks/use-webhooks-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { WebhookData } from "./types";

export function useDeleteWebhook(
	webhook: WebhookData | null | undefined,
	onSuccess?: () => void,
) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [deletedWebhookName, setDeletedWebhookName] =
		useQueryState("deleted_webhook");
	const [lastDeletedWebhookName, setLastDeletedWebhookName] = useState<
		string | null
	>(deletedWebhookName);

	useEffect(() => {
		if (deletedWebhookName) {
			setLastDeletedWebhookName(deletedWebhookName);
		}
	}, [deletedWebhookName]);

	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [confirmationName, setConfirmationName] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const { activeOrganization } = useActiveOrganization();
	const invalidate = useInvalidateWebhooks();

	const webhookToDelete = webhook?.id === deleteId ? webhook : null;
	const validationPhrase = webhookToDelete?.name || webhookToDelete?.url || "";

	const handleDelete = async () => {
		if (!webhookToDelete || !activeOrganization) return;

		if (confirmationName !== validationPhrase) {
			toast.error("Please enter the correct webhook name to confirm deletion");
			return;
		}

		try {
			setIsDeleting(true);
			await axios.delete(`/api/webhook/v1/${webhookToDelete.id}`, {
				withCredentials: true,
			});

			toast.success("Webhook deleted successfully");
			void setDeletedWebhookName(validationPhrase);
			void setDeleteId(null);
			setConfirmationName("");
			await invalidate();
			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete webhook"
				: "Failed to delete webhook";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCancel = () => {
		void setDeleteId(null);
		void setDeletedWebhookName(null);
		setConfirmationName("");
		if (!pathname.endsWith("/webhooks") && !pathname.includes("/webhooks/")) {
			// only navigate if not already on list when canceling success state
		}
		if (pathname.includes("/webhooks/") && !pathname.endsWith("/webhooks")) {
			void navigate({ to: "/webhooks" });
		}
	};

	return {
		deleteId,
		deletedWebhookName,
		lastDeletedWebhookName,
		confirmationName,
		setConfirmationName,
		isDeleting,
		validationPhrase,
		webhookToDelete,
		handleDelete,
		handleCancel,
	};
}
