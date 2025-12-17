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

const topicSchema = v.object({
  name: v.pipe(
    v.string("Topic name is required"),
    v.minLength(1, "Topic name is required"),
    v.maxLength(255, "Topic name must be less than 255 characters"),
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(1000, "Description must be less than 1000 characters"),
    ),
  ),
});

type TopicFormValues = v.InferInput<typeof topicSchema>;

const AddTopicPage = () => {
  const { activeOrganization, push } = useUserOrganization();
  const { changeStatus, status } = useLoading();
  const { mutate } = useSWRConfig();
  const { back } = useRouter();
  const { register, handleSubmit, formState, setError, watch } =
    useForm<TopicFormValues>({
      resolver: valibotResolver(
        topicSchema,
      ) as Resolver<TopicFormValues>,
      defaultValues: {
        name: "",
        description: "",
      },
    });

  const descriptionValue = watch("description");

  const onSubmit = async ({ name, description }: TopicFormValues) => {
    try {
      changeStatus("loading");
      const response = await axios.post(
        "/api/contacts/v1/topics/add",
        {
          name,
          description: description || undefined,
        },
        { headers: { credentials: "include" } },
      );
      await mutate(
        `/api/contacts/v1/topics/list?organizationId=${activeOrganization.id}&limit=100`,
      );
      push(`/topics/${response.data.id}`);
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
    <div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
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
            Create Topic
          </h1>
          <p className="text-paragraph-sm text-text-sub-600">
            Create a new topic to organize your contacts
          </p>
        </div>
      </div>

      <div className="my-6 gap-3">
        <h2 className="font-semibold text-lg">Topic Details</h2>
        <p className="text-paragraph-sm text-text-sub-600">
          Give your topic a name and description
        </p>
      </div>
      <div className="flex gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
          <div>
            <Label.Root
              htmlFor="name"
              className="mb-2 block font-medium text-sm"
            >
              Topic Name
              <Label.Asterisk />
            </Label.Root>
            <div className="relative">
              <Input.Root
                hasError={!!formState?.errors?.name?.message}
                className="w-full"
                size="small"
              >
                <Input.Wrapper>
                  <Input.Input
                    id="name"
                    placeholder="e.g., Product Updates"
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
                className="text-sm"
                placeholder="Describe this topic..."
                {...register("description")}
                disabled={status === "loading"}
                rows={3}
                hasError={!!formState?.errors?.description?.message}
              >
                <Textarea.CharCounter
                  className="text-xs"
                  current={descriptionValue?.length || 0}
                  max={500}
                />
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
                  <Spinner color="currentColor" />
                  Creating Topic...
                </>
              ) : (
                <>
                  Create Topic
                  <Icon
                    name="undo"
                    className="h-5 w-5 scale-y-[-1] rounded-md bg-bg-white-0/10 p-1"
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
            Use descriptive names for your topics
          </p>
          <div className="pt-3 text-sm text-text-sub-600">
            <p>Good examples:</p>
            <ul className="list-disc pl-5">
              <li>Product Updates</li>
              <li>Newsletter</li>
              <li>Marketing Promotions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTopicPage;
