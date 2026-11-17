# 芽芽成长贴纸 · 矢量与动效包

源图：`design/assets/芽芽猫猫成长贴纸合集.png`（1536×1024，透明背景）

## 产物

| 目录 | 内容 |
| --- | --- |
| `design/assets/yaya-stickers-raw/` | 从合集自动切出的 13 张原始 PNG（未改色） |
| `design/preview/assets/stickers/*.png` | 去掉描边、去投影后的透明 PNG（中间产物） |
| `design/preview/assets/stickers/*.svg` | VTracer 输出的透明 SVG，带 `viewBox`，可内联或 `<img>` |
| `design/preview/stickers.js` | 13 张 SVG 的离线内联数据，供动效页使用（当前约 1.6MB） |
| `design/preview/sticker-lab.html` | 贴纸动效预览页（每张一个情境动作） |
| `design/preview/assets/stickers/manifest.json` | 文件名、尺寸、字节数 |

浏览器直接打开 `design/preview/sticker-lab.html` 即可，无需服务器。

## 爪子描边处理

原贴纸的爪子有细茶色描边（约 `#DCBBA4`），原型里的爪子是无描边的柔和色块。处理没有简单删线，否则鼓掌、点赞等只靠线条勾出的爪子会消失：

1. 检测茶色描边像素；
2. 描边改成**比肤色略深一点点的同色奶油** `#E7CBB4`，不做加粗扩散；
3. 收紧判定：只处理夹在奶油色之间、周围没有深色或粉色的细线，避免嘴巴、腮红和阴影被误改；
4. 用闭运算封住耳根、尾巴与身体之间 1–4px 的透明接缝；
5. 去白边：把贴边抗锯齿的颜色融回邻近实色；
6. 同时去掉贴纸外缘的半透明投影，避免灰/粉色外圈。

不会出现茶色、灰色等“另一种颜色”的线。

因此部分姿势（尤其大拇指）会比原图更概括，这是“去描边后保留动作”的取舍。

## 矢量化流程

```bash
PLAYWRIGHT_PATH=<playwright 模块目录> node tools/extract-stickers.mjs
PLAYWRIGHT_PATH=<playwright 模块目录> node tools/clean-stickers.mjs
PLAYWRIGHT_PATH=<playwright 模块目录> node tools/vectorize-stickers.mjs
node tools/build-sticker-data.mjs
```

工具链说明：

- 切分：按三行、列间空隙与指定分割窗口，拆出 13 张。
- 清理：去除邻图碎屑、半透明阴影、茶色爪子描边；透明度阈值取中间值，避免把 Zzz、月亮、眼镜细线一起削掉。
- 预处理：先做 **3 倍高质量放大**，再把颜色归一到固定调色板（奶油、棕、黄、腮红、泡泡蓝等 14 色），最后做 3×3 多数滤波去掉量化噪点。
- 矢量：调用项目内 `tools/vtracer/vtracer.exe`（VTracer，MIT）。透明背景先合成 `#FF00FF`，输出后按“近洋红”删除背景路径，因此 SVG 仍是透明的。
- 参数：`--hierarchical cutout --mode spline --filter-speckle 1 --color-precision 8 --gradient-step 1 --max-colors 28 --simplify 0.6 --path-precision 3 --optimize 2`。

放大与调色板归一化是关键：低分辨率直接描摹时，眼镜圆环会出现缺口，柔和渐变会被描成许多不均匀的小色块。

## 动效

`sticker-lab.html` 使用整张贴纸级 CSS 动画，不引入 JS 动画库：

| 动作 | 用在哪 |
| --- | --- |
| wave | 首页自动问候、挥手 |
| bounce | 答对、完成一轮、阶段庆祝 |
| float | 首页默认陪伴 |
| bob | 老师讲解 |
| peek | 卡片提示 |
| jump | 四维首次全对 |
| pop | 单题点赞 |
| breathe | 复习等待、休息 |
| tilt | 托腮思考 |

自动描摹只得到颜色区域，不会产生眼睛、Zzz、彩纸等语义层。要单独动这些部件，需要按图层重绘或手工拆组；当前版本保证“整张贴纸动起来”，不假装有骨骼。

暂停动效、系统 `prefers-reduced-motion` 都会被尊重。
