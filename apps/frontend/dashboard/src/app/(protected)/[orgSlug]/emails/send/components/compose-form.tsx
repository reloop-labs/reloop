"use client";

import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Textarea from "@reloop/ui/textarea";

export function ComposeForm() {
	return (
		<div className="space-y-6 lg:col-span-8">
			<div>
				<Label.Root
					htmlFor="to"
					className="mb-2 block font-medium text-label-sm text-text-strong-950 text-xs uppercase"
				>
					To
					<Label.Asterisk />
				</Label.Root>
				<Input.Root size="small" className="w-full">
					<Input.Wrapper>
						<Input.Input
							id="to"
							placeholder="recipient@example.com"
							type="email"
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			<div>
				<Label.Root
					htmlFor="subject"
					className="mb-2 block font-medium text-label-sm text-text-strong-950 text-xs uppercase"
				>
					Subject
					<Label.Asterisk />
				</Label.Root>
				<Input.Root size="small" className="w-full">
					<Input.Wrapper>
						<Input.Input id="subject" placeholder="What is this email about?" />
					</Input.Wrapper>
				</Input.Root>
			</div>

			<div>
				<Label.Root
					htmlFor="body"
					className="mb-2 block font-medium text-label-sm text-text-strong-950 text-xs uppercase"
				>
					Body (HTML supported)
					<Label.Asterisk />
				</Label.Root>
				<Textarea.Root
					id="body"
					placeholder="Hello, ...
Write your email here."
					containerClassName="min-h-[400px]"
				>
					<Textarea.CharCounter current={0} max={10000} />
				</Textarea.Root>
			</div>
		</div>
	);
}
