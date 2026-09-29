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
	useReactFlow,
	useStore,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Icon } from "@reloop/ui/icon";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
	createConditionNode,
	createDelayNode,
	createSendEmailNode,
} from "../mock-data";
import {
	isConditionNode,
	isDelayNode,
	isSendEmailNode,
	TRIGGER_NODE_ID,
	type Workflow,
	type WorkflowEdge,
	type WorkflowNode,
	type WorkflowStatus,
} from "../workflow-types";
import { NodeEditorProvider } from "./node-editor-context";
import { ConditionNode } from "./nodes/condition-node";
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
	condition: ConditionNode,
	group: GroupNode,
};

const edgeTypes = {
	flow: FlowEdge,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
	type: "flow",
	data: { tone: "default" },
};

/** Horizontal center of the vertical node column (cards are 320px wide). */
const COLUMN_X = 220;
const ROW_GAP = 280;

const zoomSelector = (s: { transform: [number, number, number] }) =>
	s.transform[2];

/** Top-right vertical zoom control (75% / 100% / 125%). Zoom only via buttons. */
const ZOOM_STEPS = [0.75, 1, 1.25];

const CanvasZoomControl = () => {
	const { zoomTo } = useReactFlow();
	const zoom = useStore(zoomSelector);

	const nearestIndex = ZOOM_STEPS.reduce(
		(best, step, i) =>
			Math.abs(step - zoom) < Math.abs(ZOOM_STEPS[best]! - zoom) ? i : best,
		1,
	);
	const canZoomIn = nearestIndex < ZOOM_STEPS.length - 1;
	const canZoomOut = nearestIndex > 0;

	return (
		<div className="absolute top-4 right-4 z-10 flex flex-col items-stretch gap-0.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0/95 p-1 shadow-regular-sm backdrop-blur-sm dark:border-stroke-soft-100/40 dark:bg-[#141419]/95">
			<button
				type="button"
				onClick={() => {
					if (canZoomIn) void zoomTo(ZOOM_STEPS[nearestIndex + 1]!, { duration: 200 });
				}}
				disabled={!canZoomIn}
				aria-label="Zoom in"
				className="flex h-7 w-7 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-sub-600 dark:hover:bg-white/10"
			>
				<Icon name="plus" className="h-4 w-4" />
			</button>
			<div
				aria-hidden="true"
				className="mx-1 h-px bg-stroke-soft-200 dark:bg-white/10"
			/>
			<button
				type="button"
				onClick={() => {
					if (canZoomOut) void zoomTo(ZOOM_STEPS[nearestIndex - 1]!, { duration: 200 });
				}}
				disabled={!canZoomOut}
				aria-label="Zoom out"
				className="flex h-7 w-7 items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-sub-600 dark:hover:bg-white/10"
			>
				<Icon name="minus" className="h-4 w-4" />
			</button>
		</div>
	);
};

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
	const { fitView } = useReactFlow();

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

	const onConnect = useCallback(
		(connection: Connection) => {
			const branch =
				connection.sourceHandle === "yes" || connection.sourceHandle === "no"
					? connection.sourceHandle
					: undefined;
			setEdges((eds) => {
				const next = eds.filter(
					(edge) =>
						!(
							edge.source === connection.source &&
							(edge.sourceHandle ?? null) === (connection.sourceHandle ?? null)
						),
				);
				return addEdge(
					{
						...connection,
						type: "flow",
						data: {
							tone: branch === "yes" ? "accent" : "default",
							branch,
						},
					},
					next,
				);
			});
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
			newNode.selected = true;
			setNodes((nds) => {
				const next: WorkflowNode[] = nds.map((n) =>
					n.selected ? { ...n, selected: false } : n,
				);
				next.push(newNode);
				return next;
			});
			setSelectedNodeId(newNode.id);
			const reduceMotion =
				typeof window !== "undefined" &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			requestAnimationFrame(() => {
				void fitView({
					padding: 0.3,
					duration: reduceMotion ? 0 : 220,
				});
			});
		},
		[nodes, setNodes, fitView],
	);

	const handleAddSendEmail = useCallback(() => {
		const sendCount = nodes.filter(isSendEmailNode).length;
		appendNode(createSendEmailNode(sendCount, 0));
	}, [nodes, appendNode]);

	const handleAddDelay = useCallback(() => {
		const delayCount = nodes.filter(isDelayNode).length;
		appendNode(createDelayNode(delayCount, 0));
	}, [nodes, appendNode]);

	const handleAddCondition = useCallback(() => {
		const conditionCount = nodes.filter(isConditionNode).length;
		appendNode(createConditionNode(conditionCount, 0));
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

	const clearSelection = useCallback(() => {
		setSelectedNodeId(null);
		setNodes((nds) =>
			nds.map((n) => (n.selected ? { ...n, selected: false } : n)),
		);
	}, [setNodes]);

	return (
		<NodeEditorProvider
			value={{ updateNode: updateNodeData, deleteNode: handleDeleteNode }}
		>
			<div className="flex h-full min-h-0 flex-col">
				<WorkflowEditorToolbar
					workflow={{ ...workflow, nodes, edges }}
					name={workflow.name}
					onNameChange={onNameChange}
					onStatusChange={onStatusChange}
					onSave={handleSave}
				/>
				<div className="relative flex min-h-0 flex-1 overflow-hidden">
					<div className="relative min-w-0 flex-1">
						<WorkflowNodePalette
							onAddSendEmail={handleAddSendEmail}
							onAddDelay={handleAddDelay}
							onAddCondition={handleAddCondition}
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
							fitViewOptions={{ padding: 0.35, maxZoom: 1 }}
							proOptions={{ hideAttribution: true }}
							onPaneClick={clearSelection}
							deleteKeyCode={null}
							zoomOnScroll={false}
							zoomOnPinch={false}
							zoomOnDoubleClick={false}
							panOnScroll
							minZoom={0.75}
							maxZoom={1.25}
							className="workflow-canvas bg-bg-weak-50 dark:bg-black"
							connectionLineStyle={{
								stroke: "var(--color-stroke-sub-300)",
								strokeWidth: 1.5,
								strokeDasharray: "5 5",
							}}
						>
							<Background
								variant={BackgroundVariant.Dots}
								gap={22}
								size={1.2}
								color="var(--color-stroke-soft-200)"
							/>
							<CanvasZoomControl />
						</ReactFlow>
					</div>
				</div>
			</div>
		</NodeEditorProvider>
	);
};

export const WorkflowEditor = (props: WorkflowEditorProps) => {
	return (
		<ReactFlowProvider>
			<WorkflowEditorInner {...props} />
		</ReactFlowProvider>
	);
};
