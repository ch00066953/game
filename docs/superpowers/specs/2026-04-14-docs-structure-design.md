# 文档分类与规划骨架设计

## 目标

整理当前 `docs/` 下平铺的规划文档，建立轻量且可持续的文档目录结构，并补齐后续高频使用的规划模板。

## 现状

- 当前 `docs/` 下的 4 份文档全部位于同一级目录。
- 这些文档实际已经分属不同类型：参考资料、路线规划、执行任务、验收规范。
- 缺少统一入口文档，分类后会降低可发现性。
- 缺少可复用模板，后续新增文档仍容易继续平铺堆积。

## 设计原则

1. 保持轻量，不引入过细目录层级。
2. 目录名称直接反映用途，降低维护成本。
3. 先解决查找与扩展问题，再补充最小必要模板。
4. 保持现有中文文风和短句式表达。

## 目标目录结构

```text
docs/
  README.md
  planning/
    game-roadmap-2026.md
    game-task-backlog.md
  reference/
    classic-games-by-genre.md
  standards/
    mobile-pc-acceptance-checklist.md
  templates/
    game-project-brief-template.md
    implementation-plan-template.md
  superpowers/
    specs/
      2026-04-14-docs-structure-design.md
```

## 迁移方案

- 将 `classic-games-by-genre.md` 移入 `docs/reference/`。
- 将 `game-roadmap-2026.md` 与 `game-task-backlog.md` 移入 `docs/planning/`。
- 将 `mobile-pc-acceptance-checklist.md` 移入 `docs/standards/`。
- 新增 `docs/README.md` 作为文档导航入口。

## 新增文档骨架

### 1. 单游戏立项模板

用途：新游戏开始前，用于明确目标、玩法循环、MVP 范围、风险和双端输入方案。

### 2. 实施计划模板

用途：立项确认后，用于按 2-6 小时粒度拆分任务、记录验收和依赖。

## 链接与兼容性处理

- 更新现有文档之间的相对链接，避免迁移后失效。
- `docs/README.md` 作为统一入口，减少用户记忆路径成本。
- 根目录级说明文件若引用旧路径，需要一并修正到新路径。

## 非目标

- 本次不建立复杂的归档体系。
- 本次不拆分到按季度、按游戏、按负责人等更细维度。
- 本次不为每个游戏立即补齐完整策划，仅先提供模板。

## 实施后结果

- 文档按类型分区，入口更清晰。
- 规划类新增文档有固定模板可复用。
- 后续扩充打砖块等单游戏策划时，有明确落点和写法。