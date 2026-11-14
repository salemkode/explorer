import { createRenderer } from "vue";

// Minimal Vue host for behavior tests: real setup/render lifecycles, no browser UI.
interface RenderNode {
	type: string;
	text: string;
	children: RenderNode[];
	parent?: RenderNode;
	props: Map<string, unknown>;
}

export function createNode(type: string, text = "") {
	const children: RenderNode[] = [];
	return { type, text, children, props: new Map<string, unknown>() };
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
