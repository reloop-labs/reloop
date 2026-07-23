import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateDomains } from "../hooks/use-domains-query";
import type { Domain } from "../types";

export function DeleteDomainModal({
	domains,
	onDeleteSuccess,
}: {
	domains: Domain[];
	onDeleteSuccess?: (deletedName: string) => void;
}) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [isDeleting, setIsDeleting] = useState(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const invalidate = useInvalidateDomains();

	const domainToDelete = domains.find((domain) => domain.id === deleteId);
	const isOnDetailPage =
		pathname.includes("/domain/") &&
		!pathname.includes("/domain/add") &&
		!pathname.endsWith("/domain") &&
		!pathname.endsWith("/domain/");

	const handleDelete = async () => {
		if (!domainToDelete) return;
		setIsDeleting(true);
		try {
			const deletedName = domainToDelete.domain;
			await axios.delete(`/api/domain/v1/${domainToDelete.id}`, {
				withCredentials: true,
			});
			await invalidate();
			toast.success(`${deletedName} deleted successfully`);
			onDeleteSuccess?.(deletedName);
			void setDeleteId(null);
			if (isOnDetailPage) {
				setTimeout(() => {
					void navigate({ to: "/domain" });
				}, 100);
			}
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete domain"
				: "Failed to delete domain";
			toast.error(message);
		} finally {
			setIsDeleting(false);
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (domainToDelete && !isDeleting) {
				void handleDelete();
			}
		},
		{ enabled: !!deleteId },
	);

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) void setDeleteId(null);
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-6 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				{/* Header */}
				<div className="pr-6">
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Delete domain
					</Modal.Title>
					<p className="mt-2 text-sm text-text-sub-600 leading-relaxed">
						Deleting{" "}
						<span className="font-semibold">{domainToDelete?.domain}</span> will
						stop email sending and receiving immediately. This action cannot be
						undone.
					</p>
				</div>

				{/* Domain Details Card */}
				<div className="mt-5 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
					<div>
						<p className="font-normal text-text-sub-600 text-xs">Domain name</p>
						<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
							{domainToDelete?.domain}
						</p>
					</div>
				</div>

				{/* Warning Banner */}
				<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
					<span className="font-bold text-[#6D4000] dark:text-amber-100">
						Important Note:
					</span>{" "}
					DNS records for this domain won't be deleted automatically — you'll
					need to remove them manually from your DNS provider, or email may
					continue to be routed incorrectly.
				</div>

				{/* Footer Actions */}
				<div className="mt-6 flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={() => void setDeleteId(null)}
						disabled={isDeleting}
					>
						Cancel
					</Button.Root>
					<FancyButton.Root
						type="button"
						variant="destructive"
						size="small"
						disabled={isDeleting}
						onClick={() => void handleDelete()}
					>
						{isDeleting ? (
							<>
								<Spinner size={14} color="currentColor" />
								Deleting...
							</>
						) : (
							"Delete domain"
						)}
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
