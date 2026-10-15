## 这个 PR 做了什么

<!-- 一句话说明。关联的 Issue：#__ -->

## 属于哪一类

- [ ] 新增插件
- [ ] 修改已有插件
- [ ] 修复工具（tools/）
- [ ] 文档
- [ ] 其他：

## 自检结果（必须贴命令与输出）

```
$ node tools/verify.mjs
...
$ node tools/pack.mjs
...
$ node <插件自带检查脚本>
...
```

## 检查清单

- [ ] `node tools/verify.mjs` 无 ✗
- [ ] 插件自带的离线检查脚本全过，且**不联网、不依赖图形界面**即可运行
- [ ] `plugins/catalog.json` 已更新，版本与 `package.json` 一致
- [ ] 相关 README 已同步（插件自己的 + 合集的）
- [ ] 没有绝对路径、没有构建产物、没有个人数据、没有第三方版权内容
- [ ] 我同意 [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)，并已读 [CONTRIBUTING.md](../CONTRIBUTING.md)

## 署名

<!-- 合并后你希望以什么名字出现在 CONTRIBUTORS.md？（姓名 / ID / 匿名） -->

## 需要作者决定的事

<!-- 例如：许可模型、是否公开、插件命名、是否收费 -->
