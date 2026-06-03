"use client";

import {
	addEdge,
	Background,
	type Connection,
	Controls,
	ReactFlow,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
	useOnSelectionChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { createSendEmailNode } from "../mock-data";
import {
	isSendEmailNode,
	TRIGGER_NODE_ID,
	type Workflow,
	type WorkflowEdge,
	type WorkflowNode,
} from "../workflow-types";
import { NodeConfigPanel } from "./node-config-panel";
import { SendEmailNode } from "./nodes/send-email-node";
import { TriggerNode } from "./nodes/trigger-node";
import { WorkflowEditorToolbar } from "./workflow-editor-toolbar";
import { WorkflowNodePalette } from "./workflow-node-palette";

const nodeTypes = {
	trigger: TriggerNode,
	send_email: SendEmailNode,
};

interface WorkflowEditorProps {
	workflow: Workflow;
	onNameChange: (name: string) => void;
	onGraphChange: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
	onStatusChange: (status: Workflow["status"]) => void;
	onSave: () => void;
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

	useEffect(() => {
		if (workflowIdRef.current !== workflow.id) {
			workflowIdRef.current = workflow.id;
			setNodes(workflow.nodes);
			setEdges(workflow.edges);
			setSelectedNodeId(null);
		}
	}, [workflow.id, workflow.nodes, workflow.edges, setNodes, setEdges]);

	const persistGraph = useCallback(() => {
		onGraphChange(nodes, edges);
	}, [nodes, edges, onGraphChange]);

	useEffect(() => {
		const timer = setTimeout(persistGraph, 400);
		return () => clearTimeout(timer);
	}, [persistGraph]);

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
			setEdges((eds) => addEdge(connection, eds));
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

	const handleAddSendEmail = useCallback(() => {
		const sendCount = nodes.filter(isSendEmailNode).length;
		const maxY = Math.max(...nodes.map((n) => n.position.y), 200);
		const newNode = createSendEmailNode(sendCount, 0);
		newNode.position = { x: 380, y: maxY + (sendCount > 0 ? 140 : 0) };
		setNodes((nds) => [...nds, newNode]);
		setSelectedNodeId(newNode.id);
	}, [nodes, setNodes]);

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

	const handleSave = () => {
		onGraphChange(nodes, edges);
		onSave();
	};

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
					<WorkflowNodePalette onAddSendEmail={handleAddSendEmail} />
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						nodeTypes={nodeTypes}
						fitView
						fitViewOptions={{ padding: 0.2 }}
						onPaneClick={() => setSelectedNodeId(null)}
						deleteKeyCode={null}
						className="bg-bg-weak-50/30"
					>
						<Background gap={16} size={1} />
						<Controls showInteractive={false} />
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
