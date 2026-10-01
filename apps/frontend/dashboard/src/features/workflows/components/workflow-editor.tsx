"use client";

import {
	applyNodeChanges,
	Background,
	BackgroundVariant,
	type DefaultEdgeOptions,
	type NodeChange,
	type NodePositionChange,
	ReactFlow,
	ReactFlowProvider,
	useEdgesState,
	useOnSelectionChange,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
	createAddStepNode,
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
import { LiveAutomationBanner } from "./live-automation-banner";
import { type InsertStepKind, NodeEditorProvider } from "./node-editor-context";
import { AddStepNode } from "./nodes/add-step-node";
import { ConditionNode } from "./nodes/condition-node";
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

/** Horizontal center of the vertical node column (cards are 420px wide). */
const COLUMN_X = 220;

/** Estimated card heights by type for initial layout before DOM measurement */
export const getNodeEstimatedHeight = (type?: string): number => {
	switch (type) {
		case "trigger":
			return 108;
		case "delay":
			return 128;
		case "condition":
			return 320;
		case "send_email":
			return 260;
		case "add_step":
			return 340;
		default:
			return 140;
	}
};

/** Actual measured height from React Flow if rendered, otherwise calibrated estimated height */
export const getNodeHeight = (node?: WorkflowNode): number => {
	if (!node) return 140;
	if (node.measured?.height && node.measured.height > 20) {
		return node.measured.height;
	}
	return getNodeEstimatedHeight(node.type);
};

/** Clear vertical gap between the bottom of one node and the top of the next (line height) */
export const CLEAR_NODE_GAP = 60;

/** Ensures every sequential node on the canvas has the exact same uniform vertical spacing and stays in a straight line */
function sanitizeNodePositions(
	nodes: WorkflowNode[],
	edges: WorkflowEdge[],
): WorkflowNode[] {
	if (nodes.length === 0) return nodes;
	let modified = false;
	const result = nodes.map((n) => ({ ...n, position: { ...n.position } }));

	// Find the root node (Trigger or node without incoming edges)
	const rootNode =
		result.find((n) => n.id === TRIGGER_NODE_ID) ??
		result.find((n) => !edges.some((e) => e.target === n.id)) ??
		result[0];

	const rootX = rootNode ? rootNode.position.x : COLUMN_X;

	// Traverse the graph from the root downwards (BFS)
	const visited = new Set<string>();
	const queue: WorkflowNode[] = [];

	if (rootNode) {
		if (rootNode.position.x !== rootX) {
			rootNode.position.x = rootX;
			modified = true;
		}
		queue.push(rootNode);
		visited.add(rootNode.id);
	}

	while (queue.length > 0) {
		const current = queue.shift();
		if (!current) break;
		const currentHeight = getNodeHeight(current);
		const expectedChildY = current.position.y + currentHeight + CLEAR_NODE_GAP;

		const outgoingEdges = edges.filter((e) => e.source === current.id);
		for (const edge of outgoingEdges) {
			const target = result.find((n) => n.id === edge.target);
			if (!target) continue;

			let expectedChildX = current.position.x;
			if (edge.sourceHandle === "yes") {
				expectedChildX = current.position.x - 240;
			} else if (edge.sourceHandle === "no") {
				expectedChildX = current.position.x + 240;
			}

			if (target.position.x !== expectedChildX) {
				target.position.x = expectedChildX;
				modified = true;
			}

			if (target.position.y !== expectedChildY) {
				target.position.y = expectedChildY;
				modified = true;
			}

			if (!visited.has(target.id)) {
				visited.add(target.id);
				queue.push(target);
			}
		}
	}

	// Any unvisited nodes (disconnected) get aligned below the lowest visited node
	const unvisited = result.filter((n) => !visited.has(n.id));
	if (unvisited.length > 0) {
		const visitedNodes = result.filter((n) => visited.has(n.id));
		let maxY =
			visitedNodes.length > 0
				? Math.max(...visitedNodes.map((n) => n.position.y + getNodeHeight(n)))
				: 60;

		for (const node of unvisited) {
			const expectedY = maxY + CLEAR_NODE_GAP;
			if (node.position.y !== expectedY) {
				node.position.y = expectedY;
				modified = true;
			}
			if (node.position.x !== rootX) {
				node.position.x = rootX;
				modified = true;
			}
			maxY = expectedY + getNodeHeight(node);
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
	const [nodes, setNodes] = useState<WorkflowNode[]>(sanitizedInitialNodes);

	const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(
		workflow.edges,
	);
	const edgesRef = useRef(edges);
	edgesRef.current = edges;

	const handleNodesChange = useCallback(
		(changes: NodeChange<WorkflowNode>[]) => {
			setNodes((currentNodes) => {
				const posChange = changes.find(
					(c): c is NodePositionChange => c.type === "position" && !!c.position,
				);

				if (posChange?.position) {
					const draggedNode = currentNodes.find((n) => n.id === posChange.id);
					if (draggedNode) {
						const dx = posChange.position.x - draggedNode.position.x;
						const dy = posChange.position.y - draggedNode.position.y;

						if (dx !== 0 || dy !== 0) {
							// Move the entire tree together so individual nodes cannot be detached
							const movedNodes = currentNodes.map((node) => ({
								...node,
								position: {
									x: node.position.x + dx,
									y: node.position.y + dy,
								},
							}));

							const otherChanges = changes.filter((c) => c.type !== "position");
							return otherChanges.length > 0
								? applyNodeChanges(otherChanges, movedNodes)
								: movedNodes;
						}
					}
				}

				const updated = applyNodeChanges(changes, currentNodes);
				const hasDimChange = changes.some((c) => c.type === "dimensions");
				if (hasDimChange) {
					return sanitizeNodePositions(updated, edgesRef.current);
				}
				return updated;
			});
		},
		[setNodes],
	);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const workflowIdRef = useRef(workflow.id);
	const skipPersistRef = useRef(false);
	const { fitView } = useReactFlow();
	const softStopKey = `automation-soft-stop:${workflow.id}`;
	const [softStopFlag, setSoftStopFlag] = useState(() => {
		try {
			return window.localStorage.getItem(softStopKey) === "1";
		} catch {
			return false;
		}
	});
	useEffect(() => {
		try {
			setSoftStopFlag(
				window.localStorage.getItem(`automation-soft-stop:${workflow.id}`) ===
					"1",
			);
		} catch {
			setSoftStopFlag(false);
		}
	}, [workflow.id]);
	useEffect(() => {
		if (workflow.status === "active" || workflow.status === "draft") {
			setSoftStopFlag(false);
			try {
				window.localStorage.removeItem(`automation-soft-stop:${workflow.id}`);
			} catch {
				// ignore
			}
		}
	}, [workflow.status, workflow.id]);
	const handleSoftStopChange = useCallback(
		(soft: boolean) => {
			setSoftStopFlag(soft);
			try {
				if (soft) window.localStorage.setItem(softStopKey, "1");
				else window.localStorage.removeItem(softStopKey);
			} catch {
				// ignore
			}
		},
		[softStopKey],
	);
	const softStopped = workflow.status === "paused" && softStopFlag;
	const isReadOnly = workflow.status === "active" || softStopped;

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
				const deepestHeight = getNodeHeight(deepestNode);
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
			const nextNodes = nodes.filter((n) => n.id !== nodeId);

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

	/** Append a step directly below a specific node/handle and connect it with an edge. */
	const addStepBelow = useCallback(
		(
			sourceNodeId: string,
			sourceHandle: string | undefined,
			kind: InsertStepKind,
		) => {
			if (isReadOnly) return;
			const existingAddStep = nodes.find((n) => n.type === "add_step");
			if (existingAddStep && existingAddStep.id !== sourceNodeId) {
				handleDeleteNode(existingAddStep.id);
			}

			const sourceNode = nodes.find((n) => n.id === sourceNodeId);
			if (!sourceNode) return;

			let newNode: WorkflowNode;
			if (kind === "send_email") {
				newNode = createSendEmailNode(nodes.filter(isSendEmailNode).length, 0);
			} else if (kind === "delay") {
				newNode = createDelayNode(nodes.filter(isDelayNode).length, 0);
			} else if (kind === "condition") {
				newNode = createConditionNode(nodes.filter(isConditionNode).length, 0);
			} else {
				newNode = createAddStepNode(sourceHandle);
			}

			const sourceHeight = getNodeHeight(sourceNode);
			const targetY = sourceNode.position.y + sourceHeight + CLEAR_NODE_GAP;

			let targetX = sourceNode.position.x;
			if (sourceHandle === "yes") {
				targetX = sourceNode.position.x - 240;
			} else if (sourceHandle === "no") {
				targetX = sourceNode.position.x + 240;
			}

			newNode.position = { x: targetX, y: targetY };
			newNode.selected = true;

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

			const nextEdges = [...edges, newEdge];
			setEdges(nextEdges);

			setNodes((nds) => {
				const unselected = nds.map((n) =>
					n.selected ? { ...n, selected: false } : n,
				);
				return sanitizeNodePositions([...unselected, newNode], nextEdges);
			});
			setSelectedNodeId(newNode.id);

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
		[nodes, edges, setNodes, setEdges, fitView, isReadOnly, handleDeleteNode],
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

	/** Insert a new step between the two nodes of an edge (plus button on edges). */
	const insertStep = useCallback(
		(edgeId: string, kind: InsertStepKind) => {
			if (isReadOnly) return;
			const existingAddStep = nodes.find((n) => n.type === "add_step");
			if (existingAddStep) {
				handleDeleteNode(existingAddStep.id);
			}

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
			} else if (kind === "condition") {
				newNode = createConditionNode(nodes.filter(isConditionNode).length, 0);
			} else {
				newNode = createAddStepNode(edge.sourceHandle ?? undefined);
			}

			const insertX = target.position.x;
			const insertY = target.position.y;
			newNode.position = { x: insertX, y: insertY };
			newNode.selected = true;

			const branch =
				edge.sourceHandle === "yes" || edge.sourceHandle === "no"
					? edge.sourceHandle
					: undefined;
			const stamp = Date.now();
			const rest = edges.filter((e) => e.id !== edgeId);
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
			const nextEdges = [...rest, first, second];

			setEdges(nextEdges);

			setNodes((nds) => {
				const unselected = nds.map((n) =>
					n.selected ? { ...n, selected: false } : n,
				);
				return sanitizeNodePositions([...unselected, newNode], nextEdges);
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
		[edges, nodes, setNodes, setEdges, fitView, isReadOnly, handleDeleteNode],
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
		const addStepNode = nodes.find((n) => n.type === "add_step");
		if (addStepNode) {
			const inEdge = edges.find((e) => e.target === addStepNode.id);
			const outEdge = edges.find((e) => e.source === addStepNode.id);
			const cleanNodes = nodes.filter((n) => n.id !== addStepNode.id);
			const remainingEdges = edges.filter(
				(e) => e.source !== addStepNode.id && e.target !== addStepNode.id,
			);
			if (inEdge && outEdge && inEdge.source !== outEdge.target) {
				remainingEdges.push({
					id: `e_${inEdge.source}_${outEdge.target}_${Date.now()}`,
					source: inEdge.source,
					target: outEdge.target,
					...(inEdge.sourceHandle ? { sourceHandle: inEdge.sourceHandle } : {}),
					...(outEdge.targetHandle
						? { targetHandle: outEdge.targetHandle }
						: {}),
					type: "flow",
					data: {
						tone: inEdge.data?.tone ?? "default",
						branch: inEdge.data?.branch,
					},
				});
			}
			return onSave(cleanNodes, remainingEdges);
		}
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

	const replaceStep = useCallback(
		(nodeId: string, kind: "send_email" | "condition" | "delay") => {
			if (isReadOnly) return;
			const targetNode = nodes.find((n) => n.id === nodeId);
			if (!targetNode) return;

			let newNode: WorkflowNode;
			if (kind === "send_email") {
				newNode = createSendEmailNode(nodes.filter(isSendEmailNode).length, 0);
			} else if (kind === "delay") {
				newNode = createDelayNode(nodes.filter(isDelayNode).length, 0);
			} else {
				newNode = createConditionNode(nodes.filter(isConditionNode).length, 0);
			}

			newNode.position = { ...targetNode.position };
			newNode.selected = true;

			const nextEdges = edges.map((e) => {
				let updated = e;
				if (e.target === nodeId) {
					updated = { ...updated, target: newNode.id };
				}
				if (e.source === nodeId) {
					updated = {
						...updated,
						source: newNode.id,
						sourceHandle: kind === "condition" ? "yes" : undefined,
					};
				}
				return updated;
			});

			const nextNodes = nodes.map((n) => (n.id === nodeId ? newNode : n));
			const sanitized = sanitizeNodePositions(nextNodes, nextEdges);

			setNodes(sanitized);
			setEdges(nextEdges);
			setSelectedNodeId(newNode.id);

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
		[nodes, edges, setNodes, setEdges, fitView, isReadOnly],
	);

	return (
		<NodeEditorProvider
			value={{
				updateNode: updateNodeData,
				deleteNode: handleDeleteNode,
				insertStep,
				appendStep,
				addStepBelow,
				replaceStep,
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
					softStopped={softStopped}
					onSoftStopChange={handleSoftStopChange}
				/>
				<div className="relative flex min-h-0 flex-1 overflow-hidden">
					<div className="relative min-w-0 flex-1">
						<ReactFlow
							nodes={nodes}
							edges={edges}
							onNodesChange={isReadOnly ? undefined : handleNodesChange}
							onEdgesChange={isReadOnly ? undefined : onEdgesChange}
							onNodeDragStop={handleNodeDragStop}
							nodesDraggable={!isReadOnly}
							nodesConnectable={false}
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
