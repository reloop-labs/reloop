import { cn } from "@reloop/ui/cn";

type AnimatedWorkspaceIconProps = {
	className?: string;
};

/**
 * Workspace building: outline builds bottom→top, then windows appear.
 * Place inside an element with the `group` class.
 */
export function AnimatedWorkspaceIcon({
	className,
}: AnimatedWorkspaceIconProps) {
	return (
		<svg
			viewBox="0 0 512 512"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{/* Shell — builds up from the ground */}
			<path
				d="M499.2,486.4h-12.8V179.2c0-14.14-11.46-25.6-25.6-25.6h-256c-14.14,0-25.6,11.46-25.6,25.6v307.2h-128V25.6h230.4V128 h25.6V25.6c0-14.14-11.46-25.6-25.6-25.6H51.2C37.06,0,25.6,11.46,25.6,25.6v460.8H12.8c-7.074,0-12.8,5.726-12.8,12.8 c0,7.074,5.726,12.8,12.8,12.8h486.4c7.074,0,12.8-5.726,12.8-12.8C512,492.126,506.274,486.4,499.2,486.4z M307.2,486.4H256 v-51.2h51.2V486.4z M409.6,486.4H384v-51.2h25.6V486.4z M460.8,486.4h-25.6v-51.2c0-14.14-11.46-25.6-25.6-25.6H384 c-14.14,0-25.6,11.46-25.6,25.6v51.2h-25.6v-51.2c0-14.14-11.46-25.6-25.6-25.6H256c-14.14,0-25.6,11.46-25.6,25.6v51.2h-25.6 V179.2h256V486.4z"
				className="motion-safe:group-data-[animating=true]:animate-workspace-build"
			/>

			{/* Floor strips + windows — after the shell */}
			<path
				d="M409.6,307.2H256c-14.14,0-25.6,11.46-25.6,25.6v25.6c0,14.14,11.46,25.6,25.6,25.6h153.6c14.14,0,25.6-11.46,25.6-25.6 v-25.6C435.2,318.66,423.74,307.2,409.6,307.2z M409.6,358.4H256v-25.6h153.6V358.4z"
				className="motion-safe:group-data-[animating=true]:animate-workspace-window-1"
			/>
			<path
				d="M409.6,204.8H256c-14.14,0-25.6,11.46-25.6,25.6V256c0,14.14,11.46,25.6,25.6,25.6h153.6c14.14,0,25.6-11.46,25.6-25.6 v-25.6C435.2,216.26,423.74,204.8,409.6,204.8z M409.6,256H256v-25.6h153.6V256z"
				className="motion-safe:group-data-[animating=true]:animate-workspace-window-2"
			/>
			<path
				d="M140.8,51.2H89.6c-7.074,0-12.8,5.726-12.8,12.8v51.2c0,7.074,5.726,12.8,12.8,12.8h51.2c7.074,0,12.8-5.726,12.8-12.8V64 C153.6,56.926,147.874,51.2,140.8,51.2z M128,102.4h-25.6V76.8H128V102.4z"
				className="motion-safe:group-data-[animating=true]:animate-workspace-window-1"
			/>
			<path
				d="M243.2,51.2H192c-7.074,0-12.8,5.726-12.8,12.8v51.2c0,7.074,5.726,12.8,12.8,12.8h51.2c7.074,0,12.8-5.726,12.8-12.8V64 C256,56.926,250.274,51.2,243.2,51.2z M230.4,102.4h-25.6V76.8h25.6V102.4z"
				className="motion-safe:group-data-[animating=true]:animate-workspace-window-2"
			/>
			<path
				d="M140.8,153.6H89.6c-7.074,0-12.8,5.726-12.8,12.8v51.2c0,7.074,5.726,12.8,12.8,12.8h51.2c7.074,0,12.8-5.726,12.8-12.8 v-51.2C153.6,159.326,147.874,153.6,140.8,153.6z M128,204.8h-25.6v-25.6H128V204.8z"
				className="motion-safe:group-data-[animating=true]:animate-workspace-window-3"
			/>
			<path
				d="M140.8,256H89.6c-7.074,0-12.8,5.726-12.8,12.8V320c0,7.074,5.726,12.8,12.8,12.8h51.2c7.074,0,12.8-5.726,12.8-12.8 v-51.2C153.6,261.726,147.874,256,140.8,256z M128,307.2h-25.6v-25.6H128V307.2z"
				className="motion-safe:group-data-[animating=true]:animate-workspace-window-3"
			/>
			<path
				d="M140.8,358.4H89.6c-7.074,0-12.8,5.726-12.8,12.8v51.2c0,7.074,5.726,12.8,12.8,12.8h51.2c7.074,0,12.8-5.726,12.8-12.8 v-51.2C153.6,364.126,147.874,358.4,140.8,358.4z M128,409.6h-25.6V384H128V409.6z"
				className="motion-safe:group-data-[animating=true]:animate-workspace-window-4"
			/>
		</svg>
	);
}
