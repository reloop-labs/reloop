"use client";

import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import * as SegmentedControl from "@reloop/ui/segmented-control";

type Alignment = "left" | "center" | "right";

export const InputAlignment = () => {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<Label.Root className="font-medium text-text-sub-600 text-xs">
					Alignment
				</Label.Root>
			</div>

			<SegmentedControl.Root defaultValue="center">
				<SegmentedControl.List>
					<SegmentedControl.Trigger value="left">
						<Icon name="align-left" className="h-4 w-4" />
					</SegmentedControl.Trigger>
					<SegmentedControl.Trigger value="center">
						<Icon name="align-center" className="h-4 w-4" />
					</SegmentedControl.Trigger>
					<SegmentedControl.Trigger value="right">
						<Icon name="align-right" className="h-4 w-4" />
					</SegmentedControl.Trigger>
				</SegmentedControl.List>
			</SegmentedControl.Root>
		</div>
	);
};
