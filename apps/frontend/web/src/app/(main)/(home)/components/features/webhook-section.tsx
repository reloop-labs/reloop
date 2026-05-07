"use client";

import { FeatureSection } from "./feature-section";
import type { FeatureData, FeatureSectionProps } from "./types";
import { PipelinesVisual } from "./visuals";

const webhookData: FeatureData = {
	label: "Webhook",
	title: "Build complex workflows with simple logic",
	description:
		"Scale your email infrastructure without managing servers. Use simple, programmable pipelines to handle security, compliance, and custom delivery logic automatically.",
	visual: PipelinesVisual,
	bgImage:
		"https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072",
	cards: [
		{
			title: "Managed Authentication",
			description:
				"We handle the technical complexity of SPF, DKIM, and DMARC so your emails always reach the inbox.",
		},
		{
			title: "AI-powered Content Guard",
			description:
				"Automatically catch spam triggers, broken images, and phishing signals before your mail ever leaves the node.",
		},
		{
			title: "Programmable Flow",
			description:
				"Define complex retry logic, A/B tests, and delivery rules with a simple, YAML-based configuration.",
		},
	],
};

export function WebhookSection({
	index,
	forwardRef,
	isLast,
}: Omit<FeatureSectionProps, "feature">) {
	return (
		<FeatureSection
			feature={webhookData}
			index={index}
			forwardRef={forwardRef}
			isLast={isLast}
		/>
	);
}
