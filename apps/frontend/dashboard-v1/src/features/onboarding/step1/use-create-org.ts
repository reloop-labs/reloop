import { authClient } from "@reloop/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";

function randomOrgSlug() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID().replace(/-/g, "").substring(0, 12);
	}
	return Math.random().toString(36).substring(2, 14);
}

export function useCreateOrg() {
	const queryClient = useQueryClient();
	const [isCreating, setIsCreating] = useState(false);
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [name] = useQueryState("name", parseAsString.withDefault(""));
	const [orgId, setOrgId] = useQueryState(
		"orgId",
		parseAsString.withDefault(""),
	);
	const [logoUrl] = useQueryState("logoUrl", parseAsString.withDefault(""));
	const [referral] = useQueryState("referral", parseAsString.withDefault(""));
	const [otherReferral] = useQueryState(
		"otherReferral",
		parseAsString.withDefault(""),
	);

	const createAndContinue = async () => {
		if (orgId) {
			setStep(step + 1);
			return;
		}

		setIsCreating(true);
		try {
			const { error, data: organization } =
				await authClient.organization.create({
					name,
					keepCurrentActiveOrganization: true,
					slug: randomOrgSlug(),
					logo: logoUrl || undefined,
					metadata: {
						referral: referral === "other" ? otherReferral : referral,
					},
				});

			if (error) {
				toast.error(error.message || "Failed to create organization");
				return;
			}

			if (organization) {
				setOrgId(organization.id);
				try {
					await authClient.organization.setActive({
						organizationId: organization.id,
					});
				} catch (setActiveError) {
					console.error("Error setting active organization:", setActiveError);
				}
				await authClient.updateUser({ activeOrganizationId: organization.id });
				await queryClient.invalidateQueries({
					queryKey: queryKeys.auth.organizations(),
				});
				await queryClient.invalidateQueries({
					queryKey: queryKeys.auth.session(),
				});
			}

			setStep(step + 1);
		} finally {
			setIsCreating(false);
		}
	};

	return {
		isCreating,
		name,
		orgId,
		referral,
		otherReferral,
		createAndContinue,
	};
}
