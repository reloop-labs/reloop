"use client";

import * as Accordion from "@reloop/ui/accordion";
import type { FaqItem } from "@reloop/web/components/faq-section";

export function FaqGrid({
	groups,
	id = "faq",
}: {
	groups?: { title: string; items: FaqItem[] }[];
	items?: FaqItem[];
	id?: string;
}) {
	const allItems: FaqItem[] = groups ? groups.flatMap((g) => g.items) : [];

	return (
		<div
			id={id}
			className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12 md:px-8"
		>
			<Accordion.Root type="single" collapsible className="space-y-2">
				{allItems.map((faq) => (
					<Accordion.Item key={faq.question} value={faq.question}>
						<Accordion.Header>
							<Accordion.Trigger>
								<Accordion.Arrow />
								{faq.question}
							</Accordion.Trigger>
						</Accordion.Header>
						<Accordion.Content>{faq.answer}</Accordion.Content>
					</Accordion.Item>
				))}
			</Accordion.Root>
		</div>
	);
}
