# AGENTS.md

## Laya 项目约束

- 只要问题涉及 LayaAir 项目、运行时行为、场景树、UI 绑定、Prefab、组件、渲染、相机、输入、动画、资源加载或日志排查，必须优先使用 MCP 读取运行时状态、日志和节点信息。
- 禁止只靠文件检索、静态 grep、猜测代码行为来下结论。
- 在回答 Laya 相关问题前，必须先验证运行时事实；如果 MCP 不可用，必须明确说明不可用，再退回到本地文件检查。
- 对于“为什么画面和代码不一致”“为什么编译后行为变了”“为什么节点/visible/层级不符合预期”这类问题，必须优先查 MCP，而不是只看源码。
- 如果已经通过 MCP 得到运行时证据，回答时要基于证据说明原因，不要用推测代替验证。


- Do not generate any UI in code without explicit user permission; use existing scene/prefab nodes and the placeholder image asset instead of drawRect/drawCircle fallbacks.
