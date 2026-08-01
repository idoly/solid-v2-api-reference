# Content and Demo Guide

API pages must explain observable contracts, not restate signatures.

## API prose

Each entry has two short fields:

- **Definition** states what the API does and names the runtime or reactive behavior that distinguishes it.
- **Use case** states when to choose it, why it fits, and a boundary or alternative when that prevents confusion.

Rules:

- Keep each field to one focused paragraph. Do not repeat the function name and package as a fallback definition.
- Avoid standalone fragments such as "Useful for...", "Underlying helper...", or "Tracking is preserved".
- Keep English and Chinese semantically equivalent, but write naturally in each language.
- Use backticks for API names, parameters, JSX components, and literal values.
- Explain internal APIs in terms of their compiler, renderer, hydration, or integration context.
- Model package re-exports explicitly; do not invent different semantics for the same callable symbol.
- Add a Related API only when the comparison helps a reader choose between alternatives.

## Demo focus

Every demo teaches one primary contract of the current API.

- Invoke the current API directly and make its distinctive behavior observable in DOM output or console output.
- Use supporting APIs only to establish the condition being observed.
- Prefer 15-35 lines. More than 45 lines requires a behavior that cannot be shown clearly in a smaller program.
- Do not use timers or animation to imitate reactive behavior.
- Do not repeat a counter when mount/unmount, identity, ordering, pending state, rollback, or request metadata is the real contract.
- Labels should expose evidence such as `Effect runs: 2`, `Same node: true`, or `Phase: rolled back`.
- Browser demos must retain visible output. Server demos must expose meaningful HTML, headers, status, or stream phases.

Choose interactions from the contract:

| Contract                  | Preferred interaction                               |
| ------------------------- | --------------------------------------------------- |
| Value propagation         | Input, increment, or toggle                         |
| Store identity            | Add, remove, update, or reorder rows                |
| Lifecycle and ownership   | Mount and unmount a child scope                     |
| Async state               | Start, resolve, reject, retry, or refresh           |
| Optimistic state          | Start, settle, and rollback                         |
| Error handling            | Trigger an error and recover                        |
| DOM or hydration identity | Compare nodes before and after execution            |
| SSR response behavior     | Inspect status, headers, shell, and resolved output |

## Verification

A demo is complete only when automated verification checks its behavior.

- Browser demos never execute on page entry. Run is explicit; Reset restores generated source and the pre-execution Browser/Console state.
- Generation rejects demos that do not invoke the current API, contain non-English source, fail compilation, duplicate another complete program, or exceed the hard line limit.
- Generic browser verification exercises available controls and rejects warnings, errors, empty output, and interactions with no observable change.
- Important behavioral contracts use targeted scenarios with expected text or DOM identity assertions.
- Catalog generation must be deterministic, and committed catalog artifacts must match a fresh generation run.
