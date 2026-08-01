"use client";

import {
	addEdge,
	Background,
	BackgroundVariant,
	type Connection,
	type DefaultEdgeOptions,
	ReactFlow,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
	useOnSelectionChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { createDelayNode, createSendEmailNode } from "../mock-data";
import {
	isDelayNode,
	isSendEmailNode,
	TRIGGER_NODE_ID,
	type Workflow,
	type WorkflowEdge,
	type WorkflowNode,
	type WorkflowStatus,
} from "../workflow-types";
import { NodeConfigPanel } from "./node-config-panel";
import { DelayNode } from "./nodes/delay-node";
import { FlowEdge } from "./nodes/flow-edge";
import { GroupNode } from "./nodes/group-node";
import { SendEmailNode } from "./nodes/send-email-node";
import { TriggerNode } from "./nodes/trigger-node";
import { WorkflowEditorToolbar } from "./workflow-editor-toolbar";
import { WorkflowNodePalette } from "./workflow-node-palette";

const nodeTypes = {
	trigger: TriggerNode,
	send_email: SendEmailNode,
	delay: DelayNode,
	group: GroupNode,
};

const edgeTypes = {
	flow: FlowEdge,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
	type: "flow",
	data: { tone: "default" },
};

/** Horizontal center of the vertical node column (cards are 300px wide). */
const COLUMN_X = 220;
const ROW_GAP = 200;

interface WorkflowEditorProps {
	workflow: Workflow;
	onNameChange: (name: string) => void;
	onGraphChange: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
	onStatusChange: (status: WorkflowStatus) => Promise<void> | void;
	onSave: (
		nodes: WorkflowNode[],
		edges: WorkflowEdge[],
	) => Promise<void> | void;
}

const WorkflowEditorInner = ({
	workflow,
	onNameChange,
	onGraphChange,
	onStatusChange,
	onSave,
}: WorkflowEditorProps) => {
	const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(
		workflow.nodes,
	);
	const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(
		workflow.edges,
	);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const workflowIdRef = useRef(workflow.id);
	const skipPersistRef = useRef(false);

	useEffect(() => {
		if (workflowIdRef.current !== workflow.id) {
			workflowIdRef.current = workflow.id;
			skipPersistRef.current = true;
			setNodes(workflow.nodes);
			setEdges(workflow.edges);
			setSelectedNodeId(null);
		}
	}, [workflow.id, workflow.nodes, workflow.edges, setNodes, setEdges]);

	// Debounced local notify (parent may persist on save only or auto-save)
	useEffect(() => {
		if (skipPersistRef.current) {
			skipPersistRef.current = false;
			return;
		}
		const timer = setTimeout(() => {
			onGraphChange(nodes, edges);
		}, 400);
		return () => clearTimeout(timer);
	}, [nodes, edges, onGraphChange]);

	useOnSelectionChange({
		onChange: ({ nodes: selected }) => {
			setSelectedNodeId(selected[0]?.id ?? null);
		},
	});

	const selectedNode = useMemo(
		() => nodes.find((n) => n.id === selectedNodeId) ?? null,
		[nodes, selectedNodeId],
	);

	const onConnect = useCallback(
		(connection: Connection) => {
			setEdges((eds) =>
				addEdge(
					{ ...connection, type: "flow", data: { tone: "default" } },
					eds,
				),
			);
		},
		[setEdges],
	);

	const updateNodeData = useCallback(
		(nodeId: string, data: Record<string, unknown>) => {
			setNodes((nds) =>
				nds.map((n) =>
					n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
				),
			);
		},
		[setNodes],
	);

	const appendNode = useCallback(
		(newNode: WorkflowNode) => {
			const maxY = Math.max(...nodes.map((n) => n.position.y), 0);
			newNode.position = { x: COLUMN_X, y: maxY + ROW_GAP };
			setNodes((nds) => [...nds, newNode]);
			setSelectedNodeId(newNode.id);
		},
		[nodes, setNodes],
	);

	const handleAddSendEmail = useCallback(() => {
		const sendCount = nodes.filter(isSendEmailNode).length;
		appendNode(createSendEmailNode(sendCount, 0));
	}, [nodes, appendNode]);

	const handleAddDelay = useCallback(() => {
		const delayCount = nodes.filter(isDelayNode).length;
		appendNode(createDelayNode(delayCount, 0));
	}, [nodes, appendNode]);

	const handleDeleteNode = useCallback(
		(nodeId: string) => {
			if (nodeId === TRIGGER_NODE_ID) return;
			setNodes((nds) => nds.filter((n) => n.id !== nodeId));
			setEdges((eds) =>
				eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
			);
			if (selectedNodeId === nodeId) setSelectedNodeId(null);
		},
		[setNodes, setEdges, selectedNodeId],
	);

	useHotkeys("backspace", () => {
		if (!selectedNodeId || selectedNodeId === TRIGGER_NODE_ID) return;
		const active = document.activeElement;
		if (
			active instanceof HTMLInputElement ||
			active instanceof HTMLTextAreaElement
		) {
			return;
		}
		handleDeleteNode(selectedNodeId);
	}, [selectedNodeId, handleDeleteNode]);

	const handleSave = () => onSave(nodes, edges);

	return (
		<div className="flex h-full min-h-0 flex-col">
			<WorkflowEditorToolbar
				workflow={{ ...workflow, nodes, edges }}
				name={workflow.name}
				onNameChange={onNameChange}
				onStatusChange={onStatusChange}
				onSave={handleSave}
			/>
			<div className="relative flex min-h-0 flex-1">
				<div className="relative min-w-0 flex-1">
					<WorkflowNodePalette
						onAddSendEmail={handleAddSendEmail}
						onAddDelay={handleAddDelay}
					/>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						nodeTypes={nodeTypes}
						edgeTypes={edgeTypes}
						defaultEdgeOptions={defaultEdgeOptions}
						fitView
						fitViewOptions={{ padding: 0.3 }}
						proOptions={{ hideAttribution: true }}
						onPaneClick={() => setSelectedNodeId(null)}
						deleteKeyCode={null}
						className="workflow-canvas bg-bg-weak-50/30"
					>
						<Background
							variant={BackgroundVariant.Dots}
							gap={20}
							size={1.5}
							color="var(--color-stroke-sub-300)"
						/>
					</ReactFlow>
				</div>
				<div className="w-[320px] shrink-0">
					<NodeConfigPanel
						selectedNode={selectedNode}
						onUpdateNode={updateNodeData}
						onDeleteNode={handleDeleteNode}
						onClose={() => setSelectedNodeId(null)}
					/>
				</div>
			</div>
		</div>
	);
};

export const WorkflowEditor = (props: WorkflowEditorProps) => {
	return (
		<ReactFlowProvider>
			<WorkflowEditorInner {...props} />
		</ReactFlowProvider>
	);
};
