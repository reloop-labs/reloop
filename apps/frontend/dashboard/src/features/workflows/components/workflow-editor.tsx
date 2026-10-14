"use client";

import {
	applyNodeChanges,
	Background,
	BackgroundVariant,
	type FitViewOptions,
	type NodeChange,
	ReactFlow,
	ReactFlowProvider,
	useNodesInitialized,
	useOnSelectionChange,
	useReactFlow,
	ViewportPortal,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { layoutWorkflow, stripPlaceholderNodes } from "../layout";
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
import { getNodeIssue } from "../workflow-validation";
import { useAutomationView } from "./automation-view-tabs";
import { defaultEdgeOptions, edgeTypes, nodeTypes } from "./flow-types";
import { LiveAutomationBanner } from "./live-automation-banner";
import { MetricsView } from "./metrics/metrics-view";
import {
	type MorphFrom,
	NodeEditorProvider,
	type PickerTarget,
	pickerTargetKey,
	type StepKind,
} from "./node-editor-context";
import { RunsView } from "./runs/runs-view";
import { StepPicker } from "./step-picker";
import { WorkflowEditorToolbar } from "./workflow-editor-toolbar";

const prefersReducedMotion = () =>
	typeof window !== "undefined" &&
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const prepareGraph = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
	const clean = stripPlaceholderNodes(nodes, edges);
	return {
		nodes: layoutWorkflow(clean.nodes, clean.edges),
		edges: clean.edges,
	};
};

const createStepNode = (kind: StepKind, nodes: WorkflowNode[]) => {
	if (kind === "send_email") {
		return createSendEmailNode(nodes.filter(isSendEmailNode).length);
	}
	if (kind === "delay")
		return createDelayNode(nodes.filter(isDelayNode).length);
	return createConditionNode(nodes.filter(isConditionNode).length);
};

const branchOf = (handle?: string | null) =>
	handle === "yes" || handle === "no" ? handle : undefined;

