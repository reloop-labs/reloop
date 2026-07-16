import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useNavigate } from "@tanstack/react-router";
import type * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const EmailNotFound: React.FC = () => {
	const navigate = useNavigate();

	useHotkeys("mod+e", () => {
		void navigate({ to: "/emails/sent" });
	});

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon name="mail-single" className="h-8 w-8 text-text-sub-600" />
			</div>
			<div className="text-center">
				<h3 className="mb-2 font-semibold text-2xl text-text-strong-950">
					Email log not found
				</h3>
				<p className="mx-auto mb-8 max-w-[440px] text-balance font-medium text-paragraph-md text-text-sub-600">
					We couldn&apos;t find the email log you&apos;re looking for. It might
					have been deleted, or there was a typo in the email ID.
				</p>
			</div>
			<div className="flex items-center justify-center">
				<Button.Root
					onClick={() => void navigate({ to: "/emails/sent" })}
					variant="neutral"
					size="xsmall"
					className="gap-2 rounded-lg"
				>
					<Icon name="arrow-left" className="h-4 w-4" />
					Back to emails
					<span className="inline-flex items-center gap-0.5 opacity-60">
						<Icon
							name="command"
							className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
						/>
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
							e
						</span>
					</span>
				</Button.Root>
			</div>
		</div>
	);
};
