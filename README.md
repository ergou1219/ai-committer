# AI Committer

中文 | [English](#english)

AI Committer 是一个 VS Code 扩展：使用 Vercel AI SDK v5 调用任意 OpenAI-compatible 网关/大模型来生成 Git 提交信息，并自动写入 Source Control 的提交输入框。

核心特性：

- 支持大多数大模型/网关/私有部署：只要兼容 OpenAI 风格的 `/v1` API（例如 OpenRouter、Ollama OpenAI 兼容模式、自建代理等）
- 只基于 staged 变更生成（staged 为空会提示先 `git add`）
- 支持 Conventional Commits / simple / auto（自动从 git 历史推断，不确定默认 simple）
- 提示词更偏工程化：避免营销化措辞；当使用 `!` 时强制要求 `BREAKING CHANGE: ...`
- 支持在 Git（Source Control）面板右上角按钮一键生成

## 快速开始

1) 设置 API Key（全局）

- 打开命令面板运行：`AI Committer: Set API Key`
- API Key 会保存到 VS Code SecretStorage，不会写入 `settings.json`

2) 配置模型与网关（必须）

在 VS Code Settings 里搜索 `aiCommitter`，至少配置：

- `aiCommitter.baseURL`：OpenAI-compatible baseURL（必填，无默认）
- `aiCommitter.model`：模型 ID（必填）

示例：

- OpenRouter：`https://openrouter.ai/api/v1`
- Ollama（OpenAI 兼容模式）：`http://localhost:11434/v1`

也可以在 `settings.json` 里配置：

```json
{
  "aiCommitter.baseURL": "https://openrouter.ai/api/v1",
  "aiCommitter.model": "deepseek-chat",
  "aiCommitter.commitStyle": "auto",
  "aiCommitter.temperature": 0.2,
  "aiCommitter.maxDiffChars": 20000,
  "aiCommitter.extraHeaders": {
    "HTTP-Referer": "https://example.com",
    "X-Title": "AI Committer"
  }
}
```

3) 生成提交信息

- 先把改动 `git add` 进暂存区（staged）
- 点击 Git（Source Control）面板右上角的按钮，或运行命令：`AI Committer: Generate Commit Message`
- 生成结果会写入 Source Control 的提交输入框

## 提交风格

通过 `aiCommitter.commitStyle` 控制：

- `conventional`：强制 Conventional Commits
- `simple`：普通提交信息（无 type/scope 前缀）
- `auto`：分析 `git log` 最近提交的 subject 来推断；历史不足/不确定时默认降级为 `simple`

说明：

- 当使用 Conventional 并且第一行包含 `!`（例如 `refactor(ui)!: ...`）时，必须在 body 中包含 `BREAKING CHANGE: ...`，否则扩展会报错并拒绝写入输入框。

## 配置项参考

- `aiCommitter.baseURL`：OpenAI-compatible baseURL（必填）
- `aiCommitter.model`：模型 ID（必填）
- `aiCommitter.temperature`：默认 0.2（更稳定）
- `aiCommitter.maxDiffChars`：限制传入模型的 diff 字符数，避免超长失败
- `aiCommitter.authHeaderName` / `aiCommitter.authHeaderValuePrefix`：适配不同鉴权头（如 `x-api-key` / 不带 Bearer）
- `aiCommitter.extraHeaders`：额外 HTTP 头（非敏感）
- `aiCommitter.autoStyle.sampleCommits` / `aiCommitter.autoStyle.threshold`：auto 推断参数

## 打包 VSIX

生成可安装的 `.vsix` 文件：

```bash
pnpm run vsix
```

安装方式：

- 命令行：`code --install-extension ai-committer-0.0.1.vsix`
- 或 VS Code：Extensions -> `...` -> Install from VSIX...

## 开发与调试

- `pnpm install`
- `F5` 运行 Extension Host
- 常用命令：`pnpm run compile` / `pnpm test`

---

## English

AI Committer is a VS Code extension that generates Git commit messages using Vercel AI SDK v5. It targets OpenAI-compatible endpoints so it can work with most model gateways and self-hosted proxies that expose an OpenAI-style `/v1` API.

Key features:

- Works with most OpenAI-compatible providers (OpenRouter, Ollama OpenAI-compatible mode, self-hosted gateways, etc.)
- Generates messages from staged changes only (if nothing is staged, it will ask you to stage first)
- Commit style: `conventional` / `simple` / `auto` (auto infers from git history; uncertain => simple)
- Tighter prompt rules: avoids marketing language; if `!` is used, requires a `BREAKING CHANGE: ...` line
- Adds a one-click button in the Source Control (Git) view title bar

### Quick Start

1) Set API Key (global)

- Run: `AI Committer: Set API Key`
- The key is stored in VS Code SecretStorage (not in `settings.json`)

2) Configure provider (required)

In VS Code Settings search for `aiCommitter` and set at least:

- `aiCommitter.baseURL` (required, no default)
- `aiCommitter.model` (required)

Example `settings.json`:

```json
{
  "aiCommitter.baseURL": "https://openrouter.ai/api/v1",
  "aiCommitter.model": "deepseek-chat",
  "aiCommitter.commitStyle": "auto"
}
```

3) Generate commit message

- Stage your changes (`git add ...`)
- Click the button in Source Control view, or run `AI Committer: Generate Commit Message`
- The generated message is written into the Source Control input box

### Packaging (VSIX)

```bash
pnpm run vsix
```
