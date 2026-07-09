"use client";

import * as Button from "@reloop/ui/button";
import * as Modal from "@reloop/ui/modal";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type SnoozeDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (wakeAt: Date) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

const toDateInput = (d: Date) =>
	`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const SnoozeDialog = ({
	open,
	onOpenChange,
	onConfirm,
}: SnoozeDialogProps) => {
	const [date, setDate] = useState(() => toDateInput(new Date()));
	const [time, setTime] = useState(() => toTimeInput(new Date()));

	useEffect(() => {
		if (!open) return;
		const now = new Date();
		now.setHours(now.getHours() + 1);
		setDate(toDateInput(now));
		setTime(toTimeInput(now));
	}, [open]);

	const timeZoneLabel =
		Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

	const handleSubmit = () => {
		const wakeDate = new Date(`${date}T${time}`);
		if (Number.isNaN(wakeDate.getTime()) || wakeDate.getTime() <= Date.now()) {
			toast.error("Pick a time in the future");
			return;
		}
		onConfirm(wakeDate);
		onOpenChange(false);
	};

	const applyPreset = (ms: number) => {
		const wake = new Date(Date.now() + ms);
		setDate(toDateInput(wake));
		setTime(toTimeInput(wake));
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md border-mail-border bg-panel-light dark:bg-panel-dark sm:rounded-xl">
				<Modal.Header
					title="Snooze until…"
					description="Hide this thread until the wake time you choose."
				/>
				<Modal.Body className="space-y-4">
					<div className="flex flex-wrap gap-2">
						{[
							{ label: "1 hour", ms: 60 * 60 * 1000 },
							{ label: "Tomorrow", ms: 24 * 60 * 60 * 1000 },
							{ label: "Next week", ms: 7 * 24 * 60 * 60 * 1000 },
						].map((p) => (
							<button
								key={p.label}
								type="button"
								onClick={() => applyPreset(p.ms)}
								className="rounded-md bg-[var(--inbox-control)] px-2.5 py-1 text-xs text-mail-muted transition-colors hover:bg-[var(--inbox-control-hover)]"
							>
								{p.label}
							</button>
						))}
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<label className="flex flex-col gap-1.5 text-xs text-mail-muted">
							Date
							<input
								type="date"
								min={toDateInput(new Date())}
								value={date}
								onChange={(e) => setDate(e.target.value)}
								className="rounded-md border border-mail-border bg-[var(--inbox-control)] px-2 py-1.5 text-sm text-mail-foreground outline-none"
							/>
						</label>
						<label className="flex flex-col gap-1.5 text-xs text-mail-muted">
							Time ({timeZoneLabel})
							<input
								type="time"
								value={time}
								onChange={(e) => setTime(e.target.value)}
								className="rounded-md border border-mail-border bg-[var(--inbox-control)] px-2 py-1.5 text-sm text-mail-foreground outline-none"
							/>
						</label>
					</div>
				</Modal.Body>
				<Modal.Footer className="flex justify-end gap-2">
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button.Root>
					<Button.Root size="small" onClick={handleSubmit}>
						Snooze
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
