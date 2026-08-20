"use client";

export { posthog } from "posthog-js";
export {
	useActiveFeatureFlags,
	useFeatureFlagEnabled,
	useFeatureFlagPayload,
	useFeatureFlagVariantKey,
	usePostHog,
} from "posthog-js/react";
export * from "./posthog-provider";
