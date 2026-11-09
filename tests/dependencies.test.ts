// A dependency nothing imports is still code that gets audited, updated and shipped. Keep the list honest.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  name: string;
  dependencies: Record<string, string>;
};

const source = execFileSync("git", ["ls-files", "-z", "app", "components", "lib", "hooks"], { encoding: "utf8" })
  .split("\0")
  .filter((path) => /\.(tsx?|css)$/.test(path))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

// Used by the framework rather than through an import in the source.
const implicit = new Set(["react-dom"]);

test("every runtime dependency is imported by the app", () => {
  for (const name of Object.keys(pkg.dependencies).filter((dep) => !implicit.has(dep))) {
    const imported = new RegExp(`["']${name.replace("/", "\\/")}(/[^"']*)?["']`).test(source);
    assert.ok(imported, `${name} is a runtime dependency but nothing imports it`);
  }
});

test("the package carries the project's name", () => {
  assert.equal(pkg.name, "alpha-digital-coin");
});
