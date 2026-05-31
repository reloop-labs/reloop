import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
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

	const router = useRouter();
	const pathname = usePathname();
	const [confirmationName, setConfirmationName] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const { activeOrganization } = useUserOrganization();
	const { mutate } = useSWRConfig();

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
				headers: { credentials: "include" },
			});

			toast.success("Webhook deleted successfully");
			setDeletedWebhookName(validationPhrase);
			setDeleteId(null);
			setConfirmationName("");
			mutate(
				`/api/webhook/v1/?organizationId=${activeOrganization.id}&limit=100`,
			);
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
		setDeleteId(null);
		setDeletedWebhookName(null);
		setConfirmationName("");
		if (pathname !== "/webhooks") {
			router.push("/webhooks");
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
