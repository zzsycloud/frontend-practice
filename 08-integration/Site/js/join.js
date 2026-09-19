/**
 * 招新报名页逻辑
 * - 收集表单 → 清洗 → 校验（正则）→ 查重 → 保存 localStorage → 重新渲染
 * - 名单支持搜索 / 删除 / 导出 / 清空
 */
(function () {
  const KEY = 'signups';
  let signups = Store.load(KEY, []);

  const form = document.getElementById('signupForm');
  const msg = document.getElementById('form-msg');
  const listBody = document.getElementById('signup-list');
  const countEl = document.getElementById('signup-count');
  const searchEl = document.getElementById('signup-search');

  const RULES = {
    studentId: /^\d{11}$/,
    phone: /^1[3-9]\d{9}$/,
    email: /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/
  };

  /** 从表单收集并清洗数据（去掉首尾及中间多余空格） */
  function collect() {
    const fd = new FormData(form);
    const clean = v => (v || '').toString().replace(/\s+/g, '');
    return {
      id: Store.uid(),
      name: (fd.get('name') || '').trim(),
      studentId: clean(fd.get('studentId')),
      phone: clean(fd.get('phone')),
      email: clean(fd.get('email')),
      gender: fd.get('gender') || '',
      department: fd.get('department') || '',
      level: fd.get('level') || '初级',
      skills: fd.getAll('skills'),
      joinDate: fd.get('joinDate') || '',
      intro: (fd.get('intro') || '').trim(),
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
    };
  }

  /** 校验：返回错误信息数组，空数组代表通过 */
  function validate(data) {
    const errors = [];
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    const mark = (id, text) => {
      errors.push(text);
      const el = document.getElementById(id);
      if (el) el.classList.add('invalid');
    };

    if (!data.name) mark('name', '姓名不能为空');
    if (!RULES.studentId.test(data.studentId)) mark('studentId', '学号必须是 11 位数字');
    if (!RULES.phone.test(data.phone)) mark('phone', '手机号格式不正确');
    if (data.email && !RULES.email.test(data.email)) mark('email', '邮箱格式不正确');
    if (!data.gender) errors.push('请选择性别');
    if (signups.some(s => s.studentId === data.studentId)) mark('studentId', '该学号已报名，请勿重复提交');

    return errors;
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function render(keyword = '') {
    const kw = keyword.trim();
    const rows = signups.filter(s =>
      !kw || s.name.includes(kw) || s.studentId.includes(kw) || (s.department || '').includes(kw)
    );

    listBody.innerHTML = rows.length
      ? rows.map(s => `
        <tr>
          <td>${escapeHTML(s.name)}</td>
          <td>${s.studentId}</td>
          <td>${s.phone}</td>
          <td>${escapeHTML(s.department) || '-'}</td>
          <td>${s.level}</td>
          <td>${s.skills.length ? s.skills.join('、') : '-'}</td>
          <td>${s.createdAt}</td>
          <td><button class="btn danger small" data-del="${s.id}">删除</button></td>
        </tr>`).join('')
      : '<tr><td colspan="8" style="text-align:center;color:#94a3b8;">暂无报名记录</td></tr>';

    countEl.textContent = `${signups.length} 人`;
  }

  function persist() {
    const r = Store.save(KEY, signups);
    if (!r.ok) {
      msg.className = 'msg error';
      msg.textContent = r.message;
    }
    return r.ok;
  }

  /* ---------- 事件绑定 ---------- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = collect();
    const errors = validate(data);

    if (errors.length) {
      msg.className = 'msg error';
      msg.textContent = '❌ ' + errors.join('；');
      return;
    }

    signups.push(data);
    if (persist()) {
      msg.className = 'msg ok';
      msg.textContent = `✅ ${data.name} 报名成功！`;
      form.reset();
      render(searchEl.value);
      showToast('报名信息已保存');
    }
  });

  // 事件委托：删除按钮是动态生成的，绑在 tbody 上一次即可
  listBody.addEventListener('click', e => {
    const id = e.target.dataset.del;
    if (!id) return;
    if (!confirm('确定删除这条报名记录吗？')) return;
    signups = signups.filter(s => s.id !== id);
    persist();
    render(searchEl.value);
  });

  searchEl.addEventListener('input', () => render(searchEl.value));

  document.getElementById('export-signups').addEventListener('click', () => {
    if (!signups.length) return showToast('暂无数据可导出');
    Store.exportJSON(signups, 'photoclub_signups.json');
  });

  document.getElementById('clear-signups').addEventListener('click', () => {
    if (!signups.length) return;
    if (!confirm(`将清空全部 ${signups.length} 条报名记录，是否继续？`)) return;
    signups = [];
    persist();
    render();
  });

  render();
})();