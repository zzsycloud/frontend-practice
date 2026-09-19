/**
 * 数据看板
 * - 两份静态 JSON 通过 fetch + Promise.all 并行加载（ECharts 柱状图 + Chart.js 折线图）
 * - 两份本地 localStorage 数据（报名 / 作品）直接读取，实现跨页面数据联动
 * - 明确区分 loading / error / empty / success 四种状态
 */
(function () {
  let equipment = [];
  let submissions = [];
  let chart1, chart2, chart3, chart4;

  const $ = id => document.getElementById(id);

  function showStatus(state) {
    ['status-loading', 'status-error', 'status-empty'].forEach(id => $(id).classList.add('hidden'));
    $('charts').classList.add('hidden');
    const map = { loading: 'status-loading', error: 'status-error', empty: 'status-empty', success: 'charts' };
    $(map[state]).classList.remove('hidden');
  }

  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${url} 加载失败 (HTTP ${r.status})`);
    return r.json();
  }

  async function loadDashboardData() {
    showStatus('loading');
    const start = performance.now();

    try {
      [equipment, submissions] = await Promise.all([
        fetchJSON('./data/equipment.json'),
        fetchJSON('./data/submissions.json')
      ]);

      $('time-display').textContent = `并行加载 2 份 JSON 耗时: ${(performance.now() - start).toFixed(2)} ms`;

      if (!equipment.length || !submissions.length) return showStatus('empty');

      showStatus('success');
      renderEquipment(equipment);
      renderSubmissions(submissions);
      renderSkills();
      renderRatings();
    } catch (err) {
      console.error('数据加载失败:', err);
      $('time-display').textContent = err.message;
      showStatus('error');
    }
  }

  /* ---------- 图1：ECharts 柱状图 ---------- */
  function renderEquipment(data) {
    chart1 = chart1 || echarts.init($('chart1'));
    chart1.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, bottom: 60, top: 30 },
      xAxis: { type: 'category', data: data.map(d => d.name), axisLabel: { rotate: 30 } },
      yAxis: { type: 'value', name: '人数' },
      series: [{ type: 'bar', data: data.map(d => d.value), barWidth: '50%', itemStyle: { color: '#3498db' } }]
    }, true);

    chart1.off('click');
    chart1.on('click', params => {
      // 图表联动：按被点击器材的占比缩放折线图数据（演示用）
      const total = equipment.reduce((s, d) => s + d.value, 0);
      const ratio = params.value / total;
      chart2.data.datasets[0].label = `${params.name} 用户估算投稿量`;
      chart2.data.datasets[0].data = submissions.map(d => Math.round(d.count * ratio));
      chart2.update();
      chart1.dispatchAction({ type: 'highlight', name: params.name });
    });
  }

  /* ---------- 图2：Chart.js 折线图 ---------- */
  function renderSubmissions(data) {
    if (chart2) chart2.destroy();
    chart2 = new Chart($('chart2').getContext('2d'), {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: '月度投稿量',
          data: data.map(d => d.count),
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          fill: true, tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true, title: { display: true, text: '数量 (张)' } } }
      }
    });
  }

  /* ---------- 图3：报名者擅长领域（来自 join.html 的 localStorage） ---------- */
  function renderSkills() {
    const signups = Store.load('signups', []);
    const counter = {};
    signups.forEach(s => (s.skills || []).forEach(k => { counter[k] = (counter[k] || 0) + 1; }));
    const data = Object.entries(counter).map(([name, value]) => ({ name, value }));

    chart3 = chart3 || echarts.init($('chart3'));
    chart3.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie', radius: ['40%', '65%'],
        data: data.length ? data : [{ name: '暂无报名数据', value: 1, itemStyle: { color: '#e5e7eb' } }],
        label: { formatter: '{b}: {c}' }
      }]
    }, true);
  }

  /* ---------- 图4：作品评分分布（来自 works.html 的 localStorage） ---------- */
  function renderRatings() {
    const photos = Store.load('photos', []);
    const buckets = [1, 2, 3, 4, 5].map(n => photos.filter(p => p.rating === n).length);

    if (chart4) chart4.destroy();
    chart4 = new Chart($('chart4').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['1 星', '2 星', '3 星', '4 星', '5 星'],
        datasets: [{ label: '作品数', data: buckets, backgroundColor: '#f59e0b' }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  /* ---------- 事件 ---------- */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    if (btn.id === 'reload-btn') return loadDashboardData();

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    renderEquipment(f === 'all' ? equipment : equipment.filter(d => d.name === f));
  });

  window.addEventListener('resize', () => {
    chart1 && chart1.resize();
    chart3 && chart3.resize();
  });

  document.addEventListener('DOMContentLoaded', loadDashboardData);
})();


