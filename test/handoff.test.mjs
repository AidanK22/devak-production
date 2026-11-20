import assert from "node:assert/strict";
import test from "node:test";
import { chains, handoffTemplate, validateHandoff } from "../bin/devak.mjs";

test("a filled handoff continues the line", () => {
  const result = validateHandoff(handoffTemplate("planner", "architect"));
  assert.equal(result.ok, true);
  assert.equal(result.handoff.gate, "continue");
  assert.equal(result.handoff.from, "planner");
  assert.equal(result.handoff.to, "architect");
});

test("a handoff without context does not pass", () => {
  const result = validateHandoff("## From\nplanner\n## To\narchitect\n## Gate\ncontinue\n");
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("missing context"));
});

test("posting, paying, and filing stop at a human gate", () => {
  const text = handoffTemplate("release-manager", "producer").replace(
    "continue",
    "needs-human",
  );
  const result = validateHandoff(text);
  assert.equal(result.ok, true);
  assert.equal(result.handoff.gate, "needs-human");
});

test("a verifier handoff with npm test and exit code 0 continues", () => {
  const text = handoffTemplate("verifier", "release-manager")
    .replace("(command)", "npm test")
    .replace("(missing)", "0");
  const result = validateHandoff(text);
  assert.equal(result.ok, true);
  assert.equal(result.handoff.gate, "continue");
  assert.equal(result.handoff.command, "npm test");
  assert.equal(result.handoff.exitCode, 0);
});

test("a verifier handoff without an exit code is blocked", () => {
  const text = handoffTemplate("verifier", "release-manager").replace(
    "## Exit code\n(missing)\n",
    "",
  );
  const result = validateHandoff(text);
  assert.equal(result.ok, false);
  assert.equal(result.handoff.gate, "blocked");
  assert.ok(result.errors.includes("missing exit code"));
});

test("a verifier handoff without a command is not ok", () => {
  const text = handoffTemplate("verifier", "release-manager")
    .replace("(command)", "")
    .replace("(missing)", "0");
  const result = validateHandoff(text);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes("missing command"));
  assert.equal(result.handoff.exitCode, 0);
  assert.equal(result.handoff.gate, "continue");
});

test("a blank verifier template fails closed on the missing exit code", () => {
  const result = validateHandoff(handoffTemplate("verifier", "producer"));
  assert.equal(result.ok, false);
  assert.equal(result.handoff.gate, "blocked");
  assert.ok(result.errors.includes("missing exit code"));
});

test("a planner handoff without a command or exit code still validates", () => {
  const result = validateHandoff(handoffTemplate("planner", "architect"));
  assert.equal(result.ok, true);
  assert.equal(result.handoff.from, "planner");
  assert.equal(result.handoff.command, "");
  assert.equal(result.handoff.exitCode, null);
  assert.equal(result.handoff.gate, "continue");
});

test("the feature chain ends at release, not at the first draft", () => {
  assert.deepEqual(chains.feature.at(-1), "release-manager");
  assert.ok(chains.feature.includes("verifier"));
  assert.ok(!chains.feature.includes("media-editor"));
});
