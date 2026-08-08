"use client";

import {
	createDomainXCodeSamples,
	deleteDomainXCodeSamples,
	getDomainXCodeSamples,
	listDomainsXCodeSamples,
	updateDomainXCodeSamples,
	verifyDNSXCodeSamples,
} from "@reloop/code-samples/domain";
import type { LearnCodeSample } from "../components/mdx/CodeSamples";
import { CodeSamples } from "../components/mdx/CodeSamples";

const registry = {
	"domain.create": createDomainXCodeSamples,
	"domain.list": listDomainsXCodeSamples,
	"domain.get": getDomainXCodeSamples,
	"domain.update": updateDomainXCodeSamples,
	"domain.verify": verifyDNSXCodeSamples,
	"domain.delete": deleteDomainXCodeSamples,
} as const satisfies Record<string, readonly LearnCodeSample[]>;

export type DomainCodeSampleId = keyof typeof registry;

export function DomainCodeSamples({ id }: { id: DomainCodeSampleId }) {
	const samples = registry[id];
	return <CodeSamples samples={samples as unknown as LearnCodeSample[]} />;
}
