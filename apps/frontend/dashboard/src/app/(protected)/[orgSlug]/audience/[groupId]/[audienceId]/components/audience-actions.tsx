"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import type { Audience, AudienceGroup } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const subscribeSchema = v.object({
	reason: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(500, "Reason must be less than 500 characters"),
		),
	),
});

const unsubscribeSchema = v.object({
	reason: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(500, "Reason must be less than 500 characters"),
		),
	),
});

const moveSchema = v.object({
	audienceGroupId: v.string("Please select a group"),
});

type SubscribeFormValues = v.InferInput<typeof subscribeSchema>;
type UnsubscribeFormValues = v.InferInput<typeof unsubscribeSchema>;
type MoveFormValues = v.InferInput<typeof moveSchema>;

interface AudienceActionsProps {
	audience: Audience | null;
	audienceGroups: AudienceGroup[];
	onUpdate: (updatedAudience: Audience) => void;
	onDelete: () => void;
}

export const AudienceActions = ({
	audience,
	audienceGroups,
	onUpdate,
	onDelete,
}: AudienceActionsProps) => {
	if (!audience) {
		return null;
	}

	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
	const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false);
	const [showMoveDialog, setShowMoveDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const subscribeForm = useForm<SubscribeFormValues>({
		resolver: valibotResolver(subscribeSchema) as Resolver<SubscribeFormValues>,
		defaultValues: { reason: "" },
	});

	const unsubscribeForm = useForm<UnsubscribeFormValues>({
		resolver: valibotResolver(
			unsubscribeSchema,
		) as Resolver<UnsubscribeFormValues>,
		defaultValues: { reason: "" },
	});

	const moveForm = useForm<MoveFormValues>({
		resolver: valibotResolver(moveSchema) as Resolver<MoveFormValues>,
		defaultValues: { audienceGroupId: audience.audienceGroupId },
	});

	const handleSubscribe = async (data: SubscribeFormValues) => {
		try {
			changeStatus("loading");
			const response = await axios.post(
				`/api/audience/v1/audiences/${audience.id}/subscribe`,
				data,
				{ headers: { credentials: "include" } },
			);

			await mutate(`/api/audience/v1/audiences/${audience.id}`);
			onUpdate(response.data);
			toast.success("Audience subscribed successfully");
			setShowSubscribeDialog(false);
			subscribeForm.reset();
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to subscribe audience"
				: "Failed to subscribe audience";
			toast.error(errorMessage);
		}
	};

	const handleUnsubscribe = async (data: UnsubscribeFormValues) => {
		try {
			changeStatus("loading");
			const response = await axios.post(
				`/api/audience/v1/audiences/${audience.id}/unsubscribe`,
				data,
				{ headers: { credentials: "include" } },
			);

			await mutate(`/api/audience/v1/audiences/${audience.id}`);
			onUpdate(response.data);
			toast.success("Audience unsubscribed successfully");
			setShowUnsubscribeDialog(false);
			unsubscribeForm.reset();
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to unsubscribe audience"
				: "Failed to unsubscribe audience";
			toast.error(errorMessage);
		}
	};

	const handleMove = async (data: MoveFormValues) => {
		try {
			changeStatus("loading");
			const response = await axios.put(
				`/api/audience/v1/audiences/${audience.id}`,
				{ audienceGroupId: data.audienceGroupId },
				{ headers: { credentials: "include" } },
			);

			await mutate(`/api/audience/v1/audiences/${audience.id}`);
			onUpdate(response.data);
			toast.success("Audience moved successfully");
			setShowMoveDialog(false);
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to move audience"
				: "Failed to move audience";
			toast.error(errorMessage);
		}
	};

	const handleDelete = async () => {
		try {
			changeStatus("loading");
			await axios.delete(`/api/audience/v1/audiences/${audience.id}`, {
				headers: { credentials: "include" },
			});

			toast.success("Audience deleted successfully");
			setShowDeleteDialog(false);
			onDelete();
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete audience"
				: "Failed to delete audience";
			toast.error(errorMessage);
		}
	};

	return (
		<div className="space-y-4">
			{/* Subscription Actions */}
			<div className="rounded-lg border border-stroke-soft-200 p-6">
				<h3 className="mb-4 font-medium text-lg">Subscription Status</h3>
				<div className="flex gap-3">
					{audience.status === "subscribed" ? (
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => setShowUnsubscribeDialog(true)}
						>
							<Icon name="minus-circle" className="h-4 w-4" />
							Unsubscribe
						</Button.Root>
					) : (
						<Button.Root
							variant="neutral"
							size="small"
							onClick={() => setShowSubscribeDialog(true)}
						>
							<Icon name="check-circle" className="h-4 w-4" />
							Subscribe
						</Button.Root>
					)}
				</div>
			</div>

			{/* Move to Different Group */}
			<div className="rounded-lg border border-stroke-soft-200 p-6">
				<h3 className="mb-4 font-medium text-lg">Move to Different Group</h3>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => setShowMoveDialog(true)}
				>
					<Icon name="arrow-right" className="h-4 w-4" />
					Move Audience
				</Button.Root>
			</div>

			{/* Delete Action */}
			<div className="rounded-lg border border-red-200 bg-red-50 p-6">
				<h3 className="mb-2 font-medium text-lg text-red-800">Danger Zone</h3>
				<p className="mb-4 text-red-700 text-sm">
					Permanently delete this audience. This action cannot be undone.
				</p>
				<Button.Root
					variant="error"
					size="small"
					onClick={() => setShowDeleteDialog(true)}
				>
					<Icon name="trash" className="h-4 w-4" />
					Delete Audience
				</Button.Root>
			</div>

			{/* Subscribe Dialog */}
			<Modal.Root
				open={showSubscribeDialog}
				onOpenChange={setShowSubscribeDialog}
			>
				<Modal.Content className="max-w-md">
					<Modal.Header>
						<Modal.Title>Subscribe Audience</Modal.Title>
						<Modal.Description>
							Subscribe {audience.email} to receive communications.
						</Modal.Description>
					</Modal.Header>

					<form
						onSubmit={subscribeForm.handleSubmit(handleSubscribe)}
						className="space-y-4"
					>
						<div>
							<Label.Root
								htmlFor="subscribe-reason"
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								Reason (Optional)
							</Label.Root>
							<Input.Root className="w-full">
								<Input.Wrapper>
									<Input.Input
										id="subscribe-reason"
										placeholder="e.g., User requested subscription"
										{...subscribeForm.register("reason")}
										disabled={status === "loading"}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<Modal.Footer className="flex gap-2">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								onClick={() => setShowSubscribeDialog(false)}
								disabled={status === "loading"}
							>
								Cancel
							</Button.Root>
							<Button.Root
								type="submit"
								variant="neutral"
								disabled={status === "loading"}
							>
								{status === "loading" ? (
									<>
										<Spinner color="white" />
										Subscribing...
									</>
								) : (
									<>
										<Icon name="check-circle" className="h-4 w-4" />
										Subscribe
									</>
								)}
							</Button.Root>
						</Modal.Footer>
					</form>
				</Modal.Content>
			</Modal.Root>

			{/* Unsubscribe Dialog */}
			<Modal.Root
				open={showUnsubscribeDialog}
				onOpenChange={setShowUnsubscribeDialog}
			>
				<Modal.Content className="max-w-md">
					<Modal.Header>
						<Modal.Title>Unsubscribe Audience</Modal.Title>
						<Modal.Description>
							Unsubscribe {audience.email} from communications.
						</Modal.Description>
					</Modal.Header>

					<form
						onSubmit={unsubscribeForm.handleSubmit(handleUnsubscribe)}
						className="space-y-4"
					>
						<div>
							<Label.Root
								htmlFor="unsubscribe-reason"
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								Reason (Optional)
							</Label.Root>
							<Input.Root className="w-full">
								<Input.Wrapper>
									<Input.Input
										id="unsubscribe-reason"
										placeholder="e.g., User requested to unsubscribe"
										{...unsubscribeForm.register("reason")}
										disabled={status === "loading"}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<Modal.Footer className="flex gap-2">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								onClick={() => setShowUnsubscribeDialog(false)}
								disabled={status === "loading"}
							>
								Cancel
							</Button.Root>
							<Button.Root
								type="submit"
								variant="neutral"
								disabled={status === "loading"}
							>
								{status === "loading" ? (
									<>
										<Spinner color="white" />
										Unsubscribing...
									</>
								) : (
									<>
										<Icon name="minus-circle" className="h-4 w-4" />
										Unsubscribe
									</>
								)}
							</Button.Root>
						</Modal.Footer>
					</form>
				</Modal.Content>
			</Modal.Root>

			{/* Move Dialog */}
			<Modal.Root open={showMoveDialog} onOpenChange={setShowMoveDialog}>
				<Modal.Content className="max-w-md">
					<Modal.Header>
						<Modal.Title>Move Audience</Modal.Title>
						<Modal.Description>
							Move {audience.email} to a different audience group.
						</Modal.Description>
					</Modal.Header>

					<form
						onSubmit={moveForm.handleSubmit(handleMove)}
						className="space-y-4"
					>
						<div>
							<Label.Root
								htmlFor="audienceGroupId"
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								Target Group
							</Label.Root>
							<Select.Root
								value={moveForm.watch("audienceGroupId")}
								onValueChange={(value) =>
									moveForm.setValue("audienceGroupId", value)
								}
							>
								<Select.Trigger className="w-full">
									<Select.Value placeholder="Select a group" />
								</Select.Trigger>
								<Select.Content>
									{audienceGroups
										.filter((group) => group.id !== audience.audienceGroupId)
										.map((group) => (
											<Select.Item key={group.id} value={group.id}>
												<div className="flex items-center gap-2">
													<Icon name="users" className="h-4 w-4" />
													{group.name}
												</div>
											</Select.Item>
										))}
								</Select.Content>
							</Select.Root>
						</div>

						<Modal.Footer className="flex gap-2">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								onClick={() => setShowMoveDialog(false)}
								disabled={status === "loading"}
							>
								Cancel
							</Button.Root>
							<Button.Root
								type="submit"
								variant="neutral"
								disabled={
									status === "loading" || !moveForm.watch("audienceGroupId")
								}
							>
								{status === "loading" ? (
									<>
										<Spinner color="white" />
										Moving...
									</>
								) : (
									<>
										<Icon name="arrow-right" className="h-4 w-4" />
										Move
									</>
								)}
							</Button.Root>
						</Modal.Footer>
					</form>
				</Modal.Content>
			</Modal.Root>

			{/* Delete Dialog */}
			<Modal.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<Modal.Content className="max-w-md">
					<Modal.Header>
						<Modal.Title className="flex items-center gap-2">
							<Icon name="alert-triangle" className="h-5 w-5 text-red-500" />
							Delete Audience
						</Modal.Title>
						<Modal.Description>
							Are you sure you want to delete {audience.email}? This action
							cannot be undone.
						</Modal.Description>
					</Modal.Header>

					<div className="my-4 rounded-lg bg-red-50 p-3">
						<div className="flex items-start gap-2">
							<Icon name="info" className="mt-0.5 h-4 w-4 text-red-600" />
							<div className="text-red-800 text-sm">
								<p className="font-medium">This will permanently delete:</p>
								<ul className="mt-1 list-disc pl-4">
									<li>The audience record</li>
									<li>All associated metadata</li>
									<li>Subscription history</li>
								</ul>
							</div>
						</div>
					</div>

					<Modal.Footer className="flex gap-2">
						<Button.Root
							variant="neutral"
							mode="stroke"
							onClick={() => setShowDeleteDialog(false)}
							disabled={status === "loading"}
						>
							Cancel
						</Button.Root>
						<Button.Root
							variant="error"
							onClick={handleDelete}
							disabled={status === "loading"}
						>
							{status === "loading" ? (
								<>
									<Spinner color="white" />
									Deleting...
								</>
							) : (
								<>
									<Icon name="trash" className="h-4 w-4" />
									Delete Audience
								</>
							)}
						</Button.Root>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	);
};
