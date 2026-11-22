import { expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

test("Vue exact token badge and copy regressions", async () => {
	const fixture = fileURLToPath(
		new URL("./fixtures/token-badge-component.ts", import.meta.url),
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
	}).toEqual({ exitCode: 0, output: "passed" });
});
