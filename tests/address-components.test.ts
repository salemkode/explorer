import { expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

test("Vue address integration regressions", async () => {
	// Nuxt composables are process globals in these Bun tests. Isolate the Vue
	// compiler and network stubs from the existing store and USD-price tests.
	const fixture = fileURLToPath(
		new URL("./fixtures/address-components.ts", import.meta.url),
	);
	const child = Bun.spawn([process.execPath, "test", fixture], {
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(child.stdout).text(),
		new Response(child.stderr).text(),
		child.exited,
	]);
	expect({
		exitCode,
		output: exitCode === 0 ? "passed" : stdout + stderr,
	}).toEqual({
		exitCode: 0,
		output: "passed",
	});
});
