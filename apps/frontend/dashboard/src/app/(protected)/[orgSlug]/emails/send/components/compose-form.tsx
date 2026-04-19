"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";

interface ComposeFormProps {
	onSend?: () => void;
	isLoading?: boolean;
}

export function ComposeForm({ onSend, isLoading }: ComposeFormProps) {
	return (
		<div className="mt-6 flex min-h-[600px] flex-col border-stroke-soft-100 border-t">
			{/* From Row */}
			<div className="group flex min-h-[48px] items-center border-stroke-soft-100 border-b py-3">
				<span className="w-24 shrink-0 text-sm text-text-soft-400">From</span>
				<div className="flex flex-1 items-center justify-between gap-4">
					<Select.Root size="small" variant="inline" defaultValue="reloop.sh">
						<Select.Trigger className="h-auto border-none p-0 font-medium text-text-sub-600 shadow-none ring-0 transition-colors hover:text-text-strong-950">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="reloop.sh">
								Acme &lt;acme@example.com&gt;
							</Select.Item>
							<Select.Item value="mail.reloop.sh">
								Acme Support &lt;support@acme.com&gt;
							</Select.Item>
						</Select.Content>
					</Select.Root>
					<button
						type="button"
						className="font-medium text-[13px] text-text-soft-400 transition-colors hover:text-text-strong-950"
					>
						Reply-To
					</button>
				</div>
			</div>

			{/* Preview Row */}
			<div className="flex min-h-[48px] items-center border-stroke-soft-100 border-b py-3">
				<span className="w-24 shrink-0 text-sm text-text-soft-400">
					Preview
				</span>
				<input
					className="flex-1 border-none bg-transparent text-[13px] text-text-strong-950 outline-none placeholder:text-text-soft-400"
					placeholder=""
				/>
			</div>

			{/* Subject Row */}
			<div className="flex min-h-[48px] items-center border-stroke-soft-100 border-b py-3">
				<span className="w-24 shrink-0 text-sm text-text-soft-400">
					Subject
				</span>
				<input
					className="flex-1 border-none bg-transparent font-medium text-[13px] text-text-strong-950 outline-none placeholder:text-text-soft-400"
					placeholder=""
				/>
			</div>

			{/* Body Area */}
			<div className="relative flex flex-1 flex-col pt-4">
				<textarea
					className="min-h-[400px] w-full flex-1 resize-none border-none bg-transparent py-2 text-paragraph-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
					placeholder="Press '/' for commands, or use AI to write a pr..."
				/>
			</div>

			{/* Footer Action Bar */}
			<div className="mt-auto flex items-center justify-between pt-8 pb-12">
				<div className="flex items-center gap-6">
					<div className="group flex cursor-pointer items-center gap-2">
						<Icon
							name="tag"
							className="size-4 text-text-soft-400 transition-colors group-hover:text-text-strong-950"
						/>
						<span className="font-medium text-text-soft-400 text-xs transition-colors group-hover:text-text-strong-950">
							Tags
						</span>
					</div>
					<div className="group flex cursor-pointer items-center gap-2">
						<Icon
							name="attachment"
							className="size-4 text-text-soft-400 transition-colors group-hover:text-text-strong-950"
						/>
						<span className="font-medium text-text-soft-400 text-xs transition-colors group-hover:text-text-strong-950">
							Attach
						</span>
					</div>
				</div>

				<Button.Root
					variant="primary"
					mode="filled"
					size="medium"
					onClick={onSend}
					disabled={isLoading}
					className="rounded-xl bg-text-strong-950 px-8 text-static-white shadow-button-primary-focus transition-all hover:bg-black"
				>
					<span className="flex items-center gap-2">
						{isLoading && <Spinner size={14} color="#fff" />}
						Send message
					</span>
				</Button.Root>
			</div>
		</div>
	);
}
