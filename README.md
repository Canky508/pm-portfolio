# 谭倩琪 · 产品作品集

一个纯静态、移动优先的求职作品集页面，集中展示 4 个产品：

1. 哒乐星 StarFun（校园社交 · 蒲公英内测）
2. 挪啦（重要短信提醒 · Android 已上架）
3. 漫画学雅思 / 芽芽英语（微信小程序 · 可交互原型）
4. 金灵酒鬼（AI 调酒 Web MVP · 48h 黑客松）

## 本地预览

直接双击 `index.html` 即可；图片与可交互原型都在本地，不依赖构建。

也可以起一个静态服务（推荐，避免个别浏览器对本地文件的限制）：

```bash
npx serve .
```

然后打开 `http://localhost:3000`。

## 页面结构

- `index.html`：作品集主页面（内联 CSS / JS，零依赖）
- `demo/yaya/`：漫画学雅思可交互原型（来自 `comic-ielts` 仓库的 `design/preview`）
- `demo/starfun/`：哒乐星交互原型（来自 `starfun-app` 的 `docs/design/forest/prototype`，已去掉右侧说明面板，只保留主题切换与操作按钮）
- `assets/`：截图、图标与二维码
- `assets/qr-site.svg` / `qr-site.png`：指向线上地址的二维码
- `assets/og.png`：分享封面图

## 相关在线 Demo

- 哒乐星交互原型：`/demo/starfun/index.html`
- 漫画学雅思 H5 原型：`/demo/yaya/index.html`
- 金灵酒鬼在线试玩：<https://canky508.github.io/LIngruiz1hejiu/>

## 部署

线上地址：<https://canky508.github.io/pm-portfolio/>

更新内容后：

```bash
git add .
git commit -m "update portfolio"
git push
```

GitHub Pages 会自动更新（分支 `master`，根目录）。

## 二维码

当前二维码内容：

```
https://canky508.github.io/pm-portfolio/
```

如果更换域名，重新生成：

```bash
npx qrcode -o assets/qr-site.png -w 1024 "https://你的域名/"
```

同时替换 `assets/qr-site.svg` 与 `assets/og.png` 中的地址/封面。

## 说明

- 页面设置了 `noindex, nofollow`，不希望被搜索引擎收录。
- 联系方式只保留邮箱，未放手机号。
- 产品截图与素材版权归各项目所有，本页仅用于求职展示。
