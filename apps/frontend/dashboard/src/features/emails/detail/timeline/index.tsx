"use client";

import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import {
	type Edge,
	type NodeTypes,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Fragment, useEffect, useMemo } from "react";
import { TimelineFlowEdge } from "./timeline-flow-edge";
import {
	type TimelineFlowNode,
	TimelineFlowNodeComponent,
} from "./timeline-flow-node";
import type { EmailEvent } from "./types";

const nodeTypes: NodeTypes = {
	timelineStep: TimelineFlowNodeComponent,
};

const edgeTypes = {
	timelineEdge: TimelineFlowEdge,
};

const proOptions = { hideAttribution: true };

function FlowAutoFitter() {
	const { fitView } = useReactFlow();

	useEffect(() => {
		fitView({ padding: 0.18, maxZoom: 1, minZoom: 0.3 });

		const handleResize = () => {
			fitView({ padding: 0.18, maxZoom: 1, minZoom: 0.3 });
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [fitView]);

	return null;
}

const STEP_SPACING = 220;

export function EmailTimeline({
	events,
	sentAt,
	deliveredAt,
	failedAt,
	errorMessage,
	isLoading,
	onDeliveredClick,
}: {
	events: EmailEvent[];
	sentAt?: string | null;
	deliveredAt?: string | null;
	failedAt?: string | null;
	errorMessage?: string | null;
	isLoading?: boolean;
	/** Open delivered details sidebar when the completed Delivered step is clicked */
	onDeliveredClick?: () => void;
}) {
	const isFailed = useMemo(() => {
		return (
			!!errorMessage ||
			!!failedAt ||
			events.some(
				(e) =>
					e.type === "bounced" || e.type === "failed" || e.type === "complaint",
			)
		);
	}, [errorMessage, failedAt, events]);

	// Synthesize events for sent, delivered, and failed if they don't exist in the events array
	const allEvents = useMemo(() => {
		const list = [...(events || [])];

		if (sentAt && !list.find((e) => e.type === "sent")) {
			list.push({
				id: "synth-sent",
				type: "sent",
				createdAt: sentAt,
				metadata: {},
			});
		}

		const bounceEvent = list.find(
			(e) =>
				e.type === "bounced" || e.type === "complaint" || e.type === "failed",
		);

		if (isFailed && bounceEvent && bounceEvent.type !== "failed") {
			list.push({
				...bounceEvent,
				id: `${bounceEvent.id}-as-failed`,
				type: "failed",
			});
		} else if (isFailed && !bounceEvent) {
			list.push({
				id: "synth-failed",
				type: "failed",
				createdAt: failedAt || sentAt || new Date().toISOString(),
				metadata: {},
			});
		}

		if (!isFailed && deliveredAt && !list.find((e) => e.type === "delivered")) {
			list.push({
				id: "synth-delivered",
				type: "delivered",
				createdAt: deliveredAt,
				metadata: {},
			});
		}

		return list;
	}, [events, sentAt, isFailed, failedAt, deliveredAt]);

	const rawSteps = useMemo(() => {
		if (isFailed) {
			return [
				{
					id: "sent",
					slotIndex: 0,
					stepType: "sent",
					label: "Sent",
					icon: "send-1",
				},
				{
					id: "failed",
					slotIndex: 1,
					stepType: "failed",
					label: "Failed",
					icon: "cross-circle",
				},
				{
					id: "anchor",
					slotIndex: 3,
					stepType: "anchor",
					label: "",
					icon: "",
				},
			];
		}
		return [
			{
				id: "sent",
				slotIndex: 0,
				stepType: "sent",
				label: "Sent",
				icon: "send-1",
			},
			{
				id: "delivered",
				slotIndex: 1,
				stepType: "delivered",
				label: "Delivered",
				icon: "check-circle",
				onClick: onDeliveredClick,
				isInteractive: !!onDeliveredClick,
			},
			{
				id: "opened",
				slotIndex: 2,
				stepType: "opened",
				label: "Opened",
				icon: "eye-outline",
			},
			{
				id: "clicked",
				slotIndex: 3,
				stepType: "clicked",
				label: "Clicked",
				icon: "cursor-click",
			},
		];
	}, [isFailed, onDeliveredClick]);

	const nodes: TimelineFlowNode[] = useMemo(() => {
		return rawSteps.map((step) => {
			const event = allEvents.find((e) => e.type === step.stepType);
			const isCompleted = !!event;
			const timestamp = event?.createdAt;

			return {
				id: step.id,
				type: "timelineStep" as const,
				position: { x: step.slotIndex * STEP_SPACING, y: 0 },
				data: {
					stepType: step.stepType,
					label: step.label,
					icon: step.icon,
					isCompleted,
					timestamp,
					onClick: step.onClick,
					isInteractive: step.isInteractive,
					hasTarget: step.slotIndex > 0 && step.stepType !== "anchor",
					hasSource:
						step.slotIndex < (isFailed ? 1 : 3) && step.stepType !== "anchor",
				},
				draggable: false,
				selectable: false,
				focusable: false,
			};
		});
	}, [rawSteps, allEvents, isFailed]);

	const edges: Edge[] = useMemo(() => {
		if (isFailed) {
			return [
				{
					id: "e-sent-failed",
					source: "sent",
					target: "failed",
					type: "timelineEdge",
				},
			];
		}
		return [
			{
				id: "e-sent-delivered",
				source: "sent",
				target: "delivered",
				type: "timelineEdge",
			},
			{
				id: "e-delivered-opened",
				source: "delivered",
				target: "opened",
				type: "timelineEdge",
			},
			{
				id: "e-opened-clicked",
				source: "opened",
				target: "clicked",
				type: "timelineEdge",
			},
		];
	}, [isFailed]);

	if (isLoading) {
		const loadingSteps = [
			{ label: "Sent", icon: "send-1" },
			{ label: "Delivered", icon: "check-circle" },
			{ label: "Opened", icon: "eye-outline" },
			{ label: "Clicked", icon: "cursor-click" },
		];
		return (
			<div className="relative flex h-[128px] w-full items-center justify-between gap-0 rounded-3xl border border-stroke-soft-100 bg-bg-white-0 px-8 py-4 transition-all hover:border-stroke-soft-200">
				{loadingSteps.map((step, index) => (
					<Fragment key={index}>
						<div className="flex min-w-[70px] flex-grow flex-col items-center gap-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400">
								<Icon name={step.icon} className="h-5 w-5 opacity-40" />
							</div>
							<div className="flex flex-col items-center text-center">
								<span className="rounded-md bg-bg-weak-50 px-2 py-1 font-semibold text-text-soft-400 text-xs">
									{step.label}
								</span>
								<Skeleton className="mx-auto mt-1 h-3 w-16 rounded-md" />
							</div>
						</div>
						{index < loadingSteps.length - 1 && (
							<div className="mt-5 h-0 flex-1 border-stroke-soft-100 border-t-[1.5px] border-dashed" />
						)}
					</Fragment>
				))}
			</div>
		);
	}

	return (
		<div className="relative h-[128px] w-full overflow-hidden rounded-3xl border border-stroke-soft-100 bg-bg-white-0 transition-all hover:border-stroke-soft-200">
			<ReactFlowProvider>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					nodesDraggable={false}
					nodesConnectable={false}
					nodesFocusable={false}
					elementsSelectable={false}
					panOnDrag={false}
					zoomOnScroll={false}
					zoomOnPinch={false}
					zoomOnDoubleClick={false}
					preventScrolling={false}
					proOptions={proOptions}
					fitView
					fitViewOptions={{
						padding: 0.18,
						maxZoom: 1,
						minZoom: 0.3,
					}}
					aria-label="Email Delivery Timeline"
					className="pointer-events-auto select-none [&_.react-flow__viewport]:transition-transform [&_.react-flow__viewport]:duration-200"
				>
					<FlowAutoFitter key={`${isFailed}-${allEvents.length}`} />
				</ReactFlow>
			</ReactFlowProvider>
		</div>
	);
}
