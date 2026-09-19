/**
 * 作品管理（原 mine/script.js 迁移到统一的 Store 上，并增加分类、排序、平均分）
 */
(function () {
  const KEY = 'photos';
  let photos = Store.load(KEY, []);

  const photoForm = document.getElementById('photo-form');
  const titleInput = document.getElementById('title');
  const authorInput = document.getElementById('author');
  const categoryInput = document.getElementById('category');
  const ratingInput = document.getElementById('rating');
  const photoList = document.getElementById('photo-list');
  const totalCount = document.getElementById('total-count');
  const avgRating = document.getElementById('avg-rating');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const errorMsg = document.getElementById('error-msg');

  function stars(n) {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function render() {
    const keyword = searchInput.value.trim();
    let results = photos.filter(p => p.title.includes(keyword) || p.author.includes(keyword));

    const mode = sortSelect.value;
    if (mode === 'rating') results = [...results].sort((a, b) => b.rating - a.rating);
    if (mode === 'title') results = [...results].sort((a, b) => a.title.localeCompare(b.title, 'zh'));

    photoList.innerHTML = '';
    results.forEach(photo => {
      const li = document.createElement('li');

      const info = document.createElement('div');
      info.className = 'info';
      // 使用 textContent 而不是 innerHTML，避免作品名里的 <script> 被执行
      info.textContent = `《${photo.title}》 - ${photo.author}`;
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = photo.category || '未分类';
      const star = document.createElement('span');
      star.className = 'stars';
      star.style.marginLeft = '10px';
      star.textContent = stars(photo.rating);
      info.appendChild(badge);
      info.appendChild(star);

      const del = document.createElement('button');
      del.textContent = '删除';
      del.className = 'btn danger small';
      del.dataset.id = photo.id;

      li.appendChild(info);
      li.appendChild(del);
      photoList.appendChild(li);
    });

    totalCount.textContent = `当前共 ${results.length} 件作品`;
    const avg = photos.length ? (photos.reduce((s, p) => s + p.rating, 0) / photos.length).toFixed(1) : '-';
    avgRating.textContent = `平均分 ${avg}`;
  }

  function persist() {
    const r = Store.save(KEY, photos);
    errorMsg.textContent = r.ok ? '' : r.message;
    return r.ok;
  }

  photoForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const rating = parseInt(ratingInput.value, 10);

    if (!title || !author || isNaN(rating)) {
      errorMsg.textContent = '请填写完整信息！';
      return;
    }
    if (rating < 1 || rating > 5) {
      errorMsg.textContent = '评分必须在 1 到 5 之间！';
      return;
    }
    errorMsg.textContent = '';

    photos.push({ id: Store.uid(), title, author, category: categoryInput.value, rating });
    if (persist()) {
      render();
      photoForm.reset();
      showToast('作品已添加');
    }
  });

  // 事件委托处理删除
  photoList.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (!id) return;
    photos = photos.filter(p => p.id !== id);
    persist();
    render();
  });

  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);

  document.getElementById('export-btn').addEventListener('click', () => {
    if (!photos.length) return showToast('暂无作品可导出');
    Store.exportJSON(photos, 'photoclub_photos.json');
  });

  render();
})();