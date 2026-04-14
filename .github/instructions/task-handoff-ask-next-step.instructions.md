---
description: "Use when wrapping up a task, preparing a final response, handing off work, or deciding next steps. Requires asking the user via askQuestions what to do next and offering a recommended next action that continues the current topic."
name: "Task Handoff Ask Next Step"
applyTo: "**"
---

# Task Handoff

**BLOCKING REQUIREMENT: When the current request has reached a true stopping point, you MUST invoke the `vscode_askQuestions` TOOL (not plain text) BEFORE ending your response. This is a mandatory terminal tool call, not a progress-update pattern.**

**Do not invoke this instruction early.** If there is still a concrete, deterministic next action you can perform without user input, you must perform it first.

## Stop-Point Gate

Only use handoff when all of the following are true:

1. The current user request has no remaining explicit action items.
2. Any obvious follow-up such as verification, summarization, or required documentation sync is already finished.
3. You are about to end the response and return control to the user.

Do **not** use handoff when you are merely between subtasks, after partial completion, or while waiting to do an obvious next step.

## Required Steps

1. **Detect true completion** — your current task is actually at a terminal stopping point.
2. **INVOKE `vscode_askQuestions` as a tool call** — pass a single question asking what the user wants to do next.
3. **Include a `recommended: true` option** — mark the most natural topic-continuation option as recommended.
4. **Fallback only if the tool is unavailable** — if `vscode_askQuestions` is not callable, ask the same question in plain text.

## Tool Call Structure

```json
{
  "questions": [
    {
      "header": "下一步操作",
      "question": "当前任务已完成，接下来你希望做什么？",
      "options": [
        { "label": "[topic-continuation option]", "recommended": true },
        { "label": "[adjacent concern option]" },
        { "label": "暂时不做其他操作，先收尾" }
      ]
    }
  ]
}
```

## Anti-Patterns

- **DO NOT** invoke handoff while there is still a concrete next action you can execute yourself.
- **DO NOT** hand off after partial completion of a multi-step request.
- **DO NOT** use handoff to avoid verification or another required follow-up already implied by the task.
- **DO NOT** skip the tool call and only write text asking "接下来做什么".
- **DO NOT** end the response without invoking `vscode_askQuestions`.
- **DO NOT** use vague options — be specific to the current topic.
- **DO NOT** ask more than one follow-up question at once.
