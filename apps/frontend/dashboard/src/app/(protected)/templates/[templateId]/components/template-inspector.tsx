"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { useState } from "react";
import { InputAlignment } from "../editor/inputs/alignment";
import { InputBackgroundColor } from "../editor/inputs/background-color";
import { InputMargin } from "../editor/inputs/margin";
import { InputPadding } from "../editor/inputs/padding";
import { InputWidth } from "../editor/inputs/width";

export const TemplateInspector = () => {
	const [activeTab, setActiveTab] = useState("styles");

	return (
		<div className="flex w-72 flex-col border-stroke-soft-100 border-l bg-bg-weak-50 dark:bg-black">
			<div className="flex h-11 items-center border-stroke-soft-100 border-b px-4">
				<span className="text-xs font-semibold text-text-strong-950 uppercase tracking-wider">
					Inspector
				</span>
			</div>

			<TabMenuHorizontal.Root
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex flex-1 flex-col overflow-hidden"
			>
				<TabMenuHorizontal.List className="flex h-10 border-stroke-soft-100 border-b px-2">
					<TabMenuHorizontal.Trigger
						value="styles"
						className="flex-1 text-[11px] font-medium transition-colors data-[state=active]:text-text-strong-950 text-text-soft-400"
					>
						Styles
					</TabMenuHorizontal.Trigger>
					<TabMenuHorizontal.Trigger
						value="settings"
						className="flex-1 text-[11px] font-medium transition-colors data-[state=active]:text-text-strong-950 text-text-soft-400"
					>
						Settings
					</TabMenuHorizontal.Trigger>
				</TabMenuHorizontal.List>

				<TabMenuHorizontal.Content

					value="styles"
					className="flex-1 overflow-y-auto p-4 space-y-6"
				>
					<section className="space-y-4">
						<h3 className="text-[10px] font-bold text-text-soft-400 uppercase tracking-widest">
							Layout
						</h3>
						<InputWidth />
						<InputAlignment />
					</section>

					<div className="h-px bg-stroke-soft-100/50" />

					<section className="space-y-4">
						<h3 className="text-[10px] font-bold text-text-soft-400 uppercase tracking-widest">
							Spacing
						</h3>
						<InputPadding />
						<InputMargin />
					</section>

					<div className="h-px bg-stroke-soft-100/50" />

					<section className="space-y-4">
						<h3 className="text-[10px] font-bold text-text-soft-400 uppercase tracking-widest">
							Appearance
						</h3>
						<InputBackgroundColor />
					</section>
				</TabMenuHorizontal.Content>

				<TabMenuHorizontal.Content
					value="settings"
					className="flex-1 overflow-y-auto p-4 space-y-6"
				>
					<div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
						<Icon name="settings" className="h-8 w-8" />
						<p className="text-xs">No component selected</p>
					</div>
				</TabMenuHorizontal.Content>
			</TabMenuHorizontal.Root>

		</div>
	);
};
