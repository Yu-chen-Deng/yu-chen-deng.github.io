npm install
npm run dev

## 作者链接

在 `docs/data/authors.json` 中统一维护作者姓名和主页，使用不含单位的唯一 ID，格式为 `名-姓-编号`：

```json
{
  "wei-zhang-1": { "name": "Wei Zhang", "url": "https://example.com/person-1" },
  "wei-zhang-2": { "name": "Wei Zhang", "url": "https://example.com/person-2" }
}
```

同名的不同作者使用不同编号；同一作者在所有项目中复用同一个 ID。ID 一旦引用就保持稳定，更新姓名或主页只需修改这里。

在 `docs/data/projects.json` 的 `authors` 数组中，按署名顺序引用 ID：

```json
"authors": [
  { "id": "wei-zhang-1", "highlight": true, "equalContribution": true },
  { "id": "wei-zhang-2", "corresponding": true }
]
```

`highlight` 表示高亮，`equalContribution` 显示 `*`，`corresponding` 显示 `†`，这些字段均可省略。贡献标记属于具体项目，作者姓名和链接统一从作者文件读取。

首页 Project 区块和 Project 页会自动使用这些链接。鼠标悬停姓名可查看链接地址，点击在新标签页打开；原有样式保持不变。`url` 留空或省略时，姓名保持普通文本。引用不存在的 ID 会报错，便于及时发现拼写错误。
