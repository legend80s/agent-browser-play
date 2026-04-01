---
name: deepseek-translator
description: 使用 DeepSeek 网站翻译本地文件并保存到本地。当用户说"翻译某某文件"、"用 DeepSeek 翻译这个"、"帮我翻译下这个"等类似需求时使用此技能。必选参数：需要翻译的文件路径（必须是已存在的文件）。如果用户没有提供文件路径，需要提示用户输入。输出文件命名规则：原文件名.zh.md（如 13.md → 13.zh.md）。
---

## 使用方法

1. **获取文件路径**：如果用户没有提供文件路径，提示用户输入
2. **验证文件存在**：检查文件是否存在于本地，如果不存在则报错
3. **执行翻译**：调用当前目录下的 `deepseek.ts` 脚本

```bash
cd /Users/legend80s/github/agent-browser-play/.opencode/skills/deepseek-translator
bun deepseek.ts <文件路径>
```

## 注意事项

- 文件路径必须是绝对路径或相对于当前工作目录的路径
- 翻译结果会保存为 `<原文件名>.zh.md`
- 如果用户未登录 DeepSeek，脚本会提示用户登录
- 翻译要求：输出 markdown 格式、保留图片、图片 alt 无需翻译、通俗易懂、多用短句