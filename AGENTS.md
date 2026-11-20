# Devak production line

This is a coding-agent line for building applications. The applications are downstream. The line is the product.

## Roles

| Role | Job | Starts when |
| --- | --- | --- |
| producer | Picks the chain and passes handoffs | A request arrives |
| council | Five advisors and a chairman | A new line, app, or irreversible choice |
| planner | Writes the ordered plan | The council verdict, or a bugfix |
| architect | Records the shape and the tradeoff | A feature plan exists |
| builder | Tests first, then implements the plan | The plan is accepted |
| code-reviewer | Checks the diff against the plan | The builder's handoff validates |
| security-reviewer | Checks secrets and side effects | Review chain, or a sensitive diff |
| verifier | Runs the commands and records exit codes | Review is continue |
| release-manager | Records the ship and the human gates | The verifier is green |

## How they talk

A role writes `sessions/<id>/handoffs/<nn>-<role>.md` and stops. The producer validates it and starts the next role. That file is the conversation.

## Chains

- feature: planner -> architect -> builder -> code-reviewer -> verifier -> release-manager
- bugfix: planner -> builder -> code-reviewer -> verifier
- review: code-reviewer -> security-reviewer -> verifier
- council: council -> planner

Open a chain with `node bin/devak.mjs session feature "describe the change"`.

## What the line will not do by itself

Post to an account, move money, or file a report. Those handoffs stop at `needs-human`.
