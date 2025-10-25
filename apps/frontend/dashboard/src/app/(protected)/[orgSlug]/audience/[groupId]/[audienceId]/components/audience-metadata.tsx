"use client";
import { formatMetadata, parseMetadata } from "@fe/dashboard/utils/audience";
import { valibotResolver } from "@hookform/resolvers/valibot";
import type { Audience } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const metadataSchema = v.object({
	metadata: v.optional(v.string()),
});

type MetadataFormValues = v.InferInput<typeof metadataSchema>;

interface AudienceMetadataProps {
	audience: Audience | null;
	onUpdate: (updatedAudience: Audience) => void;
}

export const AudienceMetadata = ({
	audience,
	onUpdate,
}: AudienceMetadataProps) => {
	if (!audience) {
		return null;
	}

	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const [isEditing, setIsEditing] = useState(false);

	const { register, handleSubmit, formState, setError, reset, watch } =
		useForm<MetadataFormValues>({
			resolver: valibotResolver(metadataSchema) as Resolver<MetadataFormValues>,
			defaultValues: {
				metadata: formatMetadata(audience.metadata),
			},
		});

	const metadataString = watch("metadata");

	const onSubmit = async (data: MetadataFormValues) => {
		try {
			changeStatus("loading");

			// Parse the JSON string to validate it
			const parsedMetadata = parseMetadata(data.metadata || "");
			if (data.metadata && !parsedMetadata) {
				setError("metadata", {
					type: "manual",
					message: "Invalid JSON format",
				});
				changeStatus("idle");
				return;
			}

			const response = await axios.put(
				`/api/audience/v1/update/${audience.id}`,
				{ metadata: parsedMetadata },
				{ headers: { credentials: "include" } },
			);

			await mutate(`/api/audience/v1/get/${audience.id}`);
			onUpdate(response.data);
			toast.success("Metadata updated successfully");
			setIsEditing(false);
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "An unexpected error occurred"
				: "An unexpected error occurred";
			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		reset();
		setIsEditing(false);
	};

	const validateJSON = (value: string) => {
		if (!value.trim()) return true; // Empty is valid
		try {
			JSON.parse(value);
			return true;
		} catch {
			return false;
		}
	};

	return (
		<div className="rounded-lg border border-stroke-soft-200 p-6">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="font-medium text-lg">Custom Metadata</h2>
				{!isEditing ? (
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => setIsEditing(true)}
					>
						<Icon name="edit" className="h-4 w-4" />
						Edit
					</Button.Root>
				) : (
					<div className="flex gap-2">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleCancel}
							disabled={status === "loading"}
						>
							Cancel
						</Button.Root>
						<Button.Root
							variant="neutral"
							size="small"
							onClick={handleSubmit(onSubmit)}
							disabled={
								status === "loading" || !validateJSON(metadataString || "")
							}
						>
							{status === "loading" ? (
								<>
									<Spinner color="white" />
									Saving...
								</>
							) : (
								<>
									<Icon name="check" className="h-4 w-4" />
									Save
								</>
							)}
						</Button.Root>
					</div>
				)}
			</div>

			<div>
				<Label.Root
					htmlFor="metadata"
					className="mb-2 block font-medium text-gray-700 text-sm"
				>
					JSON Metadata
				</Label.Root>
				{isEditing ? (
					<Textarea.Root
						hasError={
							!!formState?.errors?.metadata?.message ||
							!validateJSON(metadataString || "")
						}
						className="w-full"
					>
						<textarea
							id="metadata"
							placeholder='{"key": "value", "source": "website"}'
							{...register("metadata")}
							disabled={status === "loading"}
							rows={8}
							className="font-mono text-sm"
						/>
					</Textarea.Root>
				) : (
					<div className="rounded-lg border border-stroke-soft-200 bg-gray-50 p-4">
						<pre className="whitespace-pre-wrap font-mono text-sm text-text-strong-950">
							{formatMetadata(audience.metadata)}
						</pre>
					</div>
				)}

				{formState.errors.metadata && (
					<div className="mt-2 flex items-center gap-2">
						<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
						<p className="text-red-600 text-sm">
							{formState.errors.metadata.message}
						</p>
					</div>
				)}

				{!validateJSON(metadataString || "") && metadataString && (
					<div className="mt-2 flex items-center gap-2">
						<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
						<p className="text-red-600 text-sm">Invalid JSON format</p>
					</div>
				)}

				<p className="mt-2 text-text-sub-600 text-xs">
					Enter custom metadata as JSON. This data will be stored with the
					audience and can be used for personalization.
				</p>
			</div>
		</div>
	);
};
