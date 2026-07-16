import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import type { UseFormReturn } from "react-hook-form";
import { ModalHeader } from "./header";

export type ApiKeyFormValues = {
	name: string;
};

export function FormStep({
	form,
	onSubmit,
	onClose,
	isLoading,
}: {
	form: UseFormReturn<ApiKeyFormValues>;
	onSubmit: (data: ApiKeyFormValues) => void;
	onClose: () => void;
	isLoading: boolean;
}) {
	const {
		register,
		formState: { errors },
		handleSubmit,
	} = form;

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<ModalHeader title="Create API Key" icon="key-new" onClose={onClose} />

			<Modal.Body className="space-y-4 px-5 py-4 pb-5">
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="name"
						className="font-medium text-label-sm text-text-strong-950"
					>
						Name
						<span className="ml-0.5 text-error-base">*</span>
					</label>
					<Input.Root size="xsmall" hasError={!!errors.name}>
						<Input.Wrapper>
							<Input.Input
								id="name"
								placeholder="e.g., Production Server, My App"
								autoFocus
								{...register("name")}
								disabled={isLoading}
							/>
						</Input.Wrapper>
					</Input.Root>
					{errors.name && (
						<p className="text-error-base text-paragraph-xs">
							{errors.name.message}
						</p>
					)}
					<p className="text-paragraph-xs text-text-sub-600">
						Provide a descriptive name to help you identify this key later.
					</p>
				</div>
			</Modal.Body>

			<div className="flex items-center justify-end border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
				<div className="flex items-center gap-2">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={onClose}
						disabled={isLoading}
					>
						Cancel
						<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
							Esc
						</span>
					</Button.Root>
					<Button.Root
						type="submit"
						variant="neutral"
						size="xsmall"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Spinner size={12} color="currentColor" />
								Creating...
							</>
						) : (
							<>
								Create API Key
								<span className="inline-flex items-center gap-0.5">
									<Icon
										name="command"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
									<Icon
										name="enter"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
								</span>
							</>
						)}
					</Button.Root>
				</div>
			</div>
		</form>
	);
}
