import { CreateWebhookActions } from "./components/create-webhook-actions";
import { CreateWebhookFormFields } from "./components/create-webhook-form-fields";
import { CreateWebhookHeader } from "./components/create-webhook-header";
import { CreateWebhookInfo } from "./components/create-webhook-info";
import { useCreateWebhookForm } from "./components/use-create-webhook-form";

export function CreateWebhookPage() {
	const { form, isLoading, onSubmit } = useCreateWebhookForm();

	return (
		<div className="mx-auto mb-10 w-full max-w-4xl space-y-6 px-6 lg:px-8">
			<CreateWebhookHeader />
			<form
				onSubmit={onSubmit}
				className="grid grid-cols-1 gap-8 lg:grid-cols-12"
			>
				<CreateWebhookFormFields form={form} />
				<CreateWebhookInfo />
				<CreateWebhookActions isLoading={isLoading} />
			</form>
		</div>
	);
}
