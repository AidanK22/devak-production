# Handoff protocol

A handoff is a markdown file with these sections: From, To, Context, Findings, Files, Open questions, Recommendations, Gate.

Gate is `continue`, `needs-human`, or `blocked`.

`devak validate <file>` checks the sections. An invalid handoff does not start the next role.

Append handoffs. Do not rewrite an earlier role's file.
