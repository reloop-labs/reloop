"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { Domain } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface DeleteDomainModalProps {
	domains: Domain[];
}

export const DeleteDomainModal = ({ domains }: DeleteDomainModalProps) => {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isValidationPhraseCopied, setIsValidationPhraseCopied] =
		useState(false);

	// Check if we're on a domain detail page (not the list page)
	const [confirmationText, setConfirmationText] = useState("");
	const { mutate } = useSWRConfig();
	const { activeOrganization } = useUserOrganization();
	const pathname = usePathname();
	const router = useRouter();
	const domainToDelete = domains.find((domain) => domain.id === deleteId);
	const isOnDetailPage =
		pathname?.includes("/domain/") &&
		!pathname?.includes("/domain/add") &&
		pathname !== "/domain";

	// Command/Ctrl + Enter to delete
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (confirmationText === domainToDelete?.domain && !isDeleting) {
				handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	const handleDelete = async () => {
		if (!domainToDelete) return;

		setIsDeleting(true);
		try {
			await axios.delete(`/api/domain/v1/${domainToDelete.id}`, {
				headers: { credentials: "include" },
			});
			await mutate(
				(key) =>
					typeof key === "string" && key.startsWith("/api/domain/v1/lis"),
			);

			toast.success(`${domainToDelete.domain} deleted successfully`);
			setDeleteId(null);
			setConfirmationText("");

			// Navigate to domain list if we're on a detail page
			if (isOnDetailPage && activeOrganization) {
				// Use setTimeout to ensure modal closes first, then navigate
				setTimeout(() => {
					router.push("/domain");
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
			<Modal.Content
				className="rounded-20 border-none p-0 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-20 border border-stroke-soft-100/50 bg-bg-white-0">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (confirmationText === domainToDelete?.domain && !isDeleting) {
								handleDelete();
							}
						}}
					>
						<div className="p-6">
							<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-error-base/10">
								<Icon name="trash" className="h-4 w-4 text-error-base" />
							</div>

							<h2 className="font-medium text-text-strong-950 text-title-h5">
								Delete domain?
							</h2>
							<p className="mb-6 text-pretty text-sm text-text-sub-600 leading-relaxed">
								This will stop all email delivery through this domain. Any
								campaigns or automations using this sender will fail. Update
								your sender address before removing.
							</p>

							{/* Domain Card */}
							<div className="mb-6 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-base/10 text-error-base">
									<Icon name="globe" className="h-5 w-5" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm text-text-strong-950">
										{domainToDelete?.domain}
									</p>
									<p className="mt-0.5 truncate font-mono text-text-sub-600 text-xs">
										{domainToDelete?.id}
									</p>
								</div>
							</div>

							{/* Confirmation Input */}
							<div className="mb-2">
								<p className="mb-2 text-sm text-text-sub-600">
									Type{" "}
									<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 px-2 py-0.5 font-medium text-text-strong-950 text-xs dark:bg-bg-strong-200">
										{domainToDelete?.domain}
										<button
											type="button"
											onClick={async () => {
												try {
													if (domainToDelete?.domain) {
														await navigator.clipboard.writeText(
															domainToDelete.domain,
														);
														setIsValidationPhraseCopied(true);
														setTimeout(
															() => setIsValidationPhraseCopied(false),
															2000,
														);
													}
												} catch {
													toast.error("Failed to copy domain name");
												}
											}}
											className="text-text-sub-600 transition-colors hover:text-text-strong-950"
										>
											<Icon
												name={isValidationPhraseCopied ? "check" : "copy"}
												className={`h-3 w-3 ${isValidationPhraseCopied ? "text-success-base" : ""}`}
											/>
										</button>
									</span>{" "}
									to confirm
								</p>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											type="text"
											value={confirmationText}
											onChange={(e) => setConfirmationText(e.target.value)}
											placeholder={domainToDelete?.domain}
											className="font-mono text-sm"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>

						<div className="flex flex-col-reverse justify-end gap-4 px-6 pb-6 sm:flex-row sm:items-center">
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={handleCancel}
								disabled={isDeleting}
								className="gap-1.5"
							>
								Cancel
								<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
									Esc
								</span>
							</Button.Root>
							<Button.Root
								type="submit"
								variant="error"
								size="xsmall"
								disabled={
									isDeleting || confirmationText !== domainToDelete?.domain
								}
							>
								{isDeleting ? (
									"Deleting..."
								) : (
									<>
										Delete domain
										<span className="inline-flex items-center gap-0.5">
											<Icon
												name="command"
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
											<Icon
												name="enter"
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
										</span>
									</>
								)}
							</Button.Root>
						</div>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
