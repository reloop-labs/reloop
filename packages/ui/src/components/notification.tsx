// AlignUI Notification v0.0.0

import * as NotificationPrimitives from "@radix-ui/react-toast";
import { cn } from "@reloop/ui/cn";
import * as React from "react";
import * as Alert from "./alert";
import { Icon } from "./icon";

const NotificationProvider = NotificationPrimitives.Provider;
const NotificationAction = NotificationPrimitives.Action;

const NotificationViewport = React.forwardRef<
	React.ComponentRef<typeof NotificationPrimitives.Viewport>,
	React.ComponentPropsWithoutRef<typeof NotificationPrimitives.Viewport>
>(({ className, ...rest }, forwardedRef) => (
	<NotificationPrimitives.Viewport
		ref={forwardedRef}
		className={cn(
			"fixed top-0 left-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-5 p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:left-auto sm:max-w-[438px] sm:flex-col sm:p-6",
			className,
		)}
		{...rest}
	/>
));
NotificationViewport.displayName = "NotificationViewport";

type NotificationProps = React.ComponentPropsWithoutRef<
	typeof NotificationPrimitives.Root
> &
	Pick<
		React.ComponentPropsWithoutRef<typeof Alert.Root>,
		"status" | "variant"
	> & {
		title?: string;
		description?: React.ReactNode;
		action?: React.ReactNode;
		disableDismiss?: boolean;
	};

const Notification = React.forwardRef<
	React.ComponentRef<typeof NotificationPrimitives.Root>,
	NotificationProps
>(
	(
		{
			className,
			status,
			variant = "filled",
			title,
			description,
			action,
			disableDismiss = false,
			...rest
		}: NotificationProps,
		forwardedRef,
	) => {
		let icon: string;

		switch (status) {
			case "success":
				icon = "success";
				break;
			case "warning":
				icon = "warning";
				break;
			case "error":
				icon = "error";
				break;
			case "information":
				icon = "information";
				break;
			case "feature":
				icon = "feature";
				break;
			default:
				icon = "warnding";
				break;
		}

		return (
			<NotificationPrimitives.Root
				ref={forwardedRef}
				className={cn(
					// open
					"data-[state=open]:max-[639px]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-right-full data-[state=open]:animate-in",
					// close
					"data-[state=closed]:fade-out-80 data-[state=open]:max-[639px]:slide-out-to-top-full data-[state=closed]:sm:slide-out-to-right-full data-[state=closed]:animate-out",
					// swipe
					"data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=end]:animate-out data-[swipe=move]:transition-none",
					className,
				)}
				asChild
				{...rest}
			>
				<Alert.Root variant={variant} status={status} size="large">
					<Alert.Icon as={() => <Icon name={icon} />} aria-hidden="true" />
					<div className="flex w-full flex-col gap-2.5">
						<div className="flex w-full flex-col gap-1">
							{title && (
								<NotificationPrimitives.Title className="text-label-sm">
									{title}
								</NotificationPrimitives.Title>
							)}
							{description && (
								<NotificationPrimitives.Description>
									{description}
								</NotificationPrimitives.Description>
							)}
						</div>
						{action && <div className="flex items-center gap-2">{action}</div>}
					</div>
					{!disableDismiss && (
						<NotificationPrimitives.Close aria-label="Close">
							<Alert.CloseIcon />
						</NotificationPrimitives.Close>
					)}
				</Alert.Root>
			</NotificationPrimitives.Root>
		);
	},
);
Notification.displayName = "Notification";

export {
	Notification as Root,
	NotificationProvider as Provider,
	NotificationAction as Action,
	NotificationViewport as Viewport,
	type NotificationProps,
};
