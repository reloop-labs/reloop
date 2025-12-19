"use client";

import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as SegmentedControl from "@reloop/ui/segmented-control";
import { useState } from "react";

type BorderStyle = "none" | "solid" | "dashed" | "dotted";

export const InputBorderWidth = () => {
	const [style, setStyle] = useState<BorderStyle>("none");

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<Label.Root className="font-medium text-text-sub-600 text-xs">
					Border
				</Label.Root>
			</div>

			<div className="flex gap-1.5">
				{/* Width input */}
				<Input.Root size="xsmall" className="w-20">
					<Input.Wrapper>
						<Input.Icon
							as={Icon}
							name="menu"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<Input.Input
							type="text"
							placeholder="0"
							className="text-center"
							disabled={style === "none"}
						/>
					</Input.Wrapper>
				</Input.Root>

				{/* Border style segmented control */}
				<SegmentedControl.Root
					value={style}
					onValueChange={(value) => setStyle(value as BorderStyle)}
					className="flex-1"
				>
					<SegmentedControl.List>
						<SegmentedControl.Trigger value="none" className="text-xs">
							None
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger value="solid" className="text-xs">
							<div className="h-0.5 w-4 bg-current" />
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger value="dashed" className="text-xs">
							<div className="flex gap-0.5">
								<div className="h-0.5 w-1.5 bg-current" />
								<div className="h-0.5 w-1.5 bg-current" />
							</div>
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger value="dotted" className="text-xs">
							<div className="flex gap-0.5">
								<div className="h-1 w-1 rounded-full bg-current" />
								<div className="h-1 w-1 rounded-full bg-current" />
								<div className="h-1 w-1 rounded-full bg-current" />
							</div>
						</SegmentedControl.Trigger>
					</SegmentedControl.List>
				</SegmentedControl.Root>
			</div>
		</div>
	);
};
