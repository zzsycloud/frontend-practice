
# 光影摄影社 · 社团网站（三份前端作业整合版）

将课程中的三份前端练习整合为一个统一导航、统一样式、数据互通的多页面静态网站：

- **原 Site 多页面站**（前端技术整合 + 原生 DOM + 异步 + ECharts/Chart.js + Three.js）
- **原 web 的 jQuery 数据看板** → 并入为 `dashboard-jquery.html`，与原生版看板共用同一套 JSON 数据
- **原 web2**：与 web 逐字节相同的副本，作为重复项不再并入
- 新增最小 **A-Frame** 展馆 `gallery-aframe.html`（使用项目自带的 `libs/aframe.min.js` 与现有图片），对应报告中的 A-Frame 作品要求

六项技术点（jQuery、异步请求、ECharts、Chart.js、Three.js、A-Frame）均集中在本项目内。

## 目录结构

```
Site/
├── index.html              首页：社团介绍 / 核心活动 / 作品精选（统一入口）
├── join.html               招新报名（表单校验 + localStorage 名单管理）
├── activity.html           外拍活动登记与费用统计
├── works.html              作品管理（增删查、评分、排序、导出）
├── dashboard.html          数据看板·原生 DOM 版（ECharts + Chart.js，fetch JSON + 本地数据联动）
├── dashboard-jquery.html   数据看板·jQuery 版（并入自 web/，与原生版对比 DOM 写法）
├── gallery3d.html          Three.js 3D 虚拟展馆
├── gallery-aframe.html     A-Frame 虚拟展馆（声明式实体 + 组件）
├── css/style.css           全站公共样式
├── js/
│   ├── nav.js              导航 / 页脚注入、toast 提示
│   ├── storage.js          localStorage 统一封装（Store）
│   ├── dashboard.js        原生 DOM 版看板逻辑
│   ├── dashboard-jquery.js jQuery 版看板逻辑
│   └── join.js / activity.js / works.js / gallery3d.js
├── libs/aframe.min.js      A-Frame 本地库（随 web 练习打包）
├── data/
│   ├── equipment.json      器材使用分布（两个看板共用）
│   └── submissions.json    月度投稿量（两个看板共用）
└── assets/images/          club.jpg, photo1-4, picture1-2
```

## 运行方式

看板页用 `fetch` 读取本地 JSON，Three.js 页使用 ES Module，A-Frame 页加载本地库与图片贴图，
**必须通过 HTTP 服务器打开**，不能直接双击 html：

```bash
cd Site
python -m http.server 8080
# 或 npx serve .
```

然后访问 http://localhost:8080 。

## 数据互通

| 写入页        | localStorage key   | 读取页                                                 |
| ------------- | ------------------ | ------------------------------------------------------ |
| join.html     | photoclub:signups  | dashboard.html（擅长领域饼图）                         |
| works.html    | photoclub:photos   | dashboard.html（评分分布）、gallery3d.html（相框标题） |
| activity.html | photoclub:activity | —                                                     |

两个数据看板（原生 DOM 版、jQuery 版）共用 `data/equipment.json` 与 `data/submissions.json`。
