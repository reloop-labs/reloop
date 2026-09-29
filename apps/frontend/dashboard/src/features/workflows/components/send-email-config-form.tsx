"use client";

import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Textarea from "@reloop/ui/textarea";
import type { SendEmailNodeData } from "../workflow-types";

interface SendEmailConfigFormProps {
	value: SendEmailNodeData;
	onChange: (data: SendEmailNodeData) => void;
	/** Prefix for label/input ids so multiple nodes can share the canvas. */
	idPrefix?: string;
}

export const SendEmailConfigForm = ({
	value,
	onChange,
	idPrefix = "",
}: SendEmailConfigFormProps) => {
	const update = (patch: Partial<SendEmailNodeData>) =>
		onChange({ ...value, ...patch });
	const toId = `${idPrefix}send-to`;
	const fromId = `${idPrefix}send-from`;
	const subjectId = `${idPrefix}send-subject`;
	const htmlId = `${idPrefix}send-html`;
	const templateId = `${idPrefix}send-template`;

	return (
		<div className="flex flex-col gap-4">
			<div className="space-y-1.5">
				<Label.Root htmlFor={toId}>To</Label.Root>
				<Input.Root>
					<Input.Wrapper>
						<Input.Input
							id={toId}
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
				<Label.Root htmlFor={fromId}>From</Label.Root>
				<Input.Root>
					<Input.Wrapper>
						<Input.Input
							id={fromId}
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
				<Label.Root htmlFor={subjectId}>Subject</Label.Root>
				<Input.Root>
					<Input.Wrapper>
						<Input.Input
							id={subjectId}
							placeholder="Your email subject"
							value={value.subject}
							onChange={(e) => update({ subject: e.target.value })}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			<div className="space-y-1.5">
				<Label.Root htmlFor={htmlId}>HTML body (optional)</Label.Root>
				<Textarea.Root
					id={htmlId}
					placeholder="<p>Welcome…</p>"
					value={value.html ?? ""}
					onChange={(e) => update({ html: e.target.value })}
					rows={4}
				/>
			</div>

			<div className="space-y-1.5">
				<Label.Root htmlFor={templateId}>Template ID (optional)</Label.Root>
				<Input.Root>
					<Input.Wrapper>
						<Input.Input
							id={templateId}
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
