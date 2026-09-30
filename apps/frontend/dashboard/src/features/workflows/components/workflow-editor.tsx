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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
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
import { type InsertStepKind, NodeEditorProvider } from "./node-editor-context";
import { LiveAutomationBanner } from "./live-automation-banner";
import { AddStepNode } from "./nodes/add-step-node";import { ConditionNode } from "./nodes/condition-node";
import { DelayNode } from "./nodes/delay-node";
import { FlowEdge } from "./nodes/flow-edge";
import { GroupNode } from "./nodes/group-node";
import { SendEmailNode } from "./nodes/send-email-node";
import { TriggerNode } from "./nodes/trigger-node";
import { WorkflowEditorToolbar } from "./workflow-editor-toolbar";

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

/** Estimated card heights by type so vertical spacing accounts for tall forms like Send Email */
export const getNodeEstimatedHeight = (type?: string): number => {
	switch (type) {
		case "trigger":
			return 160;
		case "delay":
			return 240;
		case "condition":
			return 340;
		case "send_email":
			return 540;
		default:
			return 240;
	}
};

/** Clear vertical gap between the bottom of one node and the top of the next (line height) */
export const CLEAR_NODE_GAP = 60;

/** Ensures sequential nodes on the canvas don't overlap vertically */
function sanitizeNodePositions(
	nodes: WorkflowNode[],
	edges: WorkflowEdge[],
): WorkflowNode[] {
	if (nodes.length <= 1) return nodes;
	let modified = false;
	const result = nodes.map((n) => ({ ...n, position: { ...n.position } }));
	const byY = [...result].sort((a, b) => a.position.y - b.position.y);

	for (const source of byY) {
		const sourceHeight = getNodeEstimatedHeight(source.type);
		const minNextY = source.position.y + sourceHeight + CLEAR_NODE_GAP;

		// 1. Direct edge connections (target of source node)
		const outgoingEdges = edges.filter((e) => e.source === source.id);
		for (const edge of outgoingEdges) {
			const target = result.find((n) => n.id === edge.target);
			if (target && target.position.y < minNextY) {
				const delta = minNextY - target.position.y;
				const targetCurrentY = target.position.y;
				for (const n of result) {
					if (
						n.position.y >= targetCurrentY &&
						Math.abs(n.position.x - target.position.x) < 280
					) {
						n.position.y += delta;
					}
				}
				modified = true;
			}
		}

		// 2. Unconnected or same-column collisions (nodes overlapping in the vertical track)
		for (const other of result) {
			if (
				other.id !== source.id &&
				other.position.y >= source.position.y &&
				Math.abs(other.position.x - source.position.x) < 280 &&
				other.position.y < minNextY
			) {
				const delta = minNextY - other.position.y;
				const otherCurrentY = other.position.y;
				for (const n of result) {
					if (
						n.position.y >= otherCurrentY &&
						Math.abs(n.position.x - other.position.x) < 280
					) {
						n.position.y += delta;
					}
				}
				modified = true;
			}
		}
	}

	return modified ? result : nodes;
}

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
	const sanitizedInitialNodes = useMemo(
		() => sanitizeNodePositions(workflow.nodes, workflow.edges),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[workflow.id],
	);
	const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(
		sanitizedInitialNodes,
	);
	const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(
		workflow.edges,
	);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const workflowIdRef = useRef(workflow.id);
	const skipPersistRef = useRef(false);
	const { fitView } = useReactFlow();
	const isReadOnly = workflow.status === "active";

	useEffect(() => {
		if (workflowIdRef.current !== workflow.id) {
			workflowIdRef.current = workflow.id;
			skipPersistRef.current = true;
			const cleanNodes = sanitizeNodePositions(workflow.nodes, workflow.edges);
			setNodes(cleanNodes);
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
			if (isReadOnly) return;
			const branch =
				connection.sourceHandle === "yes" || connection.sourceHandle === "no"
					? connection.sourceHandle
					: undefined;
			let nextEdges: WorkflowEdge[] = [];
			setEdges((eds) => {
				const rest = eds.filter(
					(edge) =>
						!(
							edge.source === connection.source &&
							(edge.sourceHandle ?? null) === (connection.sourceHandle ?? null)
						),
				);
				nextEdges = addEdge(
					{
						...connection,
						type: "flow",
						data: {
							tone: branch === "yes" ? "accent" : "default",
							branch,
						},
					},
					rest,
				);
				return nextEdges;
			});
			// Ensure newly connected nodes don't overlap
			setNodes((nds) => sanitizeNodePositions(nds, nextEdges));
		},
		[setEdges, setNodes, isReadOnly],
	);

	const updateNodeData = useCallback(
		(nodeId: string, data: Record<string, unknown>) => {
			if (isReadOnly) return;
			setNodes((nds) =>
				nds.map((n) =>
					n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
				),
			);
		},
		[setNodes, isReadOnly],
	);

	const appendNode = useCallback(
		(newNode: WorkflowNode) => {
			if (isReadOnly) return;
			if (nodes.length === 0) {
				newNode.position = { x: COLUMN_X, y: 60 };
			} else {
				const deepestNode = [...nodes].sort(
					(a, b) => b.position.y - a.position.y,
				)[0]!;
				const deepestHeight = getNodeEstimatedHeight(deepestNode.type);
				newNode.position = {
					x: deepestNode.position.x,
					y: deepestNode.position.y + deepestHeight + CLEAR_NODE_GAP,
				};
			}
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
		[nodes, setNodes, fitView, isReadOnly],
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

	/** Append a step directly below a specific node/handle and connect it with an edge. */
	const addStepBelow = useCallback(
		(
			sourceNodeId: string,
			sourceHandle: string | undefined,
			kind: InsertStepKind,
		) => {
			if (isReadOnly) return;
			const sourceNode = nodes.find((n) => n.id === sourceNodeId);
			if (!sourceNode) return;

			let newNode: WorkflowNode;
			if (kind === "send_email") {
				newNode = createSendEmailNode(nodes.filter(isSendEmailNode).length, 0);
			} else if (kind === "delay") {
				newNode = createDelayNode(nodes.filter(isDelayNode).length, 0);
			} else {
				newNode = createConditionNode(nodes.filter(isConditionNode).length, 0);
			}

			const sourceHeight = getNodeEstimatedHeight(sourceNode.type);
			const newNodeHeight = getNodeEstimatedHeight(newNode.type);
			const targetY = sourceNode.position.y + sourceHeight + CLEAR_NODE_GAP;
			const shiftDistance = newNodeHeight + CLEAR_NODE_GAP;

			let targetX = sourceNode.position.x;
			if (sourceHandle === "yes") {
				targetX = sourceNode.position.x - 180;
			} else if (sourceHandle === "no") {
				targetX = sourceNode.position.x + 180;
			}

			newNode.position = { x: targetX, y: targetY };
			newNode.selected = true;

			// Push down any existing nodes that would be overlapped
			setNodes((nds) => {
				const next: WorkflowNode[] = nds.map((n) => {
					const shouldShift =
						n.id !== sourceNodeId &&
						n.position.y >= targetY &&
						Math.abs(n.position.x - targetX) < 220;
					const shifted = shouldShift
						? {
								...n,
								position: { ...n.position, y: n.position.y + shiftDistance },
							}
						: n;
					return shifted.selected ? { ...shifted, selected: false } : shifted;
				});
				next.push(newNode);
				return next;
			});
			setSelectedNodeId(newNode.id);

			const branch =
				sourceHandle === "yes" || sourceHandle === "no"
					? sourceHandle
					: undefined;
			const stamp = Date.now();
			const newEdge: WorkflowEdge = {
				id: `e_${sourceNodeId}_${newNode.id}_${stamp}`,
				source: sourceNodeId,
				target: newNode.id,
				type: "flow",
				data: {
					tone: branch === "yes" ? "accent" : "default",
					branch,
				},
			};
			if (sourceHandle) {
				newEdge.sourceHandle = sourceHandle;
			}

			setEdges((eds) => [...eds, newEdge]);

			const reduceMotion =
				typeof window !== "undefined" &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			requestAnimationFrame(() => {
				void fitView({
					padding: 0.35,
					duration: reduceMotion ? 0 : 220,
				});
			});
		},
		[nodes, setNodes, setEdges, fitView, isReadOnly],
	);

	/** Append a step at the end of the flow (fallback / palette). */
	const appendStep = useCallback(
		(kind: InsertStepKind) => {
			if (isReadOnly) return;
			const byY = [...nodes].sort((a, b) => b.position.y - a.position.y);
			const target = byY.find((n) => n.type !== "group");
			if (target) {
				addStepBelow(target.id, undefined, kind);
			} else {
				if (kind === "send_email") handleAddSendEmail();
				else if (kind === "delay") handleAddDelay();
				else handleAddCondition();
			}
		},
		[
			nodes,
			addStepBelow,
			handleAddSendEmail,
			handleAddDelay,
			handleAddCondition,
			isReadOnly,
		],
	);

	const handleDeleteNode = useCallback(
		(nodeId: string) => {
			if (isReadOnly) return;
			if (nodeId === TRIGGER_NODE_ID) return;

			const nodeToDelete = nodes.find((n) => n.id === nodeId);
			if (!nodeToDelete) return;

			const incomingEdges = edges.filter((e) => e.target === nodeId);
			const outgoingEdges = edges.filter((e) => e.source === nodeId);

			const remainingEdges = edges.filter(
				(e) => e.source !== nodeId && e.target !== nodeId,
			);

			// Reconnect upstream nodes to downstream nodes
			const stamp = Date.now();
			const bridgeEdges: WorkflowEdge[] = [];

			for (const inEdge of incomingEdges) {
				for (const outEdge of outgoingEdges) {
					if (inEdge.source === outEdge.target) continue;

					const alreadyExists =
						remainingEdges.some(
							(e) => e.source === inEdge.source && e.target === outEdge.target,
						) ||
						bridgeEdges.some(
							(e) => e.source === inEdge.source && e.target === outEdge.target,
						);
					if (alreadyExists) continue;

					// Only inherit sourceHandle from inEdge (the upstream parent's handle)
					const branch =
						inEdge.sourceHandle === "yes" || inEdge.sourceHandle === "no"
							? inEdge.sourceHandle
							: undefined;
					const tone = branch === "yes" ? "accent" : "default";

					bridgeEdges.push({
						id: `e_${inEdge.source}_${outEdge.target}_${stamp}`,
						source: inEdge.source,
						target: outEdge.target,
						...(inEdge.sourceHandle
							? { sourceHandle: inEdge.sourceHandle }
							: {}),
						...(outEdge.targetHandle
							? { targetHandle: outEdge.targetHandle }
							: {}),
						type: "flow",
						data: {
							tone,
							branch,
						},
					});
				}
			}

			const nextEdges = [...remainingEdges, ...bridgeEdges];

			// Reposition downstream nodes so C connects seamlessly to A with exact 60px line height
			let nextNodes = nodes.filter((n) => n.id !== nodeId);

			if (incomingEdges.length > 0 && outgoingEdges.length > 0) {
				const sourceNode = nodes.find((n) => n.id === incomingEdges[0]?.source);
				const targetNode = nodes.find((n) => n.id === outgoingEdges[0]?.target);

				if (sourceNode && targetNode) {
					const sourceHeight = getNodeEstimatedHeight(sourceNode.type);
					const desiredTargetY =
						sourceNode.position.y + sourceHeight + CLEAR_NODE_GAP;
					const deltaY = targetNode.position.y - desiredTargetY;

					if (deltaY > 0) {
						const oldTargetY = targetNode.position.y;
						const targetX = targetNode.position.x;
						nextNodes = nextNodes.map((n) => {
							if (
								n.position.y >= oldTargetY &&
								Math.abs(n.position.x - targetX) < 280
							) {
								return {
									...n,
									position: {
										...n.position,
										y: n.position.y - deltaY,
										...(sourceNode.type !== "condition"
											? { x: sourceNode.position.x }
											: {}),
									},
								};
							}
							return n;
						});
					}
				}
			} else {
				// Leaf or unconnected node: shift any lower nodes up by deleted node height + gap
				const deletedHeight = getNodeEstimatedHeight(nodeToDelete.type);
				const shiftUpAmount = deletedHeight + CLEAR_NODE_GAP;
				const deletedY = nodeToDelete.position.y;
				const deletedX = nodeToDelete.position.x;

				nextNodes = nextNodes.map((n) => {
					if (
						n.position.y > deletedY &&
						Math.abs(n.position.x - deletedX) < 280
					) {
						return {
							...n,
							position: {
								...n.position,
								y: Math.max(deletedY, n.position.y - shiftUpAmount),
							},
						};
					}
					return n;
				});
			}

			// Ensure layout constraints (60px gap) across entire remaining graph
			const sanitized = sanitizeNodePositions(nextNodes, nextEdges);

			setNodes(sanitized);
			setEdges(nextEdges);
			if (selectedNodeId === nodeId) setSelectedNodeId(null);

			const reduceMotion =
				typeof window !== "undefined" &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			requestAnimationFrame(() => {
				void fitView({
					padding: 0.35,
					duration: reduceMotion ? 0 : 200,
				});
			});
		},
		[nodes, edges, selectedNodeId, setNodes, setEdges, fitView, isReadOnly],
	);

	/** Insert a new step between the two nodes of an edge (plus button on edges). */
	const insertStep = useCallback(
		(edgeId: string, kind: InsertStepKind) => {
			if (isReadOnly) return;
			const edge = edges.find((e) => e.id === edgeId);
			if (!edge) return;
			const source = nodes.find((n) => n.id === edge.source);
			const target = nodes.find((n) => n.id === edge.target);
			if (!source || !target) return;

			let newNode: WorkflowNode;
			if (kind === "send_email") {
				newNode = createSendEmailNode(nodes.filter(isSendEmailNode).length, 0);
			} else if (kind === "delay") {
				newNode = createDelayNode(nodes.filter(isDelayNode).length, 0);
			} else {
				newNode = createConditionNode(nodes.filter(isConditionNode).length, 0);
			}

			const newNodeHeight = getNodeEstimatedHeight(newNode.type);
			const shiftDistance = newNodeHeight + CLEAR_NODE_GAP;
			const insertX = target.position.x;
			const insertY = target.position.y;
			newNode.position = { x: insertX, y: insertY };
			newNode.selected = true;

			// Push target and anything below it down by shiftDistance so no overlap occurs
			setNodes((nds) => {
				const next: WorkflowNode[] = nds.map((n) => {
					const shouldShift =
						n.position.y >= insertY && Math.abs(n.position.x - insertX) < 220;
					const shifted = shouldShift
						? {
								...n,
								position: { ...n.position, y: n.position.y + shiftDistance },
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
		[edges, nodes, setNodes, setEdges, fitView, isReadOnly],
	);

	useHotkeys("backspace", () => {
		if (isReadOnly) return;
		if (!selectedNodeId || selectedNodeId === TRIGGER_NODE_ID) return;
		const active = document.activeElement;
		if (
			active instanceof HTMLInputElement ||
			active instanceof HTMLTextAreaElement
		) {
			return;
		}
		handleDeleteNode(selectedNodeId);
	}, [selectedNodeId, handleDeleteNode, isReadOnly]);

	const handleSave = () => {
		if (isReadOnly) return;
		return onSave(nodes, edges);
	};

	const clearSelection = useCallback(() => {
		setSelectedNodeId(null);
		setNodes((nds) =>
			nds.map((n) => (n.selected ? { ...n, selected: false } : n)),
		);
	}, [setNodes]);

	const handleNodeDragStop = useCallback(() => {
		if (isReadOnly) return;
		setNodes((nds) => sanitizeNodePositions(nds, edges));
	}, [edges, setNodes, isReadOnly]);

	return (
		<NodeEditorProvider
			value={{
				updateNode: updateNodeData,
				deleteNode: handleDeleteNode,
				insertStep,
				appendStep,
				addStepBelow,
				readOnly: isReadOnly,
			}}
		>
			<div className="flex h-full min-h-0 flex-col">
				<WorkflowEditorToolbar
					workflow={{ ...workflow, nodes, edges }}
					name={workflow.name}
					onNameChange={isReadOnly ? () => {} : onNameChange}
					onStatusChange={onStatusChange}
					onSave={handleSave}
				/>
				<div className="relative flex min-h-0 flex-1 overflow-hidden">
					<div className="relative min-w-0 flex-1">
						<ReactFlow
							nodes={nodes}
							edges={edges}
							onNodesChange={isReadOnly ? undefined : onNodesChange}
							onEdgesChange={isReadOnly ? undefined : onEdgesChange}
							onNodeDragStop={handleNodeDragStop}
							onConnect={isReadOnly ? undefined : onConnect}
							nodesDraggable={!isReadOnly}
							nodesConnectable={!isReadOnly}
							nodesFocusable={!isReadOnly}
							elementsSelectable={!isReadOnly}
							connectOnClick={false}
							nodeTypes={nodeTypes}
							edgeTypes={edgeTypes}
							defaultEdgeOptions={defaultEdgeOptions}
							fitView
							fitViewOptions={{ padding: 0.35, minZoom: 1, maxZoom: 1 }}
							proOptions={{ hideAttribution: true }}
							onPaneClick={clearSelection}
							deleteKeyCode={null}
							zoomOnScroll={false}
							zoomOnPinch={false}
							zoomOnDoubleClick={false}
							panOnScroll
							panOnDrag
							minZoom={1}
							maxZoom={1}
							defaultViewport={{ x: 0, y: 0, zoom: 1 }}
							className="workflow-canvas bg-bg-weak-50 dark:bg-black"
							connectionLineStyle={{
								stroke: "#3b82f6",
								strokeWidth: 2,
							}}
						>
							<Background
								variant={BackgroundVariant.Dots}
								gap={22}
								size={1.2}
								color="var(--color-stroke-soft-200)"
							/>
						</ReactFlow>
						{isReadOnly ? (
							<LiveAutomationBanner
								key={workflow.id}
								workflow={{ ...workflow, nodes, edges }}
							/>
						) : null}
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
