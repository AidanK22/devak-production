# Devak production

A coding-agent production line. Roles take a request from plan to a verified change. They talk by writing handoffs. A runner checks the handoff before the next role starts.

The shape comes from [everything-claude-code](https://github.com/vitorinocruz/affaan-m-everything-claude-code): one role per file, plan then build, review before ship, and a written handoff. See `ATTRIBUTION.md`.

## Run

```bash
npm test
node bin/devak.mjs chains
node bin/devak.mjs session feature "Add a session list"
node bin/devak.mjs validate sessions/<id>/handoffs/01-planner.md
```

`npm test` checks the handoff gate. `sessions/` is local run output and is gitignored.

A verifier handoff records the command it ran and the exit code. A missing exit code is `blocked`. Other roles stay valid without those sections.

## Layout

| Path | What it holds |
| --- | --- |
| `agents/` | One role each |
| `commands/` | orchestrate, council, verify |
| `skills/` | Handoff, one-click workflow, verification |
| `rules/` | Rules every role follows |
| `hooks/hooks.json` | Start, handoff, and side-effect gates |
| `apps/` | Later product briefs. Not this build |

## Next application

Pick a brief under `apps/` only after a council verdict. The brief does not start itself.
