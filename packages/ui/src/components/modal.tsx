// AlignUI Modal v0.0.0

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@reloop/ui/cn";
import * as React from "react";
import * as CompactButton from "./compact-button";
import { Icon } from "./icon";

const ModalRoot = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalClose = DialogPrimitive.Close;
const ModalPortal = DialogPrimitive.Portal;

const ModalOverlay = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...rest }, forwardedRef) => {
	return (
		<DialogPrimitive.Overlay
			ref={forwardedRef}
			className={cn(
				// base
				"fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-overlay p-4 backdrop-blur-[10px]",
				// animation
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=open]:animate-in",
				className,
			)}
			{...rest}
		/>
	);
});
ModalOverlay.displayName = "ModalOverlay";

const ModalContent = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
		overlayClassName?: string;
		showClose?: boolean;
	}
>(
	(
		{ className, overlayClassName, children, showClose = true, ...rest },
		forwardedRef,
	) => {
		return (
			<ModalPortal>
				<ModalOverlay className={overlayClassName}>
					<DialogPrimitive.Content
						ref={forwardedRef}
						className={cn(
							// base
							"relative w-full max-w-[400px]",
							"rounded-20 bg-bg-white-0 shadow-regular-md",
							// focus
							"focus:outline-none",
							// animation
							"data-[state=closed]:animate-out data-[state=open]:animate-in",
							"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
							"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
							className,
						)}
						{...rest}
					>
						{children}
						{showClose && (
							<ModalClose asChild>
								<CompactButton.Root
									variant="ghost"
									size="large"
									className="absolute top-4 right-4"
								>
									<CompactButton.Icon
										as={() => (
											<Icon name="plus" className="h-4 w-4 rotate-45" />
										)}
									/>
								</CompactButton.Root>
							</ModalClose>
						)}
					</DialogPrimitive.Content>
				</ModalOverlay>
			</ModalPortal>
		);
	},
);
ModalContent.displayName = "ModalContent";

function ModalHeader({
	className,
	children,
	iconName,
	title,
	description,
	...rest
}: React.HTMLAttributes<HTMLDivElement> & {
	iconName?: string;
	title?: string;
	description?: string;
}) {
	return (
		<div
			className={cn(
				"relative flex items-center gap-3.5 py-4 pr-14 pl-5 before:absolute before:inset-x-0 before:bottom-0 before:border-stroke-soft-200 before:border-b",
				className,
			)}
			{...rest}
		>
			{children || (
				<>
					{iconName && (
						<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 ring-1 ring-stroke-soft-200 ring-inset">
							<Icon name={iconName} className="size-5 text-text-sub-600" />
						</div>
					)}
					{(title || description) && (
						<div className="flex-1 space-y-1">
							{title && <ModalTitle>{title}</ModalTitle>}
							{description && (
								<ModalDescription>{description}</ModalDescription>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}
ModalHeader.displayName = "ModalHeader";

const ModalTitle = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...rest }, forwardedRef) => {
	return (
		<DialogPrimitive.Title
			ref={forwardedRef}
			className={cn("text-label-sm text-text-strong-950", className)}
			{...rest}
		/>
	);
});
ModalTitle.displayName = "ModalTitle";

const ModalDescription = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...rest }, forwardedRef) => {
	return (
		<DialogPrimitive.Description
			ref={forwardedRef}
			className={cn("text-paragraph-xs text-text-sub-600", className)}
			{...rest}
		/>
	);
});
ModalDescription.displayName = "ModalDescription";

function ModalBody({
	className,
	...rest
}: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("p-5", className)} {...rest} />;
}
ModalBody.displayName = "ModalBody";

function ModalFooter({
	className,
	...rest
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex items-center justify-between gap-3 border-stroke-soft-200 border-t px-5 py-4",
				className,
			)}
			{...rest}
		/>
	);
}

ModalFooter.displayName = "ModalFooter";

export {
	ModalRoot as Root,
	ModalTrigger as Trigger,
	ModalClose as Close,
	ModalPortal as Portal,
	ModalOverlay as Overlay,
	ModalContent as Content,
	ModalHeader as Header,
	ModalTitle as Title,
	ModalDescription as Description,
	ModalBody as Body,
	ModalFooter as Footer,
};
