"use client";

import { cn } from "@reloop/ui/cn";
import { useEffect, useRef, useState } from "react";
import { EditorSection } from "./features/editor-section";
import { InsightsSection } from "./features/insights-section";
import { SDKSection } from "./features/sdk-section";
import { WebhookSection } from "./features/webhook-section";

const FEATURE_LABELS = ["SDK", "insights", "Editor", "Webhook"];

export default function Features() {
	const [activeIndex, setActiveIndex] = useState(0);
	const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const idx = Number(entry.target.getAttribute("data-index"));
						if (!Number.isNaN(idx)) setActiveIndex(idx);
					}
				}
			},
			{ rootMargin: "-20% 0px -60% 0px", threshold: 0 },
		);

		for (const el of panelRefs.current) {
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, []);

	const scrollToPanel = (index: number) => {
		panelRefs.current[index]?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	return (
		<section id="features" className="bg-white text-[#0a0d12]">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="relative lg:flex lg:gap-20">
					{/* Sticky left nav */}
					<nav className="hidden lg:block lg:w-[180px] lg:shrink-0">
						<div className="sticky top-28 flex flex-col gap-0 py-28">
							{FEATURE_LABELS.map((label, i) => (
								<button
									type="button"
									key={label}
									onClick={() => scrollToPanel(i)}
									className={cn(
										"group flex items-center gap-3 rounded-lg px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-[0.12em] transition-colors",
										i === activeIndex
											? "text-[#0a0d12]"
											: "text-[#0a0d12]/30 hover:text-[#0a0d12]/60",
									)}
								>
									<span
										className={cn(
											"size-2 shrink-0 rounded-full transition-colors",
											i === activeIndex ? "bg-emerald-500" : "bg-transparent",
										)}
									/>
									{label}
								</button>
							))}
						</div>
					</nav>

					{/* Scrollable feature panels */}
					<div className="flex-1">
						<SDKSection
							index={0}
							forwardRef={(el) => {
								panelRefs.current[0] = el;
							}}
						/>
						<InsightsSection
							index={1}
							forwardRef={(el) => {
								panelRefs.current[1] = el;
							}}
						/>
						<EditorSection
							index={2}
							forwardRef={(el) => {
								panelRefs.current[2] = el;
							}}
						/>
						<WebhookSection
							index={3}
							forwardRef={(el) => {
								panelRefs.current[3] = el;
							}}
							isLast
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
