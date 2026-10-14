"use client";

import {
	applyNodeChanges,
	Background,
	BackgroundVariant,
	type NodeChange,
	ReactFlow,
	ReactFlowProvider,
	useNodesInitialized,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
	EnrollmentDetail,
	StepRun,
} from "../../hooks/use-automations-api";
import { layoutWorkflow, stripPlaceholderNodes } from "../../layout";
import {
	TRIGGER_NODE_ID,
	type WorkflowEdge,
	type WorkflowNode,
} from "../../workflow-types";
import { defaultEdgeOptions, edgeTypes, nodeTypes } from "../flow-types";
import { NodeEditorProvider, type RunOverlay } from "../node-editor-context";

const NOOP = () => {};
/** Space above the trigger when the run opens. */
const TOP_GAP = 48;

/** Latest step run per node (a node can run again after a retry). */
function latestByNode(steps: StepRun[]): Record<string, StepRun> {
	const byNode: Record<string, StepRun> = {};
	for (const step of steps) byNode[step.nodeId] = step;
	return byNode;
}

/** Every step at full strength; the run's state shows on each step instead. */
function prepare(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
	return {
		nodes: nodes.map((node) => ({ ...node, selected: false })),
		edges: edges.map((edge) => ({ ...edge, type: "flow" })),
	};
}

/**
 * The steps drawn read-only, each showing how one run went at it.
 */
const ReadOnlyFlowInner = ({
	graph,
	run,
}: {
	graph: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
	run: RunOverlay;
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { getNode, setViewport } = useReactFlow();

	const marked = useMemo(() => {
		const clean = stripPlaceholderNodes(graph.nodes, graph.edges);
		return prepare(clean.nodes, clean.edges);
	}, [graph]);

	const [nodes, setNodes] = useState<WorkflowNode[]>(() =>
		layoutWorkflow(marked.nodes, marked.edges),
	);
	const edgesRef = useRef(marked.edges);
	edgesRef.current = marked.edges;

	// Status cards change a step's height: lay out again once measured.
	const handleNodesChange = useCallback(
		(changes: NodeChange<WorkflowNode>[]) => {
			setNodes((current) => {
				const relevant = changes.filter(
					(c) => c.type === "dimensions" || c.type === "select",
				);
				if (relevant.length === 0) return current;
				const updated = applyNodeChanges(relevant, current);
				return relevant.some((c) => c.type === "dimensions")
					? layoutWorkflow(updated, edgesRef.current)
					: updated;
			});
		},
		[],
	);

	// Open with the trigger centered at the top, where the run starts, and keep
	// it there while the side panel opening or closing changes the width.
	const nodesInitialized = useNodesInitialized();
	const place = useCallback(() => {
		const trigger = getNode(TRIGGER_NODE_ID);
		const width = containerRef.current?.clientWidth;
		if (!trigger || !width) return;
		const nodeWidth = trigger.measured?.width ?? 400;
		void setViewport({
			x: width / 2 - (trigger.position.x + nodeWidth / 2),
			y: TOP_GAP - trigger.position.y,
			zoom: 1,
		});
	}, [getNode, setViewport]);
	useEffect(() => {
		if (!nodesInitialized) return;
		requestAnimationFrame(place);
		const container = containerRef.current;
		if (!container) return;
		let lastWidth = container.clientWidth;
		const observer = new ResizeObserver(() => {
			if (container.clientWidth === lastWidth) return;
			lastWidth = container.clientWidth;
			place();
		});
		observer.observe(container);
		return () => observer.disconnect();
	}, [nodesInitialized, place]);

	return (
		<NodeEditorProvider
			value={{
				updateNode: NOOP,
				deleteNode: NOOP,
				closeEditor: NOOP,
				editNode: NOOP,
				openPicker: NOOP,
				closePicker: NOOP,
				activePickerKey: null,
				morph: null,
				pickStep: NOOP,
				removePlaceholder: NOOP,
				clearMorph: NOOP,
				readOnly: true,
				run,
			}}
		>
			<div ref={containerRef} className="relative h-full min-w-0 flex-1">
				<ReactFlow
					nodes={nodes}
					edges={marked.edges}
					onNodesChange={handleNodesChange}
					nodesDraggable={false}
					nodesConnectable={false}
					elementsSelectable={false}
					connectOnClick={false}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					defaultEdgeOptions={defaultEdgeOptions}
					proOptions={{ hideAttribution: true }}
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
				</ReactFlow>
			</div>
		</NodeEditorProvider>
	);
};

/** One run drawn on the steps it followed, with how each step went. */
export const RunCanvas = ({ detail }: { detail: EnrollmentDetail }) => {
	const run: RunOverlay = useMemo(
		() => ({
			steps: latestByNode(detail.steps),
			trigger: detail.trigger,
			enrollment: detail.enrollment,
			emails: detail.emails,
		}),
		[detail],
	);
	return (
		<ReactFlowProvider>
			<ReadOnlyFlowInner
				key={detail.enrollment.id}
				graph={detail.graph}
				run={run}
			/>
		</ReactFlowProvider>
	);
};
