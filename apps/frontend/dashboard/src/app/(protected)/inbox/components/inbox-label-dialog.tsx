"use client";

import * as Button from "@reloop/ui/button";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import { useState } from "react";

export const InboxLabelDialog = ({
	open,
	onOpenChange,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (name: string) => void | Promise<void>;
}) => {
	const [name, setName] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) return;
		await onSubmit(trimmed);
		setName("");
		onOpenChange(false);
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-sm border-mail-border bg-panel-light dark:bg-panel-dark sm:rounded-xl">
				<form onSubmit={handleSubmit}>
					<Modal.Header>
						<Modal.Title className="text-mail-foreground">
							Create label
						</Modal.Title>
					</Modal.Header>
					<Modal.Body className="pb-2">
						<Input.Root size="xsmall">
							<Input.Wrapper>
								<Input.Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Label name"
									autoFocus
								/>
							</Input.Wrapper>
						</Input.Root>
					</Modal.Body>
					<Modal.Footer className="gap-2">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button.Root>
						<Button.Root type="submit" variant="primary" mode="filled">
							Create
						</Button.Root>
					</Modal.Footer>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
