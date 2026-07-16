import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateDomains } from "../hooks/use-domains-query";
import type { Domain } from "../types";

export function DeleteDomainModal({ domains }: { domains: Domain[] }) {
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isValidationPhraseCopied, setIsValidationPhraseCopied] =
		useState(false);
	const [confirmationText, setConfirmationText] = useState("");
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
			setConfirmationText("");
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
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (confirmationText === domainToDelete?.domain && !isDeleting) {
				void handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!deleteId },
	);

	useEffect(() => {
		if (!deleteId) {
			const t = setTimeout(() => setConfirmationText(""), 300);
			return () => clearTimeout(t);
		}
	}, [deleteId]);

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) void setDeleteId(null);
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (confirmationText === domainToDelete?.domain && !isDeleting) {
							void handleDelete();
						}
					}}
				>
					<div className="px-5 pt-5 pb-4">
						<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-error-base/10">
							<Icon name="trash" className="h-4 w-4 text-error-base" />
						</div>
						<Modal.Title className="font-semibold text-label-md text-text-strong-950">
							Delete domain?
						</Modal.Title>
						<p className="mt-1 text-paragraph-sm text-text-sub-600">
							This will stop all email delivery through this domain. Type{" "}
							<span className="font-medium text-text-strong-950">
								{domainToDelete?.domain}
							</span>{" "}
							to confirm.
						</p>

						<div className="mt-4 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
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
									className={`h-3.5 w-3.5 ${isValidationPhraseCopied ? "text-success-base" : ""}`}
								/>
							</button>
						</div>

						<div className="mt-4">
							<Input.Root size="small">
								<Input.Wrapper>
									<Input.Input
										value={confirmationText}
										onChange={(e) => setConfirmationText(e.target.value)}
										placeholder={domainToDelete?.domain}
										autoFocus
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</div>

					<div className="flex justify-end gap-2 border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => void setDeleteId(null)}
							disabled={isDeleting}
						>
							Cancel
						</Button.Root>
						<Button.Root
							type="submit"
							variant="error"
							size="xsmall"
							disabled={
								isDeleting || confirmationText !== domainToDelete?.domain
							}
						>
							{isDeleting ? "Deleting..." : "Delete domain"}
						</Button.Root>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
}
