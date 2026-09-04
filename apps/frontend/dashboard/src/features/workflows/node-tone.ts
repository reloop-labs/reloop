export type WorkflowNodeTone = "trigger" | "delay" | "condition" | "send_email";

export const nodeTone = {
	trigger: {
		label: "Trigger",
		icon: "zap",
		well: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
		selected: "border-blue-500 ring-2 ring-blue-500/15 dark:border-blue-400",
		handleClass: "!border-[var(--color-bg-white-0)] !bg-blue-500",
	},
	delay: {
		label: "Delay",
		icon: "clock",
		well: "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
		selected:
			"border-orange-500 ring-2 ring-orange-500/15 dark:border-orange-400",
		handleClass: "!border-[var(--color-bg-white-0)] !bg-orange-500",
	},
	condition: {
		label: "Condition",
		icon: "filter",
		well: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
		selected:
			"border-purple-500 ring-2 ring-purple-500/15 dark:border-purple-400",
		handleClass: "!border-[var(--color-bg-white-0)] !bg-purple-500",
	},
	send_email: {
		label: "Send email",
		icon: "mail-single",
		well: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300",
		selected: "border-green-600 ring-2 ring-green-500/15 dark:border-green-400",
		handleClass: "!border-[var(--color-bg-white-0)] !bg-green-600",
	},
} as const;
