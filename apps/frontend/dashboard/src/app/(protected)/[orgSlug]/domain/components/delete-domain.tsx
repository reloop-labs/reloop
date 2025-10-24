"use client";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import type { Domain } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

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
	const domainToDelete = domains.find((domain) => domain.id === deleteId);

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
				`/api/domain/v1/list?organizationId=${activeOrganization?.id}&limit=100`,
			);

			toast.success(`${domainToDelete.domain} deleted successfully`);
			setDeleteId(null);
			setConfirmationText("");
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
			onOpenChange={(open) => !open && setDeleteId(null)}
		>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
				<Modal.Body>
					<h2 className="mb-2 font-semibold text-gray-900 text-xl">
						Delete Domain
					</h2>
					<p className="text-gray-600 text-sm">
						Are you sure you want to delete this domain?
					</p>
					<p className="mb-4 font-medium text-red-600 text-sm">
						This can not be undone.
					</p>

					<div className="mb-4">
						<p className="mb-2 text-gray-700 text-sm">
							Type{" "}
							<span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 font-mono text-gray-800 text-xs">
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
									className="ml-1 text-gray-500 hover:text-gray-700"
								>
									<Icon
										name={isCopied ? "check" : "copy"}
										className={`h-3 w-3 ${isCopied ? "text-green-600" : ""}`}
									/>
								</button>
							</span>{" "}
							to confirm.
						</p>
						<Input.Root>
							<Input.Wrapper size="xsmall">
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

				<Modal.Footer className="flex items-center justify-end gap-3">
					<Button.Root
						variant="error"
						size="small"
						onClick={handleDelete}
						disabled={isDeleting || confirmationText !== domainToDelete?.domain}
					>
						{isDeleting ? (
							<>
								<Icon name="loader" className="h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							<>
								Delete Domain
								<Icon name="undo" className="h-3 w-3 scale-y-[-1]" />
							</>
						)}
					</Button.Root>
					<Button.Root
						variant="neutral"
						size="small"
						mode="stroke"
						onClick={handleCancel}
						disabled={isDeleting}
					>
						Cancel
						<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
