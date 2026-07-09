"use client";

import * as Button from "@reloop/ui/button";
import * as Modal from "@reloop/ui/modal";
import { useState } from "react";

export function ConfirmActionDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Confirm",
	destructive = false,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel?: string;
	destructive?: boolean;
	onConfirm: () => Promise<void> | void;
}) {
	const [loading, setLoading] = useState(false);

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<div className="space-y-1">
						<Modal.Title>{title}</Modal.Title>
						<Modal.Description>{description}</Modal.Description>
					</div>
				</Modal.Header>
				<Modal.Footer className="justify-end gap-2">
					<Button.Root
						variant="neutral"
						mode="stroke"
						onClick={() => onOpenChange(false)}
						disabled={loading}
					>
						Cancel
					</Button.Root>
					<Button.Root
						variant={destructive ? "error" : "primary"}
						disabled={loading}
						onClick={async () => {
							try {
								setLoading(true);
								await onConfirm();
								onOpenChange(false);
							} finally {
								setLoading(false);
							}
						}}
					>
						{loading ? "Working..." : confirmLabel}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
}
