import { useMemo } from "react";
import { useApiKeysQuery } from "#/features/api-keys/hooks/use-api-keys-query";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import { useSentEmailsQuery } from "#/features/emails/hooks/use-emails-query";
import {
	deriveSetupProgress,
	hasSentFromOwnDomain,
	type SetupProgress,
} from "./setup-progress";

const EMPTY_PROGRESS: SetupProgress = {
	steps: [],
	completedCount: 0,
	totalCount: 3,
	allComplete: false,
	activeDomain: null,
};

export function useSetupProgress() {
	const { activeOrganization, isMembershipReady } = useActiveOrganization();
	const enabled = isMembershipReady && Boolean(activeOrganization?.id);

	const domainsQuery = useDomainsQuery({
		page: 1,
		limit: 20,
		status: [],
		q: "",
		enabled,
	});
	const apiKeysQuery = useApiKeysQuery({
		page: 1,
		limit: 1,
		status: [],
		creator: "",
		q: "",
		enabled,
	});
	const emailsQuery = useSentEmailsQuery({
		page: 1,
		limit: 20,
		search: "",
		domain: "",
		apiKeyId: "",
		status: "",
		startDate: "",
		endDate: "",
		enabled,
	});

	const domains = domainsQuery.data?.domains ?? [];
	const apiKeyCount = apiKeysQuery.data?.total ?? 0;
	const emails = emailsQuery.data?.data ?? [];

	const progress = useMemo(
		() =>
			deriveSetupProgress({
				domains: domains.map((d) => ({
					id: d.id,
					domain: d.domain,
					status: d.status,
				})),
				apiKeyCount,
				sentFromOwnDomain: hasSentFromOwnDomain(emails, domains),
			}),
		[domains, apiKeyCount, emails],
	);

	const isPending =
		!enabled ||
		domainsQuery.isPending ||
		apiKeysQuery.isPending ||
		emailsQuery.isPending;

	return {
		orgId: activeOrganization?.id ?? null,
		orgName: activeOrganization?.name ?? null,
		progress: isPending ? EMPTY_PROGRESS : progress,
		isPending,
	};
}
