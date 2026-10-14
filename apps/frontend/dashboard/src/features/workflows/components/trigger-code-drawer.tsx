"use client";

import { toDashboardCodeExamples } from "@reloop/code-samples/helpers";
import {
	TRACK_EVENT_PLACEHOLDER_KEY,
	trackEventXCodeSamples,
} from "@reloop/code-samples/workflow";
import { Icon } from "@reloop/ui/icon";
import { useMemo } from "react";
import {
	ApiDetailsDrawer,
	type ApiDetailsDrawerProps,
} from "#/components/api-details/api-details-drawer";

const LANG_IDS = ["node", "python", "php", "go", "ruby", "curl"] as const;

const languages = [
	{ id: "nodejs", label: "Node.js", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
	{ id: "go", label: "Go", shikiLang: "go" },
	{ id: "ruby", label: "Ruby", shikiLang: "ruby" },
	{ id: "curl", label: "cURL", shikiLang: "bash" },
] as const;

/**
 * Right-side drawer showing how to fire this automation's trigger event from
 * code. Reuses the shared API details drawer; the samples come from
 * `@reloop/code-samples/workflow` with the real event key swapped in.
 */
export const TriggerCodeDrawer = ({
	eventKey,
	renderTrigger,
}: {
	eventKey?: string;
	renderTrigger: NonNullable<ApiDetailsDrawerProps["renderTrigger"]>;
}) => {
	const codeExamples = useMemo(() => {
		const examples = toDashboardCodeExamples(
			[{ id: "track", samples: trackEventXCodeSamples }],
			LANG_IDS,
		);
		if (!eventKey) return examples;
		for (const byOp of Object.values(examples)) {
			for (const [op, code] of Object.entries(byOp)) {
				byOp[op] = code.replaceAll(TRACK_EVENT_PLACEHOLDER_KEY, eventKey);
			}
		}
		return examples;
	}, [eventKey]);

	return (
		<ApiDetailsDrawer
			title="Trigger this automation"
			icon={
				<Icon
					name="code"
					className="h-4 w-4 text-text-sub-600 dark:text-white/70"
				/>
			}
			languages={languages}
			operations={[
				{
					id: "track",
					label: eventKey ? `Send ${eventKey}` : "Send the trigger event",
					href: "/docs/learn/workflows",
					icon: (
						<Icon
							name="zap"
							className="size-4 shrink-0 text-text-sub-500 dark:text-white/60"
						/>
					),
				},
			]}
			codeExamples={codeExamples}
			docSection="events"
			renderTrigger={renderTrigger}
		/>
	);
};
