import type { DefaultEdgeOptions } from "@xyflow/react";
import { ConditionNode } from "./nodes/condition-node";
import { DelayNode } from "./nodes/delay-node";
import { FlowEdge } from "./nodes/flow-edge";
import { GroupNode } from "./nodes/group-node";
import { PickerNode } from "./nodes/picker-node";
import { SendEmailNode } from "./nodes/send-email-node";
import { TriggerNode } from "./nodes/trigger-node";

/** Node and edge components shared by the editor and the Runs canvas. */
export const nodeTypes = {
	trigger: TriggerNode,
	send_email: SendEmailNode,
	delay: DelayNode,
	condition: ConditionNode,
	group: GroupNode,
	add_step: PickerNode,
};

export const edgeTypes = {
	flow: FlowEdge,
};

export const defaultEdgeOptions: DefaultEdgeOptions = {
	type: "flow",
	data: { tone: "default" },
};
