export type WorkflowNodeTone = "trigger" | "delay" | "condition" | "send_email";

export const nodeTone = {
	trigger: {
		label: "Trigger",
		icon: "zap",
		description: "Starts the automation when an event arrives",
	},
	delay: {
		label: "Delay",
		icon: "clock",
		description: "Wait before continuing",
	},
	condition: {
		label: "Condition",
		icon: "split-route",
		description: "Branch into Yes / No paths",
	},
	send_email: {
		label: "Send email",
		icon: "mail-single",
		description: "Send a template to the contact",
	},
} as const;
