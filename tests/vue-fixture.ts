import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { compileScript, parse } from "@vue/compiler-sfc";
import { plugin } from "bun";
import { type Component, createRenderer, h, markRaw } from "vue";

// Compile the actual SFCs; exercise Vue updates without a browser or a test-only UI copy.
plugin({
	name: "vue-fixture",
	setup(build) {
		build.onResolve({ filter: /^[~@]\// }, ({ path }) => ({
			path: Bun.resolveSync(
				resolve(import.meta.dir, "../src", path.slice(2)),
				import.meta.dir,
			),
		}));
		build.onLoad({ filter: /\.vue$/ }, async ({ path }) => {
			const { descriptor } = parse(await readFile(path, "utf8"), {
				filename: path,
			});
			return {
				contents: compileScript(descriptor, { id: path, inlineTemplate: true })
					.content,
				loader: "ts",
			};
		});
	},
});

// Only the host boundary is simulated. Component setup, templates, event handlers,
// computed state, keyed reconciliation, and watchers are Vue's real implementation.
class FixtureNode {
	children: FixtureNode[] = [];
	parent: FixtureNode | null = null;
	props: Record<string, unknown> = {};
	text = "";
	open = false;
	constructor(public tag: string) {}
	showModal() {
		this.open = true;
	}
	close() {
		this.open = false;
	}
}

const renderer = createRenderer<FixtureNode, FixtureNode>({
	createElement: (tag) => markRaw(new FixtureNode(tag)),
	createText: (text) => Object.assign(new FixtureNode("#text"), { text }),
	createComment: () => new FixtureNode("#comment"),
	setText: (node, text) => {
		node.text = text;
	},
	setElementText: (node, text) => {
		node.text = text;
		node.children = [];
	},
	parentNode: (node) => node.parent,
	nextSibling: (node) =>
		node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
	patchProp: (node, key, _previous, value) => {
		node.props[key] = value;
	},
	insert(node, parent, anchor) {
		if (node.parent)
			node.parent.children.splice(node.parent.children.indexOf(node), 1);
		node.parent = parent;
		const index = anchor ? parent.children.indexOf(anchor) : -1;
		parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
	},
	remove(node) {
		if (node.parent)
			node.parent.children.splice(node.parent.children.indexOf(node), 1);
		node.parent = null;
	},
});

export function nodes(root: FixtureNode, tag?: string) {
	const found = [root];
	for (const node of found) found.push(...node.children);
	return tag ? found.filter((node) => node.tag === tag) : found;
}

export function text(root: FixtureNode) {
	return nodes(root)
		.map((node) => node.text)
		.join(" ");
}

export function dispatch(
	node: FixtureNode | undefined,
	event: string,
	value = {},
) {
	const handler = node?.props[event];
	if (typeof handler !== "function")
		throw new Error(`Missing ${event} handler`);
	handler({
		target: node,
		currentTarget: node,
		stopPropagation() {},
		preventDefault() {},
		...value,
	});
}

export function mountFixture(
	component: Component,
	props: object,
	components: Record<string, Component> = {},
) {
	const root = new FixtureNode("root");
	const app = renderer.createApp({ render: () => h(component, props) });
	app.config.globalProperties.$t = (key: string) => key;
	for (const [name, value] of Object.entries(components))
		app.component(name, value);
	app.mount(root);
	return { root, unmount: () => app.unmount() };
}
