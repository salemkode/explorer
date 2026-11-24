import { createRenderer } from "vue";

// Minimal Vue host for behavior tests: real setup/render lifecycles, no browser UI.
interface RenderNode {
	type: string;
	text: string;
	children: RenderNode[];
	parent?: RenderNode;
	props: Map<string, unknown>;
}

// Teleported content (dialogs) renders into the most recently created root, so
// assertions on the mounted tree still see it.
let teleportRoot: RenderNode | null = null;

export function createNode(type: string, text = "") {
	const children: RenderNode[] = [];
	const node = {
		type,
		text,
		children,
		props: new Map<string, unknown>(),
		addEventListener() {},
		removeEventListener() {},
		get options() {
			return children;
		},
	};
	if (type === "root") teleportRoot = node;
	return node;
}

export const renderer = createRenderer<RenderNode, RenderNode>({
	createElement: createNode,
	createText: (text) => createNode("text", text),
	createComment: () => createNode("comment"),
	insert(node, parent, anchor) {
		if (node.parent) {
			node.parent.children.splice(node.parent.children.indexOf(node), 1);
		}
		const index = anchor ? parent.children.indexOf(anchor) : -1;
		parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
		node.parent = parent;
	},
	remove(node) {
		if (node.parent)
			node.parent.children.splice(node.parent.children.indexOf(node), 1);
	},
	setText(node, text) {
		node.text = text;
	},
	setElementText(node, text) {
		node.text = text;
		node.children = [];
	},
	querySelector: () => teleportRoot,
	parentNode: (node) => node.parent || null,
	nextSibling: (node) =>
		node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
	patchProp(node, key, _previous, value) {
		if (key === "textContent") node.text = String(value);
		node.props.set(key, value);
	},
});

export function textContent(node: RenderNode) {
	const text: string[] = [];
	const visit = (current: RenderNode) => {
		text.push(current.text);
		current.children.forEach(visit);
	};
	visit(node);
	return text.join(" ");
}
