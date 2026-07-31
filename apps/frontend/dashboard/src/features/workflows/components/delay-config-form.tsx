"use client";

import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Select from "@reloop/ui/select";
import type { DelayNodeData, DelayUnit } from "../workflow-types";

interface DelayConfigFormProps {
	value: DelayNodeData;
	onChange: (data: DelayNodeData) => void;
}

export const DelayConfigForm = ({ value, onChange }: DelayConfigFormProps) => {
	const update = (patch: Partial<DelayNodeData>) =>
		onChange({ ...value, ...patch });

	return (
		<div className="flex flex-col gap-4">
			<div>
				<p className="mb-1 font-medium text-sm text-text-strong-950">Wait</p>
				<p className="mb-3 text-text-sub-600 text-xs">
					How long to wait before the next step runs.
				</p>
			</div>
			<div className="space-y-1.5">
				<Label.Root htmlFor="delay-amount">Amount</Label.Root>
				<Input.Root>
					<Input.Wrapper>
						<Input.Input
							id="delay-amount"
							type="number"
							min={0}
							step={1}
							value={value.amount ?? 0}
							onChange={(e) =>
								update({ amount: Number(e.target.value) || 0 })
							}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
			<div className="space-y-1.5">
				<Label.Root>Unit</Label.Root>
				<Select.Root
					value={value.unit ?? "minutes"}
					onValueChange={(unit) => update({ unit: unit as DelayUnit })}
				>
					<Select.Trigger className="w-full">
						<Select.Value placeholder="Select unit" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="minutes">Minutes</Select.Item>
						<Select.Item value="hours">Hours</Select.Item>
						<Select.Item value="days">Days</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	);
};
