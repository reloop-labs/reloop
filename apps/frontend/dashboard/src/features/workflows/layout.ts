import {
	TRIGGER_NODE_ID,
	type WorkflowEdge,
	type WorkflowNode,
} from "./workflow-types";

/** Vertical room between one node's bottom edge and the next node's top edge. */
export const NODE_GAP_Y = 56;
/** How far below a condition its Yes/No paths fork apart. */
export const BRANCH_SPLIT_DROP = 24;
/** Horizontal room between two sibling branches. */
const BRANCH_GAP_X = 56;
/** Every step renders as a tabbed 400px frame (see NodeFrame), at rest or editing. */
const NODE_SIZE = { width: 400, height: 95 };
/** Smallest distance from a condition's center to each branch's center. */
export const BRANCH_OFFSET = NODE_SIZE.width / 2 + BRANCH_GAP_X / 2;
/** Half-width of the dangling "+" that stands in for an empty branch. */
const STUB_HALF_WIDTH = 16;
/** Horizontal room between disconnected columns. */
const COLUMN_GAP_X = 56;

export const getNodeSize = (node: WorkflowNode) => ({
	width: node.measured?.width ?? NODE_SIZE.width,
	// `??`, not `||`: a step opening from 0px height must count as 0.
	height: node.measured?.height ?? NODE_SIZE.height,
});

type Extent = { left: number; right: number };

/**
 * Lays the graph out top-to-bottom: every step sits centered under its parent.
 * A condition forks from its bottom center into a Yes path on the left and a
 * No path on the right, spaced so neither subtree overlaps the other.
 * Positions are derived purely from the graph, so nodes are never dragged out
 * of line.
 */
export function layoutWorkflow(
	nodes: WorkflowNode[],
	edges: WorkflowEdge[],
): WorkflowNode[] {
	if (nodes.length === 0) return nodes;
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const positions = new Map<string, { x: number; y: number }>();
	const visited = new Set<string>();

	const childOf = (id: string, handle?: string) => {
		const edge = edges.find(
			(e) =>
				e.source === id &&
				(handle === undefined
					? e.sourceHandle !== "no"
					: (e.sourceHandle ?? undefined) === handle),
		);
		return edge ? byId.get(edge.target) : undefined;
	};

	/** How far a subtree reaches left/right of its root's center. */
	const extentMemo = new Map<string, Extent>();
	const extentOf = (node: WorkflowNode, seen: Set<string>): Extent => {
		const cached = extentMemo.get(node.id);
		if (cached) return cached;
		const half = getNodeSize(node).width / 2;
		let ext: Extent = { left: half, right: half };
		seen.add(node.id);
		const sub = (child?: WorkflowNode): Extent =>
			child && !seen.has(child.id)
				? extentOf(child, seen)
				: { left: STUB_HALF_WIDTH, right: STUB_HALF_WIDTH };

		if (node.type === "condition") {
			const { yesOffset, noOffset, yesExt, noExt } = branchOffsets(node, sub);
			ext = {
				left: Math.max(half, yesOffset + yesExt.left),
				right: Math.max(half, noOffset + noExt.right),
			};
		} else {
			const next = childOf(node.id);
			if (next && !seen.has(next.id)) {
				const c = extentOf(next, seen);
				ext = { left: Math.max(half, c.left), right: Math.max(half, c.right) };
			}
		}
		extentMemo.set(node.id, ext);
		return ext;
	};

	const branchOffsets = (
		node: WorkflowNode,
		sub: (child?: WorkflowNode) => Extent,
	) => {
		const yesExt = sub(childOf(node.id, "yes"));
		const noExt = sub(childOf(node.id, "no"));
		return {
			yesExt,
			noExt,
			yesOffset: Math.max(BRANCH_OFFSET, yesExt.right + BRANCH_GAP_X / 2),
			noOffset: Math.max(BRANCH_OFFSET, noExt.left + BRANCH_GAP_X / 2),
		};
	};

	const place = (node: WorkflowNode, centerX: number, y: number) => {
		visited.add(node.id);
		const { width, height } = getNodeSize(node);
		positions.set(node.id, { x: centerX - width / 2, y });
		const nextY = y + height + NODE_GAP_Y;

		if (node.type === "condition") {
			const seen = new Set(visited);
			const { yesOffset, noOffset } = branchOffsets(node, (child) =>
				child && !seen.has(child.id)
					? extentOf(child, seen)
					: { left: STUB_HALF_WIDTH, right: STUB_HALF_WIDTH },
			);
			const yes = childOf(node.id, "yes");
			if (yes && !visited.has(yes.id)) place(yes, centerX - yesOffset, nextY);
			const no = childOf(node.id, "no");
			if (no && !visited.has(no.id)) place(no, centerX + noOffset, nextY);
			return;
		}

		const next = childOf(node.id);
		if (next && !visited.has(next.id)) place(next, centerX, nextY);
	};

	const root =
		byId.get(TRIGGER_NODE_ID) ??
		nodes.find((n) => !edges.some((e) => e.target === n.id)) ??
		nodes[0];
	let right = 0;
	if (root) {
		place(root, 0, 0);
		right = extentOf(root, new Set()).right;
	}

	// Anything not reachable from the trigger lines up in its own column.
	for (const node of nodes) {
		if (visited.has(node.id)) continue;
		const ext = extentOf(node, new Set(visited));
		const center = right + COLUMN_GAP_X + ext.left;
		place(node, center, 0);
		right = center + ext.right;
	}

	let changed = false;
	const next = nodes.map((node) => {
		const pos = positions.get(node.id);
		if (!pos) return node;
		if (node.position.x === pos.x && node.position.y === pos.y) return node;
		changed = true;
		return { ...node, position: pos };
	});
	return changed ? next : nodes;
}

/**
 * Older drafts may contain the retired inline "add_step" placeholder node.
 * Drop it and stitch its neighbours back together.
 */
export function stripPlaceholderNodes(
	nodes: WorkflowNode[],
	edges: WorkflowEdge[],
): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
	const placeholders = nodes.filter((n) => (n.type as string) === "add_step");
	if (placeholders.length === 0) return { nodes, edges };
	let nextEdges = edges;
	for (const placeholder of placeholders) {
		const inEdge = nextEdges.find((e) => e.target === placeholder.id);
		const outEdge = nextEdges.find((e) => e.source === placeholder.id);
		nextEdges = nextEdges.filter(
			(e) => e.source !== placeholder.id && e.target !== placeholder.id,
		);
		if (inEdge && outEdge) {
			const fromEdge = placeholder.data?.fromEdge;
			nextEdges.push({
				...inEdge,
				// An insert placeholder restores the connector it replaced.
				id:
					typeof fromEdge === "string"
						? fromEdge
						: `e_${inEdge.source}_${outEdge.target}`,
				target: outEdge.target,
			});
		}
	}
	const ids = new Set(placeholders.map((p) => p.id));
	return { nodes: nodes.filter((n) => !ids.has(n.id)), edges: nextEdges };
}
