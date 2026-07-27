"use client";

import { useRouter } from "next/navigation";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { Icon } from "@reloop/ui/icon";

export const WorkflowNotFound = () => {
	const router = useRouter();

	return (
		<div className="mx-auto flex max-w-md flex-col items-center px-8 py-24 text-center">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-weak-50">
				<Icon name="workflow" className="h-5 w-5 text-text-sub-600" />
			</div>
			<h2 className="mb-2 font-semibold text-text-strong-950 text-xl">
				Workflow not found
			</h2>
			<p className="mb-6 text-sm text-text-sub-600">
				This workflow may have been deleted or the link is incorrect.
			</p>
			<AnimatedBackButton onClick={() => router.push("/workflows")} />
		</div>
	);
};
