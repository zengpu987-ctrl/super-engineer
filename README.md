# Super Engineer

> **DeepSeek Harness 插件合集** —— 一个仓库收录我做的全部 DSH 插件；下载即得整套插件集。
>
> *A collection of DeepSeek Harness plugins. Clone it, install what you need.*

**作者 / Author:** Zeng Pu（曾朴）· zengpu987@gmail.com · 独立研究者
**状态 / Status:** 仓库已建立，第一批插件正在迁入 / repository created, first plugins being added
**许可 / Licence:** 见 [COPYRIGHT.md](COPYRIGHT.md) —— 默认保留所有权利；安装与个人使用免费，**转载、二次发布、商用须先取得书面授权**。

---

## 这个仓库是什么

不是单个插件，而是**合集**：每个插件一个目录，互不依赖，可单独安装，也可整套安装。
好处是安装方式统一、版本一目了然、插件之间不会因为共用一份代码而互相牵连。

*Not one plugin but a collection: one directory per plugin, independent of each other,
installable separately or together. One install path, one version table, no shared
code that couples them.*

## 目录结构

```
plugins/            每个插件一个目录，目录内就是可直接安装的包
  catalog.json      机器可读清单（名称、版本、说明、标签）
tools/
  verify.mjs        收录前校验：清单、入口、图标、profile 层、绝对路径
  pack.mjs          打包成 .tgz（用于"直链安装"）并输出 SHA256
dist/               打包产物（不进版本库）
```

## 安装

DSH 的插件安装通道接受四类规格，本合集用到其中三类：

| 方式 | 怎么做 | 适合谁 |
|---|---|---|
| **本地路径**（最直接） | `git clone` 本仓库 → DSH 侧边栏 **插件 → 添加插件** → 填插件目录的**绝对路径**，例如 `/Users/你/super-engineer/plugins/superman` | 已经会 clone 的人 |
| **tarball 直链** | 从 Releases 页面复制某个插件的 `.tgz` 直链 → 同一处填这个 URL | 只想装一个插件、不想克隆整个仓库的人 |
| **git 规格** | 若某个插件单独拆成了仓库，填 `用户名/仓库名` 即可 | 插件独立发布时 |

> 本地路径**必须是绝对路径**：输入框在浏览器里，相对路径会相对 profile 解析，不是你想的那个目录。

安装后重启 App（⌘Q 再打开）生效。

## 收录规范

想把一个插件加进合集：把该插件目录放进 `plugins/<名字>/`，然后

```bash
node tools/verify.mjs                 # 校验 plugins/ 下全部插件
node tools/pack.mjs                   # 生成 dist/*.tgz 与 dist/SHA256SUMS.txt
```

`verify.mjs` 检查的是"换台机器也装得上"的最小条件：`package.json` 必备字段、宿主入口与
浏览器入口存在、`dsh.bundle.patch` 指向的 profile 层存在且含 `insert:` 行、`icon` 存在且
不超过 256 KiB、`files` 白名单确实覆盖了入口与图标、以及**代码里不出现绝对路径**——写死
作者机器路径的插件在别人电脑上必然失效。

`catalog.json` 里每个插件的字段：

```jsonc
{
  "name": "@local/dsh-xxx",     // package.json 里的包名
  "path": "plugins/xxx",         // 相对仓库根目录
  "version": "0.1.0",
  "title": { "zh": "中文名", "en": "English name" },
  "description": { "zh": "一句话说明", "en": "One line" },
  "tags": ["记忆"],
  "platform": "web"
}
```

## 参与合作

这是一个**合作项目**：作者维护收录标准与发布，任何人都可以按流程提插件、修缺陷、改文档。

- [**CONTRIBUTING.md**](CONTRIBUTING.md) —— 收录标准、提交流程、PR 检查清单
- [**CODE_OF_CONDUCT.md**](CODE_OF_CONDUCT.md) —— 行为准则
- [**CONTRIBUTORS.md**](CONTRIBUTORS.md) —— 署名名单，以及 AI 参与程度的披露

> **许可模型待定（见下节）。** 在条款明确允许之前，本仓库只接受 Issue 与讨论；代码 PR 请先开
> Issue 与作者确认——否则会出现"提交了但无法合法接收"的情况。

## 收费与授权（重要）

**GitHub 没有付费下载功能**——它不能对一个仓库或一次下载收 1 元。所以"下载即付费"这件事
必须由 GitHub 之外的环节完成。可选做法：

1. **赞助后给直链**（最常见）：仓库与说明公开，付款后把 Release 附件的直链或提取码发给对方。
   门槛低、更新方便；缺点是直链一旦泄露就无法收回。
2. **私有仓库 + 邀请**：付费后把对方加成 collaborator。可控性最好，但每来一个人要手动加一次。
3. **平台发售**：在爱发电 / 知识星球 / 淘宝售票，GitHub 只作更新与展示。最省心，平台抽成。
4. **免费 + 自愿赞助**：README 放收款码，代码不加限制。传播最快。

这份合集做成了**四种方式都能用**的形状：无论最后选哪种，README、`tools/pack.mjs` 产出的
tarball、[COPYRIGHT.md](COPYRIGHT.md) 的条款都不用改，只需决定"谁拿到链接"。

**当前状态：** 仓库为**私有**，尚未收费，条款按 COPYRIGHT.md 执行（保留所有权利）。

### 与合作项目的关系

要成为**真正的合作项目**，必须选一种贡献模型——两者不能混用：

| 模型 | 别人能做什么 | 贡献者的代码 | 适合 |
|---|---|---|---|
| **宽松许可 + DCO 签到**（Apache-2.0 / MIT） | 自由使用、修改、再分发，保留署名与许可 | 提交即按同一许可授权，无需另签协议 | 想让人用得广、愿意接受外部 PR |
| **保留所有权利 + CLA** | 只能安装自用；修改与再发布须授权 | 需签贡献者许可协议，把权利授予作者 | 想保留控制权与收费能力 |

**不能既有"保留所有权利"又接受他人代码贡献**：贡献者提交的代码若没有明确许可，别人
（包括你）都无法合法使用，项目会变成一堆无法合并的补丁。作者正在这两者之间选择。

## 相关项目

- [**Superman 套件**](https://github.com/zengpu987-ctrl/dsh-superman-suite) ——
  面向 DeepSeek Harness 的对话界面、智能记忆体与文献捕获体系（含两篇论文与 449 项离线检查）

## 版权

Copyright © 2026 Zeng Pu（曾朴）· 保留所有权利。完整条款见 [COPYRIGHT.md](COPYRIGHT.md)。
