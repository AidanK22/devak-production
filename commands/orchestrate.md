# Orchestrate

`devak session <chain> "<task>"`

Chains:

- `feature`: planner, architect, builder, code-reviewer, verifier, release-manager
- `bugfix`: planner, builder, code-reviewer, verifier
- `review`: code-reviewer, security-reviewer, verifier
- `council`: council, planner

The producer fills each handoff, then runs `devak validate` before the next role starts.

Roles talk only through the handoff file. They do not keep a second channel.
