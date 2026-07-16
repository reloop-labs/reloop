"use client";

import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Select from "@reloop/ui/select";
import type { SendEmailNodeData } from "../workflow-types";

const MOCK_DOMAINS = [
	{ value: "hello@yourdomain.com", label: "hello@yourdomain.com" },
	{ value: "noreply@yourdomain.com", label: "noreply@yourdomain.com" },
];

interface SendEmailConfigFormProps {
	value: SendEmailNodeData;
	onChange: (data: SendEmailNodeData) => void;
}

export const SendEmailConfigForm = ({
	value,
	onChange,
}: SendEmailConfigFormProps) => {
	const update = (patch: Partial<SendEmailNodeData>) =>
		onChange({ ...value, ...patch });

	return (
		<div className="flex flex-col gap-4">
			<div className="space-y-1.5">
				<Label.Root htmlFor="send-to">To</Label.Root>
				<Input.Root>
					<Input.Wrapper>
						<Input.Input
							id="send-to"
							placeholder="{{contact.email}}"
							value={value.to}
							onChange={(e) => update({ to: e.target.value })}
						/>
					</Input.Wrapper>
				</Input.Root>
				<p className="text-text-sub-600 text-xs">
					Use {"{{contact.email}}"} or a fixed address.
				</p>
			</div>

			<div className="space-y-1.5">
				<Label.Root htmlFor="send-subject">Subject</Label.Root>
				<Input.Root>
					<Input.Wrapper>
						<Input.Input
							id="send-subject"
							placeholder="Your email subject"
							value={value.subject}
							onChange={(e) => update({ subject: e.target.value })}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			<div className="space-y-1.5">
				<Label.Root>From</Label.Root>
				<Select.Root
					value={value.from ?? ""}
					onValueChange={(from) => update({ from })}
				>
					<Select.Trigger className="w-full">
						<Select.Value placeholder="Select sender (mock)" />
					</Select.Trigger>
					<Select.Content>
						{MOCK_DOMAINS.map((d) => (
							<Select.Item key={d.value} value={d.value}>
								{d.label}
							</Select.Item>
						))}
					</Select.Content>
				</Select.Root>
			</div>

			<div className="space-y-1.5">
				<Label.Root htmlFor="send-template">Template</Label.Root>
				<Input.Root>
					<Input.Wrapper>
						<Input.Input
							id="send-template"
							placeholder="Template picker (coming soon)"
							value={value.templateId ?? ""}
							disabled
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
		</div>
	);
};
