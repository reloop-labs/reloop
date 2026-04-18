"use client";

import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Select from "@reloop/ui/select";

export function ComposeSidebar() {
	return (
		<div className="space-y-6 lg:col-span-4">
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
				<h2 className="mb-4 font-medium text-sm text-text-strong-950 uppercase tracking-wider">
					Sender Configuration
				</h2>

				<div className="space-y-4">
					<div>
						<Label.Root
							htmlFor="from-name"
							className="mb-1.5 block font-medium text-text-strong-950 text-xs uppercase"
						>
							From Name
						</Label.Root>
						<Input.Root size="small" className="w-full">
							<Input.Wrapper>
								<Input.Input id="from-name" placeholder="e.g. Reloop Team" />
							</Input.Wrapper>
						</Input.Root>
					</div>

					<div>
						<Label.Root
							htmlFor="domain"
							className="mb-1.5 block font-medium text-text-strong-950 text-xs uppercase"
						>
							Domain
							<Label.Asterisk />
						</Label.Root>
						<Select.Root size="small" defaultValue="reloop.sh">
							<Select.Trigger className="w-full">
								<Select.Value placeholder="Select a domain" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="reloop.sh">reloop.sh</Select.Item>
								<Select.Item value="mail.reloop.sh">mail.reloop.sh</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<div>
						<Label.Root
							htmlFor="api-key"
							className="mb-1.5 block font-medium text-text-strong-950 text-xs uppercase"
						>
							API Key
							<Label.Asterisk />
						</Label.Root>
						<Select.Root size="small" defaultValue="default">
							<Select.Trigger className="w-full">
								<Select.Value placeholder="Select API Key" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="default">Default Production</Select.Item>
								<Select.Item value="staging">Staging Key</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs">
				<h2 className="mb-4 font-medium text-sm text-text-strong-950 uppercase tracking-wider">
					Metadata
				</h2>
				<div className="space-y-4">
					<div>
						<Label.Root
							htmlFor="tags"
							className="mb-1.5 block font-medium text-text-strong-950 text-xs uppercase"
						>
							Tags
						</Label.Root>
						<Input.Root size="small" className="w-full">
							<Input.Wrapper>
								<Input.Input
									id="tags"
									placeholder="e.g. newsletter, user-invitation"
								/>
							</Input.Wrapper>
						</Input.Root>
						<p className="mt-1.5 text-[10px] text-text-sub-600">
							Comma separated list of tags for analytics.
						</p>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 rounded-xl bg-bg-weak-50 p-4">
				<Icon name="info" className="size-4 shrink-0 text-text-sub-600" />
				<p className="text-text-sub-600 text-xs leading-relaxed">
					Sending from this UI will use your active billing quota and follow
					global rate limits.
				</p>
			</div>
		</div>
	);
}
