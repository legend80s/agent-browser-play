````
**agent-browser** 是 Vercel 实验室开发的一款**专为 AI 智能体设计的浏览器自动化命令行工具**。它的核心理念是"少即是多"，通过独特的 **"快照 + 引用标识 (refs)"** 机制，让 AI 能够以极低的 token 成本高效、稳定地控制浏览器，执行点击、填表、数据抓取等复杂任务。

### 核心特性与设计哲学

与传统的浏览器自动化工具（如 Playwright、Puppeteer）不同，agent-browser 针对 AI 的上下文窗口进行了极致优化。传统工具向 AI 返回的信息往往非常冗长，一次页面快照可能消耗数千甚至上万 token，而 agent-browser 通过精简输出，最高可减少 **82.5%** 的 token 消耗，让 AI 的推理更高效、成本更低。

其核心工作流是一个高效的闭环：

```mermaid
flowchart LR
    A[agent-browser open] --> B[agent-browser snapshot -i]
    B --> C{AI 决策}
    C -->|点击| D[agent-browser click @e1]
    C -->|输入| E[agent-browser **fill** @e2 "内容"]
    D --> F[获取结果/重新快照]
    E --> F
    F --> B
````

### 关键概念：snapshot + refs

这是 agent-browser 最具革命性的设计，完美解决了 AI 理解网页结构的难题：

1. **snapshot（快照）**：执行 `agent-browser snapshot -i` 命令，工具不会返回臃肿的 DOM 树或完整的可访问性树，而是只返回页面上**可交互元素**的精简列表。
2. **refs（引用标识）**：每个可交互元素都会被赋予一个稳定的标识符，如 `[ref=e1]`、`[ref=e2]`。

**示例输出**：

```text
- link "S Snip.ly" [ref=e1]
- link "Home" [ref=e2]
- link "Dashboard" [ref=e3]
- link "Analytics" [ref=e4]
- button "Switch to dark mode" [ref=e6]
- textbox "Paste your long URL here..." [ref=e8]
- button "Shorten URL" [ref=e9]
```

AI 看到这个快照后，可以直接使用 `@e8` 和 `@e9` 这样的引用来执行操作，无需自己编写脆弱且易变的 CSS 选择器或 XPath。

### 与其他工具的对比

| 特性           | agent-browser                        | Playwright / Puppeteer          |
| :------------- | :----------------------------------- | :------------------------------ |
| **设计目标**   | 为 AI Agent 原生设计，精简输出       | 通用的自动化测试/爬虫框架       |
| **上下文效率** | **极高**，单次快照仅数百字符         | 较低，信息冗长，易超 token 限制 |
| **元素定位**   | 通过 `snapshot` 获取的 `@ref` 标识符 | 需要手动编写 CSS 选择器或 XPath |
| **上手难度**   | 极低，CLI 命令即学即用               | 中等，需要编程语言基础和库理解  |
| **语言/环境**  | 独立二进制 CLI，任何语言均可调用     | 通常需集成 Node.js/Python 库    |

### 快速安装与使用

安装过程非常简单，无需手动下载浏览器驱动：

```bash
# 1. 全局安装
npm install -g agent-browser

# 2. 安装内置浏览器（自动完成）
agent-browser install
```

**基础命令示例**：

```bash
# 打开网页
agent-browser open https://example.com

# 获取可交互元素快照（核心步骤）
agent-browser snapshot -i

# 通过引用标识点击按钮
agent-browser click @e1

# 通过引用标识填写输入框
agent-browser fill @e2 "Hello, Agent!"

# 截图
agent-browser screenshot page.png

# 关闭浏览器
agent-browser close
```

### 适用场景与集成

- **AI 编程助手**：可无缝集成到 Claude Code、Cursor 等工具中，让 AI 在完成代码编写后，自动打开浏览器验证页面功能。
- **智能体工作流**：作为通用 Agent 的核心工具，用于自动化的表单提交、跨网站数据采集、RPA 任务执行等。
- **开发者工具**：替代传统爬虫框架，快速编写轻量级的浏览器自动化脚本。

通过将复杂的浏览器控制封装为简洁的 CLI 命令，并引入 `snapshot` + `refs` 的创新范式，agent-browser 正在成为 AI 时代连接数字世界与物理操作的关键桥梁。

```

```
