import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import { ACTIVE_WEBHOOK_EVENTS } from "@reloop/webhook-events";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

interface TriggerWebhookModalProps {
	isOpen: boolean;
	onClose: () => void;
	webhookId: string;
}

const defaultEventId = ACTIVE_WEBHOOK_EVENTS[0]?.id ?? "email.sent";

const FORBIDDEN_BROWSER_HEADERS = new Set([
	"user-agent",
	"host",
	"content-length",
	"connection",
	"accept-encoding",
]);

export const TriggerWebhookModal = ({
	isOpen,
	onClose,
	webhookId,
}: TriggerWebhookModalProps) => {
	const [eventId, setEventId] = useState<string>(defaultEventId);
	const [payload, setPayload] = useState(
		JSON.stringify(
			{
				id: "id_123456",
				name: "Example Name",
			},
			null,
			2,
		),
	);
	const [isTriggering, setIsTriggering] = useState(false);

	const handleTrigger = async () => {
		try {
			setIsTriggering(true);
			let parsedPayload = {};
			try {
				parsedPayload = JSON.parse(payload);
			} catch {
				toast.error("Invalid JSON payload");
				setIsTriggering(false);
				return;
			}

			// 1. Sign test payload on backend without storing event actions or DB delivery logs
			const signRes = await axios.post(
				"/api/webhook/v1/sign-test-event",
				{
					webhookId,
					event: eventId,
					payload: parsedPayload,
				},
				{
					withCredentials: true,
				},
			);

			const { url, headers, rawBody } = signRes.data as {
				url: string;
				headers: Record<string, string>;
				rawBody: string;
			};

			const browserHeaders: Record<string, string> = {};
			for (const [k, v] of Object.entries(headers)) {
				if (FORBIDDEN_BROWSER_HEADERS.has(k.toLowerCase())) continue;
				browserHeaders[k] = v;
			}

			// 2. Direct client POST request from browser
			try {
				const response = await fetch(url, {
					method: "POST",
					headers: browserHeaders,
					body: rawBody,
				});

				if (response.ok) {
					toast.success(`Test event sent (HTTP ${response.status})`);
				} else {
					toast.error(`Endpoint returned HTTP ${response.status}`);
				}
			} catch (fetchErr: unknown) {
				const msg =
					fetchErr instanceof Error
						? fetchErr.message
						: "Failed to send request directly from browser";
				toast.error(msg);
			}

			onClose();
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Failed to sign test event";
			toast.error(message);
		} finally {
			setIsTriggering(false);
		}
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={onClose}>
			<Modal.Content>
				<Modal.Title className="sr-only">Trigger Test Event</Modal.Title>
				<div className="space-y-6 pt-4">
					<div className="space-y-1.5">
						<label
							htmlFor="event-select"
							className="font-medium text-paragraph-sm text-text-sub-600"
						>
							Select Event
						</label>
						<Select.Root value={eventId} onValueChange={setEventId}>
							<Select.Trigger id="event-select" className="w-full">
								<Select.Value />
							</Select.Trigger>
							<Select.Content>
								{ACTIVE_WEBHOOK_EVENTS.map((event) => (
									<Select.Item key={event.id} value={event.id}>
										{event.name}
									</Select.Item>
								))}
							</Select.Content>
						</Select.Root>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="payload-editor"
							className="font-medium text-paragraph-sm text-text-sub-600"
						>
							Payload (JSON)
						</label>
						<div className="rounded-lg border border-stroke-soft-200">
							<textarea
								id="payload-editor"
								className="w-full rounded-lg bg-bg-weak-50 p-3 font-mono text-xs focus:outline-none"
								rows={8}
								value={payload}
								onChange={(e) => setPayload(e.target.value)}
							/>
						</div>
					</div>
				</div>

				<Modal.Footer>
					<Button.Root variant="neutral" mode="stroke" onClick={onClose}>
						Cancel
					</Button.Root>
					<Button.Root
						variant="primary"
						onClick={handleTrigger}
						disabled={isTriggering}
					>
						{isTriggering && (
							<Icon name="refresh-cw" className="mr-2 h-4 w-4 animate-spin" />
						)}
						Trigger
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
