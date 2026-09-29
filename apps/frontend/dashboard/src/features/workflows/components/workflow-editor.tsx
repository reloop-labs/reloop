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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { NodeEditorProvider, type InsertStepKind } from "./node-editor-context";
import { AddStepNode } from "./nodes/add-step-node";
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
	add_step: AddStepNode,
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

/** Display-only end-cap below the last step (plus button to append). Never persisted. */
const END_CAP_NODE_ID = "__add_step__";
const END_CAP_EDGE_ID = "__add_step_edge__";
/** Gap between the bottom of the last step and the trailing plus. */
const END_CAP_GAP = 96;

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

	/** Append a step at the end of the flow (trailing plus / palette). */
	const appendStep = useCallback(
		(kind: InsertStepKind) => {
			if (kind === "send_email") handleAddSendEmail();
			else if (kind === "delay") handleAddDelay();
			else handleAddCondition();
		},
		[handleAddSendEmail, handleAddDelay, handleAddCondition],
	);

	/**
	 * Deepest step with a free output: plain steps with no outgoing edge, or a
	 * condition with a free Yes/No branch. The trailing plus + stub line
	 * attaches here.
	 */
	const endCapSource = useMemo(() => {
		const byY = [...nodes].sort((a, b) => b.position.y - a.position.y);
		for (const n of byY) {
			if (n.type === "condition") {
				const hasYes = edges.some(
					(e) => e.source === n.id && e.sourceHandle === "yes",
				);
				const hasNo = edges.some(
					(e) => e.source === n.id && e.sourceHandle === "no",
				);
				if (!hasYes) return { id: n.id, handle: "yes" as const };
				if (!hasNo) return { id: n.id, handle: "no" as const };
				continue;
			}
			if (n.type === "group") continue;
			if (!edges.some((e) => e.source === n.id)) {
				return { id: n.id, handle: undefined as undefined };
			}
		}
		return null;
	}, [nodes, edges]);

	/** Bottom of the lowest rendered step (measured heights, not tops). */
	const contentBottom = useStore((s) => {
		let bottom = 0;
		s.nodeLookup.forEach((n) => {
			if (n.id === END_CAP_NODE_ID) return;
			const y = n.internals?.positionAbsolute?.y ?? n.position.y;
			const h = n.measured?.height ?? 0;
			bottom = Math.max(bottom, y + h);
		});
		return bottom;
	});

	// Fit once measured so the trailing plus is in view on load.
	const didInitFitRef = useRef(false);
	useEffect(() => {
		if (didInitFitRef.current || contentBottom <= 0) return;
		didInitFitRef.current = true;
		requestAnimationFrame(() => {
			void fitView({ padding: 0.35, maxZoom: 1, duration: 0 });
		});
	}, [contentBottom, fitView]);

	/** Graph + display-only end-cap (plus button below the last step). */
	const displayNodes = useMemo<WorkflowNode[]>(() => {
		if (!endCapSource) return nodes;
		const endCap = {
			id: END_CAP_NODE_ID,
			type: "add_step",
			position: { x: COLUMN_X, y: Math.max(contentBottom, 0) + END_CAP_GAP },
			data: {},
			selectable: false,
			draggable: false,
		} as unknown as WorkflowNode;
		return [...nodes, endCap];
	}, [nodes, endCapSource, contentBottom]);

	const displayEdges = useMemo<WorkflowEdge[]>(() => {
		if (typeof window !== "undefined") {
			// eslint-disable-next-line no-console
			console.log("[debug-flow] endCapSource", endCapSource, "realEdges", edges.length, "contentBottom", contentBottom);
		}
		if (!endCapSource) return edges;
		const stub: WorkflowEdge = {
			id: END_CAP_EDGE_ID,
			source: endCapSource.id,
			target: END_CAP_NODE_ID,
			type: "flow",
			selectable: false,
			data: { tone: "default", stub: true },
		};
		if (endCapSource.handle) stub.sourceHandle = endCapSource.handle;
		return [...edges, stub];
	}, [edges, endCapSource]);

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

	/** Insert a new step between the two nodes of an edge (plus button on edges). */
	const insertStep = useCallback(
		(edgeId: string, kind: InsertStepKind) => {
			const edge = edges.find((e) => e.id === edgeId);
			if (!edge) return;
			const source = nodes.find((n) => n.id === edge.source);
			const target = nodes.find((n) => n.id === edge.target);
			if (!source || !target) return;

			let newNode: WorkflowNode;
			if (kind === "send_email") {
				newNode = createSendEmailNode(
					nodes.filter(isSendEmailNode).length,
					0,
				);
			} else if (kind === "delay") {
				newNode = createDelayNode(nodes.filter(isDelayNode).length, 0);
			} else {
				newNode = createConditionNode(
					nodes.filter(isConditionNode).length,
					0,
				);
			}

			// Open room at the target's slot and push it (and everything below) down.
			const insertY = target.position.y;
			newNode.position = { x: COLUMN_X, y: insertY };
			newNode.selected = true;
			setNodes((nds) => {
				const next: WorkflowNode[] = nds.map((n) => {
					const shifted =
						n.position.y >= insertY
							? {
									...n,
									position: { ...n.position, y: n.position.y + ROW_GAP },
								}
							: n;
					return shifted.selected ? { ...shifted, selected: false } : shifted;
				});
				next.push(newNode);
				return next;
			});
			setSelectedNodeId(newNode.id);

			const branch =
				edge.sourceHandle === "yes" || edge.sourceHandle === "no"
					? edge.sourceHandle
					: undefined;
			const stamp = Date.now();
			setEdges((eds) => {
				const rest = eds.filter((e) => e.id !== edgeId);
				const first: WorkflowEdge = {
					id: `e_${edge.source}_${newNode.id}_${stamp}`,
					source: edge.source,
					target: newNode.id,
					type: "flow",
					data: {
						tone: branch === "yes" ? "accent" : "default",
						branch,
					},
				};
				if (edge.sourceHandle) first.sourceHandle = edge.sourceHandle;
				const second: WorkflowEdge = {
					id: `e_${newNode.id}_${edge.target}_${stamp}`,
					source: newNode.id,
					target: edge.target,
					type: "flow",
					data: { tone: "default" },
				};
				if (edge.targetHandle) second.targetHandle = edge.targetHandle;
				return [...rest, first, second];
			});
		},
		[edges, nodes, setNodes, setEdges],
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
			value={{
				updateNode: updateNodeData,
				deleteNode: handleDeleteNode,
				insertStep,
				appendStep,
			}}
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
							nodes={displayNodes}
							edges={displayEdges}
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
