import { useQuery } from "@tanstack/react-query";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import {
	listAutomations,
	mapAutomationToWorkflow,
} from "./use-automations-api";
import type { Workflow } from "../workflow-types";

type UseWorkflowsListOptions = {
	limit?: number;
	enabled?: boolean;
};

export function useWorkflowsList(options: UseWorkflowsListOptions = {}) {
	const { limit = 100, enabled = true } = options;
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id ?? "";

	const query = useQuery({
		queryKey: queryKeys.workflows.list(orgId),
		queryFn: async () => {
			const res = await listAutomations(limit);
			return res.automations.map(mapAutomationToWorkflow);
		},
		enabled: enabled && !!orgId,
	});

	const workflows: Workflow[] = query.data ?? [];
	const isLoading = query.isLoading && !!orgId;
	const isHydrated = !query.isLoading || !orgId;
	const isTotalEmpty = isHydrated && !isLoading && workflows.length === 0;

	return {
		workflows,
		isLoading,
		isHydrated,
		isTotalEmpty,
		error: query.error,
		refetch: query.refetch,
	};
}
