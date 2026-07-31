"use client";

import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import type { SendEmailNodeData } from "../workflow-types";

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
				<Label.Root htmlFor="send-from">From</Label.Root>
				<Input.Root>
					<Input.Wrapper>
						<Input.Input
							id="send-from"
							placeholder="hello@yourdomain.com"
							value={value.from ?? ""}
							onChange={(e) => update({ from: e.target.value })}
						/>
					</Input.Wrapper>
				</Input.Root>
				<p className="text-text-sub-600 text-xs">
					Must be a verified sending domain for your organization.
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
				<Label.Root htmlFor="send-html">HTML body (optional)</Label.Root>
				<textarea
					id="send-html"
					placeholder="<p>Welcome…</p>"
					value={value.html ?? ""}
					onChange={(e) => update({ html: e.target.value })}
					rows={4}
					className="w-full rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 text-sm outline-none focus:border-stroke-strong-950 dark:border-stroke-soft-100/50"
				/>
			</div>

			<div className="space-y-1.5">
				<Label.Root htmlFor="send-template">Template ID (optional)</Label.Root>
				<Input.Root>
					<Input.Wrapper>
						<Input.Input
							id="send-template"
							placeholder="tmpl_..."
							value={value.templateId ?? ""}
							onChange={(e) => update({ templateId: e.target.value })}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
		</div>
	);
};
