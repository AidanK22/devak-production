# Attribution

The production-line shape in this repository is adapted from
[everything-claude-code](https://github.com/vitorinocruz/affaan-m-everything-claude-code)
by Affaan Mustafa, MIT License, Copyright (c) 2026 Affaan Mustafa.

That collection is a Claude Code plugin: specialized agents, slash commands,
skills, rules, hooks, and a handoff between agents. This repository keeps that
operating idea and retargets it.

What moved across:

- One role per file, with a narrow tool list.
- Plan before code. Review before ship.
- A written handoff is the only way one role talks to the next.
- Verification is a gate, not a closing paragraph.
- Hooks fire on session start, before a handoff, and before an external side effect.

What did not move across:

- Language packs, marketplace installers, and model-vendor routing.
- Product code for any one application. Example briefs live under `apps/` so a
  later line can pick them up. They are not the line.