const makeEdge = (
	source: WorkflowNode | string,
	target: string,
	sourceHandle?: string | null,
): WorkflowEdge => {
	const sourceId = typeof source === "string" ? source : source.id;
	const branch = branchOf(sourceHandle);
	return {
		id: `e_${sourceId}_${target}_${Date.now()}`,
		source: sourceId,
		target,
		...(sourceHandle ? { sourceHandle } : {}),
		type: "flow",
		data: { tone: branch === "yes" ? "accent" : "default", branch },
	};
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
	// biome-ignore lint/correctness/useExhaustiveDependencies: only lay out once per workflow; later updates flow through state
	const initial = useMemo(
		() => prepareGraph(workflow.nodes, workflow.edges),
		[workflow.id],
	);
	const [view] = useAutomationView();
	const [nodes, setNodes] = useState<WorkflowNode[]>(initial.nodes);
	const [edges, setEdges] = useState<WorkflowEdge[]>(initial.edges);
	const edgesRef = useRef(edges);
	edgesRef.current = edges;

	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [picker, setPicker] = useState<{
		target: PickerTarget;
		anchor: { x: number; y: number };
	} | null>(null);
	const workflowIdRef = useRef(workflow.id);
	const skipPersistRef = useRef(false);
	const { fitView, screenToFlowPosition, getViewport, setViewport } =
		useReactFlow();
	const canvasRef = useRef<HTMLDivElement>(null);

	/**
	 * Pans the canvas up or down just enough that `el` (a step being edited or
	 * the step menu) is fully in view. If it's taller than the canvas, its top
	 * stays in view.
	 */
	const revealElement = useCallback(
		(el: Element | null | undefined) => {
			const canvas = canvasRef.current;
			if (!el || !canvas) return;
			const PAD = 32;
			const view = canvas.getBoundingClientRect();
			const box = el.getBoundingClientRect();
			let dy = 0;
			if (box.top < view.top + PAD) {
				dy = view.top + PAD - box.top;
			} else if (box.bottom > view.bottom - PAD) {
				dy = Math.max(view.bottom - PAD - box.bottom, view.top + PAD - box.top);
			}
			if (Math.abs(dy) < 1) return;
			const viewport = getViewport();
			void setViewport(
				{ ...viewport, y: viewport.y + dy },
				{ duration: prefersReducedMotion() ? 0 : 240 },
			);
		},
		[getViewport, setViewport],
	);

	/** Reveals what `find` returns once it has rendered, and again after it grows. */
	const scheduleReveal = useCallback(
		(find: () => Element | null, delays: number[] = [0, 320]) => {
			for (const delay of delays) {
				if (delay === 0) {
					requestAnimationFrame(() =>
						requestAnimationFrame(() => revealElement(find())),
					);
				} else {
					window.setTimeout(() => revealElement(find()), delay);
				}
			}
		},
		[revealElement],
	);
	const findNodeEl = useCallback(
		(nodeId: string) => () =>
			canvasRef.current?.querySelector(
				`.react-flow__node[data-id="${CSS.escape(nodeId)}"]`,
			) ?? null,
		[],
	);

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
			const next = prepareGraph(workflow.nodes, workflow.edges);
			setNodes(next.nodes);
			setEdges(next.edges);
			setSelectedNodeId(null);
			setPicker(null);
		}
	}, [workflow.id, workflow.nodes, workflow.edges]);

	// Debounced local notify (parent may persist on save only or auto-save)
	useEffect(() => {
		if (skipPersistRef.current) {
			skipPersistRef.current = false;
			return;
		}
		const timer = setTimeout(() => {
			// The insert placeholder is UI-only; never hand it to the parent.
			const clean = stripPlaceholderNodes(nodes, edges);
			onGraphChange(clean.nodes, clean.edges);
		}, 400);
		return () => clearTimeout(timer);
	}, [nodes, edges, onGraphChange]);

	const handleNodesChange = useCallback(
		(changes: NodeChange<WorkflowNode>[]) => {
			setNodes((current) => {
				// Positions come from the layout, never from dragging.
				const relevant = changes.filter((c) => c.type !== "position");
				if (relevant.length === 0) return current;
				const updated = applyNodeChanges(relevant, current);
				return relevant.some((c) => c.type === "dimensions")
					? layoutWorkflow(updated, edgesRef.current)
					: updated;
			});
		},
		[],
	);

	useOnSelectionChange({
		onChange: ({ nodes: selected }) => {
			setSelectedNodeId(selected[0]?.id ?? null);
		},
	});

	const revealGraph = useCallback(() => {
		const duration = prefersReducedMotion() ? 0 : 220;
		const options: FitViewOptions = {
			minZoom: 1,
			maxZoom: 1,
			duration,
			padding: {
				top: "80px",
				bottom: "80px",
				left: "64px",
				right: "64px",
			},
		};
		// Wait a frame so freshly added nodes are measured and laid out.
		requestAnimationFrame(() =>
			requestAnimationFrame(() => void fitView(options)),
		);
	}, [fitView]);

	// Re-center once real node sizes are measured and the layout has settled.
	const nodesInitialized = useNodesInitialized();
	const centeredForRef = useRef<string | null>(null);
	// The canvas remounts when coming back from Runs or Metrics: center it again.
	useEffect(() => {
		if (view !== "editor") centeredForRef.current = null;
	}, [view]);
	useEffect(() => {
		if (!nodesInitialized || centeredForRef.current === workflow.id) return;
		centeredForRef.current = workflow.id;
		revealGraph();
	}, [nodesInitialized, workflow.id, revealGraph]);

	const selectNode = useCallback((nodeId: string | null) => {
		setSelectedNodeId(nodeId);
		setNodes((nds) =>
			nds.map((n) =>
				n.selected === (n.id === nodeId)
					? n
					: { ...n, selected: n.id === nodeId },
			),
		);
	}, []);

	const commitGraph = useCallback(
		(nextNodes: WorkflowNode[], nextEdges: WorkflowEdge[]) => {
			setEdges(nextEdges);
			setNodes(layoutWorkflow(nextNodes, nextEdges));
		},
		[],
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
		[isReadOnly],
	);

	const openPicker = useCallback(
		(target: PickerTarget, anchorEl: HTMLElement) => {
			if (isReadOnly) return;
			// Only one menu at a time: close any open insert placeholder first.
			const base = stripPlaceholderNodes(nodes, edges);
			if (target.type === "insert") {
				// Between two steps the menu becomes a real step-sized box in the
				// flow (pushing later steps down) instead of covering them.
				const edge = base.edges.find((e) => e.id === target.edgeId);
				if (!edge) return;
				const placeholder: WorkflowNode = {
					id: `add_step_${Date.now()}`,
					type: "add_step",
					position: { x: 0, y: 0 },
					// Closing restores this exact connector.
					data: { fromEdge: edge.id },
				};
				commitGraph(
					[
						...base.nodes.map((n) =>
							n.selected ? { ...n, selected: false } : n,
						),
						placeholder,
					],
					[
						...base.edges.filter((e) => e.id !== edge.id),
						makeEdge(edge.source, placeholder.id, edge.sourceHandle),
						makeEdge(placeholder, edge.target),
					],
				);
				setSelectedNodeId(null);
				setPicker(null);
				scheduleReveal(findNodeEl(placeholder.id));
				return;
			}
			if (base.nodes !== nodes) commitGraph(base.nodes, base.edges);
			// "+" buttons: the menu hangs below them. Changing a step's type: the
			// menu sits exactly over that step (the picker adds 8px above).
			const nodeEl =
				target.type === "replace"
					? anchorEl.closest<HTMLElement>(".react-flow__node")
					: null;
			const rect = (nodeEl ?? anchorEl).getBoundingClientRect();
			const anchor = screenToFlowPosition({
				x: rect.left + rect.width / 2,
				y: nodeEl ? rect.top - 8 : rect.bottom,
			});
			setPicker({ target, anchor });
			scheduleReveal(
				() => canvasRef.current?.querySelector("[data-step-picker]") ?? null,
			);
		},
		[
			isReadOnly,
			screenToFlowPosition,
			nodes,
			edges,
			commitGraph,
			scheduleReveal,
			findNodeEl,
		],
	);

	const dropPlaceholders = useCallback(() => {
		const base = stripPlaceholderNodes(nodes, edges);
		if (base.nodes !== nodes) commitGraph(base.nodes, base.edges);
	}, [nodes, edges, commitGraph]);

	const closePicker = useCallback(() => setPicker(null), []);

	const [morph, setMorph] = useState<(MorphFrom & { nodeId: string }) | null>(
		null,
	);
	const clearMorph = useCallback(() => setMorph(null), []);
	// Start pressed while steps need setup: outline them until they're done.
	const [showIssues, setShowIssues] = useState(false);
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset per workflow
	useEffect(() => setShowIssues(false), [workflow.id]);
	const flagIssues = useCallback(() => {
		setShowIssues(true);
		// Bring the first step that needs setup into view.
		const first = nodes.find((n) => getNodeIssue(n));
		if (first) scheduleReveal(findNodeEl(first.id), [0]);
	}, [nodes, scheduleReveal, findNodeEl]);

	const morphRef = useRef(morph);
	morphRef.current = morph;

	// A step's editor opens taller than the step: keep it in view. A step that
	// grows out of the menu is revealed once that animation is done.
	// biome-ignore lint/correctness/useExhaustiveDependencies: only when the selection changes
	useEffect(() => {
		if (!selectedNodeId || isReadOnly) return;
		scheduleReveal(
			findNodeEl(selectedNodeId),
			morphRef.current?.nodeId === selectedNodeId ? [560] : [0, 320],
		);
	}, [selectedNodeId]);

	const addStep = useCallback(
		(target: PickerTarget, kind: StepKind, from?: MorphFrom) => {
			if (isReadOnly) return;
			const newNode = createStepNode(kind, nodes);
			newNode.selected = true;
			// A condition hands the rest of the flow to its Yes path.
			const newNodeHandle = kind === "condition" ? "yes" : undefined;

			let nextEdges: WorkflowEdge[];
			let nextNodes: WorkflowNode[];
			const unselected = nodes.map((n) =>
				n.selected ? { ...n, selected: false } : n,
			);

			if (target.type === "replace") {
				const old = nodes.find((n) => n.id === target.nodeId);
				if (!old) return;
				const outgoing = edges.filter((e) => e.source === old.id);
				if (old.type === kind) {
					// Same type picked: just reopen it.
					setPicker(null);
					selectNode(old.id);
					return;
				}
				if (old.type === "condition" && outgoing.length > 1) {
					toast.error(
						"Remove the steps on one branch before changing this condition",
					);
					setPicker(null);
					return;
				}
				// Keep its place in the flow: rewire both sides to the new step.
				nextEdges = edges.map((e) => {
					if (e.target === old.id) return { ...e, target: newNode.id };
					if (e.source === old.id) {
						return makeEdge(newNode, e.target, newNodeHandle);
					}
					return e;
				});
				nextNodes = unselected.map((n) => (n.id === old.id ? newNode : n));
			} else {
				if (target.type === "append") {
					nextEdges = [
						...edges,
						makeEdge(target.nodeId, newNode.id, target.handle),
					];
				} else {
					const edge = edges.find((e) => e.id === target.edgeId);
					if (!edge) return;
					nextEdges = [
						...edges.filter((e) => e.id !== edge.id),
						makeEdge(edge.source, newNode.id, edge.sourceHandle),
						makeEdge(newNode, edge.target, newNodeHandle),
					];
				}
				nextNodes = [...unselected, newNode];
			}

			commitGraph(nextNodes, nextEdges);
			setSelectedNodeId(newNode.id);
			// The new step grows out of the menu in place, so don't pan here.
			setMorph(from ? { ...from, nodeId: newNode.id } : null);
			setPicker(null);
		},
		[nodes, edges, isReadOnly, commitGraph, selectNode],
	);

	const handleDeleteNode = useCallback(
		(nodeId: string) => {
			if (isReadOnly) return;
			if (nodeId === TRIGGER_NODE_ID) return;

			const nodeToDelete = nodes.find((n) => n.id === nodeId);
			if (!nodeToDelete) return;

			const incomingEdges = edges.filter((e) => e.target === nodeId);
			const outgoingEdges = edges.filter((e) => e.source === nodeId);

			if (nodeToDelete.type === "condition" && outgoingEdges.length > 1) {
				toast.error(
					"Remove the steps on one branch before deleting this condition",
				);
				return;
			}

			const remainingEdges = edges.filter(
				(e) => e.source !== nodeId && e.target !== nodeId,
			);
			const bridgeEdges: WorkflowEdge[] = [];
			for (const inEdge of incomingEdges) {
				for (const outEdge of outgoingEdges) {
					if (inEdge.source === outEdge.target) continue;
					bridgeEdges.push(
						makeEdge(inEdge.source, outEdge.target, inEdge.sourceHandle),
					);
				}
			}

			commitGraph(
				nodes.filter((n) => n.id !== nodeId),
				[...remainingEdges, ...bridgeEdges],
			);
			if (selectedNodeId === nodeId) setSelectedNodeId(null);
			setPicker(null);
			revealGraph();
		},
		[nodes, edges, selectedNodeId, isReadOnly, commitGraph, revealGraph],
	);

	useHotkeys("backspace, delete", () => {
		if (isReadOnly) return;
		if (!selectedNodeId || selectedNodeId === TRIGGER_NODE_ID) return;
		const active = document.activeElement;
		if (
			active instanceof HTMLInputElement ||
			active instanceof HTMLTextAreaElement ||
			(active instanceof HTMLElement && active.isContentEditable)
		) {
			return;
		}
		handleDeleteNode(selectedNodeId);
	}, [selectedNodeId, handleDeleteNode, isReadOnly]);

	useHotkeys("escape", () => {
		if (picker) setPicker(null);
		else if (nodes.some((n) => n.type === "add_step")) dropPlaceholders();
		else if (selectedNodeId) selectNode(null);
	}, [picker, selectedNodeId, selectNode, nodes, dropPlaceholders]);

	const handleSave = () => {
		if (isReadOnly) return;
		const clean = stripPlaceholderNodes(nodes, edges);
		return onSave(clean.nodes, clean.edges);
	};

	const clearSelection = useCallback(() => {
		setPicker(null);
		dropPlaceholders();
		selectNode(null);
	}, [selectNode, dropPlaceholders]);

	return (
		<NodeEditorProvider
			value={{
				updateNode: updateNodeData,
				deleteNode: handleDeleteNode,
				closeEditor: clearSelection,
				editNode: (nodeId: string) => {
					setPicker(null);
					selectNode(nodeId);
				},
				openPicker,
				closePicker,
				activePickerKey: picker ? pickerTargetKey(picker.target) : null,
				morph,
				clearMorph,
				pickStep: addStep,
				removePlaceholder: dropPlaceholders,
				readOnly: isReadOnly,
				showIssues,
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
					onInvalidStart={flagIssues}
				/>
				{view === "runs" ? (
					<RunsView workflow={{ ...workflow, nodes, edges }} />
				) : view === "metrics" ? (
					<MetricsView workflow={{ ...workflow, nodes, edges }} />
				) : (
					<div className="relative flex min-h-0 flex-1 overflow-hidden">
						<div ref={canvasRef} className="relative min-w-0 flex-1">
							<ReactFlow
								nodes={nodes}
								edges={edges}
								onNodesChange={handleNodesChange}
								onNodeClick={(_, node) => {
									setPicker(null);
									if (node.type !== "add_step") dropPlaceholders();
								}}
								nodesDraggable={false}
								nodesConnectable={false}
								nodesFocusable
								elementsSelectable={!isReadOnly}
								connectOnClick={false}
								nodeTypes={nodeTypes}
								edgeTypes={edgeTypes}
								defaultEdgeOptions={defaultEdgeOptions}
								fitView
								fitViewOptions={{
									minZoom: 1,
									maxZoom: 1,
									padding: { x: "64px", y: "80px" },
								}}
								proOptions={{ hideAttribution: true }}
								onPaneClick={clearSelection}
								deleteKeyCode={null}
								zoomOnScroll={false}
								zoomOnPinch={false}
								zoomOnDoubleClick={false}
								zoomActivationKeyCode={null}
								panOnScroll
								panOnDrag
								minZoom={1}
								maxZoom={1}
								className="workflow-canvas bg-bg-weak-50 dark:bg-black"
							>
								<Background
									variant={BackgroundVariant.Dots}
									gap={22}
									size={1.2}
									color="var(--color-stroke-soft-200)"
								/>
								<ViewportPortal>
									{/* `custom`: when a step was picked the menu hands off to the new step instead of fading out. */}
									<AnimatePresence custom={morph !== null}>
										{picker ? (
											<StepPicker
												key={pickerTargetKey(picker.target)}
												anchor={picker.anchor}
												onPick={(kind, from) =>
													addStep(picker.target, kind, from)
												}
												onClose={closePicker}
												connector={picker.target.type !== "replace"}
											/>
										) : null}
									</AnimatePresence>
								</ViewportPortal>
							</ReactFlow>
							{isReadOnly ? (
								<LiveAutomationBanner
									key={workflow.id}
									workflow={{ ...workflow, nodes, edges }}
								/>
							) : null}
						</div>
					</div>
				)}
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
