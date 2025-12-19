"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { useState } from "react";

type WidthUnit = "px" | "%";

export const InputWidth = () => {
	const [unit, setUnit] = useState<WidthUnit>("px");
	const [value, setValue] = useState("600");

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<Label.Root className="font-medium text-text-sub-600 text-xs">
					Width
				</Label.Root>
			</div>

			<div className="flex gap-1.5">
				<Input.Root size="xsmall" className="flex-1">
					<Input.Wrapper>
						<Input.Icon
							as={Icon}
							name="arrow-left-right"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<Input.Input
							type="text"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="600"
							className="text-center"
						/>
					</Input.Wrapper>
				</Input.Root>

				{/* Unit toggle */}
				<div className="flex rounded-lg border border-stroke-soft-200 bg-bg-white-0">
					<button
						type="button"
						onClick={() => setUnit("px")}
						className={cn(
							"rounded-l-[7px] px-2 py-1 font-medium text-xs transition-colors",
							unit === "px"
								? "bg-bg-strong-950 text-white"
								: "text-text-sub-600 hover:bg-bg-weak-50",
						)}
					>
						px
					</button>
					<button
						type="button"
						onClick={() => setUnit("%")}
						className={cn(
							"rounded-r-[7px] px-2 py-1 font-medium text-xs transition-colors",
							unit === "%"
								? "bg-bg-strong-950 text-white"
								: "text-text-sub-600 hover:bg-bg-weak-50",
						)}
					>
						%
					</button>
				</div>
			</div>
		</div>
	);
};
