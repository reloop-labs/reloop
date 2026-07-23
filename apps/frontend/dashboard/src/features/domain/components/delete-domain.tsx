import * as Button from "@reloop/ui/button";
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

export function DeleteDomainModal({ domains }: { domains: Domain[] }) {
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
			await axios.delete(`/api/domain/v1/${domainToDelete.id}`, {
				withCredentials: true,
			});
			await invalidate();
			toast.success(`${domainToDelete.domain} deleted successfully`);
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
					<Modal.Title className="text-xl font-bold tracking-tight text-text-strong-950">
						Delete domain
					</Modal.Title>
					<p className="mt-2 text-sm leading-relaxed text-text-sub-600">
						Are you sure you want to delete this domain? This will also disconnect
						any active connectors and remove all routes associated with this domain.
						This action cannot be undone.
					</p>
				</div>

				{/* Domain Details Card */}
				<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
					<div>
						<p className="text-xs text-text-sub-600 font-normal">Domain name</p>
						<p className="mt-0.5 truncate text-sm font-semibold text-text-strong-950">
							{domainToDelete?.domain}
						</p>
					</div>
					<div>
						<p className="text-xs text-text-sub-600 font-normal">Domain ID</p>
						<p className="mt-0.5 break-all font-mono text-sm text-text-strong-950 dark:text-text-sub-600">
							{domainToDelete?.id}
						</p>
					</div>
				</div>

				{/* Warning Banner */}
				<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-xs leading-relaxed text-[#8A5300] dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
					<span className="font-bold text-[#6D4000] dark:text-amber-100">
						Warning:
					</span>{" "}
					Deleting this domain will permanently remove it along with all its routes
					and connections. Any services using this domain will stop working. The
					associated DNS records will not be removed and must be deleted manually.
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
					<Button.Root
						type="button"
						variant="primary"
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
					</Button.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}

