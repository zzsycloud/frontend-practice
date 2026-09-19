/**
 * 外拍活动登记与费用统计
 * 由原来只在控制台输出的 new.js 改造而来：
 *   validateAndClean / calculateTotalFee / sortMembers 三个纯函数保留，
 *   新增 DOM 渲染、localStorage 持久化、示例数据导入。
 */
(function () {
  const KEY = 'activity';
  const ACTIVITY_FEE = 30;
  const RENT_PRICE = { '无': 0, '机身': 0, '三脚架': 20, '镜头': 50 };

  let members = Store.load(KEY, []);

  const form = document.getElementById('activityForm');
  const nameEl = document.getElementById('act-name');
  const phoneEl = document.getElementById('act-phone');
  const gearEl = document.getElementById('act-gear');
  const msgEl = document.getElementById('act-msg');
  const listEl = document.getElementById('act-list');

  // 示例数据：故意包含空格、非法手机号、null、空姓名，用来演示清洗与防御
  const DEMO = [
    { name: ' 张三 ', phone: '13800138000', gear: '镜头' },
    { name: '李四', phone: '13900139000', gear: '三脚架' },
    { name: '王五', phone: '123456', gear: '镜头' },
    { name: '赵六 ', phone: ' 13700137000 ', gear: '机身' },
    { name: '孙七', phone: '15800158000', gear: '三脚架' },
    { name: '周八', phone: '18900189000', gear: '镜头' },
    null,
    { name: '', phone: '13100131000', gear: '三脚架' }
  ];

  /** 函数1：数据清洗与校验，非法返回 null */
  function validateAndClean(member) {
    if (!member || typeof member !== 'object') {
      console.warn('拦截到非法输入已跳过:', member);
      return null;
    }
    const cleanName = (member.name || '').replace(/\s+/g, '');
    const cleanPhone = (member.phone || '').replace(/\s+/g, '');
    const gear = RENT_PRICE.hasOwnProperty(member.gear) ? member.gear : '无';

    if (!cleanName || !/^1[3-9]\d{9}$/.test(cleanPhone)) {
      console.warn('拦截到非法输入已跳过:', member);
      return null;
    }
    return {
      id: member.id || Store.uid(),
      name: cleanName,
      phone: cleanPhone,
      gear,
      rent: RENT_PRICE[gear],
      activityFee: ACTIVITY_FEE
    };
  }

  /** 函数2：reduce 求总费用 */
  function calculateTotalFee(list) {
    return list.reduce((total, m) => total + m.rent + m.activityFee, 0);
  }

  /** 函数3：多字段排序（器材升序 → 总费用降序），返回新数组 */
  function sortMembers(list) {
    return [...list].sort((a, b) => {
      if (a.gear !== b.gear) return a.gear.localeCompare(b.gear, 'zh');
      return (b.rent + b.activityFee) - (a.rent + a.activityFee);
    });
  }

  /** 函数4：按器材分组统计 */
  function groupByGear(list) {
    return list.reduce((acc, m) => {
      acc[m.gear] = acc[m.gear] || { count: 0, fee: 0 };
      acc[m.gear].count += 1;
      acc[m.gear].fee += m.rent + m.activityFee;
      return acc;
    }, {});
  }

  function setMsg(text, type) {
    msgEl.className = 'msg ' + (type || '');
    msgEl.textContent = text;
  }

  function persist() {
    const r = Store.save(KEY, members);
    if (!r.ok) setMsg(r.message, 'error');
    return r.ok;
  }

  function render() {
    const sorted = sortMembers(members);

    listEl.innerHTML = sorted.length
      ? sorted.map((m, i) => `
        <tr>
          <td>${i + 1}</td><td>${m.name}</td><td>${m.phone}</td>
          <td>${m.gear}</td><td>${m.rent}</td><td>${m.activityFee}</td>
          <td><strong>${m.rent + m.activityFee}</strong></td>
          <td><button class="btn danger small" data-del="${m.id}">删除</button></td>
        </tr>`).join('')
      : '<tr><td colspan="8" style="text-align:center;color:#94a3b8;">暂无登记，点击"导入示例数据"试试</td></tr>';

    const rent = members.reduce((s, m) => s + m.rent, 0);
    document.getElementById('stat-count').textContent = members.length;
    document.getElementById('stat-rent').textContent = rent;
    document.getElementById('stat-activity').textContent = members.length * ACTIVITY_FEE;
    document.getElementById('stat-total').textContent = calculateTotalFee(members);

    const groups = groupByGear(members);
    document.getElementById('gear-summary').innerHTML = Object.keys(groups).length
      ? Object.entries(groups).map(([gear, g]) => `
        <div class="stat">
          <div class="num">${g.count}<small style="font-size:0.9rem;"> 人</small></div>
          <div class="label">${gear} · 合计 ${g.fee} 元</div>
        </div>`).join('')
      : '<p class="hint">暂无数据</p>';
  }

  /* ---------- 事件 ---------- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    const cleaned = validateAndClean({
      name: nameEl.value, phone: phoneEl.value, gear: gearEl.value
    });
    if (!cleaned) return setMsg('❌ 姓名不能为空，手机号须为 11 位有效号码', 'error');
    if (members.some(m => m.phone === cleaned.phone)) return setMsg('❌ 该手机号已登记', 'error');

    members.push(cleaned);
    if (persist()) {
      setMsg(` ${cleaned.name} 登记成功，本人费用 ${cleaned.rent + cleaned.activityFee} 元`, 'ok');
      form.reset();
      render();
    }
  });

  document.getElementById('load-demo').addEventListener('click', () => {
    const valid = DEMO.map(validateAndClean).filter(Boolean)
      .filter(m => !members.some(x => x.phone === m.phone));
    const skipped = DEMO.length - DEMO.map(validateAndClean).filter(Boolean).length;
    members.push(...valid);
    persist();
    render();
    setMsg(`已导入 ${valid.length} 条合法数据，拦截 ${skipped} 条非法数据（详见控制台）`, 'ok');
  });

  listEl.addEventListener('click', e => {
    const id = e.target.dataset.del;
    if (!id) return;
    members = members.filter(m => m.id !== id);
    persist();
    render();
  });

  document.getElementById('export-act').addEventListener('click', () => {
    if (!members.length) return showToast('暂无数据可导出');
    Store.exportJSON(members, 'photoclub_activity.json');
  });

  document.getElementById('clear-act').addEventListener('click', () => {
    if (!members.length) return;
    if (!confirm('确定清空全部登记记录？')) return;
    members = [];
    persist();
    render();
  });

  render();
})();
