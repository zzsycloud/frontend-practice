
# 光影摄影社 · 社团网站

将课程中 7 个独立练习（社团介绍、招新页、报名表单、作品管理、外拍费用统计、数据看板、3D 展馆）整合为一个统一导航、统一样式、数据互通的多页面静态网站。

## 目录结构

```
photo-club-site/
├── index.html          首页：社团介绍 / 核心活动 / 作品精选
├── join.html           招新报名（表单校验 + localStorage 名单管理）
├── activity.html       外拍活动登记与费用统计
├── works.html          作品管理（增删查、评分、排序、导出）
├── dashboard.html      数据看板（ECharts + Chart.js，fetch JSON + 本地数据联动）
├── gallery3d.html      Three.js 3D 虚拟展馆
├── css/style.css       全站公共样式
├── js/
│   ├── nav.js          导航 / 页脚注入、toast 提示
│   ├── storage.js      localStorage 统一封装（Store）
│   ├── join.js / activity.js / works.js / dashboard.js / gallery3d.js
├── data/
│   ├── equipment.json  器材使用分布
│   └── submissions.json 月度投稿量
└── assets/images/      club.jpg, photo1-4, picture1-2
```

## 运行方式

看板页使用 `fetch` 读取本地 JSON，3D 页使用 ES Module，**必须通过 HTTP 服务器打开**，不能直接双击 html：

```bash
cd photo-club-site
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
