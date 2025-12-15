"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { Domain } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import Spinner from "@reloop/ui/spinner";

interface DeleteDomainModalProps {
	domains: Domain[];
}

export const DeleteDomainModal = ({ domains }: DeleteDomainModalProps) => {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [isDeleting, setIsDeleting] = useState(false);
	const [confirmationText, setConfirmationText] = useState("");
	const [isCopied, setIsCopied] = useState(false);
	const { mutate } = useSWRConfig();
	const { activeOrganization } = useUserOrganization();
	const pathname = usePathname();
	const router = useRouter();
	const domainToDelete = domains.find((domain) => domain.id === deleteId);

	// Check if we're on a domain detail page (not the list page)
	// Detail page: /{orgSlug}/domain/{domainId}
	// List page: /{orgSlug}/domain
	const isOnDetailPage =
		pathname?.includes("/domain/") &&
		!pathname?.includes("/domain/add") &&
		pathname !== `/${activeOrganization?.slug}/domain`;

	useEffect(() => {
		if (isCopied) {
			const timer = setTimeout(() => {
				setIsCopied(false);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [isCopied]);

	const handleDelete = async () => {
		if (!domainToDelete) return;

		setIsDeleting(true);
		try {
			await axios.delete(`/api/domain/v1/${domainToDelete.domain}`, {
				headers: { credentials: "include" },
			});
			await mutate(
				(key) =>
					typeof key === "string" &&
					key.startsWith(`/api/domain/v1/list?organizationId=${activeOrganization?.id}`),
			);

			toast.success(`${domainToDelete.domain} deleted successfully`);
			setDeleteId(null);
			setConfirmationText("");

			// Navigate to domain list if we're on a detail page
			if (isOnDetailPage && activeOrganization) {
				// Use setTimeout to ensure modal closes first, then navigate
				setTimeout(() => {
					router.push(`/${activeOrganization.slug}/domain`);
				}, 100);
			}
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete domain"
				: "Failed to delete domain";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCancel = () => {
		setDeleteId(null);
		setConfirmationText("");
	};

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) {
					setDeleteId(null);
					setConfirmationText("");
				}
			}}
		>
			<Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
				<div className="border border-stroke-soft-100/50 rounded-2xl">
					<Modal.Header className='before:border-stroke-soft-200/50'>
						<div className="flex-1">
							<Modal.Title className="text-sm">Delete Domain</Modal.Title>
						</div>
					</Modal.Header>
					<Modal.Body className="space-y-4">
						<div className="flex flex-col gap-1">
							<p className="text-text-sub-600 text-paragraph-sm">
								Are you sure you want to delete this domain?
							</p>
							<p className="font-medium text-error-base text-paragraph-sm">
								This action cannot be undone.
							</p>
						</div>
						<div className="flex flex-col gap-2">
							<p className="text-text-strong-950 text-paragraph-sm">
								Type{" "}
								<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-2 py-0.5 font-mono text-text-strong-950 text-paragraph-xs border border-stroke-soft-200">
									{domainToDelete?.domain}
									<button
										type="button"
										onClick={async () => {
											try {
												await navigator.clipboard.writeText(
													domainToDelete?.domain || "",
												);
												setIsCopied(true);
											} catch {
												toast.error("Failed to copy domain");
											}
										}}
										className="text-text-sub-600 hover:text-text-strong-950 transition-colors"
									>
										<Icon
											name={isCopied ? "check" : "copy"}
											className={`h-3 w-3 ${isCopied ? "text-success-base" : ""}`}
										/>
									</button>
								</span>{" "}
								to confirm.
							</p>
							<Input.Root size="small">
								<Input.Wrapper>
									<Input.Input
										type="text"

										value={confirmationText}
										onChange={(e) => setConfirmationText(e.target.value)}
										placeholder="Enter domain name"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</Modal.Body>
					<Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleCancel}
							disabled={isDeleting}
						>
							Cancel
							<Kbd.Root className="bg-bg-weak-50 text-[10px]">Esc</Kbd.Root>
						</Button.Root>
						<Button.Root
							variant="error"
							size="small"
							onClick={handleDelete}
							disabled={isDeleting || confirmationText !== domainToDelete?.domain}
						>
							{isDeleting ? (
								<>
									<Spinner size={16} />
									Deleting...
								</>
							) : (
								"Delete Domain"
							)}
						</Button.Root>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root >
	);
};
