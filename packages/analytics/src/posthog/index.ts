"use client";

export * from "./posthog-provider";
export { posthog } from "posthog-js";
export {
	usePostHog,
	useFeatureFlagEnabled,
	useFeatureFlagPayload,
	useActiveFeatureFlags,
	useFeatureFlagVariantKey,
} from "posthog-js/react";
