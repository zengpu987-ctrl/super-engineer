# Super Engineer

> **DeepSeek Harness 插件合集** —— 一个仓库收录我做的全部 DSH 插件；下载即得整套插件集。
>
> *A collection of DeepSeek Harness plugins. Clone it, install what you need.*

**作者 / Author:** Zeng Pu（曾朴）· zengpu987@gmail.com · 独立研究者
**合作者 / Collaborator:** Anstar, Z.（AI 助手，见 [CONTRIBUTORS.md](CONTRIBUTORS.md)）
**状态 / Status:** 仓库已建立并公开，第一批插件正在迁入 / public, first plugins being added
**许可 / Licence:** [**Apache-2.0**](LICENSE) —— 可自由使用、修改、再分发（含商业用途），
需保留署名与许可声明；**项目名称与标识不随许可授予**，详见 [COPYRIGHT.md](COPYRIGHT.md)。

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
LICENSE             Apache-2.0 全文
NOTICE              归属信息（分发时需保留）
COPYRIGHT.md        版权、许可、商标与贡献规则的说明
CITATION.cff        引用信息（GitHub「Cite this repository」会读它）
dist/               打包产物（不进版本库）
```

## 安装

DSH 的插件安装通道接受四类规格，本合集用到其中三类：

| 方式 | 怎么做 | 适合谁 |
|---|---|---|
| **本地路径**（最直接） | `git clone` 本仓库 → DSH 侧边栏 **插件 → 添加插件** → 填插件目录的**绝对路径**，例如 `/Users/你/super-engineer/plugins/superman` | 已经会 clone 的人 |
| **tarball 直链** | 从 [Releases](../../releases) 复制某个插件的 `.tgz` 直链 → 同一处填这个 URL | 只想装一个插件、不想克隆整个仓库的人 |
| **git 规格** | 若某个插件单独拆成了仓库，填 `用户名/仓库名` 即可 | 插件独立发布时 |

> 本地路径**必须是绝对路径**：输入框在浏览器里，相对路径会相对 profile 解析，不是你想的那个目录。

安装后重启 App（⌘Q 再打开）生效。

## 参与合作

这是一个**合作项目**：作者维护收录标准与发布，任何人都可以提插件、修缺陷、改文档。

- [**CONTRIBUTING.md**](CONTRIBUTING.md) —— 收录标准、提交流程、PR 检查清单
- [**CODE_OF_CONDUCT.md**](CODE_OF_CONDUCT.md) —— 行为准则
- [**CONTRIBUTORS.md**](CONTRIBUTORS.md) —— 署名名单，以及 AI 参与程度的披露

**贡献规则：Apache-2.0 入站=出站 + DCO 签到**（`git commit -s`），**无需签署 CLA**。
你的贡献按与出站相同的许可授权给所有人，你的署名以你在 PR 中说明的方式列入 CONTRIBUTORS.md。

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

## 收费？这个模型下收不了

**Apache-2.0 意味着任何人都可以合法地再分发这些代码**——包括打包上传到别的平台。所以
"付费才能下载"在这个许可下**不可能实现**，这不是漏洞，是宽松许可的固有性质。

能收费的是**服务与实物**：安装部署支持、定制开发、企业咨询、培训、纸质或镜像介质的工本费。
如果你想"必须付费才能拿到代码"，需要换成另一套模型（保留所有权利 + CLA，或私有仓库邀请制）。

**当前状态：** 代码免费开放，作者暂未提供任何收费服务。

## 引用

```bibtex
@software{super-engineer-2026,
  author = {Zeng, Pu and Anstar, Z.},
  title  = {Super Engineer: DeepSeek Harness 插件合集},
  year   = {2026},
  url    = {https://github.com/zengpu987-ctrl/super-engineer},
  note   = {Apache-2.0}
}
```

机器可读格式见 [CITATION.cff](CITATION.cff)；在 GitHub 右侧「Cite this repository」可一键导出。
[Zenodo](https://zenodo.org) 的 DOI 正在申请，取得后会补在这里。

## 相关项目

- [**Superman 套件**](https://github.com/zengpu987-ctrl/dsh-superman-suite) ——
  面向 DeepSeek Harness 的对话界面、智能记忆体与文献捕获体系（含两篇论文与 449 项离线检查）

## 版权

Copyright © 2026 Zeng Pu（曾朴）and contributors · [Apache-2.0](LICENSE)。
完整说明见 [COPYRIGHT.md](COPYRIGHT.md)；分发时请保留 [NOTICE](NOTICE)。
