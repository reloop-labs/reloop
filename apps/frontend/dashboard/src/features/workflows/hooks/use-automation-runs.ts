"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryKeys } from "#/lib/query-keys";
import {
	type EnrollmentStatus,
	getAutomationMetrics,
	getEnrollment,
	listEnrollments,
} from "./use-automations-api";

const PAGE_SIZE = 50;
/** While something is still running, check back this often. */
const LIVE_REFRESH_MS = 5000;

export const RUN_RANGES = [
	{ value: "24h", label: "Last 24 hours", hours: 24 },
	{ value: "7d", label: "Last 7 days", hours: 7 * 24 },
	{ value: "15d", label: "Last 15 days", hours: 15 * 24 },
	{ value: "30d", label: "Last 30 days", hours: 30 * 24 },
	{ value: "90d", label: "Last 90 days", hours: 90 * 24 },
	{ value: "all", label: "All time", hours: null },
] as const;

export type RunRange = (typeof RUN_RANGES)[number]["value"];

export function useAutomationRuns(
	automationId: string,
	status?: EnrollmentStatus,
	range: RunRange = "all",
) {
	return useInfiniteQuery({
		// The range, not its start time, is the key: the start moves with the clock.
		queryKey: [...queryKeys.workflows.runs(automationId, status), range],
		queryFn: ({ pageParam }) => {
			const hours = RUN_RANGES.find((r) => r.value === range)?.hours ?? null;
			return listEnrollments(automationId, {
				page: pageParam,
				limit: PAGE_SIZE,
				status,
				since:
					hours === null
						? undefined
						: new Date(Date.now() - hours * 60 * 60 * 1000),
			});
		},
		initialPageParam: 1,
		getNextPageParam: (last) =>
			last.page * last.limit < last.total ? last.page + 1 : undefined,
		refetchInterval: (query) =>
			query.state.data?.pages.some((page) =>
				page.enrollments.some((run) => run.status === "active"),
			)
				? LIVE_REFRESH_MS
				: false,
	});
}

export function useAutomationRun(
	automationId: string,
	enrollmentId: string | null,
) {
	return useQuery({
		queryKey: queryKeys.workflows.run(automationId, enrollmentId ?? ""),
		queryFn: () => getEnrollment(automationId, enrollmentId as string),
		enabled: Boolean(enrollmentId),
		refetchInterval: (query) =>
			query.state.data?.enrollment.status === "active"
				? LIVE_REFRESH_MS
				: false,
	});
}

export function useAutomationMetrics(automationId: string, days: number) {
	return useQuery({
		queryKey: queryKeys.workflows.metrics(automationId, days),
		queryFn: () => getAutomationMetrics(automationId, days),
		refetchInterval: (query) =>
			(query.state.data?.runs.active ?? 0) > 0 ? LIVE_REFRESH_MS * 3 : false,
	});
}

/** Current time, refreshed every `everyMs`, so "10s ago" keeps counting. */
export function useNow(everyMs = 15000): number {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), everyMs);
		return () => clearInterval(timer);
	}, [everyMs]);
	return now;
}
