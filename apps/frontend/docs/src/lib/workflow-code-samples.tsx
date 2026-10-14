"use client";

import {
	activateAutomationXCodeSamples,
	createAutomationXCodeSamples,
	createEventXCodeSamples,
	deleteAutomationXCodeSamples,
	enrollContactXCodeSamples,
	getEnrollmentXCodeSamples,
	listAutomationsXCodeSamples,
	listEnrollmentsXCodeSamples,
	pauseAutomationXCodeSamples,
	trackEventXCodeSamples,
	updateAutomationXCodeSamples,
} from "@reloop/code-samples/workflow";
import type { LearnCodeSample } from "../components/mdx/CodeSamples";
import { CodeSamples } from "../components/mdx/CodeSamples";

const registry = {
	"events.create": createEventXCodeSamples,
	"events.track": trackEventXCodeSamples,
	"automations.create": createAutomationXCodeSamples,
	"automations.list": listAutomationsXCodeSamples,
	"automations.update": updateAutomationXCodeSamples,
	"automations.delete": deleteAutomationXCodeSamples,
	"automations.activate": activateAutomationXCodeSamples,
	"automations.pause": pauseAutomationXCodeSamples,
	"automations.enroll": enrollContactXCodeSamples,
	"automations.enrollments.list": listEnrollmentsXCodeSamples,
	"automations.enrollments.get": getEnrollmentXCodeSamples,
} as const satisfies Record<string, LearnCodeSample[]>;

export type WorkflowCodeSampleId = keyof typeof registry;

export function WorkflowCodeSamples({ id }: { id: WorkflowCodeSampleId }) {
	return <CodeSamples samples={registry[id]} />;
}
