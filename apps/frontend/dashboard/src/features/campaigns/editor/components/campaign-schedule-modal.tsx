"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { scheduleCampaignRequest } from "../../campaigns-api";

interface CampaignScheduleModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaignId: string;
	onScheduled?: () => void;
}

export function CampaignScheduleModal({
	open,
	onOpenChange,
	campaignId,
	onScheduled,
}: CampaignScheduleModalProps) {
	const router = useRouter();
	// Default to tomorrow at 9:00 AM local time
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(9, 0, 0, 0);

	const initialDate = tomorrow.toISOString().slice(0, 16);
	const [scheduleDateTime, setScheduleDateTime] = useState(initialDate);
	const [isScheduling, setIsScheduling] = useState(false);

	const handleSchedule = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!scheduleDateTime) return;

		const date = new Date(scheduleDateTime);
		if (date.getTime() <= Date.now() + 60000) {
			toast.error("Scheduled time must be at least 1 minute in the future.");
			return;
		}

		setIsScheduling(true);
		try {
			await scheduleCampaignRequest(campaignId, date.toISOString());
			toast.success(
				`Campaign scheduled for ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
			);
			onOpenChange(false);
			onScheduled?.();
			router.push("/campaigns");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to schedule campaign";
			toast.error(message);
		} finally {
			setIsScheduling(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Portal>
				<Modal.Overlay />
				<Modal.Content className="max-w-md">
					<form onSubmit={handleSchedule}>
						<Modal.Header>
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-stroke-soft-100/40">
									<Icon name="clock" className="h-4 w-4 text-warning-base" />
								</div>
								<div>
									<Modal.Title>Schedule Campaign</Modal.Title>
									<Modal.Description className="text-text-sub-600 text-xs">
										Choose date and time to automatically broadcast this campaign.
									</Modal.Description>
								</div>
							</div>
						</Modal.Header>

						<Modal.Body className="space-y-3 py-4">
							<div className="space-y-1.5">
								<Label.Root htmlFor="schedule-time" className="text-xs">
									Send Date & Time
								</Label.Root>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											id="schedule-time"
											type="datetime-local"
											value={scheduleDateTime}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setScheduleDateTime(e.target.value)
											}
											min={new Date().toISOString().slice(0, 16)}
											required
										/>
									</Input.Wrapper>
								</Input.Root>
								<p className="text-[11px] text-text-sub-600">
									Your campaign will be queued and sent automatically at the
									specified time.
								</p>
							</div>
						</Modal.Body>

						<Modal.Footer className="flex items-center justify-end gap-2 border-stroke-soft-200 border-t pt-3">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={() => onOpenChange(false)}
								disabled={isScheduling}
							>
								Cancel
							</Button.Root>
							<Button.Root
								type="submit"
								variant="neutral"
								size="small"
								disabled={isScheduling || !scheduleDateTime}
								className="gap-1.5"
							>
								{isScheduling ? (
									<Spinner className="h-3.5 w-3.5" />
								) : (
									<Icon name="calendar" className="h-3.5 w-3.5" />
								)}
								Schedule Campaign
							</Button.Root>
						</Modal.Footer>
					</form>
				</Modal.Content>
			</Modal.Portal>
		</Modal.Root>
	);
}
