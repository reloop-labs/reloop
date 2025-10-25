"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const audienceGroupSchema = v.object({
	name: v.pipe(
		v.string("Group name is required"),
		v.minLength(1, "Group name is required"),
		v.maxLength(255, "Group name must be less than 255 characters"),
	),
	description: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(1000, "Description must be less than 1000 characters"),
		),
	),
});

type AudienceGroupFormValues = v.InferInput<typeof audienceGroupSchema>;

export const AddAudienceGroupSidebar = () => {
	const { activeOrganization, push } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const { back } = useRouter();
	const { register, handleSubmit, formState, setError } =
		useForm<AudienceGroupFormValues>({
			resolver: valibotResolver(
				audienceGroupSchema,
			) as Resolver<AudienceGroupFormValues>,
			defaultValues: {
				name: "",
				description: "",
			},
		});

	const onSubmit = async ({ name, description }: AudienceGroupFormValues) => {
		try {
			changeStatus("loading");
			await axios.post(
				"/api/audience/v1/groups/add",
				{
					name,
					description: description || undefined,
				},
				{ headers: { credentials: "include" } },
			);
			await mutate(
				`/api/audience/v1/groups/list?organizationId=${activeOrganization.id}`,
			);
			push("/audience");
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "An unexpected error occurred"
				: "An unexpected error occurred";
			setError("name", {
				type: "manual",
				message: errorMessage,
			});
		}
	};

	return (
		<div className="mx-auto max-w-3xl pt-10 pb-8">
			<Button.Root
				onClick={() => back()}
				variant="neutral"
				mode="stroke"
				size="xxsmall"
			>
				<Button.Icon>
					<Icon name="chevron-left" className="h-4 w-4" />
				</Button.Icon>
				Back
			</Button.Root>
			<div className="flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pt-6 pb-6">
				<div>
					<h1 className="font-medium text-title-h5 leading-8">
						Create Audience Group
					</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						Create a new audience group to organize your contacts
					</p>
				</div>

				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={() =>
						window.open("https://reloop.sh/docs/audience", "_blank")
					}
				>
					<Icon name="file-text" className="h-4 w-4" />
					Go to docs
				</Button.Root>
			</div>

			<div className="my-6 gap-3">
				<h2 className="font-semibold text-gray-900 text-lg">Group Details</h2>
				<p className="text-paragraph-sm text-text-sub-600">
					Give your audience group a name and description
				</p>
			</div>
			<div className="flex gap-6">
				<form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
					<div>
						<Label.Root
							htmlFor="name"
							className="mb-2 block font-medium text-gray-700 text-sm"
						>
							Group Name
							<Label.Asterisk />
						</Label.Root>
						<div className="relative">
							<Input.Root
								hasError={!!formState?.errors?.name?.message}
								className="w-full"
							>
								<Input.Wrapper>
									<Input.Input
										id="name"
										placeholder="e.g., Newsletter Subscribers"
										{...register("name")}
										disabled={status === "loading"}
									/>
								</Input.Wrapper>
							</Input.Root>
							{formState.errors.name && (
								<div className="mt-2 flex items-center gap-2">
									<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
									<p className="text-red-600 text-sm">
										{formState.errors.name.message}
									</p>
								</div>
							)}
						</div>
					</div>
					<div>
						<Label.Root
							htmlFor="description"
							className="mb-2 block font-medium text-gray-700 text-sm"
						>
							Description (Optional)
						</Label.Root>
						<div className="relative">
							<Textarea.Root
								id="description"
								placeholder="Describe this audience group..."
								{...register("description")}
								disabled={status === "loading"}
								rows={3}
								hasError={!!formState?.errors?.description?.message}
							>
								<Textarea.CharCounter current={78} max={200} />
							</Textarea.Root>

							{formState.errors.description && (
								<div className="mt-2 flex items-center gap-2">
									<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
									<p className="text-red-600 text-sm">
										{formState.errors.description.message}
									</p>
								</div>
							)}
						</div>
					</div>
					<div className="flex justify-end">
						<Button.Root
							type="submit"
							variant="neutral"
							size="small"
							disabled={status === "loading" || !formState.isValid}
							className="min-w-[140px]"
						>
							{status === "loading" ? (
								<>
									<Spinner color="white" />
									Creating Group...
								</>
							) : (
								<>
									Create Group
									<Icon
										name="users"
										className="h-5 w-5 rounded-md bg-bg-white-0/10 p-1"
									/>
								</>
							)}
						</Button.Root>
					</div>
				</form>
				<div className="mt-[29px] mb-10 w-96 rounded-2xl border border-stroke-soft-200 p-4">
					<div className="flex items-center gap-2 text-xs uppercase">
						<Icon name="bulb" className="h-3 w-3" />
						<p>Pro Tip</p>
					</div>
					<p className="pt-2 text-sm text-text-sub-600">
						Use descriptive names for your audience groups
					</p>
					<div className="pt-3 text-sm text-text-sub-600">
						<p>Good examples:</p>
						<ul className="list-disc pl-5">
							<li>Newsletter Subscribers</li>
							<li>Premium Customers</li>
							<li>Beta Testers</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};
