"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useOrgStore } from "@fe/dashboard/store/use-org-store";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { InviteMember } from "./invite-user";

export const CreateOrganizationModal = () => {
	const { open, setState } = useOrgStore();
	const { refetch } = authClient.useSession();
	const { mutateOrganizations } = useUserOrganization();
	const [organizationName, setOrganizationName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showInviteMember, setShowInviteMember] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!organizationName.trim()) return;
		setIsSubmitting(true);
		try {
			const organization = await authClient.organization.create({
				name: organizationName,
				logo: "",
				slug: organizationName.toLowerCase().replace(/ /g, "-"),
			});
			if (organization.error) {
				toast.error(
					organization.error.message || "Failed to create organization",
				);
				return;
			}
			await authClient.updateUser({
				activeOrganizationId: organization.data.id,
			});
			mutateOrganizations();
			refetch();
			setIsSubmitting(false);
			setShowInviteMember(true);
		} catch (e) {
			setIsSubmitting(false);
			toast.error("Failed to create organization");
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={setState}>
			<Modal.Content className="max-w-[440px]">
				{showInviteMember ? (
					<InviteMember
						onClose={() => {
							setState(false);
							setShowInviteMember(false);
						}}
					/>
				) : (
					<form onSubmit={handleSubmit}>
						<Modal.Body className="flex w-full items-start gap-4">
							<div className="w-full space-y-5">
								<div className="font-medium text-label-md text-text-strong-950">
									Create Organization
								</div>
								<div>
									<Label.Root htmlFor="email" className="mb-1">
										Logo
									</Label.Root>
									<div className="flex items-center gap-4">
										<FileUpload.Root className="h-20 w-20">
											<FileUpload.Icon
												name="image-upload"
												as={Icon}
												className="h-6 w-6"
											/>
										</FileUpload.Root>
										<div>
											<Button.Root
												variant="neutral"
												mode="stroke"
												size="xxsmall"
												className="px-5"
											>
												Upload
											</Button.Root>
											<p className="ml-0.5 text-paragraph-sm text-text-sub-600">
												Recommended size 1:1, up to 10MB.
											</p>
										</div>
									</div>
								</div>
								<div>
									<Label.Root htmlFor="email">
										Name
										<Label.Asterisk />
									</Label.Root>
									<Input.Root className="w-full" size="small">
										<Input.Wrapper className="w-full">
											<Input.Input
												type="text"
												placeholder="Placeholder text..."
												value={organizationName}
												onChange={(e) =>
													setOrganizationName(e.target.value.trim())
												}
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>
							</div>
						</Modal.Body>
						<Modal.Footer className="flex justify-end">
							<Modal.Close asChild>
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									disabled={isSubmitting}
								>
									Cancel
								</Button.Root>
							</Modal.Close>
							<Button.Root
								type="submit"
								variant="neutral"
								disabled={isSubmitting}
							>
								{isSubmitting && <Spinner color="var(--text-strong-950)" />}
								{isSubmitting ? "Creating..." : "Create"}
							</Button.Root>
						</Modal.Footer>
					</form>
				)}
			</Modal.Content>
		</Modal.Root>
	);
};
