# AI Committer

用 Vercel AI SDK v5 生成 Git 提交信息的 VS Code 扩展。默认使用 OpenAI-compatible 接口，因此可以对接市面上大多数模型/网关/私有部署（只要兼容 OpenAI 风格的 `/v1` API）。

## 使用方式

1) 设置 API Key（全局）

- 打开命令面板，运行：`AI Committer: Set API Key`
- API Key 会保存到 VS Code SecretStorage，不会写入 `settings.json`

2) 配置模型与网关（必须）

在 VS Code Settings 里搜索 `aiCommitter`，至少配置：

- `aiCommitter.baseURL`：OpenAI-compatible baseURL（必填）
- `aiCommitter.model`：模型 ID（必填）

示例：

- OpenRouter：`https://openrouter.ai/api/v1`
- Ollama（OpenAI 兼容模式）：`http://localhost:11434/v1`

3) 生成提交信息

- 先把改动 `git add` 进暂存区（staged）
- 运行命令：`AI Committer: Generate Commit Message`
- 生成结果会写入 Source Control 的提交输入框

## 提交风格

- `aiCommitter.commitStyle = auto | conventional | simple`
- `auto` 会根据最近提交记录推断是否使用 Conventional Commits；如果历史不足/不确定，默认降级为 `simple`

## 常见配置

- `aiCommitter.temperature`：默认 0.2（更稳定）
- `aiCommitter.maxDiffChars`：限制传入模型的 diff 字符数，避免超长失败
- `aiCommitter.authHeaderName` / `aiCommitter.authHeaderValuePrefix`：适配不同鉴权头（如 `x-api-key` / 不带 Bearer）
- `aiCommitter.extraHeaders`：额外 HTTP 头（非敏感），例如 OpenRouter 的 `HTTP-Referer` / `X-Title`
