# Player 动画播放卡住问题记录

日期：2026-08-10

## 现象

- 角色移动时，`walk` / `run` 逻辑已经发出，但 Spine 实际一直停留在 `idle`。
- 日志里能看到 `request walk`，但动画没有真正切换。
- 只有轻推或短暂切换时，看起来像是前一小段会动，持续移动时会卡住。

## 根因

- `PlayerAnimationController` 里把 `templet.readyState > 0` 当成动画可播放的硬条件。
- 但运行时日志显示：
  - Spine 节点已经绑定成功。
  - `source` 和 `templet` 也已经存在。
  - 但 `readyState` 一直是 `0`。
- 结果是 `sync()` 直接走 `not_ready` 分支，`play()` 没有被调用，`walk/run` 被误挡住，实际播放始终停在 `idle`。

## 修复

- 放宽了 `isReady()` 判断。
- 现在不再依赖 `readyState > 0` 作为唯一条件。
- 只要 Spine 节点已绑定，并且 `templet` 或 `source` 可用，就允许尝试播放动画。

## 结论

- `readyState` 在这个项目/运行时里不是可靠的播放前置条件。
- 后续不要把它作为唯一的可播放判定，否则会再次出现“请求了 walk，但实际仍在 idle”的问题。