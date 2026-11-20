#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const chains = {
  feature: ["planner", "architect", "builder", "code-reviewer", "verifier", "release-manager"],
  bugfix: ["planner", "builder", "code-reviewer", "verifier"],
  review: ["code-reviewer", "security-reviewer", "verifier"],
  council: ["council", "planner"],
};

const required = ["from", "to", "context", "findings", "files", "openQuestions", "recommendations"];

export function parseHandoff(markdown) {
  const sections = {};
  let current = null;
  const body = [];
  for (const line of markdown.split("\n")) {
    const heading = /^##\s+(.+)$/.exec(line);
    if (heading) {
      if (current) sections[current] = body.join("\n").trim();
      current = heading[1].trim().toLowerCase().replace(/\s+/g, "-");
      body.length = 0;
      continue;
    }
    if (current) body.push(line);
  }
  if (current) sections[current] = body.join("\n").trim();
  const list = (name) =>
    (sections[name] ?? "")
      .split("\n")
      .map((line) => line.replace(/^- /, "").trim())
      .filter((line) => line && line !== "(none)");
  const exitText = (sections["exit-code"] ?? "").trim();
  const exitCode = /^-?\d+$/.test(exitText) ? Number(exitText) : null;
  return {
    from: sections.from ?? "",
    to: sections.to ?? "",
    context: sections.context ?? "",
    findings: list("findings"),
    files: list("files"),
    openQuestions: list("open-questions"),
    recommendations: list("recommendations"),
    command: (sections.command ?? "").trim(),
    exitCode,
    gate: (sections.gate ?? "continue").trim(),
  };
}

export function validateHandoff(markdown) {
  const handoff = parseHandoff(markdown);
  const errors = [];
  for (const field of required) {
    const value = handoff[field];
    if (Array.isArray(value) ? value.length === 0 && field === "context" : !String(value).trim()) {
      errors.push(`missing ${field}`);
    }
  }
  if (!handoff.context.trim()) errors.push("missing context");
  if (handoff.from === "verifier") {
    if (!handoff.command.trim()) errors.push("missing command");
    if (!Number.isInteger(handoff.exitCode)) {
      errors.push("missing exit code");
      handoff.gate = "blocked";
    }
  }
  if (!["continue", "needs-human", "blocked"].includes(handoff.gate)) {
    errors.push("gate must be continue, needs-human, or blocked");
  }
  return { ok: errors.length === 0, errors, handoff };
}

function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "task";
}

export function handoffTemplate(from, to) {
  const evidence =
    from === "verifier"
      ? `## Command
(command)

## Exit code
(missing)

`
      : "";
  return `## From
${from}

## To
${to}

## Context
(what the previous role decided)

## Findings
- (none)

## Files
- (none)

## Open questions
- (none)

## Recommendations
- (none)

${evidence}## Gate
continue
`;
}

function writeSession(kind, task) {
  const chain = chains[kind];
  if (!chain) {
    throw new Error(`unknown chain ${kind}. Use: ${Object.keys(chains).join(", ")}`);
  }
  const id = `${new Date().toISOString().slice(0, 10)}-${slug(task)}`;
  const dir = path.join(root, "sessions", id);
  fs.mkdirSync(path.join(dir, "handoffs"), { recursive: true });
  fs.writeFileSync(path.join(dir, "request.md"), `# ${task}\n\nChain: ${chain.join(" -> ")}\n`);
  chain.forEach((role, index) => {
    const next = chain[index + 1] ?? "producer";
    fs.writeFileSync(
      path.join(dir, "handoffs", `${String(index + 1).padStart(2, "0")}-${role}.md`),
      handoffTemplate(role, next),
    );
  });
  return { id, dir, chain };
}

function printHelp() {
  console.log(`devak <command>

  session <feature|bugfix|review|council> <task>
  validate <handoff.md>
  chains
`);
}

function main(argv) {
  const [command, ...rest] = argv;
  if (!command || command === "help") {
    printHelp();
    return;
  }
  if (command === "chains") {
    for (const [name, chain] of Object.entries(chains)) {
      console.log(`${name}: ${chain.join(" -> ")}`);
    }
    return;
  }
  if (command === "session") {
    const [kind, ...words] = rest;
    const task = words.join(" ").trim();
    if (!kind || !task) throw new Error("usage: devak session <chain> <task>");
    const session = writeSession(kind, task);
    console.log(`${session.id}\n${session.chain.join(" -> ")}`);
    return;
  }
  if (command === "validate") {
    const file = rest[0];
    if (!file) throw new Error("usage: devak validate <handoff.md>");
    const result = validateHandoff(fs.readFileSync(file, "utf8"));
    if (!result.ok) {
      console.error(result.errors.join("\n"));
      process.exitCode = 1;
      return;
    }
    console.log(`${result.handoff.from} -> ${result.handoff.to} (${result.handoff.gate})`);
    return;
  }
  throw new Error(`unknown command ${command}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
