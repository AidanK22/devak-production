# Code rules

- Test the behavior the operator will run.
- Validate input at the boundary. Fail with a message that names the field.
- Do not build a shell command, a file path, or a request URL from raw visitor input.
- Return new data from a change. Do not quietly rewrite a handoff that already shipped.
