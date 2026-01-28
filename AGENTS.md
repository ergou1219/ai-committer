# AGENTS.md (ai-committer)

本文件给“会自己动手改代码”的自动化代理使用。目标是：少踩坑、少问问题、一次改对。

## 仓库概览

- 这是一个 VS Code 扩展（TypeScript）。入口：`src/extension.ts`，产物：`dist/extension.js`。
- 测试用 `@vscode/test-cli`（命令：`vscode-test`），Mocha 语义；测试 TS 编译到 `out/` 再运行。
- 包管理器：pnpm（存在 `pnpm-lock.yaml`）。

## 必读规则来源

- Cursor 规则：未发现（`.cursor/rules/` 或 `.cursorrules` 不存在）。
- Copilot 规则：未发现（`.github/copilot-instructions.md` 不存在）。
- 代码风格的硬约束主要来自：`eslint.config.mjs`、`tsconfig.json`。

如果未来新增 Cursor/Copilot 规则：以它们为最高优先级覆盖本文件。

## 常用命令 (Build/Lint/Test)

```bash
pnpm install
pnpm run check-types
pnpm run lint
pnpm exec eslint src --fix
pnpm run compile
pnpm run package
pnpm run watch
pnpm run pretest
```

## 测试 (尤其是单测/单文件)

测试的关键约定：

- 测试源码在 `src/test/**/*.test.ts`（当前示例：`src/test/extension.test.ts`）。
- 运行测试前会先把测试编译到 `out/`（脚本：`compile-tests`）。
- `vscode-test` 默认读取 `.vscode-test.mjs`，当前配置：`files: 'out/test/**/*.test.js'`。

常用用法：

```bash
pnpm test
pnpm test -- --grep "Sample test"
pnpm test -- --run out/test/extension.test.js
pnpm test -- --jobs 1
pnpm run compile-tests
pnpm run watch-tests
```

提示：`pretest` 会先编译测试/扩展并 lint；快速迭代可手动 `compile-tests` 后再 `pnpm test -- --run ...`。

## 运行与调试

- 运行扩展：VS Code 里用 `Run Extension`（见 `.vscode/launch.json`），会先执行默认 build task（见 `.vscode/tasks.json`）。
- 调试测试：`vscode-test` 读取 `.vscode-test.mjs`；如需要在调试器里跑测试，可给 `extensionHost` 配置加上 `testConfiguration: "${workspaceFolder}/.vscode-test.mjs"`。
- 查看可用参数：`pnpm exec vscode-test --help`（基本等价 Mocha CLI）。

## 项目结构与产物

- `src/`：TypeScript 源码。
- `dist/`：扩展运行产物（esbuild bundling）。
- `out/`：测试编译产物。
- `.vscode-test/`：VS Code 测试下载/缓存目录（已在 `.gitignore`）。

不要手改 `dist/` 或 `out/` 里的编译输出；改 `src/`，用命令生成。

## 依赖与产物约束

- 依赖管理只用 pnpm；不要混用 `npm install`/`yarn`，避免锁文件漂移。
- 提交时保留 `pnpm-lock.yaml` 与源码一致；不要手工编辑 lock。
- `esbuild` 是本仓库唯一需要本地构建的依赖（见 `pnpm-workspace.yaml:onlyBuiltDependencies`）。
- `.gitignore` 已忽略 `dist/`、`out/`、`.vscode-test/`、`*.vsix`；不要把这些产物提交进 git。

## 常见坑（会浪费时间的那种）

- 测试失败但你没改测试：先确认 `out/` 是否是最新（跑 `pnpm run compile-tests`）。
- 扩展打包/运行异常：优先检查 `dist/extension.js` 是否由 `pnpm run compile` 生成且与 `src/` 对应。
- 依赖 `vscode` 必须保持为 external（见 `esbuild.js`），不要把它打进 bundle。

## 代码风格与约束（按“不会引发 PR 争议”来写）

### 格式化/排版

- 本仓库没有 Prettier 配置；默认遵循现有文件风格。
- `src/*.ts` 目前偏向：Tab 缩进、单引号（见 `src/extension.ts`、`src/test/extension.test.ts`）。
- 只在你修改的代码附近做最小必要的格式调整，避免无意义的全文件 reformat。

### Import 规范

- 优先使用 ESM `import`；工具脚本可用 `require`（例如 `esbuild.js`）。
- Import 分组建议：
  1) Node 内置模块（如 `node:path`）
  2) 第三方依赖（如 `vscode`）
  3) 项目内模块（相对路径）
- 类型只用时用 `import type { ... }`，减少运行时代码。
- ESLint 已对 import 命名做约束（见 `eslint.config.mjs`）：import 标识符应是 `camelCase` 或 `PascalCase`。

### TypeScript 约束

- `tsconfig.json` 开启 `strict: true`：
  - 避免 `any`；需要逃生口时优先 `unknown` + 类型收窄。
  - 对可能为 `undefined/null` 的值要显式处理（可选链/提前返回/断言）。
- 模块/目标：`module: Node16`，`target: ES2022`。避免引入比 ES2022 更新且未转译的语法特性。

### 命名约定

- 变量/函数：`camelCase`；类型/类/枚举：`PascalCase`。
- VS Code 命令 ID、配置 key 等字符串：保持与 `package.json` 中的约定一致，避免“代码里一套、清单里一套”。
- 尽量使用可读全名，少用含糊缩写（除非在领域内非常通用）。

### 语义与可维护性

- 用早返回降低嵌套；复杂分支优先拆函数。
- 避免“为了复用而复用”的抽象；扩展项目常见需求是清晰、可调试。

### 错误处理与日志

- 不要 `throw "string"` 或 `throw 123`（ESLint: `no-throw-literal`）。永远 `throw new Error(...)`。
- 捕获异常时：
  - 记录足够上下文（但不要泄露 secrets/token）。
  - 如果是用户可见问题：用 `vscode.window.showErrorMessage(...)` 给出可执行的提示。
- 开发期日志可用 `console.log/error`；如后续引入 OutputChannel，则统一走 OutputChannel。

### ESLint 规则要点（当前配置是 warn，但 CI/团队可能会当作必须）

- `curly`：分支/循环建议使用大括号。
- `eqeqeq`：使用 `===`/`!==`。
- `semi`：需要分号（至少不要引入不一致）。

## VS Code 扩展开发约定

- 激活入口：`activate(context: vscode.ExtensionContext)`；清理资源：`context.subscriptions.push(...)`。
- 注册命令时：命令 ID 必须与 `package.json#contributes.commands[].command` 一致。
- 不要在激活阶段做重活；需要 IO/网络时延迟到命令执行或显式触发。

## 变更策略（给代理的行为约束）

- 修改前先跑 `pnpm run lint` / `pnpm run check-types`（至少改动相关部分要过）。
- 增加功能时：同时补 `src/test/**`（哪怕是最小的回归用例）。
- 不要提交 `.vscode-test/`、`dist/`、`out/`、`node_modules/`。

## 快速自检清单

```bash
pnpm run check-types
pnpm run lint
pnpm test
```
