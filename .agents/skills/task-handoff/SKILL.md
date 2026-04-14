---
name: task-handoff
description: Use when the current request has no remaining deterministic next action and the agent is about to end the interaction by handing control back to the user.
---

# Task Handoff

**PURPOSE:** After completing an assigned task, do not silently end the interaction. Invoke the `vscode_askQuestions` tool to ask the user what to do next.

**TASK HANDOFF IS TERMINAL:** This skill is only for the point where the agent would otherwise stop. It is not a progress-update pattern, not a clarification shortcut, and not a substitute for carrying out obvious next actions.

## BLOCKING REQUIREMENT

Only when the current request is truly at a stopping point — meaning all requested work is done, no explicit next action remains, and the agent is about to end the response — you **MUST** invoke `vscode_askQuestions` as an **actual tool call** instead of silently stopping.

If there is still a concrete action you can take without user input, you **MUST** do that action first and **MUST NOT** invoke handoff yet.

## Do Not Handoff Yet

Do **NOT** invoke this skill in any of these cases:

1. The user's message contains multiple requested actions and only one is finished.
2. You already stated an intended next step like "我接下来会..." and have not executed it yet.
3. Verification, documentation sync, or another required follow-up is already implied by the task and does not need more user input.
4. You are asking a blocking clarifying question needed to continue the current task.
5. You are only at a phase boundary, checkpoint, or partial completion rather than the true end of the current request.

## Pre-Handoff Gate

Before invoking `vscode_askQuestions`, check all of these in order:

1. **Explicit next step?** If the user already asked for another concrete action in the same request, do it now.
2. **Deterministic follow-up?** If the next step is obvious and does not require user choice, do it now.
3. **Outstanding promise?** If you told the user you would inspect, edit, verify, or summarize something, finish that first.
4. **Real stop point?** Only if the only missing input is the user's choice of next topic, priority, or scope should you hand off.

## Required Steps

1. **Detect true completion** — current request is at a real stopping point, not just a local milestone.
2. **INVOKE `vscode_askQuestions` TOOL** — pass a single question with concise options.
3. **Mark one option `recommended: true`** — prefer topic-continuation over generic cleanup.
4. **Fallback** — only if `vscode_askQuestions` is unavailable, ask the same question in plain text.

## Recommendation Priority

Prefer these recommendation types (in order):

1. **Topic continuation** — the logical next step within the same domain/feature/topic  
   Example: "继续验证当前 hook 配置是否按预期触发"
2. **Adjacent concern** — a closely related area surfaced during the task  
   Example: "检查当前改动是否需要同步更新文档或测试"
3. **Generic hygiene** — only if nothing more specific applies  
   Example: "确认当前所有改动无误后提交"

## Tool Call Template

```json
{
  "questions": [
    {
      "header": "下一步操作",
      "question": "当前任务已完成，接下来你希望做什么？",
      "options": [
        { "label": "[topic-continuation option]", "recommended": true, "description": "最自然的后续步骤" },
        { "label": "[adjacent concern option]" },
        { "label": "暂时不做其他操作，先收尾" }
      ]
    }
  ]
}
```

## Anti-Patterns

- **DO NOT** end the interaction without invoking `vscode_askQuestions` tool.
- **DO NOT** invoke handoff while there is still a concrete next action you can execute yourself.
- **DO NOT** hand off after completing only one subtask of a larger request.
- **DO NOT** use handoff to avoid verification, cleanup, or documentation updates already implied by the task.
- **DO NOT** substitute a tool call with plain text like "接下来你想做什么？".
- **DO NOT** recommend unrelated refactors or cleanup unless they were explicitly part of the task.
- **DO NOT** ask multiple follow-up questions at once — one handoff question is enough.
- **DO NOT** use vague options like "继续做其他事情" — be specific to the current topic.

## Good vs Bad Timing

**Bad timing:**
- User asks: "修复问题，然后跑一遍验证，再告诉我结果。"
- Agent修完代码后立刻 handoff。
- Why wrong: verification is still a deterministic next action.

**Good timing:**
- User asks: "修复问题，然后跑一遍验证，再告诉我结果。"
- Agent修复 → 验证 → 汇总结果。
- Only then, if interaction would otherwise end, invoke `vscode_askQuestions`.

## Example

Task completed: 修复了 Stop hook 的编码乱码问题

Correct behavior: invoke `vscode_askQuestions` with:
```json
{
  "questions": [
    {
      "header": "下一步操作",
      "question": "编码修复已完成，接下来你希望做什么？",
      "options": [
        { "label": "验证修复效果：触发一次 Stop hook 观察输出是否正常", "recommended": true },
        { "label": "延伸优化：检查其他 hook 脚本是否有相同编码风险" },
        { "label": "暂时结束，稍后再看" }
      ]
    }
  ]
}
```
