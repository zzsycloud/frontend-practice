/**
 * 全站导航 / 页脚注入
 * 每个页面只需放置 <div id="site-nav"></div> 与 <div id="site-footer"></div>，
 * 由此脚本统一渲染，避免 6 个页面各自复制一份导航（改一处即可全站生效）。
 */
(function () {
  const LINKS = [
    { href: 'index.html',     text: '首页' },
    { href: 'join.html',      text: '招新报名' },
    { href: 'activity.html',  text: '外拍登记' },
    { href: 'works.html',     text: '作品管理' },
    { href: 'dashboard.html', text: '数据看板' },
    { href: 'gallery3d.html', text: '3D 展馆' }
  ];

  // 当前页文件名（file:// 与 http:// 均适用；根路径视为 index.html）
  const current = (location.pathname.split('/').pop() || 'index.html');

  function renderNav() {
    const mount = document.getElementById('site-nav');
    if (!mount) return;

    const nav = document.createElement('nav');
    nav.className = 'site-nav';

    const items = LINKS.map(l =>
      `<li><a href="${l.href}" class="${l.href === current ? 'active' : ''}">${l.text}</a></li>`
    ).join('');

    nav.innerHTML = `
      <div class="container">
        <a class="brand" href="index.html"><span></span> 光影摄影社</a>
        <button class="nav-toggle" aria-label="菜单">☰</button>
        <ul>${items}</ul>
      </div>`;
    mount.replaceWith(nav);

    nav.querySelector('.nav-toggle').addEventListener('click', () => {
      nav.querySelector('ul').classList.toggle('open');
    });
  }

  function renderFooter() {
    const mount = document.getElementById('site-footer');
    if (!mount) return;
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <p>© 2026 光影摄影社 · 用镜头记录青春 | 地址：校园活动中心3楼 | 邮箱：photo@stu.edu</p>
      <p>本站为课程作业，数据保存在浏览器 localStorage 中，仅供演示。</p>`;
    mount.replaceWith(footer);
  }

  /** 全站共用的轻量提示（替代 alert） */
  window.showToast = function (text, ms = 2200) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), ms);
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    renderFooter();
  });
})();